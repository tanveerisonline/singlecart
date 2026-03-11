"use client";

import { useCart } from "@/hooks/use-cart";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw, CreditCard } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
  const cart = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-white">
        <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((total, item) => total + (item.selectedVariant?.price || item.price) * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Your cart is empty</h1>
          <p className="text-gray-500 font-medium max-w-sm mx-auto">Looks like you haven't added anything to your cart yet. Explore our collections and find something you love!</p>
        </div>
        <Link 
          href="/search" 
          className="inline-flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20"
        >
          Start Shopping <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white pb-24">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
           <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <ShoppingBag className="h-6 w-6" />
           </div>
           <div>
              <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Shopping Cart</h1>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">{cart.items.length} items in your bag</p>
           </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12">
          {/* Cart Items */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-500 overflow-hidden">
              <ul role="list" className="divide-y divide-gray-50">
                {cart.items.map((item) => (
                  <li key={`${item.id}-${item.selectedVariant?.id}`} className="flex p-6 sm:p-10 hover:bg-gray-50/50 transition-colors duration-300 group">
                    <div className="flex-shrink-0 relative h-24 w-24 sm:h-36 sm:w-36 rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-sm">
                      <Image
                        src={item.thumbnailUrl || "/placeholder-product.svg"} 
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>

                    <div className="ml-8 flex flex-1 flex-col justify-between">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div className="space-y-3">
                          <Link href={`/product/${item.slug}`} className="text-lg font-black text-gray-900 hover:text-primary transition-colors block leading-tight tracking-tight">
                            {item.name}
                          </Link>
                          {item.selectedVariant && (
                            <span className="inline-flex items-center bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-gray-200">
                              {item.selectedVariant.name}
                            </span>
                          )}
                          <p className="text-2xl font-black text-primary tracking-tight">${(item.selectedVariant?.price || item.price).toLocaleString()}</p>
                        </div>

                        <div className="mt-6 sm:mt-0 sm:pr-9 flex items-center justify-between sm:justify-end gap-6">
                          <div className="flex items-center bg-gray-50 border border-gray-200/60 p-2 rounded-[1.5rem] shadow-sm hover:shadow-md transition-shadow">
                            <button 
                              onClick={() => cart.updateQuantity(item.id, Math.max(1, item.quantity - 1), item.selectedVariant?.id)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-gray-400 hover:text-primary hover:bg-gray-50 transition-all active:scale-95"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center text-sm font-black text-gray-900">{item.quantity}</span>
                            <button 
                              onClick={() => cart.updateQuantity(item.id, item.quantity + 1, item.selectedVariant?.id)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl bg-white shadow-sm text-gray-400 hover:text-primary hover:bg-gray-50 transition-all active:scale-95"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => cart.removeItem(item.id, item.selectedVariant?.id)}
                            className="p-4 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all duration-300 active:scale-90"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Cart Trust Signals */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="flex items-center gap-4 p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-gray-200 transition-colors group">
                  <div className="p-3 bg-primary/5 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-300">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Global Shipping</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-wider">Tracked & Insured</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-gray-200 transition-colors group">
                  <div className="p-3 bg-primary/5 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-300">
                    <RotateCcw className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Easy Returns</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-wider">30 Day Policy</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-6 bg-white rounded-[2rem] border border-gray-100 hover:border-gray-200 transition-colors group">
                  <div className="p-3 bg-primary/5 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Secure Payment</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-wider">100% Guaranteed</p>
                  </div>
               </div>
            </div>
          </section>

          {/* Order summary */}
          <section className="mt-16 lg:col-span-4 lg:mt-0">
            <div className="bg-gray-900 rounded-[2.5rem] p-10 shadow-2xl shadow-gray-900/20 text-white sticky top-28 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
                 <ShoppingBag className="h-40 w-40" />
              </div>
              
              <h2 className="text-xl font-black uppercase tracking-tight mb-10 flex items-center gap-3">
                Order Summary
                <div className="h-1 flex-1 bg-white/10 rounded-full"></div>
              </h2>

              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="text-lg font-black text-white">${subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between text-gray-400">
                  <div className="flex flex-col gap-1">
                     <span className="text-xs font-bold uppercase tracking-widest">Shipping</span>
                     {shipping === 0 && <span className="inline-block text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md uppercase tracking-widest mt-0.5">Free over $100</span>}
                  </div>
                  <span className="text-lg font-black text-white">
                    {shipping === 0 ? "FREE" : `$${shipping.toLocaleString()}`}
                  </span>
                </div>

                <div className="border-t border-white/10 pt-8 mt-4">
                  <div className="flex items-end justify-between mb-10">
                    <span className="text-sm font-black uppercase tracking-widest">Grand Total</span>
                    <span className="text-4xl font-black text-primary tracking-tighter">${total.toLocaleString()}</span>
                  </div>

                  <Link
                    href="/checkout"
                    className="w-full flex items-center justify-center gap-3 bg-primary text-white py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
                  >
                    Proceed to Checkout <ArrowRight className="h-5 w-5" />
                  </Link>

                  <div className="mt-8 flex items-center justify-center gap-4 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                     <CreditCard className="h-5 w-5" />
                     <div className="h-1 w-1 rounded-full bg-white/20"></div>
                     <span className="text-[10px] font-black uppercase tracking-widest">Secure SSL Encryption</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Promo Code Mockup */}
            <div className="mt-8 p-6 bg-white rounded-[2rem] border border-gray-100 flex items-center gap-4 group hover:border-gray-200 transition-colors shadow-sm">
               <input 
                 type="text" 
                 placeholder="Promo Code" 
                 className="flex-1 bg-gray-50 border-transparent focus:bg-white focus:ring-2 focus:ring-primary/20 rounded-xl px-5 py-4 text-xs font-bold uppercase tracking-widest outline-none transition-all"
               />
               <button className="bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest px-6 py-4 hover:bg-primary transition-all shadow-md">
                  Apply
               </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
