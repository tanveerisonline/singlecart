import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, Package, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import ProductClient from "@/components/admin/ProductClient";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: {
      category: true,
      images: {
        take: 1
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const activeProducts = products.filter(p => p.isActive).length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your product catalog, stock, and pricing.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/new"
            className="bg-primary text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all text-sm font-semibold flex items-center shadow-sm shadow-primary/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Products", value: totalProducts, icon: Package, color: "text-primary", bg: "bg-primary/10" },
          { label: "Active", value: activeProducts, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Low Stock", value: lowStockProducts, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Out of Stock", value: outOfStockProducts, icon: Trash2, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Products Table Container - Handled by Client Component for interactivity */}
      <ProductClient products={products} />
    </div>
  );
}
