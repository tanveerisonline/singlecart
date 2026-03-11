"use client";

import { useState, useEffect, useMemo } from "react";
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
  Tag,
  Zap,
  Wallet
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AddressForm from "@/components/AddressForm";

type PaymentMethod = "STRIPE" | "PAYPAL" | "RAZORPAY" | "COD";

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [giftCardCode, setGiftCardCode] = useState("");
  const [appliedGiftCard, setAppliedGiftCard] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [giftCardError, setGiftCardError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isValidatingGiftCard, setIsValidatingGiftCard] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [enabledMethods, setEnabledMethods] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressOpen] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get("/api/user/addresses");
      setAddresses(res.data);
      const defaultAddr = res.data.find((a: any) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (res.data.length > 0) setSelectedAddressId(res.data[0].id);
    } catch (error) {
      console.error("Failed to fetch addresses");
    }
  };

  useEffect(() => {
    setIsMounted(true);
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
    } else if (status === "authenticated") {
      fetchAddresses();
    }
  }, [status, router]);

  useEffect(() => {
    const fetchEnabledMethods = async () => {
      try {
        const res = await axios.get("/api/settings/payments");
        setEnabledMethods(res.data);
        if (res.data.stripeIsEnabled) setPaymentMethod("STRIPE");
        else if (res.data.paypalIsEnabled) setPaymentMethod("PAYPAL");
        else if (res.data.razorpayIsEnabled) setPaymentMethod("RAZORPAY");
        else setPaymentMethod("COD");
      } catch (error) {
        console.error("Failed to fetch payment methods");
      }
    };
    fetchEnabledMethods();
  }, []);

  const selectedAddress = useMemo(() => {
    return addresses.find(a => a.id === selectedAddressId);
  }, [addresses, selectedAddressId]);

  const subtotal = useMemo(() => {
    return cart.items.reduce((total, item) => total + (item.selectedVariant?.price || item.price) * item.quantity, 0);
  }, [cart.items]);

  const discountValue = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "PERCENTAGE") {
      let d = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount) d = Math.min(d, appliedCoupon.maxDiscount);
      return d;
    }
    return Math.min(appliedCoupon.discountValue, subtotal);
  }, [appliedCoupon, subtotal]);

  const giftCardValue = useMemo(() => {
    if (!appliedGiftCard) return 0;
    const remainingAfterCoupon = subtotal - discountValue;
    return Math.min(appliedGiftCard.balance, remainingAfterCoupon);
  }, [appliedGiftCard, subtotal, discountValue]);

  const shipping = useMemo(() => {
    if (!selectedAddress) return 15;
    const isUS = selectedAddress.country?.toLowerCase() === 'us' || selectedAddress.country?.toLowerCase() === 'united states';
    return subtotal > 100 ? 0 : (isUS ? 5 : 15);
  }, [subtotal, selectedAddress]);

  const tax = useMemo(() => {
    if (!selectedAddress) return 0;
    const state = selectedAddress.state?.toUpperCase();
    if (state === 'CA' || state === 'NY') {
      return (subtotal - discountValue - giftCardValue) * 0.10;
    }
    return 0;
  }, [subtotal, discountValue, giftCardValue, selectedAddress]);

  const total = Math.max(0, subtotal + shipping + tax - discountValue - giftCardValue);

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

  const applyGiftCard = async () => {
    if (!giftCardCode.trim()) return;
    try {
      setIsValidatingGiftCard(true);
      setGiftCardError("");
      const res = await axios.get(`/api/gift-cards/validate?code=${giftCardCode}`);
      setAppliedGiftCard(res.data);
      toast.success("Gift card applied!");
    } catch (error: any) {
      setGiftCardError(error.response?.data || "Invalid card.");
      setAppliedGiftCard(null);
    } finally {
      setIsValidatingGiftCard(false);
    }
  };

  const [createdOrder, setCreatedOrder] = useState<any>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAddressId) {
      toast.error("Please select or add a shipping address.");
      return;
    }

    try {
      setLoading(true);
      
      let order = createdOrder;

      // 1. Create order only if not already created in this session
      if (!order) {
        const orderData = {
          items: cart.items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: Number(item.selectedVariant?.price || item.price),
            variantId: item.selectedVariant?.id
          })),
          address: selectedAddress,
          couponId: appliedCoupon?.id,
          giftCardCode: appliedGiftCard?.code,
          paymentMethod
        };

        const response = await axios.post("/api/orders", orderData);
        order = response.data;
        setCreatedOrder(order);
      }

      if (paymentMethod === "COD") {
        setRedirecting(true);
        toast.success("Order placed successfully!");
        cart.clearCart();
        router.push(`/checkout/success?orderId=${order.id}`);
        return;
      }

      // 2. Trigger Payment Gateways
      try {
        if (paymentMethod === "STRIPE") {
          const stripeRes = await axios.post("/api/checkout/stripe", { orderId: order.id });
          window.location.href = stripeRes.data.url;
        } else if (paymentMethod === "RAZORPAY") {
          const rzpRes = await axios.post("/api/checkout/razorpay", { orderId: order.id });
          toast.info("Razorpay selected. Order ID: " + rzpRes.data.id);
        } else if (paymentMethod === "PAYPAL") {
          const ppRes = await axios.post("/api/checkout/paypal", { orderId: order.id });
          toast.info("PayPal selected. Order ID: " + ppRes.data.id);
        }
      } catch (payError: any) {
        // Log to console only if specifically needed for debugging, 
        // but the user wanted only notifications.
        const msg = payError.response?.data || "Payment initialization failed. Please try another method.";
        toast.error(msg);
      }

    } catch (error: any) {
      const errorMessage = error.response?.data || "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = useMemo(() => {
    if (!enabledMethods) return [];
    const options = [];
    if (enabledMethods.stripeIsEnabled) options.push({ id: "STRIPE", name: "Stripe / GPay", icon: Zap, description: "Secure credit card payment with Apple/Google Pay." });
    if (enabledMethods.paypalIsEnabled) options.push({ id: "PAYPAL", name: "PayPal", icon: Wallet, description: "Pay via your PayPal account or credit card." });
    if (enabledMethods.razorpayIsEnabled) options.push({ id: "RAZORPAY", name: "Razorpay / UPI", icon: CreditCard, description: "UPI, Netbanking, and Indian cards." });
    if (enabledMethods.codIsEnabled) options.push({ id: "COD", name: "Cash on Delivery", icon: Truck, description: "Pay when you receive your order." });
    return options;
  }, [enabledMethods]);

  if (!isMounted || status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-40 bg-white">
        <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
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
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={onSubmit} className="space-y-8">
              <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Shipping Details</h2>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowAddressOpen(true)}
                    className="text-xs font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                  >
                    + Add New Address
                  </button>
                </div>

                {showAddressForm ? (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <AddressForm 
                      onSuccess={(newAddr) => {
                        setAddresses([newAddr, ...addresses]);
                        setSelectedAddressId(newAddr.id);
                        setShowAddressOpen(false);
                      }} 
                      onCancel={() => setShowAddressOpen(false)} 
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {addresses.length === 0 ? (
                      <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                        <p className="text-sm font-bold text-gray-400">No saved addresses found.</p>
                        <button 
                          type="button" 
                          onClick={() => setShowAddressOpen(true)}
                          className="mt-4 bg-gray-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                        >
                          Add Your First Address
                        </button>
                      </div>
                    ) : (
                      addresses.map((addr) => (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all relative group ${
                            selectedAddressId === addr.id 
                            ? "border-primary bg-primary/5 ring-4 ring-primary/5" 
                            : "border-gray-50 bg-gray-50/30 hover:border-gray-100"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase bg-white px-2 py-0.5 rounded border border-gray-100 text-gray-400">
                                  {addr.label}
                                </span>
                                {addr.isDefault && (
                                  <span className="text-[10px] font-black uppercase text-emerald-600">Default</span>
                                )}
                              </div>
                              <p className="font-black text-gray-900 uppercase tracking-tight">{addr.fullName}</p>
                              <p className="text-xs font-medium text-gray-500">{addr.phone}</p>
                              <p className="text-xs font-medium text-gray-500 leading-relaxed max-w-sm">
                                {addr.street}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                              </p>
                            </div>
                            <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              selectedAddressId === addr.id ? "border-primary" : "border-gray-200"
                            }`}>
                              {selectedAddressId === addr.id && <div className="h-3 w-3 rounded-full bg-primary" />}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[32px] p-8 sm:p-10 border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {paymentOptions.map((option) => (
                    <div 
                      key={option.id}
                      onClick={() => setPaymentMethod(option.id as PaymentMethod)}
                      className={`p-6 rounded-[24px] border-2 cursor-pointer transition-all flex items-start gap-4 ${
                        paymentMethod === option.id 
                        ? "border-primary bg-primary/5 ring-4 ring-primary/5" 
                        : "border-gray-50 bg-gray-50/30 hover:border-gray-100"
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                        paymentMethod === option.id ? "border-primary" : "border-gray-200"
                      }`}>
                        {paymentMethod === option.id && <div className="h-3 w-3 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <option.icon className={`h-4 w-4 ${paymentMethod === option.id ? "text-primary" : "text-gray-400"}`} />
                          <p className="font-black text-gray-900 uppercase tracking-tight">{option.name}</p>
                        </div>
                        <p className="text-xs font-medium text-gray-500 mt-1 leading-relaxed">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 mt-10 lg:mt-0">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden sticky top-32">
              <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <h2 className="font-black text-gray-900 uppercase tracking-tight">Order Summary</h2>
                <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center border border-gray-100 text-gray-400">
                   <ShoppingBag className="h-4 w-4" />
                </div>
              </div>

              <div className="p-8">
                <ul role="list" className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto mb-8 pr-2">
                  {cart.items.map((item) => (
                    <li key={`${item.id}-${item.selectedVariant?.id}`} className="py-5 flex gap-5">
                      <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                        <Image src={item.thumbnailUrl || "/placeholder-product.svg"} alt={item.name} fill className="object-cover" />
                        <div className="absolute top-1 right-1 h-5 w-5 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-lg">
                           {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-gray-900 truncate">{item.name}</h3>
                        <p className="text-sm font-black text-gray-900 mt-1">${((item.selectedVariant?.price || item.price) * item.quantity).toLocaleString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="space-y-4 pt-8 border-t border-gray-50">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="PROMO CODE"
                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-[10px] font-black uppercase tracking-widest outline-none"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button onClick={applyCoupon} className="bg-gray-900 text-white px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">Apply</button>
                    </div>
                    {couponError && <p className="text-rose-500 text-[8px] font-bold uppercase ml-1">{couponError}</p>}
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="GIFT CARD CODE"
                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-[10px] font-black uppercase tracking-widest outline-none"
                        value={giftCardCode}
                        onChange={(e) => setGiftCardCode(e.target.value)}
                      />
                      <button onClick={applyGiftCard} className="bg-gray-900 text-white px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">Apply</button>
                    </div>
                    {giftCardError && <p className="text-rose-500 text-[8px] font-bold uppercase ml-1">{giftCardError}</p>}
                    {appliedGiftCard && (
                      <div className="flex items-center justify-between bg-emerald-50 text-emerald-600 p-2 rounded-lg border border-emerald-100">
                        <span className="text-[10px] font-black uppercase tracking-widest">Balance: ${appliedGiftCard.balance.toFixed(2)}</span>
                        <button onClick={() => setAppliedGiftCard(null)} className="text-[10px] font-black uppercase underline">Remove</button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 py-6">
                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-gray-900 text-sm">${subtotal.toLocaleString()}</span>
                    </div>
                    {discountValue > 0 && (
                      <div className="flex items-center justify-between text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        <span>Discount</span>
                        <span className="text-sm">-${discountValue.toLocaleString()}</span>
                      </div>
                    )}
                    {giftCardValue > 0 && (
                      <div className="flex items-center justify-between text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                        <span>Gift Card</span>
                        <span className="text-sm">-${giftCardValue.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Shipping</span>
                      <span className="text-gray-900 text-sm">{shipping === 0 ? "FREE" : `$${shipping.toLocaleString()}`}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Tax (Estimated)</span>
                      <span className="text-gray-900 text-sm">${tax.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <span className="text-sm font-black text-gray-900 uppercase">Total Amount</span>
                      <span className="text-3xl font-black text-primary">${total.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={onSubmit}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-primary text-white py-6 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30"
                  >
                    {loading ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                    Complete Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
