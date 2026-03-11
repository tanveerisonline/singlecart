"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Plus, 
  Minus, 
  HelpCircle, 
  ChevronRight, 
  Search,
  MessageSquare,
  ArrowRight,
  RefreshCcw
} from "lucide-react";
import Link from "next/link";

export default function FAQPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await axios.get("/api/faqs");
        setFaqs(res.data);
      } catch (error) {
        console.error("Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(filteredFaqs.map(f => f.category)));

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gray-50 py-20 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
            <HelpCircle className="h-3 w-3" /> Customer Support
          </div>
          <h1 className="text-5xl font-black text-gray-900 uppercase tracking-tight">How can we help?</h1>
          <p className="text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">
            Find answers to common questions about shipping, returns, and our products.
          </p>
          <div className="relative max-w-xl mx-auto pt-4 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search for answers..."
              className="w-full bg-white border border-gray-200 rounded-[24px] py-5 pl-14 pr-6 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-bold shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCcw className="h-10 w-10 animate-spin text-primary opacity-20" />
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Loading knowledge base...</p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <HelpCircle className="h-12 w-12 text-gray-200 mx-auto" />
            <p className="text-gray-500 font-bold">No matching questions found.</p>
            <button onClick={() => setSearchTerm("")} className="text-primary font-black text-[10px] uppercase underline underline-offset-4">Clear Search</button>
          </div>
        ) : (
          <div className="space-y-16">
            {categories.map((category) => (
              <div key={category} className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-1 w-8 bg-primary"></div>
                  <h2 className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">{category}</h2>
                </div>
                
                <div className="space-y-4">
                  {filteredFaqs
                    .filter(f => f.category === category)
                    .map((faq) => (
                      <div 
                        key={faq.id} 
                        className={`border rounded-[24px] transition-all overflow-hidden ${
                          openId === faq.id ? "bg-white border-primary shadow-xl shadow-primary/5" : "bg-white border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        <button
                          onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                          className="w-full flex items-center justify-between p-6 text-left group"
                        >
                          <span className={`text-base font-black transition-colors ${openId === faq.id ? "text-primary" : "text-gray-900"}`}>
                            {faq.question}
                          </span>
                          <div className={`shrink-0 transition-transform duration-300 ${openId === faq.id ? "rotate-180 text-primary" : "text-gray-400"}`}>
                            {openId === faq.id ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                          </div>
                        </button>
                        
                        {openId === faq.id && (
                          <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="h-[1px] w-full bg-gray-50 mb-6" />
                            <p className="text-gray-600 leading-relaxed font-medium">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-24 bg-gray-900 rounded-[40px] p-10 md:p-16 text-center text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <MessageSquare className="h-32 w-32" />
           </div>
           <div className="relative z-10 space-y-6">
              <h2 className="text-3xl font-black uppercase tracking-tight">Still have questions?</h2>
              <p className="text-gray-400 max-w-sm mx-auto font-medium leading-relaxed">
                If you couldn't find the answer you were looking for, our team is always ready to help.
              </p>
              <div className="pt-4">
                <Link 
                  href="/contact"
                  className="inline-flex items-center gap-3 bg-white text-gray-900 px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all group shadow-xl"
                >
                  Contact Support <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
