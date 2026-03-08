"use client";

import { useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post("/api/reviews", {
        productId,
        rating,
        title,
        comment,
      });
      setSubmitted(true);
      router.refresh();
      toast.success("Review submitted for moderation!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 p-6 rounded-lg text-center">
        <h3 className="text-green-800 font-bold">Review Submitted!</h3>
        <p className="text-green-600 text-sm mt-2">Thank you for your feedback. Your review will be visible after moderation.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
      <h3 className="text-lg font-bold">Write a Review</h3>
      
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`${rating >= star ? "text-yellow-400" : "text-gray-300"} hover:scale-110 transition-transform`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Review Title</label>
        <input
          type="text"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="Summarize your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Detailed Review</label>
        <textarea
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          placeholder="What did you like or dislike?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button
        disabled={loading}
        type="submit"
        className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
