import { db } from "@/lib/db";
import { Ticket, Plus, Search, Filter, Calendar, Users, DollarSign, Percent, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import CouponClient from "@/components/admin/CouponClient";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const activeCoupons = coupons.filter(c => c.isActive && new Date() < new Date(c.endDate)).length;
  const totalValue = coupons.length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">Manage promotional codes and discounts.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/coupons/new"
            className="bg-primary text-white px-4 py-2 rounded-xl hover:opacity-90 transition-all text-sm font-semibold flex items-center shadow-sm shadow-primary/20"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Link>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Coupons", value: totalValue, icon: Ticket, color: "text-primary", bg: "bg-primary/10" },
          { label: "Active Now", value: activeCoupons, icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Expiring Soon", value: coupons.filter(c => {
            const daysToExpiry = (new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
            return daysToExpiry > 0 && daysToExpiry < 7;
          }).length, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
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

      <CouponClient coupons={coupons} />
    </div>
  );
}
