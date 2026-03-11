import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hasPermission } from "@/lib/rbac";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ giftCardId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { giftCardId } = await params;

    if (!session || !hasPermission(session.user.role, "MANAGE_SETTINGS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { balance, isActive, expiryDate } = body;

    const giftCard = await db.giftCard.update({
      where: { id: giftCardId },
      data: {
        balance: balance !== undefined ? parseFloat(balance) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      }
    });

    return NextResponse.json(giftCard);
  } catch (error) {
    console.error("[GIFT_CARD_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ giftCardId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { giftCardId } = await params;

    if (!session || !hasPermission(session.user.role, "MANAGE_SETTINGS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.giftCard.delete({
      where: { id: giftCardId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[GIFT_CARD_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
