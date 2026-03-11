import { useState, useRef, MouseEvent } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  videoUrl?: string | null;
}

export default function ProductImageGallery({ images, productName, videoUrl }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to get embed URL
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const id = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('vimeo.com')) {
      const id = url.split('/').pop();
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  };

  const isVideoActive = videoUrl && activeIndex === images.length;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isVideoActive) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No images available</span>
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="space-y-4">
      {/* Main Display */}
      <div 
        ref={containerRef}
        className={`relative aspect-square overflow-hidden rounded-[2rem] bg-gray-50 border border-gray-100 ${!isVideoActive ? 'cursor-zoom-in' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => !isVideoActive && setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
      >
        {isVideoActive ? (
          <iframe
            src={getEmbedUrl(videoUrl!)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <>
            <Image
              src={activeImage.url}
              alt={activeImage.alt || productName}
              fill
              priority
              className={`object-cover transition-opacity duration-300 ${showZoom ? 'opacity-0' : 'opacity-100'}`}
            />
            
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
          </>
        )}
      </div>

      {/* Thumbnails */}
      {(images.length > 1 || videoUrl) && (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(index)}
              className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${
                activeIndex === index ? "border-primary shadow-lg scale-105" : "border-transparent hover:border-gray-200"
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
          {videoUrl && (
            <button
              onClick={() => setActiveIndex(images.length)}
              className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all bg-gray-900 flex flex-col items-center justify-center gap-1 ${
                activeIndex === images.length ? "border-primary shadow-lg scale-105" : "border-transparent hover:border-gray-800"
              }`}
            >
              <div className="p-2 bg-white/10 rounded-full">
                <Play className="h-6 w-6 text-white fill-current" />
              </div>
              <span className="text-[8px] font-black uppercase text-white tracking-widest">Watch Video</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
