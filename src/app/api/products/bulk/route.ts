import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

const parseSafeFloat = (value: any) => {
  if (value === undefined || value === null || value === "") return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "PRODUCT_MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products)) {
      return new NextResponse("Invalid data format", { status: 400 });
    }

    // Process products one by one to handle relations properly
    // We use a transaction for reliability
    await db.$transaction(async (tx) => {
      for (const p of products) {
        // 1. Ensure category exists (by slug or ID)
        // If we don't have it, we might need to skip or error
        // For simplicity, we assume categoryId is valid if present
        
        // 2. Upsert the product
        await tx.product.upsert({
          where: { slug: p.slug },
          update: {
            name: p.name,
            shortDescription: p.shortDescription,
            description: p.description,
            price: parseSafeFloat(p.price),
            sku: p.sku,
            stock: parseInt(p.stock || "0"),
            categoryId: p.categoryId,
            brandId: p.brandId,
            thumbnailUrl: p.thumbnailUrl,
            sizeChartUrl: p.sizeChartUrl,
            metaImageUrl: p.metaImageUrl,
            hasWatermark: p.hasWatermark,
            productType: p.productType,
            tax: parseSafeFloat(p.tax),
            isFeatured: p.isFeatured,
            isActive: p.isActive,
            metaTitle: p.metaTitle,
            metaDescription: p.metaDescription,
            weight: parseSafeFloat(p.weight),
            length: parseSafeFloat(p.length),
            width: parseSafeFloat(p.width),
            height: parseSafeFloat(p.height),
            showDimensions: p.showDimensions,
            isFreeShipping: p.isFreeShipping,
            isReturnable: p.isReturnable,
            isTrending: p.isTrending,
            isEncourageOrder: p.isEncourageOrder,
            isEncourageView: p.isEncourageView,
            estimatedDeliveryText: p.estimatedDeliveryText,
            returnPolicyText: p.returnPolicyText,
            stockStatus: p.stockStatus,
            discount: parseSafeFloat(p.discount),
            salePrice: parseSafeFloat(p.salePrice),
            unit: p.unit,
            // Images and Variants are more complex to "update" in bulk import
            // We'll skip complex merging for now and just update basic fields
          },
          create: {
            name: p.name,
            slug: p.slug,
            shortDescription: p.shortDescription,
            description: p.description,
            price: parseSafeFloat(p.price),
            sku: p.sku,
            stock: parseInt(p.stock || "0"),
            categoryId: p.categoryId,
            brandId: p.brandId,
            thumbnailUrl: p.thumbnailUrl,
            sizeChartUrl: p.sizeChartUrl,
            metaImageUrl: p.metaImageUrl,
            hasWatermark: p.hasWatermark,
            productType: p.productType,
            tax: parseSafeFloat(p.tax),
            isFeatured: p.isFeatured,
            isActive: p.isActive,
            metaTitle: p.metaTitle,
            metaDescription: p.metaDescription,
            weight: parseSafeFloat(p.weight),
            length: parseSafeFloat(p.length),
            width: parseSafeFloat(p.width),
            height: parseSafeFloat(p.height),
            showDimensions: p.showDimensions,
            isFreeShipping: p.isFreeShipping,
            isReturnable: p.isReturnable,
            isTrending: p.isTrending,
            isEncourageOrder: p.isEncourageOrder,
            isEncourageView: p.isEncourageView,
            estimatedDeliveryText: p.estimatedDeliveryText,
            returnPolicyText: p.returnPolicyText,
            stockStatus: p.stockStatus,
            discount: parseSafeFloat(p.discount),
            salePrice: parseSafeFloat(p.salePrice),
            unit: p.unit,
            images: {
              create: (p.images || []).map((img: any) => ({
                url: typeof img === 'string' ? img : img.url,
                order: img.order || 0
              }))
            },
            variants: {
              create: (p.variants || []).map((v: any) => ({
                name: v.name,
                sku: v.sku,
                price: parseSafeFloat(v.price),
                stock: parseInt(v.stock || "0")
              }))
            }
          }
        });
      }
    });

    return new NextResponse("Import successful", { status: 200 });
  } catch (error: any) {
    console.error("[PRODUCTS_BULK_POST]", error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
