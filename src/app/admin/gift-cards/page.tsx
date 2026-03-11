"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Ticket, 
  Plus, 
  Trash2, 
  RefreshCcw, 
  Search,
  User,
  Calendar,
  DollarSign,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function AdminGiftCardsPage() {
  const [giftCards, setGiftCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    amount: "",
    expiryDate: "",
    customCode: "",
    userId: ""
  });

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/gift-cards");
      setGiftCards(res.data);
    } catch (error) {
      toast.error("Failed to load gift cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const onSave = async () => {
    try {
      await axios.post("/api/admin/gift-cards", formData);
      toast.success("Gift card created successfully");
      setIsAdding(false);
      setFormData({ amount: "", expiryDate: "", customCode: "", userId: "" });
      fetchCards();
    } catch (error) {
      toast.error("Failed to create gift card");
    }
  };

  const filteredCards = giftCards.filter(c => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.user?.email && c.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Gift Cards</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Generate and manage store credit for customers</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="h-4 w-4" /> Create Gift Card
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[32px] border-2 border-primary/20 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">New Gift Card</h2>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount ($)*</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-bold"
                placeholder="50.00"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Custom Code</label>
              <input
                type="text"
                value={formData.customCode}
                onChange={(e) => setFormData({...formData, customCode: e.target.value.toUpperCase()})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-bold"
                placeholder="HAPPY-2026"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-bold"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={onSave}
                disabled={!formData.amount}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl disabled:opacity-50"
              >
                Generate Code
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search by code or email..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-bold transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-8 py-5">Card Details</th>
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Initial / Balance</th>
                <th className="px-8 py-5">Expiry</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <RefreshCcw className="h-8 w-8 animate-spin text-primary mx-auto mb-4 opacity-20" />
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Syncing ledger...</p>
                  </td>
                </tr>
              ) : filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-bold">No gift cards found</td>
                </tr>
              ) : (
                filteredCards.map((card) => (
                  <tr key={card.id} className="group hover:bg-gray-50/50 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <Ticket className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{card.code}</p>
                          <p className={`text-[8px] font-black uppercase tracking-widest ${card.isActive ? 'text-emerald-500' : 'text-gray-400'}`}>
                            {card.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                      {card.user ? (
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-primary" />
                          {card.user.email}
                        </div>
                      ) : (
                        <span className="text-gray-300 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-gray-400 font-bold">${card.initialAmount.toFixed(2)}</span>
                        <span className="text-lg font-black text-gray-900">/</span>
                        <span className="text-lg font-black text-primary">${card.balance.toFixed(2)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs text-gray-500 font-bold uppercase tracking-tight">
                      {card.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
