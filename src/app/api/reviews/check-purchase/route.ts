import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ canReview: false });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    const order = await db.order.findFirst({
      where: {
        userId: session.user.id,
        status: "DELIVERED",
        items: {
          some: {
            productId: productId
          }
        }
      }
    });

    return NextResponse.json({ canReview: !!order });
  } catch (error) {
    console.log("[CHECK_PURCHASE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
