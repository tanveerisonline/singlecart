import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const pages = await db.page.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.log("[PAGES_GET]", error);
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
    const { title, slug, content, isActive } = body;

    if (!title || !slug || !content) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingPage = await db.page.findUnique({
      where: { slug }
    });

    if (existingPage) {
      return new NextResponse("Page with this slug already exists", { status: 400 });
    }

    const page = await db.page.create({
      data: {
        title,
        slug,
        content,
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    return NextResponse.json(page);
  } catch (error) {
    console.log("[PAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
