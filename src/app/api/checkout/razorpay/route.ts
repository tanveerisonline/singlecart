import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Fetch Dynamic Payment Settings
    const paymentSettings = await (db.paymentSetting as any).findUnique({
      where: { id: "default" }
    });

    const keyId = paymentSettings?.razorpayKeyId || process.env.RAZORPAY_KEY_ID;
    const keySecret = paymentSettings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET;
    const isEnabled = paymentSettings?.razorpayIsEnabled ?? true;

    if (!isEnabled) {
      return new NextResponse("Razorpay is currently disabled by the administrator.", { status: 403 });
    }

    if (!keyId || !keySecret || keyId === "your_razorpay_key_id") {
      console.error("Missing or placeholder Razorpay credentials");
      return new NextResponse("Payment system is not fully configured (Razorpay). Please contact support.", { status: 503 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const body = await req.json();
    const { orderId } = body;

    const order = await db.order.findUnique({
      where: { id: orderId, userId: session.user.id },
    });

    if (!order) return new NextResponse("Order not found", { status: 404 });

    const options = {
      amount: Math.round(order.totalAmount * 100).toString(),
      currency: "INR",
      receipt: order.id,
      payment_capture: 1,
    };

    const response = await razorpay.orders.create(options);

    return NextResponse.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.error("[RAZORPAY_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
