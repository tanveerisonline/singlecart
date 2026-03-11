"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Wallet, 
  RefreshCcw, 
  Save, 
  Lock, 
  Eye, 
  EyeOff,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function PaymentSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState({
    stripeIsEnabled: false,
    stripeSecretKey: "",
    stripePublishableKey: "",
    paypalIsEnabled: false,
    paypalClientId: "",
    paypalSecretKey: "",
    paypalMode: "sandbox",
    razorpayIsEnabled: false,
    razorpayKeyId: "",
    razorpayKeySecret: "",
    codIsEnabled: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get("/api/admin/settings/payments");
        setSettings(res.data);
      } catch (error) {
        toast.error("Failed to load payment settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const onSave = async () => {
    try {
      setSaving(true);
      await axios.patch("/api/admin/settings/payments", settings);
      toast.success("Payment settings updated successfully!");
    } catch (error: any) {
      const msg = error.response?.data || error.message || "Failed to save settings";
      toast.error(msg);
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-gray-100">
      <RefreshCcw className="h-10 w-10 animate-spin text-primary opacity-20" />
      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-4">Loading configurations...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Gateways</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your online payment methods and API credentials.</p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
        >
          {saving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Stripe Configuration */}
        <div className={`bg-white rounded-3xl border transition-all ${settings.stripeIsEnabled ? "border-primary ring-4 ring-primary/5" : "border-gray-100 opacity-80"}`}>
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-[#635BFF]/10 rounded-2xl flex items-center justify-center text-[#635BFF]">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Stripe Integration</h3>
                <p className="text-xs text-gray-500">Enable credit cards and GPay payments globally.</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({...settings, stripeIsEnabled: !settings.stripeIsEnabled})}
              className={`w-14 h-7 rounded-full relative transition-colors ${settings.stripeIsEnabled ? "bg-[#635BFF]" : "bg-gray-200"}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.stripeIsEnabled ? "right-1" : "left-1"}`} />
            </button>
          </div>
          
          {settings.stripeIsEnabled && (
            <div className="p-8 space-y-6 animate-in fade-in slide-in-from-top-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Publishable Key</label>
                  <input
                    type="text"
                    value={settings.stripePublishableKey || ""}
                    onChange={(e) => setSettings({...settings, stripePublishableKey: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
                    placeholder="pk_test_..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Secret Key</label>
                  <div className="relative">
                    <input
                      type={showKeys['stripe'] ? "text" : "password"}
                      value={settings.stripeSecretKey || ""}
                      onChange={(e) => setSettings({...settings, stripeSecretKey: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
                      placeholder="sk_test_..."
                    />
                    <button onClick={() => toggleVisibility('stripe')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showKeys['stripe'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PayPal Configuration */}
        <div className={`bg-white rounded-3xl border transition-all ${settings.paypalIsEnabled ? "border-[#0070BA] ring-4 ring-[#0070BA]/5" : "border-gray-100 opacity-80"}`}>
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-[#0070BA]/10 rounded-2xl flex items-center justify-center text-[#0070BA]">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">PayPal Integration</h3>
                <p className="text-xs text-gray-500">Support PayPal accounts and debit/credit cards.</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({...settings, paypalIsEnabled: !settings.paypalIsEnabled})}
              className={`w-14 h-7 rounded-full relative transition-colors ${settings.paypalIsEnabled ? "bg-[#0070BA]" : "bg-gray-200"}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.paypalIsEnabled ? "right-1" : "left-1"}`} />
            </button>
          </div>
          
          {settings.paypalIsEnabled && (
            <div className="p-8 space-y-6 animate-in fade-in slide-in-from-top-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Client ID</label>
                  <input
                    type="text"
                    value={settings.paypalClientId || ""}
                    onChange={(e) => setSettings({...settings, paypalClientId: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Secret Key</label>
                  <div className="relative">
                    <input
                      type={showKeys['paypal'] ? "text" : "password"}
                      value={settings.paypalSecretKey || ""}
                      onChange={(e) => setSettings({...settings, paypalSecretKey: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
                    />
                    <button onClick={() => toggleVisibility('paypal')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showKeys['paypal'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Environment Mode</label>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setSettings({...settings, paypalMode: 'sandbox'})}
                    className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${settings.paypalMode === 'sandbox' ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"}`}
                  >
                    Sandbox (Testing)
                  </button>
                  <button 
                    onClick={() => setSettings({...settings, paypalMode: 'live'})}
                    className={`flex-1 py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${settings.paypalMode === 'live' ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"}`}
                  >
                    Live (Production)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Razorpay Configuration */}
        <div className={`bg-white rounded-3xl border transition-all ${settings.razorpayIsEnabled ? "border-[#3395FF] ring-4 ring-[#3395FF]/5" : "border-gray-100 opacity-80"}`}>
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-[#3395FF]/10 rounded-2xl flex items-center justify-center text-[#3395FF]">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Razorpay Integration</h3>
                <p className="text-xs text-gray-500">Enable UPI, Netbanking and Cards for India.</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({...settings, razorpayIsEnabled: !settings.razorpayIsEnabled})}
              className={`w-14 h-7 rounded-full relative transition-colors ${settings.razorpayIsEnabled ? "bg-[#3395FF]" : "bg-gray-200"}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${settings.razorpayIsEnabled ? "right-1" : "left-1"}`} />
            </button>
          </div>
          
          {settings.razorpayIsEnabled && (
            <div className="p-8 space-y-6 animate-in fade-in slide-in-from-top-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Key ID</label>
                  <input
                    type="text"
                    value={settings.razorpayKeyId || ""}
                    onChange={(e) => setSettings({...settings, razorpayKeyId: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
                    placeholder="rzp_test_..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Key Secret</label>
                  <div className="relative">
                    <input
                      type={showKeys['razorpay'] ? "text" : "password"}
                      value={settings.razorpayKeySecret || ""}
                      onChange={(e) => setSettings({...settings, razorpayKeySecret: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-medium"
                    />
                    <button onClick={() => toggleVisibility('razorpay')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showKeys['razorpay'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Warning */}
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">Security Recommendation</p>
            <p className="text-xs text-amber-700 leading-relaxed mt-1">
              Store your sensitive keys securely. If you suspect any unauthorized access to these settings, rotate your API keys immediately on the payment gateway dashboards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
