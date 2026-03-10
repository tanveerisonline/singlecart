import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    const { couponId } = await params;
    const coupon = await db.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.log("[COUPON_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { couponId } = await params;
    const body = await req.json();
    const { 
      code, 
      discountType, 
      discountValue, 
      minPurchase, 
      maxDiscount, 
      startDate, 
      endDate, 
      usageLimit,
      isActive
    } = body;

    const coupon = await db.coupon.update({
      where: { id: couponId },
      data: {
        code: code?.toUpperCase(),
        discountType,
        discountValue: discountValue ? parseFloat(discountValue) : undefined,
        minPurchase: minPurchase ? parseFloat(minPurchase) : undefined,
        maxDiscount: maxDiscount !== undefined ? (maxDiscount ? parseFloat(maxDiscount) : null) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        usageLimit: usageLimit !== undefined ? (usageLimit ? parseInt(usageLimit) : null) : undefined,
        isActive,
      },
    });

    return NextResponse.json(coupon);
  } catch (error: any) {
    console.log("[COUPON_PATCH]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ couponId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { couponId } = await params;
    const coupon = await db.coupon.delete({
      where: { id: couponId },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.log("[COUPON_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
