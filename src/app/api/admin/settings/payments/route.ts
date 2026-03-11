import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("[PAYMENT_SETTINGS_GET] Session:", JSON.stringify(session));
    
    if (!session || !session.user) {
      console.log("[PAYMENT_SETTINGS_GET] No session or user found");
      return new NextResponse("Unauthorized: No Session", { status: 401 });
    }

    const isDirectAdmin = session.user.role === "ADMIN";
    const hasPerm = hasPermission(session.user.role, "MANAGE_SETTINGS");

    if (!isDirectAdmin && !hasPerm) {
      console.log("[PAYMENT_SETTINGS_GET] Permission denied for role:", session.user.role);
      return new NextResponse(`Unauthorized: Insufficient Permissions (${session.user.role})`, { status: 401 });
    }

    let settings = await (db.paymentSetting as any).findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await (db.paymentSetting as any).create({
        data: { id: "default" },
      });
    }

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("[PAYMENT_SETTINGS_GET_ERROR]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log("[PAYMENT_SETTINGS_PATCH] Session:", JSON.stringify(session));

    if (!session || !session.user) {
      return new NextResponse("Unauthorized: No Session", { status: 401 });
    }

    const isDirectAdmin = session.user.role === "ADMIN";
    const hasPerm = hasPermission(session.user.role, "MANAGE_SETTINGS");

    if (!isDirectAdmin && !hasPerm) {
      console.log("[PAYMENT_SETTINGS_PATCH] Permission denied for role:", session.user.role);
      return new NextResponse(`Unauthorized: Insufficient Permissions (${session.user.role})`, { status: 401 });
    }

    const body = await req.json();
    console.log("[PAYMENT_SETTINGS_PATCH] Body:", body);

    const updateData = {
      stripeIsEnabled: body.stripeIsEnabled,
      stripeSecretKey: body.stripeSecretKey,
      stripePublishableKey: body.stripePublishableKey,
      paypalIsEnabled: body.paypalIsEnabled,
      paypalClientId: body.paypalClientId,
      paypalSecretKey: body.paypalSecretKey,
      paypalMode: body.paypalMode,
      razorpayIsEnabled: body.razorpayIsEnabled,
      razorpayKeyId: body.razorpayKeyId,
      razorpayKeySecret: body.razorpayKeySecret,
      codIsEnabled: body.codIsEnabled,
    };

    const settings = await (db.paymentSetting as any).upsert({
      where: { id: "default" },
      update: updateData,
      create: { ...updateData, id: "default" },
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("[PAYMENT_SETTINGS_PATCH_ERROR]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
