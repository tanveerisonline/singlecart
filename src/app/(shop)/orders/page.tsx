import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ChevronRight, Clock, CheckCircle2, Truck, XCircle, ShoppingBag, ArrowRight } from "lucide-react";

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "DELIVERED": return { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", label: "Delivered" };
      case "SHIPPED": return { icon: Truck, color: "text-blue-600", bg: "bg-blue-50", label: "Shipped" };
      case "CANCELLED": return { icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", label: "Cancelled" };
      case "PROCESSING": return { icon: Package, color: "text-primary", bg: "bg-primary/10", label: "Processing" };
      default: return { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Pending" };
    }
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 border-b border-gray-50 pb-10">
           <div className="space-y-2">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">My Orders</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Manage and track your shopping history</p>
           </div>
           <Link href="/search" className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
              Continue Shopping <ArrowRight className="h-4 w-4" />
           </Link>
        </div>

        <div className="space-y-8">
          {orders.length === 0 ? (
            <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                 <ShoppingBag className="h-12 w-12 text-gray-200" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">No orders yet</h2>
                 <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto">Looks like you haven't made any purchases yet. Start exploring our premium collection!</p>
              </div>
              <Link href="/search" className="inline-block bg-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                 Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => {
                const config = getStatusConfig(order.status);
                return (
                  <div key={order.id} className="group bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300">
                    <div className="p-8 sm:p-10 flex flex-col md:flex-row justify-between gap-8">
                      <div className="flex flex-wrap items-center gap-8">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</p>
                          <p className="text-sm font-black text-gray-900 uppercase">#{order.orderNumber || order.id.substring(0, 8)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Placed</p>
                          <p className="text-sm font-black text-gray-900 uppercase">{new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                          <p className="text-lg font-black text-primary">${order.totalAmount.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-6 md:pt-0 border-gray-50">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${config.bg} ${config.color} transition-all`}>
                           <config.icon className="h-4 w-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
                        </div>
                        <Link
                          href={`/orders/${order.id}`}
                          className="h-12 w-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-primary hover:text-white transition-all group/btn"
                        >
                          <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
