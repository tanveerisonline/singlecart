import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

const parseSafeFloat = (value: any) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

const parseSafeInt = (value: any) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "PRODUCT_MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      name, 
      slug, 
      description, 
      shortDescription,
      price, 
      sku, 
      stock, 
      categoryId, 
      brandId,
      tagIds = [],
      images = [], 
      variants = [],
      productType,
      tax,
      isFeatured,
      isActive,
      metaTitle,
      metaDescription,
      weight,
      length,
      width,
      height,
      stockStatus,
      discount,
      salePrice,
      wholesalePriceType
    } = body;

    // Validation
    if (!name || !slug || !sku || !categoryId) {
      return new NextResponse("Missing required fields (Name, Slug, SKU, or Category)", { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return new NextResponse("Invalid price value", { status: 400 });
    }

    // Check for duplicate slug/sku
    const existingProduct = await db.product.findFirst({
      where: {
        OR: [
          { slug: slug },
          { sku: sku }
        ]
      }
    });

    if (existingProduct) {
      const field = existingProduct.slug === slug ? "Slug" : "SKU";
      return new NextResponse(`A product with this ${field} already exists.`, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name,
        slug,
        description: description || "",
        shortDescription: shortDescription || "",
        productType: productType || "PHYSICAL",
        tax: parseSafeFloat(tax) || 0,
        price: parsedPrice,
        sku,
        stock: parseSafeInt(stock) || 0,
        categoryId,
        brandId: brandId || null,
        stockStatus: stockStatus || "in_stock",
        discount: parseSafeFloat(discount) || 0,
        salePrice: parseSafeFloat(salePrice) || 0,
        wholesalePriceType: wholesalePriceType || null,
        tags: {
          connect: tagIds.map((id: string) => ({ id }))
        },
        isFeatured: isFeatured || false,
        isActive: isActive !== undefined ? isActive : true,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        weight: parseSafeFloat(weight),
        length: parseSafeFloat(length),
        width: parseSafeFloat(width),
        height: parseSafeFloat(height),
        images: {
          create: images.map((url: string, index: number) => ({ 
            url,
            order: index
          }))
        },
        variants: variants && variants.length > 0 ? {
          create: variants.map((v: any) => ({
            name: v.name,
            sku: v.sku,
            price: parseSafeFloat(v.price) || parsedPrice,
            stock: parseSafeInt(v.stock) || 0,
          }))
        } : undefined,
        stockLogs: {
          create: {
            change: parseSafeInt(stock) || 0,
            reason: "Initial Stock",
            previousStock: 0,
            newStock: parseSafeInt(stock) || 0
          }
        }
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("[PRODUCTS_POST_ERROR]", error);
    if (error.code === 'P2002') {
      return new NextResponse("Unique constraint violation: Slug or SKU already exists.", { status: 400 });
    }
    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}
