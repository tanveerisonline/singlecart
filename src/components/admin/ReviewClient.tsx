"use client";

import { useState } from "react";
import { Star, CheckCircle2, XCircle, Trash2, User, Package, Calendar, ImageIcon, Eye } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ConfirmModal from "./ConfirmModal";

interface ReviewClientProps {
  initialReviews: any[];
}

export default function ReviewClient({ initialReviews }: ReviewClientProps) {
  const [reviews, setReviews] = useState(initialReviews);
  const [loading, setLoading] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const router = useRouter();

  const onApprove = async (reviewId: string, currentStatus: boolean) => {
    try {
      setLoading(reviewId);
      await axios.patch(`/api/reviews/${reviewId}`, { isApproved: !currentStatus });
      toast.success(currentStatus ? "Review unapproved" : "Review approved");
      router.refresh();
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, isApproved: !currentStatus } : r));
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      setLoading(deleteId);
      await axios.delete(`/api/reviews/${deleteId}`);
      toast.success("Review deleted");
      router.refresh();
      setReviews(reviews.filter(r => r.id !== deleteId));
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(null);
      setDeleteId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={onDelete}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
      />
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
            <th className="px-6 py-4">Review Details</th>
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">Customer</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {reviews.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <Star className="h-8 w-8 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-bold">No reviews found</p>
                  <p className="text-gray-400 text-xs mt-1">Customer reviews will appear here.</p>
                </div>
              </td>
            </tr>
          ) : (
            reviews.map((review) => (
              <tr key={review.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            review.rating >= star ? "text-yellow-400 fill-current" : "text-gray-200"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-gray-900 ml-1">{review.title}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 max-w-md">{review.comment}</p>
                    {review.images.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {review.images.map((img: any) => (
                          <div key={img.id} className="relative h-10 w-10 rounded border border-gray-100 overflow-hidden">
                            <Image src={img.url} alt="Review" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-2">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-lg bg-gray-50 overflow-hidden border border-gray-100">
                      <Image
                        src={review.product.thumbnailUrl || "/file.svg"}
                        alt={review.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate max-w-[150px]">{review.product.name}</p>
                      <p className="text-[10px] text-gray-400">SKU: {review.product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{review.user.name || "Customer"}</p>
                      <p className="text-[10px] text-gray-400 truncate">{review.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    review.isApproved 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                    : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}>
                    {review.isApproved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onApprove(review.id, review.isApproved)}
                      disabled={loading === review.id}
                      className={`p-2 rounded-lg transition-colors ${
                        review.isApproved 
                        ? "text-amber-600 hover:bg-amber-50" 
                        : "text-emerald-600 hover:bg-emerald-50"
                      }`}
                      title={review.isApproved ? "Unapprove" : "Approve"}
                    >
                      {review.isApproved ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => setDeleteId(review.id)}
                      disabled={loading === review.id}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
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
  );
}
