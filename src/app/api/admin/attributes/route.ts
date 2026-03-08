import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // DEBUG: Check if attribute model exists on db object
    console.log("Available DB models:", Object.keys(db).filter(k => !k.startsWith('$')));
    
    if (!(db as any).attribute) {
      console.error("CRITICAL: 'attribute' model is missing from Prisma Client. This usually means 'npx prisma generate' failed or needs a restart.");
      return new NextResponse("Database client out of sync. Please restart the dev server.", { status: 500 });
    }

    const attributes = await (db as any).attribute.findMany({
      include: { values: true },
      orderBy: { name: "asc" }
    });

    return NextResponse.json(attributes);
  } catch (error: any) {
    console.error("[ATTRIBUTES_GET_ERROR]", error.message);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, values } = body; 

    if (!name) {
      return new NextResponse("Attribute name is required", { status: 400 });
    }

    if (!(db as any).attribute) {
      return new NextResponse("Database client out of sync.", { status: 500 });
    }

    const attribute = await (db as any).attribute.create({
      data: {
        name,
        values: {
          create: values.map((val: string) => ({ value: val }))
        }
      },
      include: { values: true }
    });

    return NextResponse.json(attribute);
  } catch (error: any) {
    console.error("[ATTRIBUTES_POST_ERROR]", error.message);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
