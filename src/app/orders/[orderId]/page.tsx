import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";

interface OrderPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderDetailsPage({ params }: OrderPageProps) {
  const session = await getServerSession(authOptions);
  const { orderId } = await params;

  if (!session) {
    redirect("/login");
  }

  const order = await db.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
    },
  });

  if (!order || (order.userId !== session.user.id && session.user.role !== "ADMIN")) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Order not found</h1>
        <p className="text-gray-500 mt-2">The order you are looking for does not exist or you don't have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Order #{order.orderNumber}</h1>
          <p className="mt-2 text-sm text-gray-500">
            Placed on <time>{new Date(order.createdAt).toLocaleDateString()}</time>
          </p>
        </div>
        <div className="flex space-x-4">
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
            order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
            order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
            "bg-blue-100 text-blue-800"
          }`}>
            {order.status}
          </span>
        </div>
      </div>

      <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-8">
          <h2 className="sr-only">Order Items</h2>
          <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {order.items.map((item) => (
              <li key={item.id} className="py-6 flex">
                <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden bg-gray-100">
                  <Image
                    src="/placeholder-product.jpg"
                    alt={item.product.name}
                    width={100}
                    height={100}
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                <div className="ml-6 flex-1 flex flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>{item.product.name}</h3>
                      <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Qty {item.quantity}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
            <div className="mt-4 text-sm text-gray-600">
              <p>{session.user.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>

        <div className="mt-16 lg:mt-0 lg:col-span-4">
          <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>
          <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <dl className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="font-medium text-gray-900">${(order.totalAmount - order.shippingCost).toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between text-sm">
                <dt className="text-gray-600">Shipping</dt>
                <dd className="font-medium text-gray-900">${order.shippingCost.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between text-base font-bold border-t border-gray-200 pt-4">
                <dt className="text-gray-900">Total</dt>
                <dd className="text-gray-900">${order.totalAmount.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
