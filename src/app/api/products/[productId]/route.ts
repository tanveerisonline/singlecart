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

const parseSafeDate = (value: any) => {
  if (!value || value === "") return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        images: true,
        category: true,
        variants: true,
        tags: true,
        brand: true
      },
    });

    if (!product) return new NextResponse("Not Found", { status: 404 });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PRODUCT_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "PRODUCT_MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.product.delete({
      where: { id: productId },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[PRODUCT_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
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
      isActive,
      isFeatured,
      isSafeCheckout,
      isSecureCheckout,
      isSocialShare,
      isEncourageOrder,
      isEncourageView,
      isTrending,
      productType,
      tax,
      metaTitle,
      metaDescription,
      metaImageUrl,
      weight,
      isFreeShipping,
      estimatedDeliveryText,
      isReturnable,
      returnPolicyText,
      showDimensions,
      length,
      width,
      height,
      stockStatus,
      discount,
      salePrice,
      wholesalePriceType,
      thumbnailUrl,
      sizeChartUrl,
      hasWatermark,
      saleStartDate,
      saleEndDate,
      unit,
      isRandomRelated,
      crossSellIds
    } = body;

    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    // Validate essential fields
    if (!name || !slug || !sku || !categoryId) {
      return new NextResponse("Missing required fields (Name, Slug, SKU, or Category)", { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      return new NextResponse("Invalid price value", { status: 400 });
    }

    // Check for duplicate slug/sku in OTHER products
    const existingConflict = await db.product.findFirst({
      where: {
        OR: [
          { slug: slug },
          { sku: sku }
        ],
        NOT: {
          id: productId
        }
      }
    });

    if (existingConflict) {
      const field = existingConflict.slug === slug ? "Slug" : "SKU";
      return new NextResponse(`Another product already uses this ${field}`, { status: 400 });
    }

    const product = await db.product.update({
      where: { id: productId },
      data: {
        name,
        slug,
        description,
        shortDescription,
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
        saleStartDate: parseSafeDate(saleStartDate),
        saleEndDate: parseSafeDate(saleEndDate),
        unit: unit || null,
        wholesalePriceType: wholesalePriceType || null,
        isRandomRelated: isRandomRelated || false,
        crossSellIds: crossSellIds || null,
        thumbnailUrl: thumbnailUrl || null,
        sizeChartUrl: sizeChartUrl || null,
        hasWatermark: hasWatermark || false,
        tags: {
          set: tagIds.map((id: string) => ({ id }))
        },
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured || false,
        isSafeCheckout: isSafeCheckout || false,
        isSecureCheckout: isSecureCheckout || false,
        isSocialShare: isSocialShare !== undefined ? isSocialShare : true,
        isEncourageOrder: isEncourageOrder || false,
        isEncourageView: isEncourageView || false,
        isTrending: isTrending || false,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        metaImageUrl: metaImageUrl || null,
        weight: parseSafeFloat(weight),
        isFreeShipping: isFreeShipping || false,
        estimatedDeliveryText: estimatedDeliveryText || null,
        isReturnable: isReturnable !== undefined ? isReturnable : true,
        returnPolicyText: returnPolicyText || null,
        showDimensions: showDimensions || false,
        length: parseSafeFloat(length),
        width: parseSafeFloat(width),
        height: parseSafeFloat(height),
        images: {
          deleteMany: {},
          create: images.map((url: string, index: number) => ({ 
            url,
            order: index
          }))
        },
        variants: {
          deleteMany: {},
          create: variants.map((v: any) => ({
            name: v.name,
            sku: v.sku,
            price: parseSafeFloat(v.price) || parsedPrice,
            stock: parseSafeInt(v.stock) || 0,
          }))
        }
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("[PRODUCT_PATCH_ERROR]", error);
    
    if (error.code === 'P2002') {
      return new NextResponse("Unique constraint violation: Slug or SKU already exists.", { status: 400 });
    }
    
    if (error.code === 'P2025') {
      return new NextResponse("Product not found.", { status: 404 });
    }

    return new NextResponse(`Server Error: ${error.message}`, { status: 500 });
  }
}
