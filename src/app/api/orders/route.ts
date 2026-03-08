import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { items, address, totalAmount, shippingCost } = body;

    if (!items || items.length === 0 || !address) {
      return new NextResponse("Missing data", { status: 400 });
    }

    // Create or find address
    const shippingAddress = await db.address.create({
      data: {
        ...address,
        userId: session.user.id,
      }
    });

    // Create unique order number
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        totalAmount,
        shippingCost,
        shippingAddressId: shippingAddress.id,
        status: "PENDING",
        paymentStatus: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log("[ORDERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
