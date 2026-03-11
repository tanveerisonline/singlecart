"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Package, 
  Plus, 
  Trash2, 
  RefreshCcw, 
  Search,
  DollarSign,
  X,
  CheckCircle2,
  AlertCircle,
  Edit,
  Layers,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import MediaModal from "@/components/admin/MediaModal";

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [prodSearch, setProdSearch] = useState("");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    isActive: true,
    image: "",
    productIds: [] as string[]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bundleRes, prodRes] = await Promise.all([
        axios.get("/api/admin/bundles"),
        axios.get("/api/products")
      ]);
      setBundles(bundleRes.data);
      setProducts(prodRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSave = async () => {
    try {
      if (editingId) {
        await axios.patch(`/api/admin/bundles/${editingId}`, formData);
        toast.success("Bundle updated successfully");
      } else {
        await axios.post("/api/admin/bundles", formData);
        toast.success("Bundle created successfully");
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: "", description: "", price: "", isActive: true, image: "", productIds: [] });
      fetchData();
    } catch (error) {
      toast.error("Failed to save bundle");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bundle?")) return;
    try {
      await axios.delete(`/api/admin/bundles/${id}`);
      toast.success("Bundle deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete bundle");
    }
  };

  const startEdit = (bundle: any) => {
    setEditingId(bundle.id);
    setFormData({
      name: bundle.name,
      description: bundle.description || "",
      price: bundle.price.toString(),
      isActive: bundle.isActive,
      image: bundle.image || "",
      productIds: bundle.products.map((p: any) => p.id)
    });
    setIsAdding(true);
  };

  const toggleProduct = (id: string) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(id) 
        ? prev.productIds.filter(pid => pid !== id)
        : [...prev.productIds, id]
    }));
  };

  const filteredBundles = bundles.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Product Bundles</h1>
          <p className="text-sm text-gray-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Create discounted collections of products</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ name: "", description: "", price: "", isActive: true, image: "", productIds: [] });
          }}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus className="h-4 w-4" /> Create Bundle
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[32px] border-2 border-primary/20 shadow-xl space-y-8 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
              {editingId ? "Edit Bundle" : "New Bundle"}
            </h2>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bundle Name*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-bold"
                  placeholder="Summer Essentials Pack"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-medium h-24 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bundle Price ($)*</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:bg-white outline-none text-sm font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Image</label>
                  <button 
                    onClick={() => setIsMediaModalOpen(true)}
                    className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-left text-sm font-bold text-gray-400 hover:bg-gray-100 transition-all flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    {formData.image ? "Change Image" : "Select Image"}
                  </button>
                </div>
              </div>
              
              {formData.image && (
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-gray-100">
                  <Image src={formData.image} alt="Preview" fill className="object-cover" />
                  <button 
                    onClick={() => setFormData({...formData, image: ""})}
                    className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-rose-500 hover:bg-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Include Products ({formData.productIds.length} Selected)</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold"
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto border border-gray-100 rounded-2xl bg-gray-50/50 p-2 space-y-1 custom-scrollbar">
                {products
                  .filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase()))
                  .map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProduct(p.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        formData.productIds.includes(p.id) ? "bg-primary text-white shadow-lg" : "hover:bg-white"
                      }`}
                    >
                      <div className="h-10 w-10 rounded-lg relative overflow-hidden bg-white border border-gray-100 shrink-0">
                        <Image src={p.thumbnailUrl || p.images?.[0]?.url || "/placeholder-product.svg"} alt="" fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-black truncate ${formData.productIds.includes(p.id) ? "text-white" : "text-gray-900"}`}>{p.name}</p>
                        <p className={`text-[10px] font-bold ${formData.productIds.includes(p.id) ? "text-white/70" : "text-gray-400"}`}>${p.price.toFixed(2)}</p>
                      </div>
                      {formData.productIds.includes(p.id) && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
            <button
              onClick={onSave}
              disabled={!formData.name || !formData.price || formData.productIds.length === 0}
              className="flex-1 bg-gray-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl disabled:opacity-50"
            >
              {editingId ? "Update Bundle" : "Create Bundle"}
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-12 py-5 rounded-3xl border border-gray-100 font-black text-xs uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-[40px] aspect-[4/5] animate-pulse border border-gray-100" />
          ))
        ) : filteredBundles.length === 0 ? (
          <div className="col-span-full bg-white p-20 rounded-[40px] border border-gray-100 text-center">
            <Layers className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">No bundles found</p>
          </div>
        ) : (
          filteredBundles.map((bundle) => (
            <div key={bundle.id} className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col">
              <div className="relative aspect-video w-full bg-gray-50 overflow-hidden">
                <Image 
                  src={bundle.image || "/placeholder-product.svg"} 
                  alt={bundle.name} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-4 left-4">
                   <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none mb-1">Bundle Price</p>
                      <p className="text-xl font-black text-primary leading-none">${bundle.price.toFixed(2)}</p>
                   </div>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                   <button onClick={() => startEdit(bundle)} className="h-10 w-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all shadow-sm"><Edit className="h-4 w-4" /></button>
                   <button onClick={() => onDelete(bundle.id)} className="h-10 w-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-gray-400 hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors uppercase tracking-tight">{bundle.name}</h3>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2 mt-2 leading-relaxed">{bundle.description}</p>
                </div>

                <div className="space-y-3">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Package className="h-3 w-3" /> Included ({bundle.products.length})
                   </p>
                   <div className="flex -space-x-3 overflow-hidden">
                      {bundle.products.slice(0, 5).map((p: any, i: number) => (
                        <div key={i} className="inline-block h-10 w-10 rounded-full ring-4 ring-white relative overflow-hidden bg-gray-100 border border-gray-100">
                           <Image src={p.thumbnailUrl || p.images?.[0]?.url || "/placeholder-product.svg"} alt="" fill className="object-cover" />
                        </div>
                      ))}
                      {bundle.products.length > 5 && (
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-50 ring-4 ring-white border border-gray-100 text-[10px] font-black text-gray-400">
                           +{bundle.products.length - 5}
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <MediaModal 
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => setFormData({...formData, image: url})}
      />
    </div>
  );
}
