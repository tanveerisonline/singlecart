import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    let settings = await (db.paymentSetting as any).findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await (db.paymentSetting as any).create({
        data: { id: "default" },
      });
    }

    // Return only public/safe info
    return NextResponse.json({
      stripeIsEnabled: settings.stripeIsEnabled,
      paypalIsEnabled: settings.paypalIsEnabled,
      razorpayIsEnabled: settings.razorpayIsEnabled,
      codIsEnabled: settings.codIsEnabled,
    });
  } catch (error: any) {
    console.error("[SETTINGS_PAYMENTS_GET_ERROR]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
