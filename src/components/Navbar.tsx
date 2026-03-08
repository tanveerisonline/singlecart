"use client";

import Link from "next/link";
import { ShoppingCart, User as UserIcon, Search } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
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
          <Link href="/" className="text-xl font-bold text-gray-900">
            SHOP
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full border rounded-full py-1.5 pl-10 pr-4 focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
            </form>
          </div>

          <div className="flex items-center gap-x-4">
            <Link href="/orders" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              Orders
            </Link>
            <Link href="/cart" className="relative text-gray-700 hover:text-gray-900">
              <ShoppingCart className="h-6 w-6" />
              {isMounted && cart.items.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-medium text-white">
                  {cart.items.length}
                </span>
              )}
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-gray-900">
              <UserIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
