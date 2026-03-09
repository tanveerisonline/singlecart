"use client";

import { useState, useRef, MouseEvent } from "react";
import Image from "next/image";

interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const activeImage = images[activeIndex];

  return (
    <div className="space-y-4">
      {/* Main Image with Zoom */}
      <div 
        ref={containerRef}
        className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-zoom-in"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
      >
        <Image
          src={activeImage.url}
          alt={activeImage.alt || productName}
          fill
          priority
          className={`object-cover transition-opacity duration-300 ${showZoom ? 'opacity-0' : 'opacity-100'}`}
        />
        
        {/* Zoomed Image Container */}
        {showZoom && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${activeImage.url})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundSize: '200%',
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                activeIndex === index ? "border-primary/20 ring-2 ring-primary/20" : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={image.url}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
