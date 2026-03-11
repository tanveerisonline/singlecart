"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Search, Filter, Package, Download, Upload } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";

interface ProductClientProps {
  products: any[];
}

export default function ProductClient({ products }: ProductClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  // Bulk actions state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === currentItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentItems.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const onBulkAction = async (action: string, value?: any) => {
    if (selectedIds.length === 0) return;
    
    try {
      setIsBulkLoading(true);
      await axios.patch("/api/products/bulk", {
        ids: selectedIds,
        action,
        value
      });
      toast.success("Bulk action completed successfully");
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      toast.error("Bulk action failed");
    } finally {
      setIsBulkLoading(false);
    }
  };

  const onBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;

    try {
      setIsBulkLoading(true);
      await axios.patch("/api/products/bulk", {
        ids: selectedIds,
        action: "DELETE"
      });
      toast.success("Products deleted successfully");
      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      toast.error("Bulk delete failed");
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const onDeleteClick = (id: string) => {
    setTargetId(id);
    setIsModalOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!targetId) return;

    try {
      setLoadingId(targetId);
      await axios.delete(`/api/products/${targetId}`);
      toast.success("Product deleted successfully");
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while deleting the product.");
    } finally {
      setLoadingId(null);
      setTargetId(null);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleExport = () => {
    const dataToExport = products.map(p => {
      const { cartItems, orderItems, reviews, stockLogs, wishlist, ...rest } = p;
      return rest;
    });
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Products exported successfully!");
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
          throw new Error("Invalid format: Expected an array of products.");
        }

        setIsImporting(true);
        await axios.post("/api/products/bulk", { products: importedData });
        toast.success(`${importedData.length} products imported successfully!`);
        router.refresh();
      } catch (error: any) {
        console.error("Import error:", error);
        toast.error(error.response?.data || error.message || "Failed to import products.");
      } finally {
        setIsImporting(false);
        if (e.target) e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onConfirmDelete}
        loading={loadingId !== null}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone and will remove the item from your store permanently."
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                <span className="text-[10px] font-black uppercase bg-primary text-white px-2 py-1 rounded-md">
                  {selectedIds.length} Selected
                </span>
                <div className="h-4 w-[1px] bg-gray-200 mx-1" />
                <select 
                  onChange={(e) => {
                    if (e.target.value === "DELETE") onBulkDelete();
                    else onBulkAction(e.target.value.split(':')[0], e.target.value.split(':')[1]);
                    e.target.value = "";
                  }}
                  className="bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl outline-none cursor-pointer hover:bg-black transition-all"
                >
                  <option value="">Bulk Actions</option>
                  <option value="UPDATE_STATUS:active">Set Active</option>
                  <option value="UPDATE_STATUS:inactive">Set Inactive</option>
                  <option value="UPDATE_STOCK_STATUS:in_stock">Set In Stock</option>
                  <option value="UPDATE_STOCK_STATUS:out_of_stock">Set Out of Stock</option>
                  <option value="DELETE">Delete Selected</option>
                </select>
              </div>
            )}
            <div className="relative flex-1 sm:w-96 group">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={handleSearch}
                className="w-full bg-gray-50 border-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none font-medium"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <label className="cursor-pointer bg-white border border-gray-100 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all text-xs font-bold flex items-center shadow-sm">
              <Upload className="h-3 w-3 mr-2" />
              Import
              <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={isImporting} />
            </label>
            <button 
              onClick={handleExport}
              className="bg-white border border-gray-100 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all text-xs font-bold flex items-center shadow-sm"
            >
              <Download className="h-3 w-3 mr-2" />
              Export
            </button>
            <button className="bg-white border border-gray-100 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all text-xs font-bold flex items-center">
              <Filter className="h-3 w-3 mr-2" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === currentItems.length && currentItems.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </th>
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <Package className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">No products found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50/50 transition-all duration-200 group ${selectedIds.includes(product.id) ? "bg-primary/[0.02]" : ""}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden relative mr-4 flex-shrink-0">
                          {product.images?.[0]?.url ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-100">
                              <Package className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate max-w-[200px] group-hover:text-primary transition-colors">
                            {product.name}
                            {!product.isActive && (
                              <span className="ml-2 text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-widest font-black">Inactive</span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{product.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600 border border-gray-200">
                        {product.category?.name || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900">${product.price.toFixed(2)}</span>
                        {product.compareAtPrice && (
                          <span className="text-[10px] text-gray-400 line-through font-bold">${product.compareAtPrice.toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            product.stock === 0 ? 'bg-rose-500' : 
                            product.stock <= product.lowStockThreshold ? 'bg-amber-500' : 
                            'bg-emerald-500'
                          }`}></span>
                          <span className="text-[10px] font-black uppercase text-gray-700 tracking-tighter">{product.stock} in stock</span>
                        </div>
                        <div className="w-24 bg-gray-100 rounded-full h-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              product.stock === 0 ? 'bg-rose-500' : 
                              product.stock <= product.lowStockThreshold ? 'bg-amber-500' : 
                              'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min((product.stock / 50) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/products/${product.id}`}
                          className="p-2 text-gray-400 hover:text-primary hover:opacity-90/5 rounded-lg transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => onDeleteClick(product.id)}
                          disabled={loadingId === product.id}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
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
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Showing <span className="text-gray-900">{indexOfFirstItem + 1}</span> to <span className="text-gray-900">{Math.min(indexOfLastItem, filteredProducts.length)}</span> of <span className="text-gray-900">{filteredProducts.length}</span> products
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:text-primary hover:border-primary/50 transition-all"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${
                      currentPage === page
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:text-primary hover:border-primary/50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
