"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";
import Link from "next/link";
import { 
  Plus, 
  PlusCircle,
  Trash2, 
  Image as ImageIcon, 
  Box, 
  Layers, 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Check, 
  Info, 
  Settings, 
  Search, 
  Truck, 
  Eye, 
  Tag as TagIcon, 
  ShieldCheck,
  ChevronRight,
  Monitor,
  Package,
  FileText,
  BarChart,
  Globe,
  Award,
  X,
  AlertTriangle,
  Grid
} from "lucide-react";
import Image from "next/image";
import MediaModal from "@/components/admin/MediaModal";
import { toast } from "sonner";

interface AttributeValue {
  id: string;
  value: string;
}

interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
}

interface Brand {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

type TabType = "general" | "images" | "inventory" | "setup" | "seo" | "shipping" | "status";
type SelectionMode = "thumbnail" | "images" | "sizeChart";

export default function NewProductPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("images");
  
  const [data, setData] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    description: "",
    price: "",
    sku: "",
    stock: "",
    categoryId: "",
    brandId: "",
    tagIds: [] as string[],
    images: [] as string[],
    thumbnailUrl: "",
    sizeChartUrl: "",
    hasWatermark: false,
    productType: "PHYSICAL",
    tax: "0",
    isFeatured: false,
    isActive: true,
    metaTitle: "",
    metaDescription: "",
    weight: "",
    length: "",
    width: "",
    height: "",
    stockStatus: "in_stock",
    discount: "0",
    salePrice: "0.00",
    wholesalePriceType: ""
  });

  // For variant generation
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
  const [variants, setVariants] = useState<{name: string, sku: string, price: string, stock: string}[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, attrRes, brandRes, tagRes] = await Promise.all([
          axios.get("/api/categories"),
          axios.get("/api/admin/attributes"),
          axios.get("/api/brands"),
          axios.get("/api/tags")
        ]);
        setCategories(catRes.data);
        setAttributes(attrRes.data);
        setBrands(brandRes.data);
        setAvailableTags(tagRes.data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, []);

  // Calculate sale price when price or discount changes
  useEffect(() => {
    const p = parseFloat(data.price) || 0;
    const d = parseFloat(data.discount) || 0;
    if (p > 0 && d > 0) {
      const sale = p - (p * (d / 100));
      setData(prev => ({ ...prev, salePrice: sale.toFixed(2) }));
    } else {
      setData(prev => ({ ...prev, salePrice: p.toFixed(2) }));
    }
  }, [data.price, data.discount]);

  const onSelectMedia = (url: string) => {
    if (selectionMode === "thumbnail") {
      setData({ ...data, thumbnailUrl: url });
    } else if (selectionMode === "sizeChart") {
      setData({ ...data, sizeChartUrl: url });
    } else if (selectionMode === "images") {
      if (!data.images.includes(url)) {
        setData({ ...data, images: [...data.images, url] });
      }
    }
    setIsMediaModalOpen(false);
  };

  const removeImage = (url: string) => {
    setData({ ...data, images: data.images.filter(img => img !== url) });
  };

  const toggleTag = (tagId: string) => {
    setData(prev => {
      const current = prev.tagIds || [];
      const updated = current.includes(tagId)
        ? current.filter(id => id !== tagId)
        : [...current, tagId];
      return { ...prev, tagIds: updated };
    });
  };

  const toggleAttributeValue = (attrName: string, value: string) => {
    setSelectedAttributes(prev => {
      const current = prev[attrName] || [];
      const updated = current.includes(value) 
        ? current.filter(v => v !== value)
        : [...current, value];
      
      return { ...prev, [attrName]: updated };
    });
  };

  const generateVariants = () => {
    const activeAttrs = Object.entries(selectedAttributes).filter(([_, vals]) => vals.length > 0);
    if (activeAttrs.length === 0) {
      toast.error("Please select at least one attribute value first.");
      return;
    }

    const combine = (acc: any[], [attrName, values]: [string, string[]]) => {
      if (acc.length === 0) return values.map(v => ({ [attrName]: v }));
      return acc.flatMap(item => values.map(v => ({ ...item, [attrName]: v })));
    };

    const combinations = activeAttrs.reduce(combine, []);
    
    const newVariants = combinations.map((combo: any) => {
      const name = Object.entries(combo).map(([k, v]) => `${k}: ${v}`).join(", ");
      const skuSuffix = Object.values(combo).join("-").toUpperCase().replace(/\s+/g, "");
      return {
        name,
        sku: `${data.sku || 'PROD'}-${skuSuffix}`,
        price: data.price,
        stock: "0"
      };
    });

    setVariants(newVariants);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.thumbnailUrl && data.images.length === 0) {
      toast.error("Please provide at least a thumbnail or one product image.");
      setActiveTab("images");
      return;
    }

    try {
      setLoading(true);
      const productData = {
        ...data,
        variants: variants
      };
      await axios.post("/api/products", productData);
      toast.success("Product created successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data || "Failed to save product. Please check all fields.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: FileText },
    { id: "images", label: "Product Media", icon: ImageIcon },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "setup", label: "Setup", icon: Settings },
    { id: "seo", label: "SEO", icon: Globe },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "status", label: "Status", icon: ShieldCheck },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
            <p className="text-sm text-gray-500 mt-0.5">Create a new item for your store catalog.</p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 md:flex-none px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Discard
          </button>
          <button
            onClick={onSubmit}
            disabled={loading}
            className="flex-1 md:flex-none px-8 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:bg-indigo-300 transition-all flex items-center justify-center shadow-lg shadow-indigo-100"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Menu */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-8">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Product Navigation</p>
            </div>
            <nav className="p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold rounded-xl transition-all ${
                    activeTab === tab.id 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100 scale-[1.02]" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-white" : "text-gray-400"}`} />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            {/* General Tab */}
            {activeTab === "general" && (
              <div className="p-8 space-y-8">
                <div className="border-b border-gray-50 pb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">General Information</h2>
                    <p className="text-sm text-gray-500 mt-1">Configure the core details of your product.</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Product Type */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product Type</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setData({ ...data, productType: "PHYSICAL" })}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group ${
                          data.productType === "PHYSICAL" 
                          ? "border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50" 
                          : "border-gray-50 bg-gray-50/30 hover:border-gray-200"
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-colors ${
                          data.productType === "PHYSICAL" ? "bg-indigo-600 text-white" : "bg-white text-gray-400 group-hover:text-indigo-600"
                        }`}>
                          <Package className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-bold ${data.productType === "PHYSICAL" ? "text-indigo-900" : "text-gray-700"}`}>Physical Product</p>
                          <p className="text-[10px] text-gray-500 font-medium">Tangible item that requires shipping</p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setData({ ...data, productType: "DIGITAL" })}
                        className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group ${
                          data.productType === "DIGITAL" 
                          ? "border-indigo-600 bg-indigo-50/30 ring-4 ring-indigo-50" 
                          : "border-gray-50 bg-gray-50/30 hover:border-gray-200"
                        }`}
                      >
                        <div className={`p-2 rounded-xl transition-colors ${
                          data.productType === "DIGITAL" ? "bg-indigo-600 text-white" : "bg-white text-gray-400 group-hover:text-indigo-600"
                        }`}>
                          <Monitor className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-bold ${data.productType === "DIGITAL" ? "text-indigo-900" : "text-gray-700"}`}>Digital Product</p>
                          <p className="text-[10px] text-gray-500 font-medium">Downloadable file or virtual service</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Name & Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Product Name</label>
                      <input
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                        placeholder="e.g. Premium Wireless Headphones"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">URL Slug</label>
                      <input
                        required
                        className="w-full px-4 py-2.5 bg-gray-100 border border-gray-100 rounded-xl text-gray-500 cursor-not-allowed outline-none text-xs font-mono"
                        readOnly
                        value={data.slug}
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Short Description</label>
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium resize-none"
                      placeholder="Brief overview for search results and previews..."
                      value={data.shortDescription}
                      onChange={(e) => setData({ ...data, shortDescription: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Description</label>
                    <div className="rounded-2xl border border-gray-100 overflow-hidden bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white focus-within:border-indigo-500 transition-all">
                      <div className="bg-gray-100/50 px-4 py-2 border-b border-gray-100 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Editor Placeholder</span>
                      </div>
                      <textarea
                        required
                        rows={10}
                        className="w-full px-4 py-4 bg-transparent outline-none text-sm font-medium leading-relaxed resize-y min-h-[200px]"
                        placeholder="Detailed product information, features, and benefits..."
                        value={data.description}
                        onChange={(e) => setData({ ...data, description: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Tax Field */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tax Rate (%)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">%</span>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-bold"
                          placeholder="0.00"
                          value={data.tax}
                          onChange={(e) => setData({ ...data, tax: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Product Media Tab */}
            {activeTab === "images" && (
              <div className="p-8 space-y-10">
                <div className="border-b border-gray-50 pb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Product Media</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage thumbnails, product gallery, and assets.</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Left Column - Specific Assets */}
                  <div className="space-y-8">
                    {/* Thumbnail */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                        Thumbnail*
                        <span className="text-[9px] lowercase font-medium text-gray-400">*Recommended 600x600px</span>
                      </label>
                      <div 
                        onClick={() => { setSelectionMode("thumbnail"); setIsMediaModalOpen(true); }}
                        className={`relative aspect-square max-w-[200px] rounded-2xl border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden
                          ${data.thumbnailUrl ? "border-indigo-500 bg-gray-50" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"}`}
                      >
                        {data.thumbnailUrl ? (
                          <>
                            <img src={data.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <RefreshCcw className="h-6 w-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-3 rounded-full bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-indigo-600 transition-all mb-2">
                              <Plus className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Image</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Size Chart */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Size Chart</label>
                      <div 
                        onClick={() => { setSelectionMode("sizeChart"); setIsMediaModalOpen(true); }}
                        className={`relative h-32 rounded-2xl border-2 border-dashed transition-all cursor-pointer group flex items-center gap-4 px-6
                          ${data.sizeChartUrl ? "border-indigo-500 bg-gray-50" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"}`}
                      >
                        {data.sizeChartUrl ? (
                          <>
                            <div className="h-20 w-20 rounded-lg overflow-hidden border border-gray-200">
                              <img src={data.sizeChartUrl} alt="Size Chart" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-gray-900">Chart Selected</p>
                              <p className="text-[10px] text-gray-500">Click to change</p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setData({...data, sizeChartUrl: ""}); }}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="p-2 rounded-lg bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                              <Plus className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Size Chart</p>
                              <p className="text-[9px] text-gray-400 mt-0.5">Recommended for fashion products</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Watermark Toggle */}
                    <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <Info className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-indigo-900">Apply Watermark</p>
                            <p className="text-[10px] text-indigo-700/70">Protect your product images</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setData({...data, hasWatermark: !data.hasWatermark})}
                          className={`w-12 h-6 rounded-full relative transition-colors ${data.hasWatermark ? "bg-indigo-600" : "bg-gray-300"}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.hasWatermark ? "right-1 shadow-sm" : "left-1"}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Gallery */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center justify-between">
                      Gallery Images
                      <span className="text-[9px] lowercase font-medium text-gray-400">*Recommended 600x600px</span>
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {data.images.map((url, i) => (
                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100 shadow-sm bg-gray-50">
                          <img src={url} alt="Gallery" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              onClick={() => removeImage(url)}
                              className="p-2 bg-white rounded-xl text-rose-600 shadow-lg hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => { setSelectionMode("images"); setIsMediaModalOpen(true); }}
                        className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all gap-2 group"
                      >
                        <div className="p-3 rounded-full bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                          <Plus className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Add to Gallery</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === "inventory" && (
              <div className="p-8 space-y-8">
                <div className="border-b border-gray-50 pb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Inventory & Pricing</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage stock status, SKU, and detailed pricing.</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <Package className="h-6 w-6" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {/* Stock Status */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Stock Status*</label>
                      <select
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-bold cursor-pointer"
                        value={data.stockStatus}
                        onChange={(e) => setData({ ...data, stockStatus: e.target.value })}
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="on_backorder">On Backorder</option>
                      </select>
                    </div>

                    {/* SKU */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">SKU*</label>
                      <input
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-mono font-bold"
                        placeholder="Enter SKU"
                        value={data.sku}
                        onChange={(e) => setData({ ...data, sku: e.target.value })}
                      />
                    </div>

                    {/* Stock Quantity */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Stock Quantity*</label>
                      <input
                        required
                        type="number"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-bold"
                        placeholder="Enter Quantity"
                        value={data.stock}
                        onChange={(e) => setData({ ...data, stock: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Price */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-bold"
                          placeholder="Enter Price"
                          value={data.price}
                          onChange={(e) => setData({ ...data, price: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Discount */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Discount (%)</label>
                      <div className="relative">
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                        <input
                          type="number"
                          step="0.1"
                          className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-bold"
                          placeholder="Enter Discount"
                          value={data.discount}
                          onChange={(e) => setData({ ...data, discount: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Sale Price */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Sale Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                        <input
                          readOnly
                          className="w-full pl-8 pr-4 py-2.5 bg-gray-100 border border-gray-100 rounded-xl outline-none text-sm font-bold text-emerald-600 cursor-not-allowed"
                          value={data.salePrice}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Wholesale Price Type */}
                <div className="pt-6 border-t border-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Wholesale Price Type</label>
                      <select
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-bold cursor-pointer"
                        value={data.wholesalePriceType}
                        onChange={(e) => setData({ ...data, wholesalePriceType: e.target.value })}
                      >
                        <option value="">Select Type</option>
                        <option value="fixed">Fixed Price</option>
                        <option value="percentage">Percentage Discount</option>
                      </select>
                    </div>
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Enabling this feature will present wholesale prices as a table list on the frontend for bulk buyers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Variants Section */}
                <div className="pt-8 border-t border-gray-50">
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      Variant Management
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-6">
                      Create variations like size, color, or material. Select attributes first, then generate combinations.
                    </p>
                    <div className="space-y-4">
                      {attributes.map(attr => (
                        <div key={attr.id} className="space-y-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{attr.name}</p>
                          <div className="flex flex-wrap gap-2">
                            {attr.values.map(val => {
                              const isSelected = selectedAttributes[attr.name]?.includes(val.value);
                              return (
                                <button
                                  key={val.id}
                                  type="button"
                                  onClick={() => toggleAttributeValue(attr.name, val.value)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                    isSelected 
                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" 
                                    : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"
                                  }`}
                                >
                                  {val.value}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      type="button"
                      onClick={generateVariants}
                      className="w-full mt-8 py-3 bg-white border border-gray-200 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center shadow-sm"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Combinations
                    </button>
                  </div>
                </div>

                {variants.length > 0 && (
                  <div className="pt-8 border-t border-gray-50">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Layers className="h-5 w-5 text-indigo-600" />
                        Generated Variants ({variants.length})
                      </h3>
                      <button onClick={() => setVariants([])} className="text-[10px] font-bold text-rose-600 uppercase tracking-widest hover:underline">Clear All</button>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {variants.map((v, i) => (
                        <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:shadow-md">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">{v.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono font-bold uppercase mt-0.5">{v.sku}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Price</label>
                              <div className="relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">$</span>
                                <input 
                                  type="number" 
                                  step="0.01"
                                  value={v.price} 
                                  onChange={(e) => {
                                    const newVariants = [...variants];
                                    newVariants[i].price = e.target.value;
                                    setVariants(newVariants);
                                  }}
                                  className="w-24 pl-5 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" 
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Stock</label>
                              <input 
                                type="number" 
                                value={v.stock} 
                                onChange={(e) => {
                                  const newVariants = [...variants];
                                  newVariants[i].stock = e.target.value;
                                  setVariants(newVariants);
                                }}
                                className="w-20 px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" 
                              />
                            </div>
                          </div>
                          <button onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="p-2 text-gray-300 hover:text-rose-600 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Setup Tab */}
            {activeTab === "setup" && (
              <div className="p-8 space-y-8">
                <div className="border-b border-gray-50 pb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Store Setup</h2>
                    <p className="text-sm text-gray-500 mt-1">Classification and organization details.</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <Settings className="h-6 w-6" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Base Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                        <input
                          required
                          type="number"
                          step="0.01"
                          className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-lg text-indigo-600"
                          placeholder="0.00"
                          value={data.price}
                          onChange={(e) => setData({ ...data, price: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Layers className="h-3 w-3" /> Category
                      </label>
                      <select
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none cursor-pointer font-bold text-sm"
                        value={data.categoryId}
                        onChange={(e) => setData({ ...data, categoryId: e.target.value })}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Award className="h-3 w-3" /> Brand
                      </label>
                      <select
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none cursor-pointer font-bold text-sm"
                        value={data.brandId}
                        onChange={(e) => setData({ ...data, brandId: e.target.value })}
                      >
                        <option value="">Select Brand</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <TagIcon className="h-3 w-3" /> Tags
                      </label>
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {availableTags.map(tag => {
                            const isSelected = data.tagIds.includes(tag.id);
                            return (
                              <button
                                key={tag.id}
                                type="button"
                                onClick={() => toggleTag(tag.id)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                  isSelected 
                                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                                  : "bg-white text-gray-500 border border-gray-200 hover:border-indigo-300"
                                }`}
                              >
                                {tag.name}
                                {isSelected && <X className="h-3 w-3" />}
                              </button>
                            );
                          })}
                          {availableTags.length === 0 && (
                            <p className="text-[10px] text-gray-400 italic">No tags created yet.</p>
                          )}
                        </div>
                        <div className="pt-2 border-t border-gray-200/50">
                          <Link href="/admin/tags" className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest flex items-center gap-1">
                            <PlusCircle className="h-3 w-3" /> Manage Tags
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === "seo" && (
              <div className="p-8 space-y-8">
                <div className="border-b border-gray-50 pb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Search Optimization</h2>
                    <p className="text-sm text-gray-500 mt-1">Control how this product appears in search engines.</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <Globe className="h-6 w-6" />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Meta Title</label>
                    <input
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                      placeholder="SEO optimized title..."
                      value={data.metaTitle}
                      onChange={(e) => setData({ ...data, metaTitle: e.target.value })}
                    />
                    <div className="flex justify-between px-1">
                      <span className="text-[9px] text-gray-400">Optimal: 50-60 characters</span>
                      <span className="text-[9px] text-gray-400">{data.metaTitle.length} chars</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Meta Description</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium resize-none"
                      placeholder="Brief description for search engine results..."
                      value={data.metaDescription}
                      onChange={(e) => setData({ ...data, metaDescription: e.target.value })}
                    />
                    <div className="flex justify-between px-1">
                      <span className="text-[9px] text-gray-400">Optimal: 150-160 characters</span>
                      <span className="text-[9px] text-gray-400">{data.metaDescription.length} chars</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Google Preview</p>
                    <div className="space-y-1">
                      <p className="text-[#1a0dab] text-lg font-medium hover:underline cursor-pointer truncate">{data.metaTitle || data.name || "Product Title"}</p>
                      <p className="text-[#006621] text-xs truncate">shop.com › products › {data.slug || "url-slug"}</p>
                      <p className="text-[#545454] text-xs line-clamp-2 leading-relaxed">
                        {data.metaDescription || data.shortDescription || "Add a meta description to see how your product will look in Google search results."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping Tab */}
            {activeTab === "shipping" && (
              <div className="p-8 space-y-8">
                <div className="border-b border-gray-50 pb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Shipping Details</h2>
                    <p className="text-sm text-gray-500 mt-1">Set physical dimensions for delivery calculation.</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <Truck className="h-6 w-6" />
                  </div>
                </div>

                {data.productType === "DIGITAL" ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 bg-gray-50 rounded-full mb-4">
                      <Monitor className="h-10 w-10 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-bold">Shipping not required</p>
                    <p className="text-gray-400 text-xs mt-1">Digital products are delivered instantly via download.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-bold"
                          placeholder="0.00"
                          value={data.weight}
                          onChange={(e) => setData({ ...data, weight: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Package Dimensions (cm)</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-gray-400 ml-1">Length</label>
                          <input
                            type="number"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-bold"
                            placeholder="0"
                            value={data.length}
                            onChange={(e) => setData({ ...data, length: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-gray-400 ml-1">Width</label>
                          <input
                            type="number"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-bold"
                            placeholder="0"
                            value={data.width}
                            onChange={(e) => setData({ ...data, width: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-gray-400 ml-1">Height</label>
                          <input
                            type="number"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-bold"
                            placeholder="0"
                            value={data.height}
                            onChange={(e) => setData({ ...data, height: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Status Tab */}
            {activeTab === "status" && (
              <div className="p-8 space-y-8">
                <div className="border-b border-gray-50 pb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Visibility & Status</h2>
                    <p className="text-sm text-gray-500 mt-1">Control product availability and highlights.</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    onClick={() => setData({ ...data, isActive: !data.isActive })}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                      data.isActive 
                      ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-50" 
                      : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${data.isActive ? "bg-emerald-500 text-white" : "bg-white text-gray-400"}`}>
                      <Eye className="h-6 w-6" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${data.isActive ? "text-emerald-900" : "text-gray-700"}`}>Active Status</p>
                      <p className="text-[10px] text-gray-500 font-medium">Toggle product visibility in store</p>
                    </div>
                    <div className="ml-auto">
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${data.isActive ? "bg-emerald-500" : "bg-gray-300"}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${data.isActive ? "right-1" : "left-1"}`} />
                      </div>
                    </div>
                  </div>

                  <div 
                    onClick={() => setData({ ...data, isFeatured: !data.isFeatured })}
                    className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                      data.isFeatured 
                      ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-50" 
                      : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${data.isFeatured ? "bg-indigo-500 text-white" : "bg-white text-gray-400"}`}>
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${data.isFeatured ? "text-indigo-900" : "text-gray-700"}`}>Featured Product</p>
                      <p className="text-[10px] text-gray-500 font-medium">Highlight this item on home page</p>
                    </div>
                    <div className="ml-auto">
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${data.isFeatured ? "bg-indigo-500" : "bg-gray-300"}`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${data.isFeatured ? "right-1" : "left-1"}`} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                  <div className="flex items-center gap-3 text-amber-700 mb-2">
                    <Info className="h-5 w-5" />
                    <p className="text-sm font-bold uppercase tracking-wider">Publication Note</p>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Setting a product to "Active" will make it immediately visible to customers. 
                    Ensure all pricing and inventory details are correct before publishing.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <MediaModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={onSelectMedia}
      />
    </div>
  );
}
