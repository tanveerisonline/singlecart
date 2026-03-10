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
      isSafeCheckout,
      isSecureCheckout,
      isSocialShare,
      isEncourageOrder,
      isEncourageView,
      isTrending,
      isActive,
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
          connect: tagIds.map((id: string) => ({ id }))
        },
        isFeatured: isFeatured || false,
        isSafeCheckout: isSafeCheckout || false,
        isSecureCheckout: isSecureCheckout || false,
        isSocialShare: isSocialShare !== undefined ? isSocialShare : true,
        isEncourageOrder: isEncourageOrder || false,
        isEncourageView: isEncourageView || false,
        isTrending: isTrending || false,
        isActive: isActive !== undefined ? isActive : true,
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");
    const minPrice = parseSafeFloat(searchParams.get("minPrice"));
    const maxPrice = parseSafeFloat(searchParams.get("maxPrice"));
    const isFeatured = searchParams.get("isFeatured") === "true";
    const inStock = searchParams.get("inStock") === "true";
    const onSale = searchParams.get("onSale") === "true";
    const rating = parseSafeInt(searchParams.get("rating"));
    const sort = searchParams.get("sort") || "newest";
    const query = searchParams.get("query");

    const where: any = {
      isActive: true,
    };

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    
    if (minPrice !== null || maxPrice !== null) {
      where.price = {};
      if (minPrice !== null) where.price.gte = minPrice;
      if (maxPrice !== null) where.price.lte = maxPrice;
    }

    if (isFeatured) where.isFeatured = true;
    if (inStock) where.stock = { gt: 0 };
    
    if (onSale) {
      where.OR = [
        { discount: { gt: 0 } },
        { compareAtPrice: { gt: 0 } }, // Simplification for Prisma/SQLite
      ];
    }
    
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { sku: { contains: query } },
      ];
    }

    if (rating) {
      where.reviews = {
        some: {},
        // This is a simplified rating filter as SQLite doesn't support avg in where easily
        // In a real app with postgres you might use raw queries or a better schema
      };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };

    const products = await db.product.findMany({
      where,
      include: {
        images: { take: 1 },
        category: true,
        brand: true,
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy,
    });

    // Client side filter for average rating if requested
    let filteredProducts = products;
    if (rating) {
      filteredProducts = products.filter(p => {
        if (p.reviews.length === 0) return false;
        const avg = p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length;
        return avg >= rating;
      });
    }

    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error("[PRODUCTS_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
