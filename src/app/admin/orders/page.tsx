import { db } from "@/lib/db";
import { ShoppingBag, Search, Filter, ArrowUpDown, Clock, CheckCircle2, XCircle, Package } from "lucide-react";
import Link from "next/link";
import OrderStatusSwitcher from "@/components/admin/OrderStatusSwitcher";

export default async function AdminOrdersPage() {
  const [orders, stats] = await Promise.all([
    db.order.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.order.groupBy({
      by: ['status'],
      _count: true
    })
  ]);

  const totalOrders = orders.length;
  const pendingOrders = stats.find(s => s.status === 'PENDING')?._count || 0;
  const deliveredOrders = stats.find(s => s.status === 'DELIVERED')?._count || 0;
  const cancelledOrders = stats.find(s => s.status === 'CANCELLED')?._count || 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Manage and track all customer orders from here.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all text-sm font-semibold flex items-center shadow-sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all text-sm font-semibold flex items-center shadow-sm shadow-primary/20">
            Export Orders
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
          { label: "Pending", value: pendingOrders, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Delivered", value: deliveredOrders, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Cancelled", value: cancelledOrders, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96 group">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by ID or customer..." 
              className="w-full bg-gray-50 border-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort by:</span>
            <button className="text-sm font-bold text-gray-700 flex items-center hover:text-primary">
              Newest <ArrowUpDown className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <ShoppingBag className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">No orders found</p>
                      <p className="text-gray-400 text-xs mt-1">When customers buy products, they'll appear here.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                    <td className="px-6 py-5">
                      <Link href={`/admin/orders/${order.id}`} className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                        {order.orderNumber}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-[10px] text-gray-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {order.user.name?.[0] || order.user.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                            {order.user.name || "Customer"}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[150px]">
                            {order.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-bold text-gray-900">${order.totalAmount.toFixed(2)}</div>
                      <div className="text-[10px] text-gray-500 font-medium">{order.paymentMethod || 'Credit Card'}</div>
                    </td>
                    <td className="px-6 py-5">
                      <OrderStatusSwitcher orderId={order.id} currentStatus={order.status} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center justify-center h-8 px-4 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold hover:opacity-90/10 hover:text-primary transition-all"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-6 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-500">Showing {orders.length} orders</p>
          <div className="flex gap-2">
            <button disabled className="px-3 py-1 rounded-lg border border-gray-100 text-xs font-bold text-gray-400 disabled:opacity-50">Previous</button>
            <button disabled className="px-3 py-1 rounded-lg border border-gray-100 text-xs font-bold text-gray-400 disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
