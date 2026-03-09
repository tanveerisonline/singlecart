"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface SliderImage {
  id: string;
  title: string | null;
  link: string | null;
  imageUrl: string;
}

export default function HomeSlider() {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/admin/slider");
        const data = await response.json();
        const activeImages = data.filter((img: any) => img.isActive);
        setImages(activeImages);
      } catch (error) {
        console.error("Error fetching slider images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Hydration fix: Always render the placeholder on the server and initial client pass
  if (!mounted || loading) {
    return (
      <div className="h-[400px] md:h-[500px] lg:h-[600px] w-full bg-gray-100 animate-pulse flex items-center justify-center">
        <div className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Slider...</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="h-[400px] md:h-[500px] lg:h-[600px] w-full bg-gray-900 flex items-center justify-center">
        <div className="text-white font-bold uppercase tracking-widest text-xs">No active slides found</div>
      </div>
    );
  }

  return (
    <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={images[currentIndex].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="relative h-full w-full"
        >
          <Image
            src={images[currentIndex].imageUrl}
            alt={images[currentIndex].title || "Slider Image"}
            fill
            priority
            className="object-cover"
          />
          {images[currentIndex].title && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight"
                >
                  {images[currentIndex].title}
                </motion.h2>
                {images[currentIndex].link && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link
                      href={images[currentIndex].link!}
                      className="inline-block bg-white text-gray-900 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl"
                    >
                      Shop Now
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-gray-900 text-white transition-all flex items-center justify-center group z-30"
          >
            <ChevronLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-gray-900 text-white transition-all flex items-center justify-center group z-30"
          >
            <ChevronRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === currentIndex ? "bg-white w-10" : "bg-white/30 w-2 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
