import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hasPermission } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.role, "MANAGE_PRODUCTS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bundles = await db.bundle.findMany({
      include: {
        products: {
          select: { id: true, name: true, price: true, thumbnailUrl: true, images: { take: 1 } }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(bundles);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.role, "MANAGE_PRODUCTS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, description, price, isActive, image, productIds } = body;

    if (!name || !price || !productIds || !Array.isArray(productIds)) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const bundle = await db.bundle.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        isActive: isActive !== undefined ? isActive : true,
        image,
        products: {
          connect: productIds.map((id: string) => ({ id }))
        }
      },
      include: {
        products: true
      }
    });

    return NextResponse.json(bundle);
  } catch (error) {
    console.error("[BUNDLES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
