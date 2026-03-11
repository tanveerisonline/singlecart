"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  ShoppingBag, 
  Mail, 
  Clock, 
  User, 
  RefreshCcw, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  TrendingDown
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const fetchCarts = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/marketing/abandoned-carts");
      setCarts(res.data);
    } catch (error) {
      toast.error("Failed to load abandoned carts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const onSendEmail = async (userId: string) => {
    try {
      setSendingId(userId);
      await axios.post("/api/admin/marketing/abandoned-carts", { userId });
      toast.success("Recovery email sent successfully!");
    } catch (error) {
      toast.error("Failed to send email");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Abandoned Carts</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest">Re-engage customers who left items in their cart</p>
        </div>
        <div className="flex items-center gap-4 bg-amber-50 px-6 py-3 rounded-2xl border border-amber-100">
           <TrendingDown className="h-5 w-5 text-amber-600" />
           <div>
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Potential Recovery</p>
              <p className="text-lg font-black text-amber-900">${carts.reduce((sum, c) => sum + c.cartItems.reduce((s: number, i: any) => s + (i.product.price * i.quantity), 0), 0).toLocaleString()}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="bg-white p-20 rounded-[32px] border border-gray-100 text-center">
            <RefreshCcw className="h-10 w-10 animate-spin text-primary mx-auto mb-4 opacity-20" />
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Scanning carts...</p>
          </div>
        ) : carts.length === 0 ? (
          <div className="bg-white p-20 rounded-[32px] border border-gray-100 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">No abandoned carts found</p>
            <p className="text-gray-400 text-xs mt-1">Carts appear here if inactive for more than 24 hours.</p>
          </div>
        ) : (
          carts.map((cart) => {
            const total = cart.cartItems.reduce((s: number, i: any) => s + (i.product.price * i.quantity), 0);
            return (
              <div key={cart.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="p-8 lg:flex items-center justify-between gap-12">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900 uppercase tracking-tight">{cart.name || "Guest Customer"}</h3>
                        <p className="text-xs font-bold text-gray-400">{cart.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {cart.cartItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                          <div className="h-8 w-8 rounded-lg relative overflow-hidden bg-white border border-gray-100">
                            <Image src={item.product.thumbnailUrl || "/placeholder-product.svg"} alt="" fill className="object-cover" />
                          </div>
                          <span className="text-[10px] font-black text-gray-600 uppercase pr-2">x{item.quantity}</span>
                        </div>
                      ))}
                      {cart.cartItems.length > 3 && (
                        <div className="h-12 flex items-center px-4 bg-gray-50 rounded-xl border border-gray-100 text-[10px] font-black text-gray-400 uppercase">
                          +{cart.cartItems.length - 3} More
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 lg:mt-0 flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[240px]">
                    <div className="text-right lg:text-left mb-2 lg:mb-0">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cart Total</p>
                       <p className="text-3xl font-black text-primary">${total.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => onSendEmail(cart.id)}
                      disabled={sendingId === cart.id}
                      className="w-full bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-xl shadow-gray-900/10 disabled:opacity-50"
                    >
                      {sendingId === cart.id ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                      Send Recovery Email
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
