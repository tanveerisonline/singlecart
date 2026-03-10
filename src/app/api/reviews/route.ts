import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, title, comment, images } = body;

    if (!productId || !rating) {
      return new NextResponse("Missing data", { status: 400 });
    }

    // Check if user has purchased this product
    const order = await db.order.findFirst({
      where: {
        userId: session.user.id,
        status: "DELIVERED",
        items: {
          some: {
            productId: productId
          }
        }
      }
    });

    if (!order) {
      return new NextResponse("You must purchase this product before reviewing it.", { status: 403 });
    }

    const review = await db.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        title,
        comment,
        isApproved: false, // Default to false for moderation
        images: {
          createMany: {
            data: images ? images.map((url: string) => ({ url })) : []
          }
        }
      },
      include: {
        images: true
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.log("[REVIEWS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
