"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");

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
    if (isMounted && cart.items.length === 0) {
      router.push("/cart");
    }
  }, [status, cart.items.length, router, isMounted]);

  if (!isMounted || status === "loading") return null;

  const subtotal = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = 5.00;

  const applyCoupon = async () => {
    try {
      setCouponError("");
      const response = await axios.get(`/api/coupons/validate?code=${couponCode}`);
      if (subtotal < response.data.minPurchase) {
        setCouponError(`Minimum purchase of $${response.data.minPurchase} required.`);
        return;
      }
      setAppliedCoupon(response.data);
    } catch (error: any) {
      setCouponError(error.response?.data || "Invalid coupon.");
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

  const discount = calculateDiscount();
  const total = subtotal + shipping - discount;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        address,
        totalAmount: total,
        shippingCost: shipping,
        couponId: appliedCoupon?.id
      };

      const response = await axios.post("/api/orders", orderData);
      
      if (response.status === 200 || response.status === 201) {
        cart.clearCart();
        router.push(`/orders/${response.data.id}`);
      }
    } catch (error) {
      console.error("Order creation failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          <form onSubmit={onSubmit}>
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                <div className="grid grid-cols-1 gap-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Street Address</label>
                    <input
                      required
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        required
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State / Province</label>
                      <input
                        required
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                      <input
                        required
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <input
                        required
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Payment</h2>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-sm text-gray-500 mb-4">For this demo, we're using "Cash on Delivery" or a simulated payment process.</p>
                <div className="flex items-center">
                  <input
                    id="cod"
                    name="payment-method"
                    type="radio"
                    defaultChecked
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                    Cash on Delivery (Simulated)
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 disabled:bg-gray-400"
              >
                {loading ? "Processing..." : `Confirm Order - $${total.toFixed(2)}`}
              </button>
            </div>
          </form>

          {/* Order summary sidebar */}
          <div className="mt-10 lg:mt-0">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <ul role="list" className="divide-y divide-gray-200">
                {cart.items.map((product) => (
                  <li key={product.id} className="py-4 flex">
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden border">
                      <img src="/placeholder-product.jpg" alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3 className="text-sm">{product.name}</h3>
                          <p className="ml-4 text-sm">${(product.price * product.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Qty {product.quantity}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <dl className="border-t border-gray-200 py-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd className="font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <dt className="text-gray-600">Shipping</dt>
                  <dd className="font-medium text-gray-900">${shipping.toFixed(2)}</dd>
                </div>
                
                {/* Coupon Input */}
                <div className="pt-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      className="flex-1 border rounded-md px-2 py-1 text-sm uppercase"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-green-600 text-xs mt-1">
                      Coupon "{appliedCoupon.code}" applied! (-${discount.toFixed(2)})
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-base font-bold border-t border-gray-200 pt-4">
                  <dt className="text-gray-900">Total</dt>
                  <dd className="text-gray-900">${total.toFixed(2)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
