import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.json();
    const { image, name } = formData;

    if (!image) {
      return new NextResponse("No image data provided", { status: 400 });
    }

    if (image.startsWith("data:image")) {
      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          image,
          { folder: "shop_uploads" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });

      const result = uploadResponse as any;

      await (db.media as any).create({
        data: {
          name: name || result.original_filename || "upload",
          url: result.secure_url,
          type: result.format,
          size: result.bytes,
        }
      });
      
      return NextResponse.json({ url: result.secure_url });
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
