"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Star, ImagePlus, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface ReviewFormProps {
  productId: string;
}

export default function ReviewForm({ productId }: ReviewFormProps) {
  const { data: session, status } = useSession();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkPurchase = async () => {
      if (status === "authenticated") {
        try {
          const response = await axios.get(`/api/reviews/check-purchase?productId=${productId}`);
          setCanReview(response.data.canReview);
        } catch (error) {
          console.error(error);
          setCanReview(false);
        }
      }
    };
    checkPurchase();
  }, [productId, status]);

  const onImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 3) {
      toast.error("Maximum 3 images allowed");
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const response = await axios.post("/api/upload", {
          image: base64,
          name: file.name
        });
        setImages([...images, response.data.url]);
        toast.success("Image uploaded");
      };
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canReview) {
      toast.error("You must purchase this product before reviewing it.");
      return;
    }
    try {
      setLoading(true);
      await axios.post("/api/reviews", {
        productId,
        rating,
        title,
        comment,
        images,
      });
      setSubmitted(true);
      router.refresh();
      toast.success("Review submitted for moderation!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  if (status === "unauthenticated") {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600">Please <a href="/login" className="text-blue-600 font-semibold hover:underline">login</a> to write a review.</p>
      </div>
    );
  }

  if (canReview === false) {
    return (
      <div className="bg-amber-50 p-6 rounded-lg text-center border border-amber-100">
        <p className="text-amber-800 font-medium">Only customers who have purchased this product can leave a review.</p>
        <p className="text-amber-600 text-sm mt-1">If you have recently purchased it, please wait until your order is delivered.</p>
      </div>
    );
  }

  if (canReview === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-green-50 p-6 rounded-lg text-center border border-green-100">
        <h3 className="text-green-800 font-bold">Review Submitted!</h3>
        <p className="text-green-600 text-sm mt-2">Thank you for your feedback. Your review will be visible after moderation.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4 border border-gray-200">
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
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
          placeholder="Summarize your experience"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Detailed Review</label>
        <textarea
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
          placeholder="What did you like or dislike?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Photos (Optional, max 3)</label>
        <div className="flex flex-wrap gap-2">
          {images.map((url, index) => (
            <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden group">
              <Image src={url} alt="Review" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < 3 && (
            <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-white">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onImageUpload}
                disabled={uploading}
              />
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <>
                  <ImagePlus className="h-5 w-5 text-gray-400" />
                  <span className="text-[10px] text-gray-400 mt-1">Upload</span>
                </>
              )}
            </label>
          )}
        </div>
      </div>

      <button
        disabled={loading || uploading}
        type="submit"
        className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400 transition-colors font-medium"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
