import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hasPermission } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.role, "MANAGE_SETTINGS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const faqs = await db.fAQ.findMany({
      orderBy: [
        { category: "asc" },
        { order: "asc" }
      ]
    });

    return NextResponse.json(faqs);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.role, "MANAGE_SETTINGS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { question, answer, category, order, isActive } = body;

    if (!question || !answer) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const faq = await db.fAQ.create({
      data: {
        question,
        answer,
        category: category || "General",
        order: parseInt(order) || 0,
        isActive: isActive !== undefined ? isActive : true,
      }
    });

    return NextResponse.json(faq);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
