import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { writeFile, stat } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.json();
    const { image, name } = formData;

    if (!image) {
      return new NextResponse("No image data provided", { status: 400 });
    }

    // Check if it's a base64 image
    if (image.startsWith("data:image")) {
      const base64Data = image.split(",")[1];
      const buffer = Buffer.from(base64Data, "base64");
      
      const mimeType = image.split(";")[0].split(":")[1];
      const fileExtension = mimeType.split("/")[1];
      const fileName = `${randomUUID()}.${fileExtension}`;
      const relativePath = `/uploads/${fileName}`;
      const absolutePath = path.join(process.cwd(), "public", "uploads", fileName);

      await writeFile(absolutePath, buffer);
      
      const fileStat = await stat(absolutePath);

      // Log in Media table
      await (db.media as any).create({
        data: {
          name: name || fileName,
          url: relativePath,
          type: mimeType,
          size: fileStat.size,
        }
      });
      
      return NextResponse.json({ url: relativePath });
    }

    return new NextResponse("Invalid image format", { status: 400 });
  } catch (error) {
    console.log("[UPLOAD_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const media = await (db.media as any).findMany({
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(media);
  } catch (error) {
    console.log("[MEDIA_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
