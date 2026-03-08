"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Award, 
  PlusCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  RefreshCcw, 
  Trash2, 
  X, 
  ChevronRight,
  Info,
  ImageIcon,
  Edit
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";
import Image from "next/image";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  _count?: {
    products: number;
  };
}

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logoUrl: ""
  });

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/brands");
      setBrands(response.data);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    setFormData({ ...formData, name, slug });
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logoUrl || ""
    });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingBrand(null);
    setFormData({ name: "", slug: "", logoUrl: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingBrand) {
        await axios.patch(`/api/brands/${editingBrand.id}`, formData);
        toast.success("Brand updated successfully!");
      } else {
        await axios.post("/api/brands", formData);
        toast.success("Brand created successfully!");
      }
      handleCancel();
      fetchBrands();
      router.refresh();
    } catch (error: any) {
      console.error("Error saving brand:", error);
      toast.error(error.response?.data || "Failed to save brand");
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
      await axios.delete(`/api/brands/${targetId}`);
      fetchBrands();
      router.refresh();
      toast.success("Brand deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting brand:", error);
      toast.error(error.response?.data || "Failed to delete brand");
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
        title="Delete Brand"
        description="Are you sure you want to delete this brand? Products associated with this brand will remain but will no longer show a brand connection."
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500 text-sm mt-1">Manage manufacturers and product brands.</p>
        </div>
        <button
          onClick={() => {
            if (isAdding) handleCancel();
            else setIsAdding(true);
          }}
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
              Add Brand
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Award className="h-24 w-24 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mr-3">
              {editingBrand ? <Edit className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
            </div>
            {editingBrand ? "Edit Brand" : "Create New Brand"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nike, Apple, Samsung"
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
                  placeholder="nike"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Logo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
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
                {saving ? "Saving..." : editingBrand ? "Update Brand" : "Create Brand"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full sm:w-96 group">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search brands..." 
              className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCcw className="h-10 w-10 animate-spin text-indigo-400 mb-4" />
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Loading brands...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-6 py-4">Brand Info</th>
                  <th className="px-6 py-4">URL Slug</th>
                  <th className="px-6 py-4 text-center">Products</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                          <Award className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-bold">No brands found</p>
                        <button 
                          onClick={() => setIsAdding(true)}
                          className="mt-2 text-indigo-600 text-sm font-bold hover:underline"
                        >
                          Add your first brand
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden mr-3">
                            {brand.logoUrl ? (
                              <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-contain" />
                            ) : (
                              <Award className="h-6 w-6 text-gray-300" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{brand.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">/{brand.slug}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-sm font-bold text-gray-900">{brand._count?.products || 0}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(brand)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => onDeleteClick(brand.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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
    </div>
  );
}
