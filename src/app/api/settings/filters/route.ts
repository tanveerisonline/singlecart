import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let settings = await (db as any).filterSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = {
        showCategory: true,
        showBrand: true,
        showPrice: true,
        showRating: true,
        showAvailability: true,
        showDiscount: true,
      };
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[PUBLIC_FILTER_SETTINGS_GET]", error);
    // Return defaults if database fails
    return NextResponse.json({
      showCategory: true,
      showBrand: true,
      showPrice: true,
      showRating: true,
      showAvailability: true,
      showDiscount: true,
    });
  }
}
