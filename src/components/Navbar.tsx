"use client";

import Link from "next/link";
import { 
  ShoppingCart, 
  User as UserIcon, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight,
  Heart,
  ShoppingBag,
  HelpCircle,
  Phone,
  LayoutGrid,
  RefreshCcw
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import axios from "axios";

import { useWishlist } from "@/hooks/use-wishlist";

interface NavbarProps {
  logoUrl?: string | null;
  logoWidth?: number;
  logoHeight?: number;
}

export default function Navbar({ logoUrl, logoWidth = 128, logoHeight = 40 }: NavbarProps) {
  const cart = useCart();
  const wishlist = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        const cats = Array.isArray(response.data) ? response.data : (response.data.categories || []);
        setCategories(cats.filter((c: any) => c.isActive).slice(0, 8));
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Body Scroll Lock for Modal & Mobile Menu
  useEffect(() => {
    if (isSearchOpen || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isSearchOpen, isMobileMenuOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await axios.get(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
          setSearchResults(res.data);
          setShowAutocomplete(true);
        } catch (error) {
          console.error("Autocomplete error", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowAutocomplete(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowAutocomplete(false);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-lg shadow-lg py-2" : "bg-white py-4 border-b border-gray-50"
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0 group">
              {logoUrl ? (
                <div 
                  className="relative transition-transform group-hover:scale-105"
                  style={{ width: `${logoWidth}px`, height: `${logoHeight}px` }}
                >
                  <Image
                    src={logoUrl}
                    alt="Store Logo"
                    fill
                    className="object-contain object-left"
                    priority
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                   <div className="h-8 w-8 sm:h-10 sm:w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform group-hover:rotate-12">
                      <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
                   </div>
                   <span className="text-lg sm:text-2xl font-black text-gray-900 tracking-tighter uppercase">
                      SHOP<span className="text-primary">.</span>
                   </span>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <div className="relative group">
                 <button className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-colors py-2">
                    Collections <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
                 </button>
                 {isMounted && (
                   <div className="absolute top-full left-0 w-[600px] bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 grid grid-cols-2 gap-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-4 group-hover:translate-y-0 duration-300">
                      <div className="space-y-6">
                         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-50 pb-2">Top Categories</h3>
                         <div className="grid grid-cols-1 gap-4">
                            {categories.map((cat) => (
                               <Link 
                                 key={cat.id} 
                                 href={`/collections/${cat.slug}`} 
                                 className="flex items-center gap-3 p-2 rounded-2xl hover:bg-primary/5 transition-all group/item"
                               >
                                  <div className="h-10 w-10 rounded-xl bg-gray-50 overflow-hidden relative border border-gray-100">
                                     <Image src={cat.imageUrl || "/placeholder-category.svg"} alt={cat.name} fill className="object-cover" />
                                  </div>
                                  <span className="text-sm font-bold text-gray-700 group-hover/item:text-primary transition-colors">{cat.name}</span>
                               </Link>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-6 bg-gray-50 rounded-2xl p-6">
                         <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Featured Collections</h3>
                         <div className="space-y-3">
                            <Link href="/collections/new-arrivals" className="block p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                               <p className="text-sm font-black text-gray-900">New Arrivals</p>
                               <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Fresh from the warehouse</p>
                            </Link>
                            <Link href="/collections/best-sellers" className="block p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                               <p className="text-sm font-black text-gray-900">Best Sellers</p>
                               <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Loved by everyone</p>
                            </Link>
                            <Link href="/collections/on-sale" className="block p-4 bg-primary text-white rounded-xl shadow-md hover:opacity-90 transition-all">
                               <p className="text-sm font-black">Flash Sale</p>
                               <p className="text-[10px] opacity-80 font-bold uppercase mt-1">Up to 70% Off</p>
                            </Link>
                         </div>
                      </div>
                   </div>
                 )}
              </div>
              
              <Link href="/search" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-colors">Shop</Link>
              <Link href="/orders" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-colors">Orders</Link>
              <Link href="/contact" className="text-[11px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-colors">Support</Link>
            </nav>

            {/* Action Icons */}
            <div className="flex items-center gap-1.5 sm:gap-4 ml-auto">
              {/* Search Toggle */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="h-10 w-10 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-primary transition-all"
              >
                <Search className="h-5 w-5" />
              </button>

              <Link href="/wishlist" className="relative hidden sm:flex h-10 w-10 rounded-xl hover:bg-gray-50 items-center justify-center text-gray-500 hover:text-primary transition-all">
                 <Heart className="h-5 w-5" />
                 {isMounted && wishlist.items.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-lg bg-rose-500 text-[8px] font-black text-white shadow-lg shadow-rose-500/20 animate-in zoom-in duration-300">
                    {wishlist.items.length}
                  </span>
                )}
              </Link>
              
              <Link href="/cart" className="relative h-10 w-10 rounded-xl hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-primary transition-all group">
                <ShoppingCart className="h-5 w-5" />
                {isMounted && cart.items.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-lg bg-primary text-[8px] font-black text-white shadow-lg shadow-primary/20 animate-in zoom-in duration-300">
                    {cart.items.length}
                  </span>
                )}
              </Link>

              <Link href="/profile" className="hidden sm:flex h-10 w-10 rounded-xl bg-gray-900 text-white items-center justify-center hover:bg-primary transition-all shadow-lg shadow-gray-200">
                <UserIcon className="h-5 w-5" />
              </Link>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 z-[60]"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay Modal */}
      <div className={`fixed inset-0 z-[100] transition-all duration-500 ${
        isSearchOpen ? "visible" : "invisible"
      }`}>
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity duration-500 ${
            isSearchOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsSearchOpen(false)}
        />
        
        {/* Search Content */}
        <div className={`absolute inset-x-0 top-0 bg-white shadow-2xl transition-transform duration-500 transform ${
          isSearchOpen ? "translate-y-0" : "-translate-y-full"
        }`}>
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-20">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-black uppercase tracking-tight">Search Store</h2>
               <button 
                 onClick={() => setIsSearchOpen(false)}
                 className="p-3 rounded-2xl bg-gray-100 text-gray-900 hover:bg-rose-500 hover:text-white transition-all"
               >
                 <X className="h-6 w-6" />
               </button>
            </div>

            <form onSubmit={handleSearch} className="relative group">
              <input
                autoFocus={isSearchOpen}
                type="text"
                placeholder="What are you looking for?"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] py-5 sm:py-6 pl-12 sm:pl-16 pr-6 focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary focus:outline-none transition-all text-lg sm:text-xl font-bold placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-7 sm:w-7 text-gray-400 group-focus-within:text-primary transition-colors" />
            </form>

            {/* Results in Modal */}
            <div className="mt-8 sm:mt-10 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
               {isSearching ? (
                 <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <RefreshCcw className="h-10 w-10 text-primary animate-spin opacity-20" />
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Searching our warehouse...</p>
                 </div>
               ) : searchResults.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 transition-all group/item shadow-sm hover:shadow-xl"
                      >
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white relative overflow-hidden border border-gray-100 shrink-0">
                          <Image 
                            src={product.thumbnailUrl || product.images?.[0]?.url || "/placeholder-product.svg"} 
                            alt={product.name} 
                            fill 
                            className="object-cover transition-transform group-hover/item:scale-110" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-black text-gray-900 truncate group-hover/item:text-primary transition-colors uppercase tracking-tight">{product.name}</p>
                          <p className="text-xs sm:text-sm font-black text-primary mt-1">${product.price.toFixed(2)}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover/item:text-primary group-hover/item:translate-x-1 transition-all" />
                      </Link>
                    ))}
                    <Link 
                      href={`/search?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="md:col-span-2 block w-full p-5 text-center text-xs font-black uppercase tracking-[0.3em] text-gray-400 hover:text-primary hover:bg-gray-50 transition-all border-2 border-dashed border-gray-100 rounded-3xl mt-4"
                    >
                      View All Results
                    </Link>
                 </div>
               ) : searchQuery.length >= 2 ? (
                 <div className="py-20 text-center space-y-4 bg-gray-50 rounded-[3rem]">
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                       <Search className="h-8 w-8 text-gray-200" />
                    </div>
                    <p className="text-gray-500 font-bold">No results found for "{searchQuery}"</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Trending Collections</p>
                    <div className="flex flex-wrap gap-3">
                       {categories.map(cat => (
                         <Link key={cat.id} href={`/collections/${cat.slug}`} onClick={() => setIsSearchOpen(false)} className="px-6 py-3 bg-gray-50 hover:bg-primary hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-gray-100">
                            {cat.name}
                         </Link>
                       ))}
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`lg:hidden fixed inset-0 z-[55] transition-all duration-500 ${
        isMobileMenuOpen ? "visible" : "invisible"
      }`}>
         <div 
           className={`absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity duration-500 ${
             isMobileMenuOpen ? "opacity-100" : "opacity-0"
           }`}
           onClick={() => setIsMobileMenuOpen(false)}
         />
         
         <div className={`absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-white shadow-2xl transition-transform duration-500 transform ${
           isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
         }`}>
            <div className="p-6 h-full flex flex-col">
               <div className="flex items-center justify-between mb-10">
                  <span className="text-2xl font-black tracking-tighter">MENU<span className="text-primary">.</span></span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-2xl bg-gray-50 text-gray-900"><X className="h-6 w-6" /></button>
               </div>

               <form onSubmit={handleSearch} className="relative mb-10">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:outline-none transition-all text-sm font-bold"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
               </form>

               <nav className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Quick Navigation</p>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/" className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 text-gray-900 font-black text-sm uppercase tracking-widest">
                     Home <ChevronRight className="h-4 w-4 text-primary" />
                  </Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/search" className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 text-gray-900 font-black text-sm uppercase tracking-widest">
                     Shop All <ChevronRight className="h-4 w-4 text-primary" />
                  </Link>
                  <Link onClick={() => setIsMobileMenuOpen(false)} href="/profile" className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 text-gray-900 font-black text-sm uppercase tracking-widest">
                     My Account <ChevronRight className="h-4 w-4 text-primary" />
                  </Link>
                  
                  <div className="pt-6 space-y-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Popular Categories</p>
                     <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => (
                           <Link 
                             key={cat.id} 
                             onClick={() => setIsMobileMenuOpen(false)} 
                             href={`/collections/${cat.slug}`}
                             className="flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group active:scale-95 transition-all"
                           >
                              <div className="h-12 w-12 rounded-xl bg-white overflow-hidden relative border border-gray-100 shadow-sm">
                                 <Image src={cat.imageUrl || "/placeholder-category.svg"} alt={cat.name} fill className="object-cover" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-tighter text-gray-900 truncate">{cat.name}</span>
                           </Link>
                        ))}
                     </div>
                  </div>
               </nav>

               <div className="pt-10 border-t border-gray-50 grid grid-cols-3 gap-4">
                  <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-2">
                     <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><HelpCircle className="h-6 w-6" /></div>
                     <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Support</span>
                  </Link>
                  <a href="tel:+1234567890" className="flex flex-col items-center gap-2">
                     <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Phone className="h-6 w-6" /></div>
                     <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Call Us</span>
                  </a>
                  <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-center gap-2">
                     <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><ShoppingBag className="h-6 w-6" /></div>
                     <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Orders</span>
                  </Link>
               </div>
            </div>
         </div>
      </div>
    </>
  );
}
