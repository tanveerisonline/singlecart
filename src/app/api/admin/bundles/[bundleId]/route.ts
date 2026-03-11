import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hasPermission } from "@/lib/rbac";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ bundleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { bundleId } = await params;

    if (!session || !hasPermission(session.user.role, "MANAGE_PRODUCTS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, isActive, image, productIds } = body;

    // We need to first disconnect old products if productIds are provided
    const updateData: any = {
      name,
      description,
      price: price !== undefined ? parseFloat(price) : undefined,
      isActive,
      image,
    };

    if (productIds && Array.isArray(productIds)) {
      // Get current products
      const currentBundle = await db.bundle.findUnique({
        where: { id: bundleId },
        include: { products: true }
      });
      
      updateData.products = {
        disconnect: currentBundle?.products.map(p => ({ id: p.id })),
        connect: productIds.map((id: string) => ({ id }))
      };
    }

    const bundle = await db.bundle.update({
      where: { id: bundleId },
      data: updateData,
      include: { products: true }
    });

    return NextResponse.json(bundle);
  } catch (error) {
    console.error("[BUNDLE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ bundleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { bundleId } = await params;

    if (!session || !hasPermission(session.user.role, "MANAGE_PRODUCTS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.bundle.delete({
      where: { id: bundleId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[BUNDLE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
