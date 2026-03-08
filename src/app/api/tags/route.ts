import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tags = await db.tag.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: "asc"
      }
    });
    return NextResponse.json(tags);
  } catch (error) {
    console.error("[TAGS_GET]", error);
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
    const { name, slug } = body;

    if (!name || !slug) {
      return new NextResponse("Name and slug are required", { status: 400 });
    }

    const existingTag = await db.tag.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });

    if (existingTag) {
      return new NextResponse("Tag name or slug already exists", { status: 400 });
    }

    const tag = await db.tag.create({
      data: {
        name,
        slug
      }
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("[TAGS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
