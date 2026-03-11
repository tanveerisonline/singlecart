"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Package, 
  Search,
  ChevronRight,
  User,
  AlertCircle,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/returns");
      setReturns(res.data);
    } catch (error) {
      toast.error("Failed to load returns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const onUpdateStatus = async (returnId: string, status: string) => {
    try {
      setUpdatingId(returnId);
      await axios.patch("/api/admin/returns", {
        returnId,
        status,
        adminNotes: `Status updated to ${status} on ${new Date().toLocaleString()}`
      });
      toast.success(`Return ${status.toLowerCase()} successfully`);
      fetchReturns();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredReturns = returns.filter(r => 
    r.order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Returns Management</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest">Process and track customer return requests</p>
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search by order # or email..."
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-bold transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="bg-white p-20 rounded-[32px] border border-gray-100 text-center">
            <RefreshCw className="h-10 w-10 animate-spin text-primary mx-auto mb-4 opacity-20" />
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Loading requests...</p>
          </div>
        ) : filteredReturns.length === 0 ? (
          <div className="bg-white p-20 rounded-[32px] border border-gray-100 text-center">
            <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">No return requests found</p>
          </div>
        ) : (
          filteredReturns.map((req) => (
            <div key={req.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-8 lg:flex items-center justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="bg-gray-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      #{req.order.orderNumber}
                    </span>
                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      req.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      req.status === 'APPROVED' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      req.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}>
                      {req.status}
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Requested on {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><User className="h-4 w-4" /></div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</p>
                          <p className="text-sm font-bold text-gray-900">{req.order.user.name} ({req.order.user.email})</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500"><AlertCircle className="h-4 w-4" /></div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reason</p>
                          <p className="text-sm font-bold text-gray-900">{req.reason}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</p>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        {req.description || "No additional details provided."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 lg:mt-0 flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[200px]">
                  {req.status === "PENDING" && (
                    <>
                      <button 
                        onClick={() => onUpdateStatus(req.id, "APPROVED")}
                        disabled={updatingId === req.id}
                        className="w-full bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                      >
                        Approve Request
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(req.id, "REJECTED")}
                        disabled={updatingId === req.id}
                        className="w-full bg-rose-50 text-rose-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 transition-all disabled:opacity-50"
                      >
                        Reject Request
                      </button>
                    </>
                  )}
                  {req.status === "APPROVED" && (
                    <button 
                      onClick={() => onUpdateStatus(req.id, "COMPLETED")}
                      disabled={updatingId === req.id}
                      className="w-full bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                    >
                      Complete & Refund
                    </button>
                  )}
                  <button className="w-full bg-gray-50 text-gray-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                    <FileText className="h-3 w-3" /> View Order
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
