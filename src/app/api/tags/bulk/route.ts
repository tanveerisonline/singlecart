import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { tags } = body;

    if (!Array.isArray(tags)) {
      return new NextResponse("Invalid data format", { status: 400 });
    }

    // Use a transaction to ensure all or nothing
    await db.$transaction(
      tags.map((tag: any) => 
        db.tag.upsert({
          where: { slug: tag.slug || tag.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") },
          update: {
            name: tag.name,
          },
          create: {
            name: tag.name,
            slug: tag.slug || tag.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "")
          },
        })
      )
    );

    return new NextResponse("Import successful", { status: 200 });
  } catch (error: any) {
    console.error("[TAGS_BULK_POST]", error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
