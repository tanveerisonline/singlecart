"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X, ChevronDown, Star, Check } from "lucide-react";
import axios from "axios";
import { Category, Brand } from "@prisma/client";

interface FilterSettings {
  showCategory: boolean;
  showBrand: boolean;
  showPrice: boolean;
  showRating: boolean;
  showAvailability: boolean;
  showDiscount: boolean;
}

export default function ProductFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [settings, setSettings] = useState<FilterSettings | null>(null);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("categoryId") || "");
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get("brandId") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [rating, setRating] = useState(searchParams.get("rating") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");
  const [onSale, setOnSale] = useState(searchParams.get("onSale") === "true");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, brandsRes, settingsRes] = await Promise.all([
          axios.get("/api/categories"),
          axios.get("/api/brands"),
          axios.get("/api/settings/filters")
        ]);
        const cats = Array.isArray(catsRes.data) ? catsRes.data : (catsRes.data.categories || []);
        setCategories(cats);
        setBrands(brandsRes.data);
        setSettings(settingsRes.data);
      } catch (error) {
        console.error("Filter data fetch error:", error);
      }
    };
    fetchData();
  }, []);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedCategory) params.set("categoryId", selectedCategory);
    else params.delete("categoryId");
    
    if (selectedBrand) params.set("brandId", selectedBrand);
    else params.delete("brandId");
    
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    
    if (rating) params.set("rating", rating);
    else params.delete("rating");
    
    if (inStock) params.set("inStock", "true");
    else params.delete("inStock");
    
    if (onSale) params.set("onSale", "true");
    else params.delete("onSale");

    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setMinPrice("");
    setMaxPrice("");
    setRating("");
    setInStock(false);
    setOnSale(false);
    router.push(window.location.pathname);
    setIsOpen(false);
  };

  if (!settings) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm"
      >
        <Filter className="h-4 w-4 text-primary" />
        Filters
        {(selectedCategory || selectedBrand || minPrice || maxPrice || rating || inStock || onSale) && (
          <span className="flex h-2 w-2 rounded-full bg-primary" />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <h3 className="font-black text-gray-900 uppercase tracking-tight">Refine Search</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-50 rounded-lg transition-colors">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* Category */}
            {settings.showCategory && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Category</p>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm font-bold focus:ring-2 focus:ring-primary/10 outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Brand */}
            {settings.showBrand && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Brand</p>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm font-bold focus:ring-2 focus:ring-primary/10 outline-none"
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Price */}
            {settings.showPrice && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Price Range</p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm font-bold focus:ring-2 focus:ring-primary/10 outline-none"
                  />
                  <span className="text-gray-300">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-3 text-sm font-bold focus:ring-2 focus:ring-primary/10 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Rating */}
            {settings.showRating && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Minimum Rating</p>
                <div className="flex flex-wrap gap-2">
                  {[4, 3, 2].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRating(rating === r.toString() ? "" : r.toString())}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-black transition-all ${
                        rating === r.toString() 
                        ? 'bg-primary/5 border-primary text-primary' 
                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      {r}+ <Star className={`h-3 w-3 ${rating === r.toString() ? 'fill-primary' : 'fill-gray-300 text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Toggles */}
            <div className="space-y-4 pt-2">
              {settings.showAvailability && (
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-black text-gray-700 uppercase tracking-tight group-hover:text-primary transition-colors">In Stock Only</span>
                  <div 
                    onClick={() => setInStock(!inStock)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${inStock ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${inStock ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>
              )}
              {settings.showDiscount && (
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-black text-gray-700 uppercase tracking-tight group-hover:text-primary transition-colors">On Sale</span>
                  <div 
                    onClick={() => setOnSale(!onSale)}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${onSale ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${onSale ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center gap-3">
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
            >
              Clear
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg shadow-gray-200"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
