"use client";

import { useState } from "react";
import axios from "axios";
import { RefreshCw, X, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ReturnRequestButtonProps {
  orderId: string;
  orderStatus: string;
  hasReturnRequest: boolean;
}

export default function ReturnRequestButton({ orderId, orderStatus, hasReturnRequest }: ReturnRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const reasons = [
    "Defective or damaged",
    "Different from description",
    "Wrong item sent",
    "Missing parts",
    "No longer needed",
    "Better price elsewhere",
    "Other"
  ];

  const onSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/orders/returns", {
        orderId,
        reason,
        description
      });
      toast.success("Return request submitted successfully");
      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to submit return request");
    } finally {
      setLoading(false);
    }
  };

  if (hasReturnRequest) {
    return (
      <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl border border-amber-100 font-bold text-[10px] uppercase tracking-widest">
        <RefreshCw className="h-3 w-3" /> Return Requested
      </div>
    );
  }

  // Only allow returns if Delivered or Shipped (simulation)
  const allowedStatuses = ["DELIVERED", "SHIPPED", "PROCESSING"];
  if (!allowedStatuses.includes(orderStatus)) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-6 py-3 rounded-2xl hover:border-primary hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
      >
        <RefreshCw className="h-4 w-4" /> Request Return
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Return Request</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reason for Return*</label>
                <select 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold appearance-none cursor-pointer"
                >
                  <option value="">Select Reason</option>
                  {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Additional Details</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium h-32 resize-none"
                  placeholder="Tell us more about the issue..."
                />
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl flex gap-3 border border-amber-100">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-tighter">
                Our team will review your request within 24-48 hours. You will be notified of the status via email.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsOpen(false)}
                className="flex-1 px-6 py-4 rounded-2xl border border-gray-100 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={onSubmit}
                disabled={loading || !reason}
                className="flex-1 bg-primary text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
