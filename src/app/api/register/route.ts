import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, phone, referralCode } = body;

    if (!email || !password || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user exists by email
    const existingEmail = await db.user.findUnique({
      where: { email }
    });

    if (existingEmail) {
      return new NextResponse("Email already in use", { status: 400 });
    }

    // Check if user exists by phone
    if (phone) {
      const existingPhone = await db.user.findUnique({
        where: { phone }
      });

      if (existingPhone) {
        return new NextResponse("Phone number already in use", { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    let referredById = null;
    if (referralCode) {
      const referrer = await db.user.findUnique({ where: { referralCode } });
      if (referrer) referredById = referrer.id;
    }

    const user = await db.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword,
        referredById,
        referralCode: `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      },
    });

    if (referredById) {
       await db.giftCard.create({
         data: {
           code: `RW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
           balance: 10,
           initialAmount: 10,
           userId: referredById,
         }
       }).catch(() => console.error("Failed to generate referral reward"));
    }

    return NextResponse.json(user);
  } catch (error) {
    console.log("[REGISTER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
