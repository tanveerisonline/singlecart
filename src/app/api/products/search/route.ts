import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const products = await db.product.findMany({
      where: {
        name: {
          contains: query,
        },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        thumbnailUrl: true,
        images: {
          take: 1,
          select: { url: true }
        }
      },
      take: 5,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("[PRODUCT_SEARCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
