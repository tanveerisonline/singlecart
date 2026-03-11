import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hasPermission } from "@/lib/rbac";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ faqId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { faqId } = await params;

    if (!session || !hasPermission(session.user.role, "MANAGE_SETTINGS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { question, answer, category, order, isActive } = body;

    const faq = await db.fAQ.update({
      where: { id: faqId },
      data: {
        question,
        answer,
        category,
        order: order !== undefined ? parseInt(order) : undefined,
        isActive
      }
    });

    return NextResponse.json(faq);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ faqId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { faqId } = await params;

    if (!session || !hasPermission(session.user.role, "MANAGE_SETTINGS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.fAQ.delete({
      where: { id: faqId }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
