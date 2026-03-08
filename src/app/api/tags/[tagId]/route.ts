import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ tagId: string }> }
) {
  try {
    const { tagId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "PRODUCT_MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!tagId) {
      return new NextResponse("Tag ID is required", { status: 400 });
    }

    await db.tag.delete({
      where: { id: tagId }
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[TAG_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ tagId: string }> }
) {
  try {
    const { tagId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "PRODUCT_MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, slug } = body;

    const tag = await db.tag.update({
      where: { id: tagId },
      data: {
        name,
        slug
      }
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error("[TAG_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
