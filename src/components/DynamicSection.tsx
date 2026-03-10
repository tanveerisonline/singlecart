import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  discountText: string | null;
  bgColor: string | null;
  textColor: string | null;
  imageUrl: string | null;
  className: string | null;
}

interface DynamicSectionProps {
  section: {
    id: string;
    name: string;
    layout: string;
    containerClassName: string | null;
    banners: Banner[];
  };
}

export default function DynamicSection({ section }: DynamicSectionProps) {
  const { layout, banners, containerClassName } = section;
  const activeBanners = banners.filter(b => b);

  if (activeBanners.length === 0) return null;

  const getLayoutClasses = () => {
    switch (layout) {
      case "FULL_WIDTH":
        return "grid-cols-1";
      case "TWO_COLUMNS":
        return "grid-cols-1 md:grid-cols-2";
      case "THREE_COLUMNS":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case "ROW":
        return "flex flex-nowrap overflow-x-auto pb-4 scrollbar-hide gap-4";
      case "GRID":
        return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      default:
        return "grid-cols-1";
    }
  };

  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${containerClassName || ""}`}>
      <div className={`${layout === "ROW" ? getLayoutClasses() : `grid gap-6 ${getLayoutClasses()}`}`}>
        {activeBanners.map((banner) => (
          <BannerItem key={banner.id} banner={banner} layout={layout} />
        ))}
      </div>
    </section>
  );
}

function BannerItem({ banner, layout }: { banner: Banner; layout: string }) {
  const isDark = (color: string) => {
    // Simple hex brightness check or just trust user selection
    return true; // Defaulting to light text if dark bg, etc.
  };

  return (
    <div 
      className={`relative rounded-3xl overflow-hidden group min-h-[300px] flex flex-col justify-center p-8 sm:p-12 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${layout === "ROW" ? "min-w-[300px] sm:min-w-[400px]" : "w-full"} ${banner.className || ""}`}
      style={{ 
        backgroundColor: banner.bgColor || "#f3f4f6",
        color: banner.textColor || "#111827"
      }}
    >
      {banner.imageUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={banner.imageUrl}
            alt={banner.title || "Banner"}
            fill
            className="object-cover opacity-100 group-hover:scale-105 transition-transform duration-700"
          />
          {/* Subtle overlay if there's text to ensure readability */}
          {(banner.title || banner.subtitle) && (
            <div className="absolute inset-0 bg-black/5" />
          )}
        </div>
      )}

      <div className="relative z-10 max-w-lg">
        {banner.discountText && (
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-black text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm border border-black/5">
            {banner.discountText}
          </span>
        )}
        
        {banner.subtitle && (
          <h4 className="text-sm sm:text-base font-bold uppercase tracking-widest mb-2 opacity-90 drop-shadow-sm">
            {banner.subtitle}
          </h4>
        )}
        
        {banner.title && (
          <h2 className="text-3xl sm:text-5xl font-black mb-4 leading-tight drop-shadow-md">
            {banner.title}
          </h2>
        )}
        
        {banner.description && (
          <p className="text-sm sm:text-base mb-8 opacity-80 max-w-md font-medium leading-relaxed">
            {banner.description}
          </p>
        )}
        
        {banner.buttonText && (
          <Link 
            href={banner.buttonLink || "#"}
            className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:bg-black hover:text-white group/btn shadow-xl shadow-black/5 hover:shadow-black/20"
          >
            {banner.buttonText}
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
}
