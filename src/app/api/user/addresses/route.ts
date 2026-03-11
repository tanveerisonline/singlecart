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

    const addresses = await db.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" }
    });

    return NextResponse.json(addresses);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { label, fullName, phone, street, city, state, postalCode, country, isDefault } = body;

    if (!fullName || !phone || !street || !city || !postalCode || !country) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // If this is the first address, make it default
    const count = await db.address.count({ where: { userId: session.user.id } });
    const shouldBeDefault = count === 0 ? true : isDefault;

    if (shouldBeDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      });
    }

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        label: label || "Home",
        fullName,
        phone,
        street,
        city,
        state: state || "",
        postalCode,
        country,
        isDefault: shouldBeDefault
      }
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error("[ADDRESS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
