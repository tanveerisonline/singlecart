"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Palette, 
  Save, 
  RefreshCcw, 
  Image as ImageIcon, 
  X, 
  Trash2, 
  Info, 
  ShieldCheck, 
  CreditCard, 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin,
  ChevronRight,
  Globe,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import MediaModal from "@/components/admin/MediaModal";
import Image from "next/image";

type TabType = "general" | "checkout" | "contact" | "social";

export default function ThemeSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<string>("");

  const [data, setData] = useState({
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#4f46e5",
    safeCheckoutImage: "",
    secureCheckoutImage: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/admin/theme");
        if (response.data) {
          setData({
            logoUrl: response.data.logoUrl || "",
            faviconUrl: response.data.faviconUrl || "",
            primaryColor: response.data.primaryColor || "#4f46e5",
            safeCheckoutImage: response.data.safeCheckoutImage || "",
            secureCheckoutImage: response.data.secureCheckoutImage || "",
            contactEmail: response.data.contactEmail || "",
            contactPhone: response.data.contactPhone || "",
            address: response.data.address || "",
            facebookUrl: response.data.facebookUrl || "",
            instagramUrl: response.data.instagramUrl || "",
            twitterUrl: response.data.twitterUrl || ""
          });
        }
      } catch (error) {
        console.error("Fetch error:", error);
        // Silently fail if not found
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSelectMedia = (url: string) => {
    setData({ ...data, [selectionMode]: url });
    setIsMediaModalOpen(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await axios.patch("/api/admin/theme", data);
      toast.success("Theme settings updated successfully!");
      // Force reload to apply new primary color from RootLayout
      window.location.reload();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General Assets", icon: ImageIcon },
    { id: "checkout", label: "Checkout Trust", icon: ShieldCheck },
    { id: "contact", label: "Contact Info", icon: Mail },
    { id: "social", label: "Social Links", icon: Facebook },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-gray-100">
      <RefreshCcw className="h-10 w-10 animate-spin text-primary mb-4 opacity-20" />
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Loading theme options...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <MediaModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={onSelectMedia}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
            <Palette className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Theme Customization</h1>
            <p className="text-sm text-gray-500 mt-0.5">Control the visual identity and trust signals of your store.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:opacity-90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden sticky top-8">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Navigation</p>
            </div>
            <nav className="p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-black rounded-2xl transition-all ${
                    activeTab === tab.id 
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" 
                    : "text-gray-400 hover:bg-gray-50 hover:text-primary"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* General Assets */}
            {activeTab === "general" && (
              <div className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Store Logo</label>
                    <div 
                      onClick={() => { setSelectionMode("logoUrl"); setIsMediaModalOpen(true); }}
                      className={`relative aspect-video rounded-3xl border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden
                        ${data.logoUrl ? "border-primary bg-gray-50" : "border-gray-200 hover:border-primary hover:bg-primary/5"}`}
                    >
                      {data.logoUrl ? (
                        <>
                          <Image src={data.logoUrl} alt="Logo" fill className="object-contain p-4" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <RefreshCcw className="h-6 w-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-4 rounded-2xl bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-primary transition-all mb-2"><ImageIcon className="h-6 w-6" /></div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Logo</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Favicon</label>
                    <div 
                      onClick={() => { setSelectionMode("faviconUrl"); setIsMediaModalOpen(true); }}
                      className={`relative h-24 w-24 rounded-2xl border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden
                        ${data.faviconUrl ? "border-primary bg-gray-50" : "border-gray-200 hover:border-primary hover:bg-primary/5"}`}
                    >
                      {data.faviconUrl ? (
                        <>
                          <Image src={data.faviconUrl} alt="Favicon" fill className="object-contain p-4" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <RefreshCcw className="h-4 w-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-2 rounded-xl bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-primary transition-all mb-1"><Globe className="h-5 w-5" /></div>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Select</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-10 border-t border-gray-50">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Theme Color</label>
                  <div className="flex items-center gap-6">
                    <input 
                      type="color" 
                      value={data.primaryColor}
                      onChange={(e) => setData({...data, primaryColor: e.target.value})}
                      className="h-14 w-24 rounded-xl cursor-pointer border border-gray-200 p-1 bg-white"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-black text-gray-900 uppercase tracking-tighter">{data.primaryColor}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">This color will be used for buttons, links, and highlights.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Checkout Trust */}
            {activeTab === "checkout" && (
              <div className="p-10 space-y-10">
                <div className="space-y-8">
                  <div className="bg-cyan-50/50 rounded-[32px] p-8 border border-cyan-100 flex items-start gap-6">
                    <div className="p-3 bg-cyan-500 text-white rounded-2xl shadow-lg shadow-cyan-100"><ShieldCheck className="h-6 w-6" /></div>
                    <div>
                      <h3 className="font-black text-cyan-950 uppercase tracking-tight">Safe Checkout Graphic</h3>
                      <p className="text-xs text-cyan-700/70 mt-1 font-bold">Appears on product pages to build customer trust. Recommended: Transparent PNG.</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => { setSelectionMode("safeCheckoutImage"); setIsMediaModalOpen(true); }}
                    className={`relative h-48 rounded-[32px] border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden
                      ${data.safeCheckoutImage ? "border-cyan-500 bg-gray-50" : "border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/30"}`}
                  >
                    {data.safeCheckoutImage ? (
                      <>
                        <Image src={data.safeCheckoutImage} alt="Safe Checkout" fill className="object-contain p-6" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button onClick={(e) => { e.stopPropagation(); setSelectionMode("safeCheckoutImage"); setIsMediaModalOpen(true); }} className="p-3 bg-white rounded-2xl text-cyan-600 shadow-xl"><RefreshCcw className="h-6 w-6" /></button>
                          <button onClick={(e) => { e.stopPropagation(); setData({...data, safeCheckoutImage: ""}); }} className="p-3 bg-white rounded-2xl text-rose-600 shadow-xl"><Trash2 className="h-6 w-6" /></button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 rounded-2xl bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-cyan-600 transition-all mb-3"><ImageIcon className="h-8 w-8" /></div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Graphic</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-8 pt-10 border-t border-gray-50">
                  <div className="bg-violet-50/50 rounded-[32px] p-8 border border-violet-100 flex items-start gap-6">
                    <div className="p-3 bg-violet-500 text-white rounded-2xl shadow-lg shadow-violet-100"><CreditCard className="h-6 w-6" /></div>
                    <div>
                      <h3 className="font-black text-violet-950 uppercase tracking-tight">Secure Payment Graphic</h3>
                      <p className="text-xs text-violet-700/70 mt-1 font-bold">Showcases available payment methods and SSL security signals.</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => { setSelectionMode("secureCheckoutImage"); setIsMediaModalOpen(true); }}
                    className={`relative h-48 rounded-[32px] border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden
                      ${data.secureCheckoutImage ? "border-violet-500 bg-gray-50" : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/30"}`}
                  >
                    {data.secureCheckoutImage ? (
                      <>
                        <Image src={data.secureCheckoutImage} alt="Secure Checkout" fill className="object-contain p-6" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button onClick={(e) => { e.stopPropagation(); setSelectionMode("secureCheckoutImage"); setIsMediaModalOpen(true); }} className="p-3 bg-white rounded-2xl text-violet-600 shadow-xl"><RefreshCcw className="h-6 w-6" /></button>
                          <button onClick={(e) => { e.stopPropagation(); setData({...data, secureCheckoutImage: ""}); }} className="p-3 bg-white rounded-2xl text-rose-600 shadow-xl"><Trash2 className="h-6 w-6" /></button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-4 rounded-2xl bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-violet-600 transition-all mb-3"><ImageIcon className="h-8 w-8" /></div>
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Graphic</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Info */}
            {activeTab === "contact" && (
              <div className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Mail className="h-3 w-3" /> Contact Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. support@store.com"
                      value={data.contactEmail}
                      onChange={(e) => setData({ ...data, contactEmail: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Phone className="h-3 w-3" /> Contact Phone
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +1 234 567 890"
                      value={data.contactPhone}
                      onChange={(e) => setData({ ...data, contactPhone: e.target.value })}
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Business Address
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Physical store or office address..."
                    value={data.address}
                    onChange={(e) => setData({ ...data, address: e.target.value })}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-medium resize-none"
                  />
                </div>
              </div>
            )}

            {/* Social Links */}
            {activeTab === "social" && (
              <div className="p-10 space-y-8">
                <div className="grid grid-cols-1 gap-6">
                  {[
                    { id: "facebookUrl", label: "Facebook URL", icon: Facebook, color: "text-blue-600" },
                    { id: "instagramUrl", label: "Instagram URL", icon: Instagram, color: "text-rose-600" },
                    { id: "twitterUrl", label: "Twitter (X) URL", icon: Twitter, color: "text-sky-500" },
                  ].map((social) => (
                    <div key={social.id} className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <social.icon className={`h-3 w-3 ${social.color}`} /> {social.label}
                      </label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={(data as any)[social.id]}
                        onChange={(e) => setData({ ...data, [social.id]: e.target.value })}
                        className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none text-sm font-bold text-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <div className="bg-primary/90 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Settings className="h-48 w-48" />
        </div>
        <div className="relative z-10 flex items-start gap-8">
          <div className="p-4 bg-white/10 rounded-[24px] backdrop-blur-md border border-white/10">
            <Info className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight mb-2 uppercase">Theme Management Info</h3>
            <p className="text-white/80 text-sm leading-relaxed max-w-3xl font-bold">
              Changes saved here are cached globally. If you don't see updates on the frontend immediately, 
              try clearing your browser cache or performing a fresh page load. 
              Always use high-resolution, optimized images for logos and trust graphics to maintain performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
