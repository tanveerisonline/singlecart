"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  Ticket, 
  Globe, 
  Shield, 
  History, 
  Image as ImageIcon, 
  Settings2,
  LogOut,
  ChevronDown,
  PlusCircle,
  List,
  Tags as TagsIcon,
  Layers,
  Award,
  MessageSquare,
  ChevronRight
} from "lucide-react";

interface AdminSidebarProps {
  session: any;
}

export default function AdminSidebar({ session }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isProductsOpen, setIsProductsOpen] = useState(pathname.startsWith("/admin/products") || 
                                                     pathname.startsWith("/admin/attributes") || 
                                                     pathname.startsWith("/admin/categories") ||
                                                     pathname.startsWith("/admin/tags") ||
                                                     pathname.startsWith("/admin/brands") ||
                                                     pathname.startsWith("/admin/qna") ||
                                                     pathname.startsWith("/admin/inventory"));

  const toggleProducts = () => setIsProductsOpen(!isProductsOpen);

  const isActive = (href: string) => pathname === href;
  const isSubActive = (href: string) => pathname.startsWith(href);

  const productSubItems = [
    { label: "Add Product", icon: PlusCircle, href: "/admin/products/new" },
    { label: "All Products", icon: List, href: "/admin/products" },
    { label: "Inventory", icon: History, href: "/admin/inventory" },
    { label: "Attributes", icon: Settings2, href: "/admin/attributes" },
    { label: "Categories", icon: Layers, href: "/admin/categories" },
    { label: "Tags", icon: TagsIcon, href: "/admin/tags" },
    { label: "Brands", icon: Award, href: "/admin/brands" },
    { label: "Q&A", icon: MessageSquare, href: "/admin/qna" },
  ];

  const mainSidebarItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { label: "Media", icon: ImageIcon, href: "/admin/media" },
    { label: "Orders", icon: ShoppingBag, href: "/admin/orders" },
    { label: "Customers", icon: Users, href: "/admin/customers" },
    { label: "Staff", icon: Shield, href: "/admin/users" },
    { label: "Coupons", icon: Ticket, href: "/admin/coupons" },
    { label: "Slider", icon: Globe, href: "/admin/slider" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col hidden lg:flex">
      <div className="p-6 border-b border-gray-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">ShopAdmin</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
        <p className="px-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Main Menu</p>
        
        {/* Dashboard Link */}
        <Link
          href="/admin"
          className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
            isActive("/admin") 
            ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100" 
            : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
          }`}
        >
          <LayoutDashboard className={`h-5 w-5 mr-3 transition-colors ${
            isActive("/admin") ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-500"
          }`} />
          Dashboard
        </Link>

        {/* Products Dropdown */}
        <div className="space-y-1">
          <button
            onClick={toggleProducts}
            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
              isProductsOpen || isSubActive("/admin/products")
              ? "text-indigo-600" 
              : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            <div className="flex items-center">
              <Package className={`h-5 w-5 mr-3 transition-colors ${
                isProductsOpen || isSubActive("/admin/products") ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-500"
              }`} />
              Products
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isProductsOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isProductsOpen && (
            <div className="ml-4 pl-4 border-l border-gray-100 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
              {productSubItems.map((subItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  className={`flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 group ${
                    isActive(subItem.href)
                    ? "text-indigo-600 bg-indigo-50/50" 
                    : "text-gray-500 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                >
                  <subItem.icon className={`h-4 w-4 mr-2.5 transition-colors ${
                    isActive(subItem.href) ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-500"
                  }`} />
                  {subItem.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Rest of the items */}
        {mainSidebarItems.slice(1).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
              isActive(item.href) 
              ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100" 
              : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
            }`}
          >
            <item.icon className={`h-5 w-5 mr-3 transition-colors ${
              isActive(item.href) ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-500"
            }`} />
            {item.label}
          </Link>
        ))}
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200">
            {session.user.name?.[0] || session.user.email?.[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{session.user.name || "Admin"}</p>
            <p className="text-[10px] text-gray-500 truncate uppercase font-bold tracking-wider">{session.user.role}</p>
          </div>
          <Link href="/api/auth/signout" className="text-gray-400 hover:text-rose-600 transition-colors p-1 hover:bg-rose-50 rounded-lg">
            <LogOut className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
