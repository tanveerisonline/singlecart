import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  CreditCard, 
  ShoppingBag,
  ChevronRight,
  ArrowLeft,
  XCircle,
  FileText
} from "lucide-react";
import Link from "next/link";
import InvoiceDownloadButton from "@/components/InvoiceDownloadButton";
import ReturnRequestButton from "@/components/ReturnRequestButton";

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
      returnRequest: true,
    },
  });

  if (!order || (order.userId !== session.user.id && session.user.role !== "ADMIN")) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
          <XCircle className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Order Not Found</h1>
          <p className="text-gray-500 font-medium max-w-sm mx-auto">The order you're looking for doesn't exist or you don't have access to it.</p>
        </div>
        <Link href="/orders" className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em] hover:gap-4 transition-all">
          <ArrowLeft className="h-4 w-4" /> Back to My Orders
        </Link>
      </div>
    );
  }

  const steps = [
    { label: "Pending", status: "PENDING", icon: Clock },
    { label: "Processing", status: "PROCESSING", icon: Package },
    { label: "Shipped", status: "SHIPPED", icon: Truck },
    { label: "Delivered", status: "DELIVERED", icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(step => step.status === order.status);

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-gray-50 pb-10">
           <div className="space-y-4">
              <Link href="/orders" className="flex items-center gap-2 text-gray-400 hover:text-primary transition-all group">
                 <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Back to My Orders</span>
              </Link>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Order Details</h1>
              <div className="flex items-center gap-4 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                 <span className="text-primary">#{order.orderNumber || order.id.substring(0, 8)}</span>
                 <span className="h-1 w-1 rounded-full bg-gray-200"></span>
                 <span>Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
           </div>
           
           <div className="flex gap-3">
              <ReturnRequestButton 
                orderId={order.id} 
                orderStatus={order.status} 
                hasReturnRequest={!!order.returnRequest} 
              />
              <InvoiceDownloadButton order={order} userName={session.user.name || "Customer"} />
           </div>
        </div>

        {/* Order Tracking Progress */}
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 sm:p-12 shadow-sm mb-12 overflow-x-auto">
           <div className="min-w-[600px] flex justify-between relative">
              <div className="absolute top-6 left-0 w-full h-1 bg-gray-100 -z-0"></div>
              <div className={`absolute top-6 left-0 h-1 bg-primary transition-all duration-1000 -z-0`} style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}></div>
              
              {steps.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.label} className="relative z-10 flex flex-col items-center gap-4">
                     <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white border-4 border-gray-50 text-gray-300"}`}>
                        <Icon className="h-6 w-6" />
                     </div>
                     <div className="text-center">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-gray-900" : "text-gray-300"}`}>{step.label}</p>
                        {isActive && idx === currentStepIndex && <p className="text-[8px] font-bold text-primary uppercase mt-1">Current State</p>}
                     </div>
                  </div>
                )
              })}
           </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Items & Address */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-gray-50/30">
                 <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Ordered Items</h2>
              </div>
              <ul role="list" className="divide-y divide-gray-50">
                {order.items.map((item) => (
                  <li key={item.id} className="p-8 flex gap-8 group">
                    <div className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      <Image
                        src={item.product.thumbnailUrl || "/placeholder-product.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-gray-900 group-hover:text-primary transition-colors">{item.product.name}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-xl font-black text-gray-900">${(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <MapPin className="h-5 w-5" />
                     </div>
                     <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Shipping Address</h3>
                  </div>
                  <div className="text-sm text-gray-500 font-medium leading-relaxed">
                    <p className="font-black text-gray-900 text-base mb-2">{session.user.name}</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                    <p className="uppercase tracking-widest mt-2">{order.shippingAddress.country}</p>
                  </div>
               </div>

               <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <CreditCard className="h-5 w-5" />
                     </div>
                     <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Payment Method</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="h-8 w-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center opacity-40 grayscale"><Image src="/vercel.svg" alt="pay" width={20} height={20} /></div>
                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{order.paymentMethod || "Cash on Delivery"}</p>
                     </div>
                     <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {order.paymentStatus === 'PAID' ? 'Payment Completed' : 'Payment Pending'}
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4 mt-10 lg:mt-0">
            <div className="bg-gray-900 rounded-[40px] p-10 shadow-2xl text-white sticky top-32 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <ShoppingBag className="h-32 w-32" />
              </div>
              
              <h2 className="text-xl font-black uppercase tracking-tight mb-10">Order Summary</h2>

              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="text-lg font-black text-white">${(order.totalAmount - order.shippingCost).toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-xs font-bold uppercase tracking-widest">Shipping</span>
                  <span className="text-lg font-black text-white">${order.shippingCost.toLocaleString()}</span>
                </div>

                <div className="border-t border-white/10 pt-8 mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-black uppercase tracking-widest">Grand Total</span>
                    <span className="text-4xl font-black text-primary">${order.totalAmount.toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center mt-10">Thank you for shopping with us!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
