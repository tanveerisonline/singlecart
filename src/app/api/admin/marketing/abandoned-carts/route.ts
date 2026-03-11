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

    // Find cart items that were updated > 24 hours ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const abandonedCarts = await db.user.findMany({
      where: {
        cartItems: {
          some: {
            updatedAt: {
              lt: oneDayAgo
            }
          }
        },
        orders: {
          none: {
            createdAt: {
              gt: oneDayAgo
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        cartItems: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
                thumbnailUrl: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(abandonedCarts);
  } catch (error) {
    console.error("[ABANDONED_CARTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !hasPermission(session.user.role, "MANAGE_ORDERS")) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { userId } = body;

    // Simulate sending recovery email
    console.log(`[MARKETING] Sending abandoned cart recovery email to user: ${userId}`);
    
    return NextResponse.json({ message: "Recovery email triggered successfully" });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
