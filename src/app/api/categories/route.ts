import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";

    const where = {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    };

    const [categories, total] = await Promise.all([
      db.category.findMany({
        where,
        include: {
          parent: true,
          _count: {
            select: { products: true }
          }
        },
        orderBy: {
          createdAt: "desc"
        },
        skip,
        take: limit,
      }),
      db.category.count({ where })
    ]);

    return NextResponse.json({
      categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
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

    if (!name || !slug) {
      return new NextResponse("Name and slug are required", { status: 400 });
    }

    const existingCategory = await db.category.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });

    if (existingCategory) {
      return new NextResponse("Category name or slug already exists", { status: 400 });
    }

    const category = await db.category.create({
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
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
