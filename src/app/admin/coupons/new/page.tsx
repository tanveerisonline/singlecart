"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Ticket, 
  ArrowLeft, 
  Save, 
  X, 
  Calendar, 
  DollarSign, 
  Percent, 
  Users, 
  Info,
  ChevronRight,
  PlusCircle,
  Tag
} from "lucide-react";

export default function NewCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minPurchase: "0",
    maxDiscount: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    usageLimit: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("/api/coupons", {
        ...data,
        discountValue: parseFloat(data.discountValue),
        minPurchase: parseFloat(data.minPurchase),
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      });
      toast.success("Coupon created successfully!");
      router.push("/admin/coupons");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data || "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Coupon</h1>
            <p className="text-sm text-gray-500 mt-0.5">Generate discounts and promotional codes.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 md:flex-none px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all hover:text-primary hover:border-primary/50 transition-all"
          >
            Discard
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 md:flex-none px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:bg-primary/30 transition-all flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Create Coupon"}
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Config */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Tag className="h-24 w-24 text-primary" />
            </div>
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
                <p className="text-xs text-gray-500 mt-0.5">Identify your promotion.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Coupon Code</label>
                <input
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-bold uppercase tracking-widest"
                  placeholder="e.g. SUMMER25"
                  value={data.code}
                  onChange={(e) => setData({ ...data, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Discount Type</label>
                <select
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-bold cursor-pointer"
                  value={data.discountType}
                  onChange={(e) => setData({ ...data, discountType: e.target.value })}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Discount Values</h2>
                <p className="text-xs text-gray-500 mt-0.5">Configure how much customers save.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Value</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    {data.discountType === "PERCENTAGE" ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                  </div>
                  <input
                    required
                    type="number"
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-bold"
                    placeholder="20"
                    value={data.discountValue}
                    onChange={(e) => setData({ ...data, discountValue: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Min. Purchase</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    <DollarSign className="h-3 w-3" />
                  </div>
                  <input
                    type="number"
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-bold"
                    placeholder="0"
                    value={data.minPurchase}
                    onChange={(e) => setData({ ...data, minPurchase: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Max. Discount</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    <DollarSign className="h-3 w-3" />
                  </div>
                  <input
                    type="number"
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-bold"
                    placeholder="None"
                    value={data.maxDiscount}
                    onChange={(e) => setData({ ...data, maxDiscount: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Scheduling */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Duration</h2>
                <p className="text-xs text-gray-500 mt-0.5">When is it active?</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Starts On</label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-bold"
                  value={data.startDate}
                  onChange={(e) => setData({ ...data, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Expires On</label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-bold"
                  value={data.endDate}
                  onChange={(e) => setData({ ...data, endDate: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Limits */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Usage</h2>
                <p className="text-xs text-gray-500 mt-0.5">Limit availability.</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Usage Limit</label>
              <input
                type="number"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-bold"
                placeholder="Total available uses"
                value={data.usageLimit}
                onChange={(e) => setData({ ...data, usageLimit: e.target.value })}
              />
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
