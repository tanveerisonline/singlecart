import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { pageId } = await params;

    const page = await db.page.findUnique({
      where: {
        id: pageId,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.log("[PAGE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { pageId } = await params;
    const body = await req.json();
    const { title, slug, content, isActive } = body;

    if (!pageId) {
      return new NextResponse("Page ID required", { status: 400 });
    }

    const page = await db.page.update({
      where: {
        id: pageId,
      },
      data: {
        title,
        slug,
        content,
        isActive,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.log("[PAGE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { pageId } = await params;

    const page = await db.page.delete({
      where: {
        id: pageId,
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.log("[PAGE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
