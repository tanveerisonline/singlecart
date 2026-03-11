import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hasPermission } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.role, "MANAGE_ORDERS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const returns = await db.returnRequest.findMany({
      include: {
        order: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(returns);
  } catch (error) {
    console.error("[ADMIN_RETURNS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.role, "MANAGE_ORDERS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { returnId, status, adminNotes } = body;

    const returnRequest = await db.returnRequest.update({
      where: { id: returnId },
      data: { 
        status,
        adminNotes
      },
      include: { order: true }
    });

    // If completed, update order status to RETURNED
    if (status === "COMPLETED") {
      await db.order.update({
        where: { id: returnRequest.orderId },
        data: { status: "RETURNED", paymentStatus: "REFUNDED" }
      });
    } else if (status === "REJECTED") {
      await db.order.update({
        where: { id: returnRequest.orderId },
        data: { status: "DELIVERED" } // Revert back
      });
    }

    return NextResponse.json(returnRequest);
  } catch (error) {
    console.error("[ADMIN_RETURNS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
