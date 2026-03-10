"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Layers, 
  PlusCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  RefreshCcw, 
  Package, 
  Trash2, 
  X, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Info,
  Image as ImageIcon,
  Globe,
  FileText,
  Smile,
  ShieldCheck,
  Eye,
  EyeOff,
  Edit2,
  Download,
  Upload
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";
import MediaModal from "@/components/admin/MediaModal";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  iconUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaImageUrl: string | null;
  isActive: boolean;
  parentId: string | null;
  parent?: Category | null;
  _count?: {
    products: number;
  };
}

type SelectionMode = "image" | "icon" | "metaImage";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  
  // Media Modal State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("image");

  // Pagination & Search State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 0
  });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "",
    imageUrl: "",
    iconUrl: "",
    metaTitle: "",
    metaDescription: "",
    metaImageUrl: "",
    isActive: true
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/categories?page=${page}&limit=${limit}&search=${search}`);
      setCategories(response.data.categories || []);
      setMeta(response.data.meta || { total: 0, totalPages: 0 });
      
      // Also fetch top-level categories for the parent dropdown if not already loaded
      const allRes = await axios.get("/api/categories?limit=100");
      const allCats = allRes.data.categories || (Array.isArray(allRes.data) ? allRes.data : []);
      setParentCategories(allCats.filter((c: Category) => !c.parentId));
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const handleExport = () => {
    const dataStr = JSON.stringify(categories, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `categories-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Categories exported successfully!");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content);
        
        if (!Array.isArray(importedData)) {
          throw new Error("Invalid format: Expected an array of categories.");
        }

        setSaving(true);
        await axios.post("/api/categories/bulk", { categories: importedData });
        toast.success(`${importedData.length} categories imported successfully!`);
        fetchCategories();
      } catch (error: any) {
        console.error("Import error:", error);
        toast.error(error.response?.data || error.message || "Failed to import categories.");
      } finally {
        setSaving(false);
        if (e.target) e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleNameChange = (name: string) => {
    if (editingId) {
      setFormData({ ...formData, name });
      return;
    }
    const slug = name.toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    setFormData({ ...formData, name, slug });
  };

  const onSelectMedia = (url: string) => {
    if (selectionMode === "image") {
      setFormData({ ...formData, imageUrl: url });
    } else if (selectionMode === "icon") {
      setFormData({ ...formData, iconUrl: url });
    } else if (selectionMode === "metaImage") {
      setFormData({ ...formData, metaImageUrl: url });
    }
    setIsMediaModalOpen(false);
  };

  const onEditClick = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parentId: category.parentId || "",
      imageUrl: category.imageUrl || "",
      iconUrl: category.iconUrl || "",
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
      metaImageUrl: category.metaImageUrl || "",
      isActive: category.isActive
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        await axios.patch(`/api/categories/${editingId}`, formData);
        toast.success("Category updated successfully!");
      } else {
        await axios.post("/api/categories", formData);
        toast.success("Category created successfully!");
      }
      setFormData({ 
        name: "", 
        slug: "", 
        description: "", 
        parentId: "",
        imageUrl: "",
        iconUrl: "",
        metaTitle: "",
        metaDescription: "",
        metaImageUrl: "",
        isActive: true
      });
      setEditingId(null);
      setIsAdding(false);
      fetchCategories();
      router.refresh();
    } catch (error: any) {
      console.error("Error saving category:", error);
      toast.error(error.response?.data || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteClick = (id: string) => {
    setTargetId(id);
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!targetId) return;
    try {
      setSaving(true);
      await axios.delete(`/api/categories/${targetId}`);
      fetchCategories();
      router.refresh();
      toast.success("Category deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data || "Failed to delete category");
    } finally {
      setSaving(false);
      setIsConfirmOpen(false);
      setTargetId(null);
    }
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ 
      name: "", 
      slug: "", 
      description: "", 
      parentId: "",
      imageUrl: "",
      iconUrl: "",
      metaTitle: "",
      metaDescription: "",
      metaImageUrl: "",
      isActive: true
    });
  };

  return (
    <div className="space-y-8 pb-12">
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onConfirmDelete}
        loading={saving}
        title="Delete Category"
        description="Are you sure you want to delete this category? Products in this category will become uncategorized."
      />

      <MediaModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={onSelectMedia}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Categories</h1>
          <p className="text-gray-500 text-sm mt-0.5">Organize your products into hierarchical collections.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm font-semibold text-sm flex items-center hover:text-primary hover:border-primary/50 transition-all">
            <Upload className="h-4 w-4 mr-2" />
            Import
            <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={saving} />
          </label>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm font-semibold text-sm flex items-center hover:text-primary hover:border-primary/50 transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-5 py-2.5 rounded-xl flex items-center bg-primary text-white hover:opacity-90 shadow-primary/20 shadow-lg transition-all font-bold text-sm"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Category
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden">
          <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
                <Layers className="h-5 w-5" />
              </div>
              {editingId ? "Edit Category" : "Create New Category"}
            </h2>
            <div className="flex items-center gap-3">
               <button
                type="button"
                onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  formData.isActive 
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                  : "bg-gray-50 text-gray-400 border border-gray-100"
                }`}
              >
                {formData.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                {formData.isActive ? "Enabled" : "Disabled"}
              </button>
              <button 
                onClick={cancelAdd}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* Basic Info Section */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Layers className="h-3 w-3" /> Category Name*
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Category Name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <ChevronRight className="h-3 w-3" /> URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="electronics"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className={`w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-xs font-mono font-bold text-primary ${editingId ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    readOnly={!!editingId}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <MoreVertical className="h-3 w-3" /> Select Parent
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-bold cursor-pointer"
                  >
                    <option value="">None (Top Level)</option>
                    {parentCategories.filter(c => c.id !== editingId).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <FileText className="h-3 w-3" /> Description
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Category Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Media Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category Image</label>
                <div 
                  onClick={() => { setSelectionMode("image"); setIsMediaModalOpen(true); }}
                  className={`relative h-32 rounded-2xl border-2 border-dashed transition-all cursor-pointer group flex items-center gap-4 px-6
                    ${formData.imageUrl ? "border-primary/20 bg-gray-50" : "border-gray-200 hover:border-primary/20 hover:opacity-90/5"}`}
                >
                  {formData.imageUrl ? (
                    <>
                      <div className="h-20 w-20 rounded-xl overflow-hidden border border-gray-200 shadow-sm relative">
                        <Image src={formData.imageUrl} alt="Category" fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight">Main Image Selected</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">Click to change asset</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setFormData({...formData, imageUrl: ""}); }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><X className="h-4 w-4" /></button>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-full bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-primary transition-all"><ImageIcon className="h-6 w-6" /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Image</p>
                        <p className="text-[9px] text-gray-400 mt-0.5 italic">Featured category display image</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category Icon</label>
                <div 
                  onClick={() => { setSelectionMode("icon"); setIsMediaModalOpen(true); }}
                  className={`relative h-32 rounded-2xl border-2 border-dashed transition-all cursor-pointer group flex items-center gap-4 px-6
                    ${formData.iconUrl ? "border-primary/20 bg-gray-50" : "border-gray-200 hover:border-primary/20 hover:opacity-90/5"}`}
                >
                  {formData.iconUrl ? (
                    <>
                      <div className="h-16 w-16 rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white p-2 relative">
                        <Image src={formData.iconUrl} alt="Icon" fill className="object-contain" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-gray-900 uppercase tracking-tight">Icon Selected</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase">Click to change asset</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); setFormData({...formData, iconUrl: ""}); }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><X className="h-4 w-4" /></button>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-full bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-primary transition-all"><Smile className="h-6 w-6" /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Icon</p>
                        <p className="text-[9px] text-gray-400 mt-0.5 italic">Small icon for menu navigation</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* SEO Section */}
            <div className="pt-10 border-t border-gray-50 space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Search Engine Optimization</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Meta Title</label>
                    <input
                      type="text"
                      placeholder="Enter meta title"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Meta Description</label>
                    <textarea
                      rows={3}
                      placeholder="Enter meta description"
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-medium resize-none"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Meta Image</label>
                  <div 
                    onClick={() => { setSelectionMode("metaImage"); setIsMediaModalOpen(true); }}
                    className={`relative h-[164px] rounded-2xl border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden
                      ${formData.metaImageUrl ? "border-primary/20 bg-gray-50" : "border-gray-200 hover:border-primary/20 hover:opacity-90/5"}`}
                  >
                    {formData.metaImageUrl ? (
                      <>
                        <Image src={formData.metaImageUrl} alt="SEO" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <RefreshCcw className="h-6 w-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 rounded-full bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-primary transition-all mb-2"><ImageIcon className="h-6 w-6" /></div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center px-4">Select SEO Image</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 gap-4">
              <button 
                type="button"
                onClick={cancelAdd}
                className="px-8 py-3.5 rounded-[20px] border border-gray-200 text-gray-600 font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all hover:text-primary hover:border-primary/50 transition-all"
              >
                Discard
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="bg-primary text-white px-10 py-3.5 rounded-[20px] hover:opacity-90 font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 disabled:bg-primary/30 transition-all active:scale-[0.98]"
              >
                {saving ? "Processing..." : editingId ? "Update Asset" : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category List */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="relative w-full sm:w-96 group">
            <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-gray-50 border-transparent rounded-[18px] py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 focus:bg-white focus:border-primary/20 transition-all outline-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Total: {meta.total} Categories
            </p>
            <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
              <button 
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg hover:bg-white hover:text-primary text-gray-400 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="flex items-center justify-center px-3 text-xs font-black text-primary bg-white rounded-lg shadow-sm">
                {page}
              </span>
              <button 
                disabled={page >= meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg hover:bg-white hover:text-primary text-gray-400 disabled:opacity-30 transition-all shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative">
                <div className="h-16 w-16 border-4 border-primary/20 rounded-full animate-pulse"></div>
                <RefreshCcw className="h-8 w-8 animate-spin text-primary absolute inset-0 m-auto" />
              </div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-6">Refreshing Library</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                  <th className="px-8 py-5">Visual</th>
                  <th className="px-8 py-5">Asset Identity</th>
                  <th className="px-8 py-5">Products</th>
                  <th className="px-8 py-5">Hierarchy</th>
                  <th className="px-8 py-5">Visibility</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center max-w-xs mx-auto">
                        <div className="bg-gray-50 p-6 rounded-full mb-6 border border-gray-100">
                          <Layers className="h-10 w-10 text-gray-200" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Empty Library</h3>
                        <p className="text-gray-400 text-xs font-bold mt-2 leading-relaxed">
                          Your collection is empty. Start by adding your first asset to begin organizing your store.
                        </p>
                        <button 
                          onClick={() => setIsAdding(true)}
                          className="mt-8 bg-primary/10 text-primary px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 hover:text-white transition-all shadow-md shadow-primary/20"
                        >
                          Launch Creator
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50/30 transition-all duration-200 group">
                      <td className="px-8 py-6">
                        <div className="relative h-14 w-14 rounded-[20px] overflow-hidden bg-white border border-gray-100 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          {category.imageUrl ? (
                            <Image src={category.imageUrl} alt={category.name} fill className="object-cover" />
                          ) : category.iconUrl ? (
                            <Image src={category.iconUrl} alt="icon" fill className="object-contain p-2" />
                          ) : (
                            <Layers className="h-6 w-6 text-primary/20" />
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <div className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors uppercase tracking-tight">{category.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">/{category.slug}</span>
                            {category.metaTitle && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase">SEO</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="inline-flex items-center gap-2 bg-gray-100/50 px-3 py-1.5 rounded-xl border border-gray-100">
                          <Package className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-xs font-black text-gray-900">{category._count?.products || 0}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {category.parent ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100 shadow-sm shadow-amber-50">
                            <ChevronRight className="h-3 w-3" />
                            {category.parent.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/10">
                            <ShieldCheck className="h-3 w-3" />
                            ROOT
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                          category.isActive 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-gray-50 text-gray-400 border-gray-100"
                        }`}>
                          {category.isActive ? <CheckCircle2 className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                          {category.isActive ? "Live" : "Draft"}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => onEditClick(category)}
                            className="p-2.5 bg-white text-gray-400 hover:text-primary rounded-xl border border-gray-100 hover:border-primary/20 shadow-sm transition-all hover:scale-110 active:scale-95"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => onDeleteClick(category.id)}
                            className="p-2.5 bg-white text-gray-400 hover:text-rose-600 rounded-xl border border-gray-100 hover:border-rose-100 shadow-sm transition-all hover:scale-110 active:scale-95"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {categories.length > 0 && (
        <div className="bg-primary rounded-[32px] p-8 text-white shadow-xl shadow-primary/20 flex items-start gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Info className="h-32 w-32" />
          </div>
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
            <Info className="h-6 w-6 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-white font-black text-sm uppercase tracking-widest">Library Governance</p>
            <p className="text-primary/40 text-xs mt-2 leading-relaxed max-w-2xl font-bold">
              Deleting an asset is permanent. Associated products will remain intact but will be categorized as "Uncategorized". 
              Hierarchy integrity is enforced: you must remove sub-categories before deleting a parent asset.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
