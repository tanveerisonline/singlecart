import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CustomerOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const orders = await db.order.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Your Orders</h1>
          <p className="mt-2 text-sm text-gray-500">
            Check the status of recent orders, manage returns, and download invoices.
          </p>
        </div>

        <div className="mt-16">
          <h2 className="sr-only">Recent orders</h2>

          <div className="space-y-20">
            {orders.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500">You haven't placed any orders yet.</p>
                <Link href="/" className="mt-4 text-indigo-600 font-medium hover:text-indigo-500">
                  Start shopping
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center border-b border-gray-200">
                      <div className="flex space-x-6">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Date Placed</p>
                          <p className="text-sm font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Total Amount</p>
                          <p className="text-sm font-medium text-gray-900">${order.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Order #</p>
                          <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                        </div>
                      </div>
                      <div>
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-indigo-600 font-medium hover:text-indigo-500 text-sm"
                        >
                          View Order
                        </Link>
                      </div>
                    </div>
                    <div className="px-6 py-4 flex justify-between items-center">
                       <div className="flex items-center">
                          <span className={`h-2.5 w-2.5 rounded-full mr-2 ${
                            order.status === "DELIVERED" ? "bg-green-500" :
                            order.status === "PENDING" ? "bg-yellow-500" :
                            "bg-blue-500"
                          }`} />
                          <span className="text-sm font-medium text-gray-900">Status: {order.status}</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
