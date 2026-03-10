import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("Fetching filter settings...");
    let settings = await (db as any).filterSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      console.log("No settings found, creating default...");
      settings = await (db as any).filterSetting.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[FILTER_SETTINGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("Updating filter settings with body:", body);
    
    // Explicitly pick fields to avoid passing invalid ones to Prisma
    const updateData = {
      showCategory: body.showCategory ?? true,
      showBrand: body.showBrand ?? true,
      showPrice: body.showPrice ?? true,
      showRating: body.showRating ?? true,
      showAvailability: body.showAvailability ?? true,
      showDiscount: body.showDiscount ?? true,
    };

    const settings = await (db as any).filterSetting.upsert({
      where: { id: "default" },
      update: updateData,
      create: { ...updateData, id: "default" },
    });

    console.log("Settings updated successfully:", settings);
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("[FILTER_SETTINGS_PATCH]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
