"use client";

import { useState, useEffect } from "react";
import { Filter, Save, Loader2, CheckCircle2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function FilterSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    showCategory: true,
    showBrand: true,
    showPrice: true,
    showRating: true,
    showAvailability: true,
    showDiscount: true,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get("/api/admin/settings/filters");
        setSettings(response.data);
      } catch (error) {
        toast.error("Failed to load filter settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const onToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await axios.patch("/api/admin/settings/filters", settings);
      toast.success("Filter settings updated successfully");
    } catch (error) {
      toast.error("Failed to save filter settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filterOptions = [
    { key: "showCategory", label: "Category Filter", description: "Allow users to filter products by their category." },
    { key: "showBrand", label: "Brand Filter", description: "Allow users to filter products by their brand." },
    { key: "showPrice", label: "Price Range Filter", description: "Allow users to filter products by a specific price range." },
    { key: "showRating", label: "Customer Rating Filter", description: "Allow users to filter products by minimum star rating." },
    { key: "showAvailability", label: "Stock Availability Filter", description: "Allow users to show only in-stock products." },
    { key: "showDiscount", label: "On-Sale Filter", description: "Allow users to filter for products with active discounts." },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Filter Configuration</h1>
          <p className="text-gray-500 text-sm mt-1">Control which filters are visible on your shop and category pages.</p>
        </div>
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-primary text-white px-6 py-2.5 rounded-xl hover:opacity-90 transition-all text-sm font-bold flex items-center shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filterOptions.map((option) => (
            <div key={option.key} className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-primary/20 transition-all group">
              <div className="space-y-1">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight group-hover:text-primary transition-colors">{option.label}</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-relaxed pr-4">
                  {option.description}
                </p>
              </div>
              <button
                onClick={() => onToggle(option.key as any)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings[option.key as keyof typeof settings] ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings[option.key as keyof typeof settings] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
