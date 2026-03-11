"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, ProductImage, Category } from "@prisma/client";
import { ShoppingCart, Eye, Star, Heart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { MouseEventHandler, useEffect, useState } from "react";

interface ProductCardProps {
  product: Partial<Product> & {
    id: string;
    name: string;
    price: number;
    slug: string;
    images?: ProductImage[];
    category?: Category | null;
    thumbnailUrl?: string | null;
    compareAtPrice?: number | null;
    isFeatured?: boolean | null;
    isTrending?: boolean | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isMounted, setIsMounted] = useState(false);
  const cart = useCart();
  const wishlist = useWishlist();

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const isFavorite = isMounted ? wishlist.isInWishlist(product.id) : false;

  const discountPercentage = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
    : 0;

  const onAddToCart: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    cart.addItem(product);
  };

  const onAddToWishlist: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isFavorite) {
      wishlist.removeItem(product.id);
    } else {
      wishlist.addItem(product);
    }
  };

  const onPreview: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    // Could open a modal here, but for now we'll let the main link handle it
    window.location.href = `/product/${product.slug}`;
  };

  const imageSrc = product.images?.[0]?.url || product.thumbnailUrl || "/placeholder-product.svg";

  return (
    <div className="group relative bg-white rounded-[2rem] border border-gray-100 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/40 hover:-translate-y-2 overflow-hidden flex flex-col h-full">
      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50/50 p-4">
        <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-white shadow-sm border border-gray-100/50">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
          {discountPercentage > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md shadow-rose-500/20">
              {discountPercentage}% Off
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-gray-900 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
              Featured
            </span>
          )}
          {product.isTrending && (
            <span className="bg-primary text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md shadow-primary/20">
              Trending
            </span>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-20">
            <button 
              onClick={onAddToWishlist}
              className={`h-12 w-12 rounded-full flex items-center justify-center shadow-xl transition-all transform translate-y-8 group-hover:translate-y-0 duration-500 hover:scale-110 active:scale-95 ${
                isFavorite ? "bg-rose-500 text-white shadow-rose-500/20" : "bg-white text-gray-900 hover:bg-rose-500 hover:text-white"
              }`}
            >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
            </button>
            <button 
              onClick={onPreview}
              className="h-12 w-12 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-xl hover:bg-primary hover:text-white transition-all transform translate-y-8 group-hover:translate-y-0 duration-500 delay-75 hover:scale-110 active:scale-95"
            >
                <Eye className="h-5 w-5" />
            </button>
        </div>
      </Link>

      {/* Info Container */}
      <div className="p-6 flex flex-col flex-1">
        {product.category && (
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">
            {product.category.name}
          </p>
        )}
        
        <Link href={`/product/${product.slug}`} className="block flex-1">
          <h3 className="text-base font-black text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors tracking-tight">
            {product.name}
          </h3>
        </Link>

        {/* Rating Mockup */}
        <div className="flex items-center gap-1 mt-3 mb-4">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i < 4 ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
            ))}
            <span className="text-[10px] font-bold text-gray-400 ml-1.5 uppercase tracking-widest">(4.0)</span>
        </div>

        <div className="flex items-end justify-between pt-4 border-t border-gray-50 mt-auto">
          <div className="flex flex-col">
            {product.compareAtPrice && (
              <span className="text-[11px] text-gray-400 line-through font-bold mb-0.5">
                ${product.compareAtPrice.toLocaleString()}
              </span>
            )}
            <span className="text-xl font-black text-gray-900 tracking-tight">
              ${product.price.toLocaleString()}
            </span>
          </div>
          
          <button 
            onClick={onAddToCart}
            className="h-12 w-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center hover:bg-primary transition-all shadow-lg hover:shadow-primary/20 active:scale-90 group/btn"
          >
            <ShoppingCart className="h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
}
