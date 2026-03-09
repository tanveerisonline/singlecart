import Image from "next/image";
import Link from "next/link";
import { Product, ProductImage, Category } from "@prisma/client";
import { ShoppingCart, Eye, Star, Heart } from "lucide-react";

interface ProductCardProps {
  product: Product & {
    images: ProductImage[];
    category?: Category;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const discountPercentage = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) 
    : 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 overflow-hidden">
      {/* Image Container */}
      <Link href={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50">
        <Image
          src={product.images[0]?.url || "/placeholder-product.jpg"}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discountPercentage > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
              {discountPercentage}% Off
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
              Featured
            </span>
          )}
          {product.isTrending && (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
              Trending
            </span>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button className="h-10 w-10 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                <Heart className="h-5 w-5" />
            </button>
            <button className="h-10 w-10 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg hover:bg-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                <Eye className="h-5 w-5" />
            </button>
        </div>
      </Link>

      {/* Info Container */}
      <div className="p-5 space-y-2">
        {product.category && (
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {product.category.name}
          </p>
        )}
        
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating Mockup */}
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < 4 ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
            ))}
            <span className="text-[10px] font-medium text-gray-400 ml-1">(4.0)</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-gray-900">
              ${product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs text-gray-400 line-through font-medium">
                ${product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          <button className="h-9 w-9 rounded-xl bg-gray-50 text-gray-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all">
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
