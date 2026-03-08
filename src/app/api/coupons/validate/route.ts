import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return new NextResponse("Missing coupon code", { status: 400 });
    }

    const coupon = await db.coupon.findUnique({
      where: {
        code: code.toUpperCase(),
        isActive: true,
      },
    });

    if (!coupon) {
      return new NextResponse("Invalid coupon code", { status: 404 });
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      return new NextResponse("Coupon has expired", { status: 400 });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return new NextResponse("Coupon usage limit reached", { status: 400 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.log("[COUPON_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
