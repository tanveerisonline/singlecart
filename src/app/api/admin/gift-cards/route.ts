import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hasPermission } from "@/lib/rbac";
import { randomBytes } from "crypto";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.role, "MANAGE_SETTINGS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const giftCards = await db.giftCard.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(giftCards);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.role, "MANAGE_SETTINGS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { amount, expiryDate, userId, customCode } = body;

    if (!amount || isNaN(parseFloat(amount))) {
      return new NextResponse("Invalid amount", { status: 400 });
    }

    const code = customCode || randomBytes(4).toString('hex').toUpperCase();

    const giftCard = await db.giftCard.create({
      data: {
        code,
        initialAmount: parseFloat(amount),
        balance: parseFloat(amount),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        userId: userId || null,
        isActive: true
      }
    });

    return NextResponse.json(giftCard);
  } catch (error) {
    console.error("[GIFT_CARD_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
