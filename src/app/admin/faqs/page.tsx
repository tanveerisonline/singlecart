"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  RefreshCcw, 
  ChevronRight,
  GripVertical,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    order: 0,
    isActive: true
  });

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/faqs");
      setFaqs(res.data);
    } catch (error) {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const onSave = async () => {
    try {
      if (isEditing) {
        await axios.patch(`/api/admin/faqs/${isEditing}`, formData);
        toast.success("FAQ updated successfully");
      } else {
        await axios.post("/api/admin/faqs", formData);
        toast.success("FAQ created successfully");
      }
      setIsEditing(null);
      setIsAdding(false);
      setFormData({ question: "", answer: "", category: "General", order: 0, isActive: true });
      fetchFaqs();
    } catch (error) {
      toast.error("Failed to save FAQ");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await axios.delete(`/api/admin/faqs/${id}`);
      toast.success("FAQ deleted successfully");
      fetchFaqs();
    } catch (error) {
      toast.error("Failed to delete FAQ");
    }
  };

  const startEdit = (faq: any) => {
    setIsEditing(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isActive: faq.isActive
    });
    setIsAdding(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">FAQ & Knowledge Base</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Manage customer help content and common questions</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setIsEditing(null);
            setFormData({ question: "", answer: "", category: "General", order: 0, isActive: true });
          }}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="h-4 w-4" /> Add Question
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[32px] border-2 border-primary/20 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
              {isEditing ? "Edit Question" : "New Question"}
            </h2>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Question*</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({...formData, question: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-bold"
                placeholder="e.g. How long does shipping take?"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Answer*</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({...formData, answer: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-medium h-32 resize-none"
                placeholder="Provide a detailed answer..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-bold"
                placeholder="General, Shipping, Returns..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Display Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-bold"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={onSave}
              className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl"
            >
              {isEditing ? "Update Question" : "Create Question"}
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-8 py-4 rounded-2xl border border-gray-100 font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-20 rounded-[32px] border border-gray-100 text-center">
            <RefreshCcw className="h-10 w-10 animate-spin text-primary mx-auto mb-4 opacity-20" />
            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Scanning knowledge base...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="bg-white p-20 rounded-[32px] border border-gray-100 text-center">
            <HelpCircle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">No questions found</p>
            <p className="text-gray-400 text-[10px] font-black uppercase mt-1">Start by adding common customer queries</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                <div className="p-6 flex items-start gap-6">
                  <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0 group-hover:text-primary transition-colors">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {faq.category}
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                        Order: {faq.order}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-gray-900 group-hover:text-primary transition-colors mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium line-clamp-2">
                      {faq.answer}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(faq)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(faq.id)}
                      className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
