import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    const existingUser = await db.user.findUnique({
      where: { id: params.userId }
    });

    if (!existingUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Do not allow removing the last admin (basic check)
    if (existingUser.role === "ADMIN" && role && role !== "ADMIN") {
      const adminCount = await db.user.count({
        where: { role: "ADMIN" }
      });
      if (adminCount <= 1) {
        return new NextResponse("Cannot remove the only administrator", { status: 400 });
      }
    }

    const updateData: any = {
      name,
      email,
      role,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await db.user.update({
      where: { id: params.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.log("[USER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userToDelete = await db.user.findUnique({
      where: { id: params.userId }
    });

    if (!userToDelete) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (userToDelete.role === "ADMIN") {
      const adminCount = await db.user.count({
        where: { role: "ADMIN" }
      });
      if (adminCount <= 1) {
        return new NextResponse("Cannot delete the only administrator", { status: 400 });
      }
    }

    await db.user.delete({
      where: { id: params.userId }
    });

    return new NextResponse("User deleted", { status: 200 });
  } catch (error) {
    console.log("[USER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
