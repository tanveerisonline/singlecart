import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    const { sectionId } = await params;
    const section = await db.dynamicSection.findUnique({
      where: { id: sectionId },
      include: {
        banners: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!section) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.log("[SECTION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { sectionId } = await params;
    const body = await req.json();
    const { name, page, location, layout, order, isActive, containerClassName, banners } = body;

    // Use a transaction to update section and sync banners
    const section = await db.$transaction(async (tx) => {
      // 1. Update the section
      const updatedSection = await tx.dynamicSection.update({
        where: { id: sectionId },
        data: {
          name,
          page,
          location,
          layout,
          order: order !== undefined ? parseInt(order.toString()) : undefined,
          isActive,
          containerClassName,
        },
      });

      // 2. Delete all existing banners for this section
      await tx.banner.deleteMany({
        where: { sectionId },
      });

      // 3. Create current banners
      if (banners && banners.length > 0) {
        await tx.banner.createMany({
          data: banners.map((banner: any, index: number) => ({
            sectionId,
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
          })),
        });
      }

      return updatedSection;
    });

    return NextResponse.json(section);
  } catch (error) {
    console.log("[SECTION_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { sectionId } = await params;
    const section = await db.dynamicSection.delete({
      where: { id: sectionId },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.log("[SECTION_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
