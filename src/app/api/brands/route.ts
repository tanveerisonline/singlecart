import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const brands = await db.brand.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: "asc"
      }
    });
    return NextResponse.json(brands);
  } catch (error) {
    console.error("[BRANDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "PRODUCT_MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, slug, logoUrl } = body;

    if (!name || !slug) {
      return new NextResponse("Name and slug are required", { status: 400 });
    }

    const existingBrand = await db.brand.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });

    if (existingBrand) {
      return new NextResponse("Brand name or slug already exists", { status: 400 });
    }

    const brand = await db.brand.create({
      data: {
        name,
        slug,
        logoUrl
      }
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error("[BRANDS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
