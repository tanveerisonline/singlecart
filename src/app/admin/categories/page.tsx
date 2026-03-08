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
  Info
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  parent?: Category | null;
  _count?: {
    products: number;
  };
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: ""
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await axios.post("/api/categories", formData);
      setFormData({ name: "", slug: "", description: "", parentId: "" });
      setIsAdding(false);
      fetchCategories();
      router.refresh();
      toast.success("Category created successfully!");
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

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">Organize your products into hierarchical categories.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 rounded-xl flex items-center transition-all shadow-sm font-semibold text-sm ${
            isAdding 
              ? "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50" 
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 shadow-sm"
          }`}
        >
          {isAdding ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Category
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Layers className="h-24 w-24 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mr-3">
              <PlusCircle className="h-5 w-5" />
            </div>
            Create New Category
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electronics"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">URL Slug</label>
                <input
                  type="text"
                  required
                  placeholder="electronics"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Parent Category (Optional)</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium cursor-pointer"
                >
                  <option value="">None (Top Level)</option>
                  {categories.filter(c => !c.parentId).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Short description of this category"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl hover:bg-indigo-700 font-bold text-sm shadow-sm shadow-indigo-100 disabled:bg-indigo-300 transition-all"
              >
                {saving ? "Saving..." : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96 group">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-gray-100 text-gray-600 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-all text-xs font-bold flex items-center">
              <Filter className="h-3.5 w-3.5 mr-2 text-gray-400" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCcw className="h-10 w-10 animate-spin text-indigo-400 mb-4" />
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Loading categories...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4">Parent</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                          <Layers className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-bold">No categories found</p>
                        <button 
                          onClick={() => setIsAdding(true)}
                          className="mt-2 text-indigo-600 text-sm font-bold hover:underline"
                        >
                          Create your first category
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm mr-3 border border-indigo-100">
                            {category.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{category.name}</div>
                            {category.description && (
                              <div className="text-[10px] text-gray-400 truncate max-w-[200px]">{category.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">/{category.slug}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Package className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-sm font-bold text-gray-900">{category._count?.products || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {category.parent ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                            {category.parent.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Main
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => onDeleteClick(category.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                            <MoreVertical className="h-4 w-4" />
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
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <p className="text-amber-900 font-bold text-sm uppercase tracking-wider">Note on Deletion</p>
            <p className="text-amber-800 text-xs mt-1 leading-relaxed">
              Deleting a category will not delete the products inside it. Those products will simply lose their category assignment.
              You cannot delete a category that has sub-categories.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
