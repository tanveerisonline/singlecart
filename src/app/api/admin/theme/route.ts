import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("[THEME_GET] Fetching theme settings...");
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // @ts-ignore - In case Prisma client is not yet regenerated
    let themeSetting = await db.themeSetting.findFirst();

    if (!themeSetting) {
      console.log("[THEME_GET] No settings found, creating default...");
      // @ts-ignore
      themeSetting = await db.themeSetting.create({
        data: {
          id: "default"
        }
      });
    }

    return NextResponse.json(themeSetting);
  } catch (error: any) {
    console.error("[THEME_GET_ERROR]", error.message || error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    console.log("[THEME_PATCH] Updating theme settings...");
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { 
      logoUrl, 
      faviconUrl, 
      primaryColor, 
      safeCheckoutImage, 
      secureCheckoutImage,
      contactEmail,
      contactPhone,
      address,
      facebookUrl,
      instagramUrl,
      twitterUrl
    } = body;

    // @ts-ignore
    const themeSetting = await db.themeSetting.upsert({
      where: { id: "default" },
      update: {
        logoUrl,
        faviconUrl,
        primaryColor,
        safeCheckoutImage,
        secureCheckoutImage,
        contactEmail,
        contactPhone,
        address,
        facebookUrl,
        instagramUrl,
        twitterUrl
      },
      create: {
        id: "default",
        logoUrl,
        faviconUrl,
        primaryColor,
        safeCheckoutImage,
        secureCheckoutImage,
        contactEmail,
        contactPhone,
        address,
        facebookUrl,
        instagramUrl,
        twitterUrl
      }
    });

    return NextResponse.json(themeSetting);
  } catch (error: any) {
    console.error("[THEME_PATCH_ERROR]", error.message || error);
    return new NextResponse(`Internal Error: ${error.message}`, { status: 500 });
  }
}
