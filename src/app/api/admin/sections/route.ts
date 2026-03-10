import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const sections = await db.dynamicSection.findMany({
      include: {
        banners: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.log("[SECTIONS_GET]", error);
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
    const { name, page, location, layout, order, isActive, containerClassName, banners } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const section = await db.dynamicSection.create({
      data: {
        name,
        page: page || "HOME",
        location: location || "MIDDLE",
        layout: layout || "FULL_WIDTH",
        order: order ? parseInt(order.toString()) : 0,
        isActive: isActive !== undefined ? isActive : true,
        containerClassName,
        banners: {
          create: banners?.map((banner: any, index: number) => ({
            title: banner.title,
            subtitle: banner.subtitle,
            description: banner.description,
            buttonText: banner.buttonText,
            buttonLink: banner.buttonLink,
            discountText: banner.discountText,
            bgColor: banner.bgColor || "#ffffff",
            textColor: banner.textColor || "#000000",
            imageUrl: banner.imageUrl,
            order: index,
            isActive: banner.isActive !== undefined ? banner.isActive : true,
            className: banner.className,
          })) || []
        }
      },
      include: {
        banners: true
      }
    });

    return NextResponse.json(section);
  } catch (error) {
    console.log("[SECTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
