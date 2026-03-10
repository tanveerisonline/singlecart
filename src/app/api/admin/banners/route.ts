import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { sectionId, title, subtitle, description, buttonText, buttonLink, discountText, bgColor, textColor, imageUrl, order, isActive, className } = body;

    if (!sectionId) {
      return new NextResponse("Section ID is required", { status: 400 });
    }

    const banner = await db.banner.create({
      data: {
        sectionId,
        title,
        subtitle,
        description,
        buttonText,
        buttonLink,
        discountText,
        bgColor,
        textColor,
        imageUrl,
        order: order ? parseInt(order.toString()) : 0,
        isActive: isActive !== undefined ? isActive : true,
        className,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.log("[BANNERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
