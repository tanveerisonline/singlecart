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
  Tag,
  Clock,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";

interface CouponFormProps {
  initialData?: any;
}

export default function CouponForm({ initialData }: CouponFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const [data, setData] = useState({
    code: initialData?.code || "",
    discountType: initialData?.discountType || "PERCENTAGE",
    discountValue: initialData?.discountValue?.toString() || "",
    minPurchase: initialData?.minPurchase?.toString() || "0",
    maxDiscount: initialData?.maxDiscount?.toString() || "",
    startDate: formatDateForInput(initialData?.startDate) || new Date().toISOString().slice(0, 16),
    endDate: formatDateForInput(initialData?.endDate) || "",
    usageLimit: initialData?.usageLimit?.toString() || "",
    isActive: initialData?.isActive ?? true,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.endDate) {
      toast.error("Expiry date and time is required");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...data,
        discountValue: parseFloat(data.discountValue),
        minPurchase: parseFloat(data.minPurchase),
        maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : null,
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      };

      if (initialData) {
        await axios.patch(`/api/coupons/${initialData.id}`, payload);
        toast.success("Coupon updated successfully!");
      } else {
        await axios.post("/api/coupons", payload);
        toast.success("Coupon created successfully!");
      }
      
      router.push("/admin/coupons");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/coupons" className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">
              {initialData ? "Edit Promotion" : "New Promotion"}
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Configure your discount parameters and scheduling.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 md:flex-none px-8 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 disabled:bg-primary/30 transition-all flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Processing..." : initialData ? "Update Campaign" : "Launch Campaign"}
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Identity Section */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Tag className="h-24 w-24 text-primary" />
            </div>
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Ticket className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Campaign Identity</h2>
                <p className="text-xs text-gray-400 font-bold uppercase mt-0.5 tracking-widest">Identify your promotion.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Coupon Code*</label>
                <input
                  required
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary transition-all outline-none text-sm font-black uppercase tracking-[0.2em]"
                  placeholder="e.g. SUMMER2025"
                  value={data.code}
                  onChange={(e) => setData({ ...data, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Incentive Type</label>
                <select
                  required
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary transition-all outline-none text-sm font-black uppercase tracking-widest cursor-pointer"
                  value={data.discountType}
                  onChange={(e) => setData({ ...data, discountType: e.target.value })}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount ($)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Economics Section */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Financial Parameters</h2>
                <p className="text-xs text-gray-400 font-bold uppercase mt-0.5 tracking-widest">Configure customer savings.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Value</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs group-focus-within:text-primary transition-colors">
                    {data.discountType === "PERCENTAGE" ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                  </div>
                  <input
                    required
                    type="number"
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary transition-all outline-none text-sm font-black"
                    placeholder="20"
                    value={data.discountValue}
                    onChange={(e) => setData({ ...data, discountValue: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Threshold</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs group-focus-within:text-primary transition-colors">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary transition-all outline-none text-sm font-black"
                    placeholder="Min Purchase"
                    value={data.minPurchase}
                    onChange={(e) => setData({ ...data, minPurchase: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ceiling</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs group-focus-within:text-primary transition-colors">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary transition-all outline-none text-sm font-black"
                    placeholder="Max Discount"
                    value={data.maxDiscount}
                    onChange={(e) => setData({ ...data, maxDiscount: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Status & Control */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Visibility</h2>
                <p className="text-xs text-gray-400 font-bold uppercase mt-0.5 tracking-widest">Status control.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setData({ ...data, isActive: !data.isActive })}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                data.isActive 
                ? "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100" 
                : "bg-gray-50 border-gray-100 text-gray-400"
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Campaign Status</span>
              <div className="flex items-center gap-2">
                {data.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                <span className="text-xs font-black uppercase">{data.isActive ? "Active" : "Paused"}</span>
              </div>
            </button>
          </section>

          {/* Precision Scheduling */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Timeline</h2>
                <p className="text-xs text-gray-400 font-bold uppercase mt-0.5 tracking-widest">Precision scheduling.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Launch Date & Time</label>
                <input
                  required
                  type="datetime-local"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary transition-all outline-none text-xs font-black uppercase"
                  value={data.startDate}
                  onChange={(e) => setData({ ...data, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiry Date & Time</label>
                <input
                  required
                  type="datetime-local"
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary transition-all outline-none text-xs font-black uppercase"
                  value={data.endDate}
                  onChange={(e) => setData({ ...data, endDate: e.target.value })}
                />
              </div>
            </div>
          </section>

          {/* Inventory/Usage Section */}
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Distribution</h2>
                <p className="text-xs text-gray-400 font-bold uppercase mt-0.5 tracking-widest">Availability control.</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Redemption Limit</label>
              <input
                type="number"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary transition-all outline-none text-sm font-black"
                placeholder="Total available uses"
                value={data.usageLimit}
                onChange={(e) => setData({ ...data, usageLimit: e.target.value })}
              />
              <p className="text-[9px] text-gray-400 font-bold px-1 mt-2 leading-relaxed">Leave empty for unlimited redemptions across all customers.</p>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
