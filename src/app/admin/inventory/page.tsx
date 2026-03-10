"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Package, 
  AlertTriangle, 
  ArrowUp, 
  ArrowDown, 
  History, 
  Search, 
  RefreshCcw, 
  Filter,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  X,
  Clock,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface Variant {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

interface StockLog {
  id: string;
  change: number;
  reason: string | null;
  previousStock: number;
  newStock: number;
  createdAt: string;
  variant?: { name: string } | null;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  images: { url: string }[];
  category: { name: string };
  variants: Variant[];
  stockLogs?: StockLog[];
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustValue, setAdjustValue] = useState("0");
  const [adjustReason, setAdjustReason] = useState("Adjustment");
  
  // New States
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedProduct, setSelectedCustomer] = useState<Product | null>(null);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [targetResetId, setTargetResetId] = useState<string | null>(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/inventory");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjust = async (productId: string, variantId?: string, forceValue?: number) => {
    try {
      const change = forceValue !== undefined ? forceValue : parseInt(adjustValue);
      if (isNaN(change) && forceValue === undefined) return;

      await axios.post("/api/admin/inventory", {
        productId,
        variantId,
        change,
        reason: adjustReason
      });

      setAdjustingId(null);
      setAdjustValue("0");
      setAdjustReason("Adjustment");
      fetchInventory();
      toast.success("Stock level updated!");
    } catch (error) {
      console.error("Error adjusting stock:", error);
      toast.error("Failed to adjust stock");
    }
  };

  const handleResetStock = async () => {
    if (!targetResetId) return;
    const product = products.find(p => p.id === targetResetId);
    if (!product) return;
    
    await handleAdjust(targetResetId, undefined, -product.stock);
    setIsConfirmOpen(false);
    setTargetResetId(null);
  };

  const showLogs = (product: Product) => {
    setSelectedCustomer(product);
    setIsLogsOpen(true);
    setOpenMenuId(null);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  return (
    <div className="space-y-8 pb-12 relative">
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleResetStock}
        title="Zero Out Stock"
        description="Are you sure you want to set the stock level to 0 for this product? This will be logged as a manual adjustment."
      />

      {/* Stock Logs Side Panel */}
      {isLogsOpen && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsLogsOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Stock Activity Log
              </h2>
              <button onClick={() => setIsLogsOpen(false)} className="p-2 hover:bg-white rounded-xl transition-all">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="h-12 w-12 rounded-xl overflow-hidden relative border border-white shadow-sm">
                  <Image src={selectedProduct.images[0]?.url || "/placeholder-product.jpg"} alt="" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 truncate w-48 uppercase tracking-tight">{selectedProduct.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedProduct.sku}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Recent Adjustments</h4>
                {!selectedProduct.stockLogs || selectedProduct.stockLogs.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No history recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedProduct.stockLogs.map((log) => (
                      <div key={log.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-primary/20 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                            log.change > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {log.change > 0 ? <Plus className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                            {Math.abs(log.change)} Units
                          </div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-700">{log.reason || 'Manual Adjustment'}</p>
                            {log.variant && <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Variant: {log.variant.name}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Final Stock</p>
                            <p className="text-sm font-black text-gray-900">{log.newStock}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-50 bg-gray-50/30">
              <Link 
                href={`/admin/products/${selectedProduct.id}`}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Product Details
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">Inventory Management</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Monitor and adjust stock levels across all products and variants.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchInventory}
            className="bg-white border border-gray-200 text-gray-700 h-11 px-5 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold flex items-center shadow-sm"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 text-primary ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Inventory", value: products.length, icon: Package, color: "text-primary", bg: "bg-primary/10" },
          { label: "Low Stock Items", value: lowStockCount, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Out of Stock", value: outOfStockCount, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-5 shadow-sm transition-all hover:shadow-md">
            <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-gray-50/30">
          <div className="relative w-full sm:w-96 group">
            <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              className="w-full bg-white border border-gray-100 rounded-[18px] py-3 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/10 focus:border-primary/20 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-white border border-gray-100 text-gray-600 h-11 px-5 rounded-xl hover:bg-gray-50 transition-all text-[10px] font-black uppercase tracking-widest flex items-center">
              <Filter className="h-3.5 w-3.5 mr-2 text-primary" />
              Filter List
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative">
                <div className="h-16 w-16 border-4 border-primary/20 rounded-full animate-pulse"></div>
                <RefreshCcw className="h-8 w-8 animate-spin text-primary absolute inset-0 m-auto" />
              </div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-6">Scanning Warehouse</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100">
                  <th className="px-8 py-5">Product Identity</th>
                  <th className="px-8 py-5">Category</th>
                  <th className="px-8 py-5">Stock Level</th>
                  <th className="px-8 py-5">Inventory Status</th>
                  <th className="px-8 py-5 text-right">Adjust Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center max-w-xs mx-auto">
                        <div className="bg-gray-50 p-6 rounded-full mb-6 border border-gray-100">
                          <Package className="h-10 w-10 text-gray-200" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Empty Inventory</h3>
                        <p className="text-gray-400 text-xs font-bold mt-2 leading-relaxed">
                          We couldn't find any items matching your current inventory search.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/30 transition-all duration-200 group">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="h-14 w-14 rounded-2xl border border-gray-100 overflow-hidden flex-shrink-0 bg-white shadow-sm relative group-hover:scale-105 transition-transform duration-300">
                            <Image
                              src={product.images[0]?.url || "/placeholder-product.jpg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-4 min-w-0">
                            <div className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors uppercase tracking-tight truncate max-w-[200px]">{product.name}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-100/50 text-gray-600 border border-gray-100 shadow-sm">
                          {product.category?.name || "No Category"}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-black text-gray-900">{product.stock} Units</span>
                          <div className="w-28 bg-gray-100 rounded-full h-1.5 overflow-hidden border border-gray-50">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                product.stock === 0 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 
                                product.stock <= product.lowStockThreshold ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 
                                'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                              }`}
                              style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {product.stock <= 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm shadow-rose-50">
                            <XCircle className="h-3.5 w-3.5" /> Out of Stock
                          </span>
                        ) : product.stock <= product.lowStockThreshold ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 shadow-sm shadow-amber-50">
                            <AlertTriangle className="h-3.5 w-3.5" /> Critical Level
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm shadow-emerald-50">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Healthy Stock
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right relative">
                        {adjustingId === product.id ? (
                          <div className="flex flex-col gap-2 items-end animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                autoFocus
                                value={adjustValue}
                                onChange={(e) => setAdjustValue(e.target.value)}
                                className="w-20 px-3 py-2 bg-white border border-primary/30 rounded-xl text-sm text-center font-black focus:ring-4 focus:ring-primary/10 outline-none transition-all shadow-sm"
                              />
                              <button
                                onClick={() => handleAdjust(product.id)}
                                className="bg-primary text-white h-9 px-4 rounded-xl hover:opacity-90 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                              >
                                Commit
                              </button>
                              <button
                                onClick={() => setAdjustingId(null)}
                                className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                            <select 
                              className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-3 py-1.5 border border-gray-100 rounded-xl bg-gray-50 outline-none cursor-pointer hover:bg-white transition-all shadow-inner"
                              value={adjustReason}
                              onChange={(e) => setAdjustReason(e.target.value)}
                            >
                              <option value="Adjustment">Regular Adjustment</option>
                              <option value="Restock">Restock / New Shipment</option>
                              <option value="Damage">Damaged / Expired</option>
                              <option value="Return">Customer Return</option>
                              <option value="Sale">Correction (Sold)</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setAdjustingId(product.id);
                                setAdjustValue("10");
                                setAdjustReason("Restock");
                              }}
                              className="h-10 w-10 flex items-center justify-center bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-emerald-50 hover:border-emerald-200 shadow-sm shadow-emerald-50/50"
                              title="Restock Items"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => {
                                setAdjustingId(product.id);
                                setAdjustValue("-10");
                                setAdjustReason("Adjustment");
                              }}
                              className="h-10 w-10 flex items-center justify-center bg-white text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-rose-50 hover:border-rose-200 shadow-sm shadow-rose-50/50"
                              title="Remove Items"
                            >
                              <Minus className="h-5 w-5" />
                            </button>
                            
                            <div className="relative">
                              <button 
                                onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                                className={`h-10 w-10 flex items-center justify-center rounded-xl border border-gray-100 shadow-sm transition-all ${openMenuId === product.id ? 'bg-primary text-white' : 'bg-white text-gray-400 hover:text-gray-600'}`}
                              >
                                <MoreVertical className="h-5 w-5" />
                              </button>
                              
                              {openMenuId === product.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                                    <button onClick={() => showLogs(product)} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-primary transition-all">
                                      <History className="h-4 w-4" /> View History
                                    </button>
                                    <Link href={`/admin/products/${product.id}`} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-primary transition-all">
                                      <Edit className="h-4 w-4" /> Edit Product
                                    </Link>
                                    <div className="h-px bg-gray-50 my-1 mx-2" />
                                    <button 
                                      onClick={() => {
                                        setTargetResetId(product.id);
                                        setIsConfirmOpen(true);
                                        setOpenMenuId(null);
                                      }} 
                                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all"
                                    >
                                      <Trash2 className="h-4 w-4" /> Zero Out Stock
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
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
