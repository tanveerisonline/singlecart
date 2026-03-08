import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ attributeId: string }> }
) {
  try {
    const { attributeId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.attribute.delete({
      where: { id: attributeId }
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.log("[ATTRIBUTE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ attributeId: string }> }
) {
  try {
    const { attributeId } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, values } = body; // values is array of strings or objects

    const attribute = await db.attribute.update({
      where: { id: attributeId },
      data: {
        name,
        values: {
          deleteMany: {},
          create: values.map((val: any) => ({ value: typeof val === 'string' ? val : val.value }))
        }
      },
      include: { values: true }
    });

    return NextResponse.json(attribute);
  } catch (error) {
    console.log("[ATTRIBUTE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
