import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sliderImages = await db.sliderImage.findMany({
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(sliderImages);
  } catch (error) {
    console.log("[SLIDER_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, link, imageUrl, order, isActive } = body;

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    const sliderImage = await db.sliderImage.create({
      data: {
        title,
        link,
        imageUrl,
        order: order ? parseInt(order) : 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(sliderImage);
  } catch (error) {
    console.log("[SLIDER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
