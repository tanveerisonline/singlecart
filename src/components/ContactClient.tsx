"use client";

import { useState } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  Facebook,
  Instagram,
  Twitter,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { ThemeSetting } from "@prisma/client";
import Link from "next/link";

interface ContactClientProps {
  theme?: ThemeSetting | null;
}

export default function ContactClient({ theme }: ContactClientProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Hero Header */}
      <div className="bg-gray-900 py-24 relative overflow-hidden">
         <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
         <div className="absolute -top-24 -right-24 h-96 w-96 bg-primary/20 rounded-full blur-3xl"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
            <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em]">Get in Touch</span>
            <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">How can we <span className="text-primary italic">Help?</span></h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
               Have a question about an order, a product, or just want to say hi? Our dedicated support team is here for you 24/7.
            </p>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                     <Mail className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Email Us</h3>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Response within 24h</p>
                  </div>
               </div>
               <p className="text-lg font-black text-gray-900 break-all">{theme?.contactEmail || "support@shop.com"}</p>
               <div className="h-px bg-gray-50 w-full"></div>
               <div className="flex items-center gap-4 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Available 24/7</span>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                     <Phone className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Call Us</h3>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Direct line support</p>
                  </div>
               </div>
               <p className="text-lg font-black text-gray-900">{theme?.contactPhone || "+1 (234) 567-890"}</p>
               <div className="h-px bg-gray-50 w-full"></div>
               <div className="flex items-center gap-4 text-gray-400">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">SMS also available</span>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shadow-inner">
                     <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                     <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Our Office</h3>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Global Headquarters</p>
                  </div>
               </div>
               <p className="text-sm font-bold text-gray-600 leading-relaxed">
                  {theme?.address || "123 Commerce Way, Digital City, 90210"}
               </p>
               <div className="h-px bg-gray-50 w-full"></div>
               <div className="flex gap-3">
                  {theme?.facebookUrl && <Link href={theme.facebookUrl} className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary transition-all"><Facebook className="h-4 w-4" /></Link>}
                  {theme?.instagramUrl && <Link href={theme.instagramUrl} className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary transition-all"><Instagram className="h-4 w-4" /></Link>}
                  {theme?.twitterUrl && <Link href={theme.twitterUrl} className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary transition-all"><Twitter className="h-4 w-4" /></Link>}
               </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[40px] p-8 sm:p-12 border border-gray-100 shadow-2xl shadow-gray-200/50">
              {submitted ? (
                <div className="text-center py-20 space-y-8 animate-in fade-in zoom-in duration-500">
                  <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Message Received!</h2>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">We've received your request and our team will get back to you within 24 hours. Check your inbox!</p>
                  </div>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-primary font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 mx-auto hover:gap-4 transition-all"
                  >
                    Send another message <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        required 
                        placeholder="John Doe"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold" 
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input 
                        required 
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                    <input 
                      required 
                      placeholder="How can we help?"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold" 
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message Detail</label>
                    <textarea 
                      required 
                      rows={6} 
                      placeholder="Please describe your request in detail..."
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium resize-none" 
                    />
                  </div>

                  <button
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-primary text-white py-6 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    Send My Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
