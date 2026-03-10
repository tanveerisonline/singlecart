"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  ChevronRight, 
  MapPin, 
  ShoppingBag,
  ArrowLeft,
  Lock,
  CheckCircle2,
  RefreshCcw,
  Tag
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    label: "Home",
  });

  useEffect(() => {
    setIsMounted(true);
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
    }
  }, [status, router]);

  useEffect(() => {
    if (isMounted && cart.items.length === 0) {
      router.push("/cart");
    }
  }, [isMounted, cart.items.length, router]);

  if (!isMounted || status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-white">
        <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const subtotal = cart.items.reduce((total, item) => total + (item.selectedVariant?.price || item.price) * item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      setIsValidatingCoupon(true);
      setCouponError("");
      const response = await axios.get(`/api/coupons/validate?code=${couponCode}`);
      if (subtotal < response.data.minPurchase) {
        setCouponError(`Minimum purchase of $${response.data.minPurchase} required.`);
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon(response.data);
      toast.success("Coupon applied successfully!");
    } catch (error: any) {
      setCouponError(error.response?.data || "Invalid coupon.");
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "PERCENTAGE") {
      let discount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount) discount = Math.min(discount, appliedCoupon.maxDiscount);
      return discount;
    }
    return Math.min(appliedCoupon.discountValue, subtotal);
  };

  const discountValue = calculateDiscount();
  const total = subtotal + shipping - discountValue;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!address.street || !address.city || !address.postalCode) {
      toast.error("Please complete your shipping information.");
      return;
    }

    try {
      setLoading(true);
      
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: Number(item.selectedVariant?.price || item.price),
          variantId: item.selectedVariant?.id
        })),
        address,
        totalAmount: total,
        shippingCost: shipping,
        couponId: appliedCoupon?.id
      };

      const response = await axios.post("/api/orders", orderData);
      
      if (response.status === 200 || response.status === 201) {
        toast.success("Order placed successfully!");
        cart.clearCart();
        router.push(`/checkout/success?orderId=${response.data.id}`);
      }
    } catch (error: any) {
      console.error("Order creation failed", error);
      toast.error(error.response?.data || "Something went wrong while creating your order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Checkout Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
           <Link href="/cart" className="flex items-center gap-2 text-gray-400 hover:text-primary transition-all group">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Back to Cart</span>
           </Link>
           
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                 <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">1</div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 hidden sm:block">Shipping</span>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-200" />
              <div className="flex items-center gap-2">
                 <div className="h-6 w-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[10px] font-black">2</div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 hidden sm:block">Payment</span>
              </div>
           </div>

           <div className="flex items-center gap-2 text-emerald-600">
              <Lock className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Secure Checkout</span>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Main Form Area */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={onSubmit} className="space-y-8">
              {/* Shipping Information */}
              <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Shipping Details</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                    <input
                      required
                      type="text"
                      placeholder="House number and street name"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City / Town</label>
                      <input
                        required
                        type="text"
                        placeholder="City"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">State / Province</label>
                      <input
                        required
                        type="text"
                        placeholder="State"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Postal Code / ZIP</label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. 90210"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold"
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Country</label>
                      <input
                        required
                        type="text"
                        placeholder="Country"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold"
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Payment Method</h2>
                </div>

                <div className="space-y-4">
                  <div 
                    className="p-6 rounded-[24px] border-2 border-primary bg-primary/5 flex items-start gap-4 relative overflow-hidden group cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                       <CreditCard className="h-24 w-24" />
                    </div>
                    <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center shrink-0 mt-1">
                       <div className="h-3 w-3 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <p className="font-black text-gray-900 uppercase tracking-tight">Cash on Delivery</p>
                      <p className="text-xs font-medium text-gray-500 mt-1 leading-relaxed">Pay with cash when your order is delivered to your doorstep. Perfect for immediate trust.</p>
                      <div className="mt-4 flex gap-3">
                         <div className="h-8 w-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center opacity-40 grayscale"><Image src="/vercel.svg" alt="pay" width={20} height={20} /></div>
                         <div className="h-8 w-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center opacity-40 grayscale"><Image src="/next.svg" alt="pay" width={30} height={10} /></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 rounded-[24px] border border-gray-100 bg-gray-50/50 flex items-start gap-4 opacity-60">
                    <div className="h-6 w-6 rounded-full border-2 border-gray-200 shrink-0 mt-1"></div>
                    <div>
                      <p className="font-black text-gray-400 uppercase tracking-tight">Credit / Debit Card</p>
                      <p className="text-[10px] font-black text-primary uppercase mt-1 tracking-widest">Coming Soon</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button (Mobile) */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-primary text-white py-6 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                  Complete Order • ${total.toLocaleString()}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-5 mt-10 lg:mt-0">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden sticky top-32">
              <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <h2 className="font-black text-gray-900 uppercase tracking-tight">Order Summary</h2>
                <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center border border-gray-100 text-gray-400">
                   <ShoppingBag className="h-4 w-4" />
                </div>
              </div>

              <div className="p-8">
                <ul role="list" className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 mb-8">
                  {cart.items.map((item) => (
                    <li key={`${item.id}-${item.selectedVariant?.id}`} className="py-5 flex gap-5 group">
                      <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        <Image 
                          src={item.thumbnailUrl || "/placeholder-product.svg"} 
                          alt={item.name} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute top-1 right-1 h-5 w-5 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-lg shadow-lg">
                           {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="text-sm font-black text-gray-900 truncate group-hover:text-primary transition-colors">{item.name}</h3>
                        {item.selectedVariant && (
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.selectedVariant.name}</p>
                        )}
                        <p className="text-sm font-black text-gray-900">${((item.selectedVariant?.price || item.price) * item.quantity).toLocaleString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="space-y-4 pt-8 border-t border-gray-50">
                  {/* Coupon Area */}
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="PROMO CODE"
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={isValidatingCoupon || !couponCode}
                        className="bg-gray-900 text-white px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary transition-all disabled:opacity-50"
                      >
                        {isValidatingCoupon ? <RefreshCcw className="h-4 w-4 animate-spin mx-auto" /> : "Apply"}
                      </button>
                    </div>
                    {couponError && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest ml-1">{couponError}</p>}
                    {appliedCoupon && (
                      <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 p-3 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest flex-1">Code "{appliedCoupon.code}" applied</span>
                        <button onClick={() => setAppliedCoupon(null)} className="text-[10px] font-black hover:underline underline-offset-2">Remove</button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 py-6">
                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-gray-900 text-sm">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Shipping</span>
                      <span className="text-gray-900 text-sm">{shipping === 0 ? "FREE" : `$${shipping.toLocaleString()}`}</span>
                    </div>
                    {discountValue > 0 && (
                      <div className="flex items-center justify-between text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        <span>Discount</span>
                        <span className="text-sm">-${discountValue.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="text-sm font-black text-gray-900 uppercase tracking-tighter">Total Amount</span>
                      <span className="text-3xl font-black text-primary">${total.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={onSubmit}
                    disabled={loading}
                    className="w-full hidden lg:flex items-center justify-center gap-3 bg-primary text-white py-6 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                    Complete Order
                  </button>

                  <div className="flex items-center justify-center gap-4 pt-6 opacity-30 grayscale group">
                    <Truck className="h-5 w-5 group-hover:text-primary transition-colors" />
                    <ShieldCheck className="h-5 w-5 group-hover:text-primary transition-colors" />
                    <Lock className="h-5 w-5 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
