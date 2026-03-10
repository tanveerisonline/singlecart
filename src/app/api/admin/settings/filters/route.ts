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

    let settings = await (db as any).filterSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await (db as any).filterSetting.create({
        data: { id: "default" },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[FILTER_SETTINGS_GET]", error);
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
    const { id, updatedAt, createdAt, ...updateData } = body;

    const settings = await (db as any).filterSetting.upsert({
      where: { id: "default" },
      update: updateData,
      create: { ...updateData, id: "default" },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[FILTER_SETTINGS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
