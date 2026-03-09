import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "PRODUCT_MANAGER"].includes(session.user.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { categories } = body;

    if (!Array.isArray(categories)) {
      return new NextResponse("Invalid data format", { status: 400 });
    }

    // Sort categories to process parents before children if they are in the same batch
    // This is a bit complex for a single transaction if we use cuid, 
    // but we can try to upsert based on slug.
    
    // For simplicity, we'll process them in two passes or assume parents are already there
    // or just let Prisma handle it if possible.
    
    // Better way: process top-level first, then others.
    const topLevel = categories.filter(c => !c.parentId);
    const children = categories.filter(c => c.parentId);

    await db.$transaction([
      ...topLevel.map((cat: any) => 
        db.category.upsert({
          where: { slug: cat.slug },
          update: {
            name: cat.name,
            description: cat.description,
            imageUrl: cat.imageUrl,
            iconUrl: cat.iconUrl,
            metaTitle: cat.metaTitle,
            metaDescription: cat.metaDescription,
            metaImageUrl: cat.metaImageUrl,
            isActive: cat.isActive !== undefined ? cat.isActive : true,
          },
          create: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            imageUrl: cat.imageUrl,
            iconUrl: cat.iconUrl,
            metaTitle: cat.metaTitle,
            metaDescription: cat.metaDescription,
            metaImageUrl: cat.metaImageUrl,
            isActive: cat.isActive !== undefined ? cat.isActive : true,
          }
        })
      ),
      ...children.map((cat: any) => 
        db.category.upsert({
          where: { slug: cat.slug },
          update: {
            name: cat.name,
            description: cat.description,
            imageUrl: cat.imageUrl,
            iconUrl: cat.iconUrl,
            metaTitle: cat.metaTitle,
            metaDescription: cat.metaDescription,
            metaImageUrl: cat.metaImageUrl,
            isActive: cat.isActive !== undefined ? cat.isActive : true,
            // We assume the parent category already exists or is in the topLevel
            // If parentId is provided as a slug in the import, we'd need more logic.
            // For now we assume IDs are stable or it's a re-import.
            parentId: cat.parentId
          },
          create: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            imageUrl: cat.imageUrl,
            iconUrl: cat.iconUrl,
            metaTitle: cat.metaTitle,
            metaDescription: cat.metaDescription,
            metaImageUrl: cat.metaImageUrl,
            isActive: cat.isActive !== undefined ? cat.isActive : true,
            parentId: cat.parentId
          }
        })
      )
    ]);

    return new NextResponse("Import successful", { status: 200 });
  } catch (error: any) {
    console.error("[CATEGORIES_BULK_POST]", error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
