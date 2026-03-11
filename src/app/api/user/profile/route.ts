import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        referrals: {
          select: {
            id: true,
            name: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Ensure referral code exists
    if (!user.referralCode) {
      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: { referralCode: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}` },
        select: {
          id: true,
          name: true,
          email: true,
          referralCode: true,
          referrals: true
        }
      });
      return NextResponse.json(updatedUser);
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
