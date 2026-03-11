import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return new NextResponse("Code is required", { status: 400 });
    }

    const giftCard = await db.giftCard.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!giftCard) {
      return new NextResponse("Invalid gift card code", { status: 404 });
    }

    if (!giftCard.isActive) {
      return new NextResponse("This gift card is inactive", { status: 400 });
    }

    if (giftCard.balance <= 0) {
      return new NextResponse("This gift card has no remaining balance", { status: 400 });
    }

    if (giftCard.expiryDate && new Date(giftCard.expiryDate) < new Date()) {
      return new NextResponse("This gift card has expired", { status: 400 });
    }

    return NextResponse.json({
      code: giftCard.code,
      balance: giftCard.balance,
    });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
