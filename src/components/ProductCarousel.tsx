"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { Product, ProductImage, Category } from "@prisma/client";

interface ProductWithRelations extends Product {
  images: ProductImage[];
  category: Category;
}

interface ProductCarouselProps {
  title: string;
  products: ProductWithRelations[];
  autoSlide?: boolean;
  interval?: number;
}

export default function ProductCarousel({ 
  title, 
  products, 
  autoSlide = true, 
  interval = 5000 
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollNext = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollAmount = container.clientWidth;
    
    if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
      container.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }, []);

  const scrollPrev = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollAmount = container.clientWidth;

    if (container.scrollLeft <= 0) {
      container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
    } else {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (!autoSlide || isHovered || products.length <= 4) return;

    const timer = setInterval(() => {
      scrollNext();
    }, interval);

    return () => clearInterval(timer);
  }, [autoSlide, isHovered, interval, scrollNext, products.length]);

  if (products.length === 0) return null;

  return (
    <div 
      className="space-y-6 py-12"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between px-4 sm:px-0">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={scrollPrev}
            className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={scrollNext}
            className="p-2.5 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-4 sm:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div 
            key={product.id} 
            className="min-w-[280px] md:min-w-[320px] lg:min-w-[300px] snap-start"
          >
            <ProductCard product={product as any} />
          </div>
        ))}
      </div>
    </div>
  );
}
