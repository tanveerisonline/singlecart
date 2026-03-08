import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "STORE_MANAGER", "PRODUCT_MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const products = await db.product.findMany({
      include: {
        category: true,
        variants: true,
        images: {
          take: 1
        }
      },
      orderBy: {
        stock: "asc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[INVENTORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "STORE_MANAGER", "PRODUCT_MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { productId, variantId, change, reason } = body;

    if (!productId || change === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const stockChange = parseInt(change);

    if (variantId) {
      const variant = await db.productVariant.findUnique({
        where: { id: variantId }
      });

      if (!variant) return new NextResponse("Variant not found", { status: 404 });

      const newStock = variant.stock + stockChange;

      const updatedVariant = await db.productVariant.update({
        where: { id: variantId },
        data: {
          stock: newStock,
          stockLogs: {
            create: {
              productId,
              change: stockChange,
              reason: reason || "Adjustment",
              previousStock: variant.stock,
              newStock: newStock
            }
          }
        }
      });
      
      return NextResponse.json(updatedVariant);
    } else {
      const product = await db.product.findUnique({
        where: { id: productId }
      });

      if (!product) return new NextResponse("Product not found", { status: 404 });

      const newStock = product.stock + stockChange;

      const updatedProduct = await db.product.update({
        where: { id: productId },
        data: {
          stock: newStock,
          stockLogs: {
            create: {
              change: stockChange,
              reason: reason || "Adjustment",
              previousStock: product.stock,
              newStock: newStock
            }
          }
        }
      });

      return NextResponse.json(updatedProduct);
    }
  } catch (error) {
    console.log("[INVENTORY_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
