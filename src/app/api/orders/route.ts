import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { items, address, totalAmount, shippingCost, couponId } = body;

    console.log("[ORDERS_DEBUG] Received IDs:", items.map((i: any) => i.productId));

    if (!items || items.length === 0) {
      return new NextResponse("Your cart is empty", { status: 400 });
    }

    // 1. Verify all products still exist
    const productIds = items.map((item: any) => item.productId);
    const existingProducts = await db.product.findMany({
      where: {
        id: { in: productIds }
      }
    });

    console.log("[ORDERS_DEBUG] Found in DB:", existingProducts.map(p => p.id));

    if (existingProducts.length !== productIds.length) {
      const foundIds = existingProducts.map(p => p.id);
      const missingIds = productIds.filter((id: string) => !foundIds.includes(id));
      console.log("[ORDERS_DEBUG] Missing IDs:", missingIds);
      return new NextResponse(`One or more products are no longer available. Missing: ${missingIds.join(', ')}`, { status: 400 });
    }

    // 2. Find or create address record
    let shippingAddress = await db.address.findFirst({
      where: {
        userId: session.user.id,
        street: address.street,
        city: address.city,
        postalCode: address.postalCode,
        country: address.country
      }
    });

    if (!shippingAddress) {
      shippingAddress = await db.address.create({
        data: {
          street: address.street,
          city: address.city,
          state: address.state || "",
          postalCode: address.postalCode,
          country: address.country,
          label: address.label || "Home",
          userId: session.user.id,
        }
      });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        totalAmount: parseFloat(totalAmount),
        shippingCost: parseFloat(shippingCost) || 0,
        shippingAddressId: shippingAddress.id,
        couponId: couponId || null,
        status: "PENDING",
        paymentStatus: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: parseInt(item.quantity),
            price: parseFloat(item.price)
          }))
        }
      }
    });

    if (couponId) {
      await db.coupon.update({
        where: { id: couponId },
        data: { usageCount: { increment: 1 } }
      }).catch(err => console.error("Coupon update fail", err));
    }

    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: parseInt(item.quantity) } }
      }).catch(err => console.error("Stock update fail", err));
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error("[ORDERS_POST_ERROR]", error);
    return new NextResponse(`Server error: ${error.message}`, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const orders = await db.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              include: { images: { take: 1 } }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(orders);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
