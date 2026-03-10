"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical, 
  Image as ImageIcon, 
  Type, 
  Palette, 
  Layout as LayoutIcon,
  Eye,
  Settings2,
  ChevronDown,
  ChevronUp,
  X,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import Link from "next/link";
import MediaModal from "./MediaModal";

interface BannerData {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  discountText: string;
  bgColor: string;
  textColor: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  className: string;
}

interface SectionFormProps {
  initialData?: any;
}

const LAYOUT_OPTIONS = [
  { label: "Full Width (One Banner)", value: "FULL_WIDTH" },
  { label: "Two Columns (Side by Side)", value: "TWO_COLUMNS" },
  { label: "Three Columns", value: "THREE_COLUMNS" },
  { label: "Row (Horizontal List)", value: "ROW" },
  { label: "Grid (Responsive)", value: "GRID" },
];

const LOCATION_OPTIONS = [
  { label: "Top (Above Slider)", value: "TOP" },
  { label: "Middle (Content Area)", value: "MIDDLE" },
  { label: "Before Products (Featured)", value: "BEFORE_PRODUCTS" },
  { label: "Bottom (Above Footer)", value: "BOTTOM" },
];

const PAGE_OPTIONS = [
  { label: "Home Page", value: "HOME" },
  { label: "Category Page", value: "CATEGORY" },
  { label: "Product Page", value: "PRODUCT" },
  { label: "Collections", value: "COLLECTIONS" },
];

