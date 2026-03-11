import { NextResponse } from "next/server";
import { Client, Environment } from "@paypal/paypal-server-sdk";
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

    const clientId = paymentSettings?.paypalClientId || process.env.PAYPAL_CLIENT_ID;
    const clientSecret = paymentSettings?.paypalSecretKey || process.env.PAYPAL_CLIENT_SECRET;
    const isEnabled = paymentSettings?.paypalIsEnabled ?? true;
    const mode = paymentSettings?.paypalMode || "sandbox";

    if (!isEnabled) {
      return new NextResponse("PayPal is currently disabled by the administrator.", { status: 403 });
    }

    if (!clientId || !clientSecret || clientId === "your_paypal_client_id") {
      console.error("Missing or placeholder PayPal credentials");
      return new NextResponse("Payment system is not fully configured (PayPal). Please contact support.", { status: 503 });
    }

    const client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: clientId,
        oAuthClientSecret: clientSecret,
      },
      timeout: 0,
      environment: mode === "live" ? Environment.Production : Environment.Sandbox,
    });

    const body = await req.json();
    const { orderId } = body;

    const order = await db.order.findUnique({
      where: { id: orderId, userId: session.user.id },
    });

    if (!order) return new NextResponse("Order not found", { status: 404 });

    const request = {
      body: {
        intent: "CAPTURE",
        purchaseUnits: [
          {
            amount: {
              currencyCode: "USD",
              value: order.totalAmount.toFixed(2),
            },
            referenceId: order.id,
          },
        ],
      },
    };

    const response = await client.ordersController.ordersCreate(request);

    return NextResponse.json({ id: response.result.id });
  } catch (error) {
    console.error("[PAYPAL_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
