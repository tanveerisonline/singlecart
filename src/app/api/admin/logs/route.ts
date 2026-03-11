import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hasPermission } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.role, "VIEW_ANALYTICS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const logs = await db.activityLog.findMany({
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 200 // Limit to recent logs for performance
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("[ACTIVITY_LOGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
