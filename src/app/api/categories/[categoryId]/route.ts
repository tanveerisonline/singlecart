import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "PRODUCT_MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    // Check if category has subcategories
    const hasSubCategories = await db.category.findFirst({
      where: { parentId: categoryId }
    });

    if (hasSubCategories) {
      return new NextResponse("Cannot delete category with sub-categories", { status: 400 });
    }

    await db.category.delete({
      where: { id: categoryId }
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    
    if (!categoryId) {
      return new NextResponse("Category ID is required", { status: 400 });
    }

    const category = await db.category.findUnique({
      where: { id: categoryId },
      include: {
        parent: true,
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "PRODUCT_MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      name, 
      slug, 
      description, 
      parentId,
      imageUrl,
      iconUrl,
      metaTitle,
      metaDescription,
      metaImageUrl,
      isActive 
    } = body;

    const category = await db.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug,
        description,
        parentId: parentId || null,
        imageUrl,
        iconUrl,
        metaTitle,
        metaDescription,
        metaImageUrl,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
