"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Layout, Palette, Store, CreditCard, Truck, RefreshCcw, Save, ShieldCheck, Globe, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    storeName: "",
    storeEmail: "",
    storePhone: "",
    currency: "USD",
    address: "",
    taxRate: 0,
    shippingFee: 5.0,
    freeShippingThreshold: 100.0,
    homeLayout: "default",
  });

  const router = useRouter();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get("/api/admin/settings");
        setSettings({
          ...response.data,
          homeLayout: response.data.homeLayout || "default"
        });
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.patch("/api/admin/settings", settings);
      toast.success("Settings updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Failed to save settings", error);
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-gray-100">
      <RefreshCcw className="h-10 w-10 animate-spin text-indigo-500 mb-4 opacity-20" />
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Loading configuration...</p>
    </div>
  );

  const layouts = [
    { id: "default", name: "Default", description: "Standard layout with slider and latest products." },
    { id: "grid", name: "Grid Focus", description: "Clean grid layout focusing purely on product discovery." },
    { id: "elegant", name: "Elegant Premium", description: "Centered typography and refined spacing for high-end look." },
    { id: "compact", name: "Compact Dense", description: "Maximize screen space with more products per row." },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Configure your store's appearance, contact details, and business rules.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            System Secure
          </div>
        </div>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-8">
        {/* Layout Selection */}
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Layout className="h-24 w-24 text-indigo-600" />
          </div>
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Home Page Experience</h2>
              <p className="text-xs text-gray-500 mt-0.5">Choose how your store appears to customers.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {layouts.map((layout) => (
              <div 
                key={layout.id}
                onClick={() => setSettings({ ...settings, homeLayout: layout.id })}
                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-md group ${
                  settings.homeLayout === layout.id 
                  ? "border-indigo-600 bg-indigo-50/20 ring-4 ring-indigo-50" 
                  : "border-gray-50 bg-gray-50/30 hover:border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className={`text-sm font-bold ${settings.homeLayout === layout.id ? "text-indigo-700" : "text-gray-900"}`}>
                    {layout.name}
                  </h3>
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    settings.homeLayout === layout.id ? "border-indigo-600 bg-indigo-600 shadow-sm" : "border-gray-300 group-hover:border-gray-400"
                  }`}>
                    {settings.homeLayout === layout.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">{layout.description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* General Store Info */}
          <section className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">General Information</h2>
                <p className="text-xs text-gray-500 mt-0.5">Basic identity and contact details.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Globe className="h-3 w-3" /> Store Name
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  placeholder="e.g. Modern Shop"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Mail className="h-3 w-3" /> Support Email
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                  placeholder="contact@shop.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> Support Phone
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                  value={settings.storePhone || ""}
                  onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                  placeholder="+1 (234) 567-890"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <CreditCard className="h-3 w-3" /> Base Currency
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  placeholder="USD"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> Physical Address
                </label>
                <textarea
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium resize-none"
                  rows={3}
                  value={settings.address || ""}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="123 Commerce Way, Digital City, 90210"
                />
              </div>
            </div>
          </section>

          {/* Business Rules */}
          <section className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Financials</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Tax and pricing rules.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tax Rate (%)</label>
                  <input
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                    type="number"
                    step="0.01"
                    value={settings.taxRate || 0}
                    onChange={(e) => setSettings({ ...settings, taxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Shipping</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Delivery costs and thresholds.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Standard Shipping Fee</label>
                  <input
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                    type="number"
                    step="0.01"
                    value={settings.shippingFee || 0}
                    onChange={(e) => setSettings({ ...settings, shippingFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Free Shipping Threshold</label>
                  <input
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                    type="number"
                    step="0.01"
                    value={settings.freeShippingThreshold || 0}
                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 disabled:bg-indigo-300 shadow-lg shadow-indigo-100 transition-all font-bold text-sm flex items-center"
          >
            {saving ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
