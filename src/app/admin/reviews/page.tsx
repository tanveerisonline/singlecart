import { db } from "@/lib/db";
import { Star, CheckCircle2, XCircle, Trash2, User, Package, Calendar, ImageIcon } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import axios from "axios";
import ReviewClient from "@/components/admin/ReviewClient";

export default async function ReviewsPage() {
  const reviews = await db.review.findMany({
    include: {
      user: true,
      product: true,
      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter((r) => !r.isApproved).length,
    approved: reviews.filter((r) => r.isApproved).length,
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
          <p className="text-gray-500 text-sm mt-1">Moderate and manage customer ratings and comments.</p>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Reviews", value: stats.total, icon: Star, color: "text-primary", bg: "bg-primary/10" },
          { label: "Pending Approval", value: stats.pending, icon: Calendar, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Approved", value: stats.approved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
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

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <ReviewClient initialReviews={JSON.parse(JSON.stringify(reviews))} />
      </div>
    </div>
  );
}
