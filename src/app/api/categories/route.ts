import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
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

    const existingCategory = await db.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return new NextResponse("Category with this slug already exists", { status: 400 });
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
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "");
    const limit = parseInt(searchParams.get("limit") || "");
    const search = searchParams.get("search") || "";
    const activeOnly = searchParams.get("activeOnly") === "true";

    const where: any = {};
    
    if (activeOnly) {
      where.isActive = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
      ];
    }

    // If no pagination is requested, return all (common for dropdowns)
    if (isNaN(page) || isNaN(limit)) {
      const categories = await db.category.findMany({
        where,
        include: {
          parent: true,
          _count: {
            select: { products: true }
          }
        },
        orderBy: {
          name: "asc",
        },
      });
      
      // If the frontend expects { categories, meta }, wrap it
      // But many places might expect just the array. 
      // Given the error in CategoriesPage, it expects { categories, meta }
      return NextResponse.json({
        categories,
        meta: {
          total: categories.length,
          totalPages: 1
        }
      });
    }

    const skip = (page - 1) * limit;

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
          createdAt: "desc",
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
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
