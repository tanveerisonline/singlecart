import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse("Email is required", { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      // For security reasons, don't reveal if user exists
      return new NextResponse("If an account exists, a reset link will be sent.", { status: 200 });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await db.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // In a real app, you would send an email here
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    console.log("-----------------------------------------");
    console.log("PASSWORD RESET LINK FOR:", email);
    console.log(resetUrl);
    console.log("-----------------------------------------");

    return new NextResponse("If an account exists, a reset link will be sent.", { status: 200 });
  } catch (error) {
    console.log("[FORGOT_PASSWORD_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
