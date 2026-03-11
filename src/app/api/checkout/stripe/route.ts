import { NextResponse } from "next/server";
import Stripe from "stripe";
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
    const paymentSettings = await (db.paymentSetting as any).findFirst({
      where: { id: "default" }
    });

    const secretKey = paymentSettings?.stripeSecretKey || process.env.STRIPE_SECRET_KEY;
    const isEnabled = paymentSettings?.stripeIsEnabled ?? true;

    if (!isEnabled) {
      return new NextResponse("Stripe is currently disabled by the administrator.", { status: 403 });
    }

    if (!secretKey || secretKey === "your_stripe_secret_key") {
      console.error("Missing or placeholder Stripe Secret Key");
      return new NextResponse("Payment system is not fully configured (Stripe). Please contact support.", { status: 503 });
    }

    const stripe = new Stripe(secretKey);

    const body = await req.json();
    const { orderId } = body;

    const order = await db.order.findUnique({
      where: { id: orderId, userId: session.user.id },
      include: { items: { include: { product: true } } },
    });

    if (!order) return new NextResponse("Order not found", { status: 404 });

    const line_items = order.items.map((item) => {
      const productName = item.product?.name || "Product";
      const unitAmount = Math.round((item.price || 0) * 100);
      
      return {
        price_data: {
          currency: "usd",
          product_data: { name: productName },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    if (line_items.length === 0) {
      return new NextResponse("No valid items in order", { status: 400 });
    }

    if (order.shippingCost > 0) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping" },
          unit_amount: Math.round(order.shippingCost * 100),
        },
        quantity: 1,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      console.error("Missing NEXT_PUBLIC_APP_URL");
      return new NextResponse("App configuration error: Missing Base URL", { status: 500 });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${baseUrl}/checkout/success?orderId=${order.id}&payment_intent=stripe`,
      cancel_url: `${baseUrl}/checkout?canceled=true`,
      metadata: { orderId: order.id },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("[STRIPE_ERROR]", error);
    const errorMessage = error.message || "Internal Error";
    const statusCode = error.statusCode || 500;
    return new NextResponse(`Stripe Error: ${errorMessage}`, { status: statusCode });
  }
}
