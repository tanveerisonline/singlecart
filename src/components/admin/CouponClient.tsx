"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Ticket, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  DollarSign, 
  Percent, 
  Trash2, 
  Edit,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Copy,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minPurchase: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
}

interface CouponClientProps {
  coupons: Coupon[];
}

export default function CouponClient({ coupons }: CouponClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDeleteClick = (id: string) => {
    setTargetId(id);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const onConfirmDelete = async () => {
    if (!targetId) return;

    try {
      setLoadingId(targetId);
      await axios.delete(`/api/coupons/${targetId}`);
      toast.success("Coupon deleted successfully");
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while deleting the coupon.");
    } finally {
      setLoadingId(null);
      setTargetId(null);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
    setOpenMenuId(null);
  };

  return (
    <>
      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onConfirmDelete}
        loading={loadingId !== null}
        title="Delete Coupon"
        description="Are you sure you want to delete this coupon? This action cannot be undone."
      />

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gray-50/30">
          <div className="relative w-full sm:w-96 group">
            <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by code..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-[1.2rem] py-3 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Total: {filteredCoupons.length} Campaigns
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                <th className="px-8 py-5">Campaign Code</th>
                <th className="px-8 py-5">Incentive</th>
                <th className="px-8 py-5">Usage</th>
                <th className="px-8 py-5">Validity</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center max-w-xs mx-auto">
                      <div className="bg-gray-50 p-6 rounded-full mb-6 border border-gray-100">
                        <Ticket className="h-10 w-10 text-gray-200" />
                      </div>
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">No Promotions</h3>
                      <p className="text-gray-400 text-xs font-bold mt-2 leading-relaxed">
                        Create your first promotional campaign to start boosting your sales.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isExpired = new Date() > new Date(coupon.endDate);
                  const isFull = coupon.usageLimit ? coupon.usageCount >= coupon.usageLimit : false;
                  
                  return (
                    <tr key={coupon.id} className="hover:bg-gray-50/30 transition-all duration-200 group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                            <Ticket className="h-4 w-4" />
                          </div>
                          <div className="text-sm font-black text-gray-900 uppercase tracking-widest group-hover:text-primary transition-colors">
                            {coupon.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900">
                            {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`} OFF
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                            Min. ${coupon.minPurchase}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center w-24">
                            <span className="text-[10px] font-black text-gray-900">{coupon.usageCount}</span>
                            <span className="text-[10px] font-bold text-gray-400">/ {coupon.usageLimit || "∞"}</span>
                          </div>
                          <div className="w-24 bg-gray-100 rounded-full h-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full bg-primary transition-all duration-500`}
                              style={{ width: `${coupon.usageLimit ? Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100) : 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[10px] uppercase">
                            <Calendar className="h-3 w-3" />
                            {new Date(coupon.startDate).toLocaleDateString()}
                          </div>
                          <div className={`flex items-center gap-1.5 font-black text-[10px] uppercase ${isExpired ? 'text-rose-500' : 'text-emerald-600'}`}>
                            <Clock className="h-3 w-3" />
                            {new Date(coupon.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {!coupon.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-400 border border-gray-200">
                            <XCircle className="h-3 w-3" /> Paused
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100">
                            <XCircle className="h-3 w-3" /> Expired
                          </span>
                        ) : isFull ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100">
                            <Users className="h-3 w-3" /> Redeemed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <CheckCircle2 className="h-3 w-3" /> Running
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right relative">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/admin/coupons/${coupon.id}`}
                            className="p-2.5 bg-white text-gray-400 hover:text-primary rounded-xl border border-gray-100 hover:border-primary/20 shadow-sm transition-all hover:scale-110 active:scale-95"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          
                          <div className="relative">
                            <button 
                              onClick={() => setOpenMenuId(openMenuId === coupon.id ? null : coupon.id)}
                              className={`p-2.5 rounded-xl border border-gray-100 shadow-sm transition-all ${openMenuId === coupon.id ? 'bg-primary text-white' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            
                            {openMenuId === coupon.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right text-left">
                                  <button onClick={() => copyCode(coupon.code)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-primary transition-all">
                                    <Copy className="h-4 w-4" /> Copy Code
                                  </button>
                                  <div className="h-px bg-gray-50 my-1 mx-2" />
                                  <button onClick={() => onDeleteClick(coupon.id)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all">
                                    <Trash2 className="h-4 w-4" /> Delete Coupon
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
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
