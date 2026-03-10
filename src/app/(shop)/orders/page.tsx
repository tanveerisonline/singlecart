import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, ChevronRight, Clock, CheckCircle2, Truck, XCircle, ShoppingBag, ArrowRight, Calendar, DollarSign } from "lucide-react";

export default async function CustomerOrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const orders = await db.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              thumbnailUrl: true,
            }
          }
        }
      }
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
            <div className="grid grid-cols-1 gap-8">
              {orders.map((order) => {
                const config = getStatusConfig(order.status);
                const firstItems = order.items.slice(0, 3);
                const remainingCount = order.items.length - 3;

                return (
                  <div key={order.id} className="group bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500">
                    <div className="p-8 sm:p-12">
                      <div className="flex flex-col lg:flex-row justify-between gap-10">
                        {/* Order Info & Images */}
                        <div className="flex-1 space-y-8">
                          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Reference</p>
                              <p className="text-sm font-black text-gray-900 uppercase">#{order.orderNumber || order.id.substring(0, 8)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Date Placed
                              </p>
                              <p className="text-sm font-black text-gray-900 uppercase">{new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <DollarSign className="h-3 w-3" /> Investment
                              </p>
                              <p className="text-xl font-black text-primary">${order.totalAmount.toLocaleString()}</p>
                            </div>
                          </div>

                          {/* Product Thumbnails */}
                          <div className="flex items-center gap-4">
                            <div className="flex -space-x-4">
                              {firstItems.map((item, idx) => (
                                <div key={idx} className="relative h-20 w-20 rounded-[1.5rem] bg-gray-50 border-4 border-white overflow-hidden shadow-sm group-hover:scale-105 transition-transform duration-500" style={{ zIndex: 10 - idx }}>
                                  <Image
                                    src={item.product.thumbnailUrl || "/placeholder-product.svg"}
                                    alt="product"
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                              {remainingCount > 0 && (
                                <div className="relative h-20 w-20 rounded-[1.5rem] bg-gray-900 border-4 border-white flex items-center justify-center shadow-sm z-0">
                                  <span className="text-white text-xs font-black">+{remainingCount}</span>
                                </div>
                              )}
                            </div>
                            <div className="hidden sm:block">
                               <p className="text-sm font-black text-gray-900 uppercase tracking-tight">
                                  {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                               </p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                  {order.items[0].product.name} {order.items.length > 1 ? '& more' : ''}
                               </p>
                            </div>
                          </div>
                        </div>

                        {/* Status & Action */}
                        <div className="flex flex-row lg:flex-col justify-between lg:justify-center items-center gap-6 lg:border-l border-gray-50 lg:pl-10 shrink-0">
                          <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl ${config.bg} ${config.color} border ${config.color.replace('text-', 'border-').replace('600', '100')} transition-all`}>
                             <config.icon className="h-4 w-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
                          </div>
                          <Link
                            href={`/orders/${order.id}`}
                            className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all group/btn shadow-xl shadow-gray-200"
                          >
                            View Details
                            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        </div>
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
