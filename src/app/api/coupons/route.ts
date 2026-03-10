import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      code, 
      discountType, 
      discountValue, 
      minPurchase, 
      maxDiscount, 
      startDate, 
      endDate, 
      usageLimit 
    } = body;

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
      },
    });

    return NextResponse.json(coupon);
  } catch (error: any) {
    console.log("[COUPONS_POST] Detailed Error:", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
