import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { addressId } = await params;

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { label, fullName, phone, street, city, state, postalCode, country, isDefault } = body;

    // Verify ownership
    const existing = await db.address.findUnique({
      where: { id: addressId, userId: session.user.id }
    });

    if (!existing) return new NextResponse("Address not found", { status: 404 });

    if (isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false }
      });
    }

    const address = await db.address.update({
      where: { id: addressId },
      data: {
        label,
        fullName,
        phone,
        street,
        city,
        state,
        postalCode,
        country,
        isDefault
      }
    });

    return NextResponse.json(address);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ addressId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { addressId } = await params;

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const address = await db.address.findUnique({
      where: { id: addressId, userId: session.user.id }
    });

    if (!address) return new NextResponse("Address not found", { status: 404 });

    await db.address.delete({
      where: { id: addressId }
    });

    // If we deleted the default address, make the most recent one default
    if (address.isDefault) {
      const latest = await db.address.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" }
      });
      if (latest) {
        await db.address.update({
          where: { id: latest.id },
          data: { isDefault: true }
        });
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
