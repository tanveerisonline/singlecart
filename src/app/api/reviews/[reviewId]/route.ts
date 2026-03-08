import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { reviewId } = await params;

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { isApproved } = body;

    const review = await db.review.update({
      where: {
        id: reviewId,
      },
      data: {
        isApproved,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.log("[REVIEW_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { reviewId } = await params;

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.review.delete({
      where: {
        id: reviewId,
      },
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.log("[REVIEW_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
