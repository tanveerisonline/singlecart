import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hasPermission } from "@/lib/rbac";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.role, "MANAGE_PRODUCTS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { ids, action, value } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new NextResponse("No product IDs provided", { status: 400 });
    }

    let updateData: any = {};

    switch (action) {
      case "DELETE":
        await db.product.deleteMany({
          where: { id: { in: ids } }
        });
        return NextResponse.json({ message: "Products deleted successfully" });
      
      case "UPDATE_STATUS":
        updateData = { isActive: value === "active" };
        break;
      
      case "UPDATE_STOCK_STATUS":
        updateData = { stockStatus: value };
        break;
      
      case "UPDATE_PRICE":
        // This is a bit more complex, usually relative or fixed
        // For simplicity, let's assume it's a fixed value for now
        updateData = { price: parseFloat(value) };
        break;
      
      default:
        return new NextResponse("Invalid bulk action", { status: 400 });
    }

    await db.product.updateMany({
      where: { id: { in: ids } },
      data: updateData
    });

    return NextResponse.json({ message: "Products updated successfully" });
  } catch (error) {
    console.error("[PRODUCTS_BULK_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
