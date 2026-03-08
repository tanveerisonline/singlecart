import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { sliderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const sliderImage = await db.sliderImage.delete({
      where: {
        id: params.sliderId,
      },
    });

    return NextResponse.json(sliderImage);
  } catch (error) {
    console.log("[SLIDER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { sliderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, link, imageUrl, order, isActive } = body;

    const sliderImage = await db.sliderImage.update({
      where: {
        id: params.sliderId,
      },
      data: {
        title,
        link,
        imageUrl,
        order: order ? parseInt(order) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    return NextResponse.json(sliderImage);
  } catch (error) {
    console.log("[SLIDER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
