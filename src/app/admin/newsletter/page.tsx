"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Mail, 
  Send, 
  Users, 
  CheckCircle2, 
  XCircle,
  RefreshCcw,
  Search
} from "lucide-react";
import { toast } from "sonner";

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    subject: "",
    html: ""
  });

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/newsletter");
      setSubscribers(res.data);
    } catch (error) {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const onSend = async () => {
    if (!formData.subject || !formData.html) {
      toast.error("Please fill in both subject and content");
      return;
    }
    
    if (!confirm("Are you sure you want to send this to all active subscribers?")) return;

    try {
      setSending(true);
      const res = await axios.post("/api/admin/newsletter", formData);
      toast.success(res.data.message || "Newsletter sent!");
      setFormData({ subject: "", html: "" });
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to send newsletter");
    } finally {
      setSending(false);
    }
  };

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = subscribers.filter(s => s.isActive).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Newsletter</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Manage subscribers and send broadcast emails</p>
        </div>
        <div className="flex items-center gap-4 bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20">
           <Users className="h-5 w-5 text-primary" />
           <div>
              <p className="text-[10px] font-black text-primary/80 uppercase tracking-widest">Active Audience</p>
              <p className="text-lg font-black text-primary">{activeCount} Subscribers</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Compose Section */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Mail className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Compose Broadcast</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Subject*</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-bold"
                placeholder="Check out our latest arrivals!"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">HTML Content*</label>
              <textarea
                value={formData.html}
                onChange={(e) => setFormData({...formData, html: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-medium h-64 resize-none font-mono"
                placeholder="<h1>Hello!</h1><p>Welcome to our update...</p>"
              />
            </div>
            
            <button
              onClick={onSend}
              disabled={sending || !formData.subject || !formData.html || activeCount === 0}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
            >
              {sending ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send to {activeCount} Subscribers
            </button>
          </div>
        </div>

        {/* Subscribers List */}
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
          <div className="p-6 border-b border-gray-50">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search subscribers..."
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-bold transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
                <RefreshCcw className="h-8 w-8 animate-spin text-primary opacity-20" />
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Loading...</span>
              </div>
            ) : filteredSubscribers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-20 text-center">
                <Users className="h-10 w-10 text-gray-200" />
                <span className="text-xs font-bold text-gray-400">No subscribers found</span>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredSubscribers.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{sub.email}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      {sub.isActive ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