export default function SectionForm({ initialData }: SectionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeBannerIndex, setActiveBannerIndex] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    page: initialData?.page || "HOME",
    location: initialData?.location || "MIDDLE",
    layout: initialData?.layout || "FULL_WIDTH",
    order: initialData?.order || 0,
    isActive: initialData?.isActive ?? true,
    containerClassName: initialData?.containerClassName || "",
  });

  const [banners, setBanners] = useState<BannerData[]>(
    initialData?.banners || []
  );

  const [expandedBanner, setExpandedBanner] = useState<number | null>(
    banners.length > 0 ? 0 : null
  );

  const handleAddBanner = () => {
    const newBanner: BannerData = {
      title: "",
      subtitle: "",
      description: "",
      buttonText: "",
      buttonLink: "",
      discountText: "",
      bgColor: "#f3f4f6",
      textColor: "#111827",
      imageUrl: "",
      order: banners.length,
      isActive: true,
      className: "",
    };
    setBanners([...banners, newBanner]);
    setExpandedBanner(banners.length);
  };

  const handleRemoveBanner = (index: number) => {
    const newBanners = banners.filter((_, i) => i !== index);
    setBanners(newBanners);
    if (expandedBanner === index) setExpandedBanner(null);
  };

  const handleBannerChange = (index: number, field: keyof BannerData, value: any) => {
    const newBanners = [...banners];
    newBanners[index] = { ...newBanners[index], [field]: value };
    setBanners(newBanners);
  };

  const moveBanner = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[newIndex];
    newBanners[newIndex] = temp;
    setBanners(newBanners);
    if (expandedBanner === index) setExpandedBanner(newIndex);
    else if (expandedBanner === newIndex) setExpandedBanner(index);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Section name is required");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        banners: banners.map((b, i) => ({ ...b, order: i })),
      };
      
      if (initialData) {
        await axios.patch(`/api/admin/sections/${initialData.id}`, payload);
        toast.success("Section updated successfully");
      } else {
        await axios.post("/api/admin/sections", payload);
        toast.success("Section created successfully");
      }

      router.push("/admin/sections");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const openMediaModal = (index: number) => {
    setActiveBannerIndex(index);
    setIsMediaModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <MediaModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => {
          if (activeBannerIndex !== null) {
            handleBannerChange(activeBannerIndex, "imageUrl", url);
          }
        }}
        selectedUrl={activeBannerIndex !== null ? banners[activeBannerIndex]?.imageUrl : undefined}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/sections" className="p-2 hover:bg-gray-100 rounded-xl transition-all">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {initialData ? "Edit Section" : "New Section"}
            </h1>
            <p className="text-sm text-gray-500">
              Configure how and where your banners will appear.
            </p>
          </div>
        </div>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest border-b border-gray-50 pb-4">
              <Settings2 className="h-4 w-4" />
              General Configuration
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Section Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Home Hero Banners"
                  className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Status</label>
                <select
                  value={formData.isActive ? "true" : "false"}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                  className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Target Page</label>
                <select
                  value={formData.page}
                  onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                  className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                >
                  {PAGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Location Slot</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                >
                  {LOCATION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Layout Style</label>
                <select
                  value={formData.layout}
                  onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                  className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                >
                  {LAYOUT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Container Extra Classes (Tailwind)</label>
              <input
                value={formData.containerClassName}
                onChange={(e) => setFormData({ ...formData, containerClassName: e.target.value })}
                placeholder="e.g. py-10 gap-4"
                className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
              />
            </div>
          </div>

          {/* Banners List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Section Banners ({banners.length})
              </h2>
              <button
                type="button"
                onClick={handleAddBanner}
                className="text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="h-4 w-4" /> Add Banner
              </button>
            </div>

            <div className="space-y-3">
              {banners.map((banner, index) => (
                <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all">
                  <div 
                    className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors ${expandedBanner === index ? "bg-gray-50/50 border-b border-gray-50" : ""}`}
                    onClick={() => setExpandedBanner(expandedBanner === index ? null : index)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveBanner(index, 'up'); }}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-primary disabled:opacity-30"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveBanner(index, 'down'); }}
                          disabled={index === banners.length - 1}
                          className="p-1 text-gray-400 hover:text-primary disabled:opacity-30"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="h-10 w-10 bg-gray-50 rounded-lg overflow-hidden relative border border-gray-100">
                        {banner.imageUrl ? (
                          <img src={banner.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {banner.title || `Banner #${index + 1}`}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                          {banner.isActive ? "Active" : "Inactive"} • {banner.bgColor}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveBanner(index);
                        }}
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {expandedBanner === index ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {expandedBanner === index && (
                    <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Image & Style */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Banner Image</label>
                            <div 
                              onClick={() => openMediaModal(index)}
                              className="aspect-video w-full rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group overflow-hidden relative"
                            >
                              {banner.imageUrl ? (
                                <>
                                  <img src={banner.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-xs">
                                    Change Image
                                  </div>
                                </>
                              ) : (
                                <>
                                  <ImageIcon className="h-8 w-8 text-gray-300 mb-2 group-hover:text-primary transition-colors" />
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Click to select image</p>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Background Color</label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={banner.bgColor}
                                  onChange={(e) => handleBannerChange(index, "bgColor", e.target.value)}
                                  className="h-10 w-10 rounded-lg border-none p-0 cursor-pointer overflow-hidden"
                                />
                                <input
                                  type="text"
                                  value={banner.bgColor}
                                  onChange={(e) => handleBannerChange(index, "bgColor", e.target.value)}
                                  className="flex-1 bg-gray-50 border-gray-100 rounded-xl px-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Text Color</label>
                              <div className="flex gap-2">
                                <input
                                  type="color"
                                  value={banner.textColor}
                                  onChange={(e) => handleBannerChange(index, "textColor", e.target.value)}
                                  className="h-10 w-10 rounded-lg border-none p-0 cursor-pointer overflow-hidden"
                                />
                                <input
                                  type="text"
                                  value={banner.textColor}
                                  onChange={(e) => handleBannerChange(index, "textColor", e.target.value)}
                                  className="flex-1 bg-gray-50 border-gray-100 rounded-xl px-3 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Title</label>
                            <input
                              value={banner.title}
                              onChange={(e) => handleBannerChange(index, "title", e.target.value)}
                              placeholder="e.g. Premium Selection"
                              className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Subtitle</label>
                            <input
                              value={banner.subtitle}
                              onChange={(e) => handleBannerChange(index, "subtitle", e.target.value)}
                              placeholder="e.g. Featured Picks"
                              className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Discount/Badge Text</label>
                            <input
                              value={banner.discountText}
                              onChange={(e) => handleBannerChange(index, "discountText", e.target.value)}
                              placeholder="e.g. Up to 50% Off"
                              className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Description</label>
                            <textarea
                              value={banner.description}
                              onChange={(e) => handleBannerChange(index, "description", e.target.value)}
                              rows={2}
                              placeholder="Add more details..."
                              className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium resize-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-50 pt-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Button Text</label>
                          <input
                            value={banner.buttonText}
                            onChange={(e) => handleBannerChange(index, "buttonText", e.target.value)}
                            placeholder="e.g. Shop Now"
                            className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Button Link</label>
                          <input
                            value={banner.buttonLink}
                            onChange={(e) => handleBannerChange(index, "buttonLink", e.target.value)}
                            placeholder="e.g. /category/new"
                            className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-700 uppercase tracking-tight">Active</label>
                          <select
                            value={banner.isActive ? "true" : "false"}
                            onChange={(e) => handleBannerChange(index, "isActive", e.target.value === "true")}
                            className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {banners.length === 0 && (
                <div className="py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-gray-200 mb-2" />
                  <p className="text-sm font-medium text-gray-400">No banners added yet</p>
                  <button type="button" onClick={handleAddBanner} className="text-primary text-xs font-bold mt-2">Add your first banner</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Preview Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest border-b border-gray-50 pb-4">
              <Eye className="h-4 w-4" />
              Live Preview Info
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Current Layout</p>
                <p className="text-sm font-bold text-gray-900">{LAYOUT_OPTIONS.find(l => l.value === formData.layout)?.label}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Display Slot</p>
                <p className="text-sm font-bold text-gray-900">{LOCATION_OPTIONS.find(l => l.value === formData.location)?.label}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Target Page</p>
                <p className="text-sm font-bold text-gray-900">{PAGE_OPTIONS.find(l => l.value === formData.page)?.label}</p>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">Pro Tip</p>
              <div className="text-[11px] text-blue-600 leading-relaxed font-medium space-y-2">
                <p>To show banners <strong>side-by-side</strong>, add them as separate banners <strong>within this same section</strong> and set Layout to "Two Columns".</p>
                <p>Use the ↑ and ↓ arrows to reorder them.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
