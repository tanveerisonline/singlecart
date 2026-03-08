"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Edit, Search, Filter, Ticket, Calendar } from "lucide-react";
import Link from "next/link";
import ConfirmModal from "./ConfirmModal";

interface CouponClientProps {
  coupons: any[];
}

export default function CouponClient({ coupons }: CouponClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDeleteClick = (id: string) => {
    setTargetId(id);
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!targetId) return;

    try {
      setLoadingId(targetId);
      await axios.delete(`/api/coupons/${targetId}`);
      toast.success("Coupon deleted successfully");
      setIsConfirmOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete coupon");
    } finally {
      setLoadingId(null);
      setTargetId(null);
    }
  };

  return (
    <>
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onConfirmDelete}
        loading={loadingId !== null}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? This will permanently disable the discount code."
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96 group">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search coupon codes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                <th className="px-6 py-4">Coupon Info</th>
                <th className="px-6 py-4">Discount</th>
                <th className="px-6 py-4">Usage</th>
                <th className="px-6 py-4">Expiry</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <Ticket className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">No coupons found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isExpired = new Date() > new Date(coupon.endDate);
                  const isActive = coupon.isActive && !isExpired;
                  
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100 mr-3">
                            <Ticket className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">{coupon.code}</div>
                            <div className="text-[10px] text-gray-400 font-medium mt-0.5">Created {new Date(coupon.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-gray-900">
                          {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                        </span>
                        <p className="text-[10px] text-gray-400 font-medium">Off total order</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-gray-900">{coupon.usageCount} / {coupon.usageLimit || "∞"}</span>
                          <div className="w-20 bg-gray-100 rounded-full h-1 overflow-hidden">
                            <div 
                              className="bg-indigo-500 h-full rounded-full" 
                              style={{ width: `${coupon.usageLimit ? Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100) : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span className={`text-sm font-medium ${isExpired ? "text-rose-500" : ""}`}>
                            {new Date(coupon.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border
                          ${isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                          {isActive ? 'Active' : isExpired ? 'Expired' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => onDeleteClick(coupon.id)}
                            disabled={loadingId === coupon.id}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
