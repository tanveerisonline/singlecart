import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const faqs = await db.fAQ.findMany({
      where: { isActive: true },
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
