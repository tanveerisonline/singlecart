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
    const { productId, rating, title, comment } = body;

    if (!productId || !rating) {
      return new NextResponse("Missing data", { status: 400 });
    }

    const review = await db.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        title,
        comment,
        isApproved: false, // Default to false for moderation
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.log("[REVIEWS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
