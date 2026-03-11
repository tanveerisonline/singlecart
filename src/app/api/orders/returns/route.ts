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
    const { orderId, reason, description } = body;

    if (!orderId || !reason) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { id: orderId, userId: session.user.id }
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Only allow returns for DELIVERED orders (simulation)
    // Or at least not CANCELLED
    if (order.status === "CANCELLED") {
      return new NextResponse("Cannot return a cancelled order", { status: 400 });
    }

    const returnRequest = await db.returnRequest.create({
      data: {
        orderId,
        reason,
        description,
        status: "PENDING",
      }
    });

    // Update order status to reflect return request
    await db.order.update({
      where: { id: orderId },
      data: { status: "RETURN_REQUESTED" }
    });

    return NextResponse.json(returnRequest);
  } catch (error) {
    console.error("[RETURNS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
