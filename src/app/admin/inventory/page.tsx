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
  Minus
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface Variant {
  id: string;
  name: string;
  sku: string;
  stock: number;
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
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustValue, setAdjustValue] = useState("0");
  const [adjustReason, setAdjustReason] = useState("Adjustment");

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

  const handleAdjust = async (productId: string, variantId?: string) => {
    try {
      const change = parseInt(adjustValue);
      if (isNaN(change) || change === 0) return;

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

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock <= 0).length;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor and adjust stock levels across all products and variants.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all text-sm font-semibold flex items-center shadow-sm">
            <History className="h-4 w-4 mr-2 text-gray-400" />
            Stock Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Inventory", value: products.length, icon: Package, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Low Stock Items", value: lowStockCount, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Out of Stock", value: outOfStockCount, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-5 shadow-sm">
            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-96 group">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            <div className="flex flex-col items-center justify-center py-32">
              <RefreshCcw className="h-10 w-10 animate-spin text-indigo-400 mb-4" />
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Fetching inventory...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-6 py-4">Product Info</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Current Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                          <Package className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">No items found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="h-12 w-12 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50 relative group-hover:scale-105 transition-transform duration-300">
                            <Image
                              src={product.images[0]?.url || "/placeholder-product.jpg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-4 min-w-0">
                            <div className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{product.name}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-gray-900">{product.stock} units</span>
                          <div className="w-24 bg-gray-100 rounded-full h-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                product.stock === 0 ? 'bg-rose-500' : 
                                product.stock <= product.lowStockThreshold ? 'bg-amber-500' : 
                                'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {product.stock <= 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                            <XCircle className="h-3 w-3" /> Out of Stock
                          </span>
                        ) : product.stock <= product.lowStockThreshold ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                            <AlertTriangle className="h-3 w-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                            <CheckCircle2 className="h-3 w-3" /> Healthy
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {adjustingId === product.id ? (
                          <div className="flex flex-col gap-2 items-end animate-in fade-in slide-in-from-right-2 duration-300">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={adjustValue}
                                onChange={(e) => setAdjustValue(e.target.value)}
                                className="w-16 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                              />
                              <button
                                onClick={() => handleAdjust(product.id)}
                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 text-xs font-bold transition-all shadow-sm shadow-indigo-100"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setAdjustingId(null)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </div>
                            <select 
                              className="text-[10px] font-bold uppercase tracking-wider p-1.5 border border-gray-100 rounded-lg bg-gray-50 outline-none cursor-pointer hover:bg-white transition-all"
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
                              }}
                              className="h-9 w-9 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-emerald-50 hover:border-emerald-200 shadow-sm shadow-emerald-50/50"
                              title="Add Stock"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setAdjustingId(product.id);
                                setAdjustValue("-10");
                              }}
                              className="h-9 w-9 flex items-center justify-center text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-rose-50 hover:border-rose-200 shadow-sm shadow-rose-50/50"
                              title="Deduct Stock"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <button className="h-9 w-9 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                              <MoreVertical className="h-4 w-4" />
                            </button>
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
