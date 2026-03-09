"use client";

import Link from "next/link";
import { ShoppingCart, User as UserIcon, Search } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface NavbarProps {
  logoUrl?: string | null;
}

export default function Navbar({ logoUrl }: NavbarProps) {
  const cart = useCart();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              <div className="relative h-10 w-32">
                <Image
                  src={logoUrl}
                  alt="Store Logo"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            ) : (
              <span className="text-xl font-black text-gray-900 tracking-tighter uppercase">
                SHOP
              </span>
            )}
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full border border-gray-200 rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </form>
          </div>

          <div className="flex items-center gap-x-6">
            <Link href="/orders" className="text-gray-500 hover:text-primary text-[10px] font-black uppercase tracking-widest transition-colors">
              Orders
            </Link>
            <Link href="/cart" className="relative text-gray-700 hover:text-primary transition-colors group">
              <ShoppingCart className="h-6 w-6" />
              {isMounted && cart.items.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white shadow-lg shadow-primary/20 animate-in zoom-in duration-200">
                  {cart.items.length}
                </span>
              )}
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-primary transition-colors">
              <UserIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
