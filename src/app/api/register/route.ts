import { db } from "@/lib/db";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, phone } = body;

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

    const user = await db.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.log("[REGISTER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
