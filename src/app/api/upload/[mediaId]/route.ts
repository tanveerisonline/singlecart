import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ mediaId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { mediaId } = await params;

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const mediaItem = await (db.media as any).findUnique({
      where: { id: mediaId }
    });

    if (!mediaItem) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Delete from file system
    if (mediaItem.url.startsWith("/uploads/")) {
      const absolutePath = path.join(process.cwd(), "public", mediaItem.url);
      try {
        await unlink(absolutePath);
      } catch (unlinkError) {
        console.error("[MEDIA_FILE_UNLINK_ERROR]", unlinkError);
        // Continue to delete from DB even if file is missing
      }
    }

    // Delete from database
    await (db.media as any).delete({
      where: { id: mediaId }
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.log("[MEDIA_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
