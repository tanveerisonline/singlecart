"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OrderStatusSwitcherProps {
  orderId: string;
  currentStatus: string;
}

const statuses = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURN_REQUESTED",
  "RETURNED",
  "REFUNDED",
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CANCELLED':
    case 'REFUNDED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'SHIPPED':
    case 'PROCESSING':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export default function OrderStatusSwitcher({ orderId, currentStatus }: OrderStatusSwitcherProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      setLoading(true);
      await axios.patch(`/api/orders/${orderId}`, { status: e.target.value });
      router.refresh();
      toast.success(`Order status: ${e.target.value}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block min-w-[130px]">
      <select
        disabled={loading}
        value={currentStatus}
        onChange={onChange}
        className={`appearance-none w-full text-[10px] font-bold tracking-wider rounded-lg px-3 py-1.5 border transition-all outline-none cursor-pointer pr-8 ${getStatusColor(currentStatus)} disabled:opacity-50`}
      >
        {statuses.map((status) => (
          <option key={status} value={status} className="bg-white text-gray-900">
            {status}
          </option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        {loading ? (
          <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
        ) : (
          <svg className="w-3 h-3 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  );
}
