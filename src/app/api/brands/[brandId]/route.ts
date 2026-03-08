import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "PRODUCT_MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!brandId) {
      return new NextResponse("Brand ID is required", { status: 400 });
    }

    await db.brand.delete({
      where: { id: brandId }
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[BRAND_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "PRODUCT_MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, slug, logoUrl } = body;

    const brand = await db.brand.update({
      where: { id: brandId },
      data: {
        name,
        slug,
        logoUrl
      }
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error("[BRAND_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
