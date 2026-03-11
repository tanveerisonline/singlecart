"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { 
  CheckCircle2, 
  ShoppingBag, 
  ArrowRight, 
  Package, 
  Truck, 
  ShieldCheck,
  Star,
  Eye,
  RefreshCcw
} from "lucide-react";
import ProductCard from "@/components/ProductCard";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch latest products
        const response = await axios.get("/api/products?limit=4&sort=newest");
        setLatestProducts(response.data.slice(0, 4));

        // Load recently viewed from localStorage
        const stored = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
        setRecentlyViewed(stored.slice(0, 4));
      } catch (error) {
        console.error("Error fetching success page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Success Header Card */}
        <div className="bg-white rounded-[40px] p-8 md:p-16 text-center border border-gray-100 shadow-sm space-y-8 animate-in fade-in zoom-in duration-700">
           <div className="h-24 w-24 bg-emerald-50 rounded-[32px] flex items-center justify-center mx-auto text-emerald-500 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="h-12 w-12" />
           </div>
           
           <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tight">Order Completed!</h1>
              <p className="text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
                 Thank you for your purchase. Your order has been placed successfully and is being processed by our team.
              </p>
           </div>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href={orderId ? `/orders/${orderId}` : "/orders"} 
                className="w-full sm:w-auto px-10 py-5 bg-gray-900 text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-primary transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-3"
              >
                 <Package className="h-4 w-4" /> View Order Details
              </Link>
              <Link 
                href="/search" 
                className="w-full sm:w-auto px-10 py-5 bg-white border border-gray-100 text-gray-900 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:border-primary hover:text-primary transition-all shadow-sm flex items-center justify-center gap-3"
              >
                 <ShoppingBag className="h-4 w-4" /> Continue Shopping
              </Link>
           </div>
        </div>

        {/* Status Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
           <div className="bg-white p-8 rounded-[32px] border border-gray-100 flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                 <Package className="h-6 w-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Status</p>
                 <p className="text-sm font-black text-gray-900 mt-1 uppercase">Processing</p>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[32px] border border-gray-100 flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                 <Truck className="h-6 w-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery</p>
                 <p className="text-sm font-black text-gray-900 mt-1 uppercase">3-5 Business Days</p>
              </div>
           </div>
           <div className="bg-white p-8 rounded-[32px] border border-gray-100 flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                 <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Warranty</p>
                 <p className="text-sm font-black text-gray-900 mt-1 uppercase">Secure Purchase</p>
              </div>
           </div>
        </div>

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <div className="mt-24 space-y-10">
             <div className="flex items-end justify-between">
                <div className="space-y-2">
                   <div className="flex items-center gap-2">
                      <div className="h-1 w-8 bg-primary"></div>
                      <span className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Your History</span>
                   </div>
                   <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Recently Viewed</h2>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {recentlyViewed.map((product) => (
                   <ProductCard key={product.id} product={product} />
                ))}
             </div>
          </div>
        )}

        {/* Latest Products Section */}
        <div className="mt-24 space-y-10">
           <div className="flex items-end justify-between">
              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                    <div className="h-1 w-8 bg-rose-500"></div>
                    <span className="text-rose-500 font-bold text-[10px] uppercase tracking-[0.2em]">New Arrivals</span>
                 </div>
                 <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Latest Collections</h2>
              </div>
              <Link href="/search" className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                 Explore More <ArrowRight className="h-4 w-4" />
              </Link>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-gray-100 rounded-[2rem] animate-pulse"></div>
                ))
              ) : (
                latestProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-40 bg-white">
        <RefreshCcw className="h-12 w-12 text-primary animate-spin opacity-20" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
