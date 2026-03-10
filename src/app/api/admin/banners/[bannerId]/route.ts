import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { bannerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { bannerId } = await params;
    const body = await req.json();
    const { title, subtitle, description, buttonText, buttonLink, discountText, bgColor, textColor, imageUrl, order, isActive, className } = body;

    const banner = await db.banner.update({
      where: { id: bannerId },
      data: {
        title,
        subtitle,
        description,
        buttonText,
        buttonLink,
        discountText,
        bgColor,
        textColor,
        imageUrl,
        order: order !== undefined ? parseInt(order.toString()) : undefined,
        isActive,
        className,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.log("[BANNER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { bannerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { bannerId } = await params;
    const banner = await db.banner.delete({
      where: { id: bannerId },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.log("[BANNER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
