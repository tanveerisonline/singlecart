import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let settings = await db.storeSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await db.storeSetting.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Remove immutable fields if present
    const { id, updatedAt, createdAt, ...updateData } = body;

    // We use (db.storeSetting as any).upsert to bypass the stale Prisma Client types 
    // caused by EPERM locking the query engine during generation.
    // The database itself IS updated, but the TypeScript types in node_modules are stale.
    const settings = await (db.storeSetting as any).upsert({
      where: { id: "default" },
      update: updateData,
      create: { ...updateData, id: "default" },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[SETTINGS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
