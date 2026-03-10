"use client";

import { useWishlist } from "@/hooks/use-wishlist";
import ProductCard from "@/components/ProductCard";
import { Heart, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WishlistPage() {
  const wishlist = useWishlist();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 border-b border-gray-50 pb-10">
           <div className="space-y-2">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase flex items-center gap-4">
                My Wishlist 
                <span className="bg-rose-50 text-rose-500 text-xs px-3 py-1 rounded-full border border-rose-100">
                  {wishlist.items.length} Items
                </span>
              </h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Save your favorite items for later</p>
           </div>
           {wishlist.items.length > 0 && (
             <button 
               onClick={() => wishlist.clearWishlist()}
               className="inline-flex items-center gap-2 text-gray-400 hover:text-rose-500 font-black text-[10px] uppercase tracking-widest transition-all"
             >
                <Trash2 className="h-4 w-4" /> Clear All
             </button>
           )}
        </div>

        {wishlist.items.length === 0 ? (
          <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 space-y-8">
            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
               <Heart className="h-12 w-12 text-gray-200" />
            </div>
            <div className="space-y-2">
               <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Your wishlist is empty</h2>
               <p className="text-gray-400 text-sm font-medium max-w-xs mx-auto">Start hearting products you love and they will appear here!</p>
            </div>
            <Link href="/search" className="inline-block bg-primary text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
               Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlist.items.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
