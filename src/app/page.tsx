import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import HomeSlider from "@/components/HomeSlider";
import { 
  Sparkles, 
  Zap, 
  TrendingUp, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones,
  ArrowRight,
  Mail
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default async function Home() {
  const products = await db.product.findMany({
    include: {
      images: true,
      category: true,
    },
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const categories = await db.category.findMany({
    where: { isActive: true },
    take: 6,
  });

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const trendingProducts = products.filter(p => p.isTrending).slice(0, 8);
  const newArrivals = products.slice(0, 8);

  return (
    <div className="bg-white space-y-20 pb-20">
      {/* Hero Section */}
      <HomeSlider />

      {/* Trust Signals */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 py-10 border-y border-gray-50">
          <div className="flex items-center gap-4 group">
            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Free Shipping</h3>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">Orders over $100</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Secure Payment</h3>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">100% Protected</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <RotateCcw className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Easy Returns</h3>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">30 Days Guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Headphones className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">24/7 Support</h3>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">Dedicated Team</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Explorer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div className="space-y-2">
            <span className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Explore Collections</span>
            <h2 className="text-3xl font-black text-gray-900">Shop by Category</h2>
          </div>
          <Link href="/search" className="text-sm font-bold text-primary hover:gap-3 flex items-center gap-2 transition-all">
            View All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/search?category=${category.slug}`}
              className="group text-center space-y-4"
            >
              <div className="relative aspect-square rounded-full overflow-hidden bg-gray-50 border-2 border-transparent group-hover:border-primary transition-all p-2">
                <div className="relative h-full w-full rounded-full overflow-hidden">
                  <Image
                    src={category.imageUrl || "/placeholder-category.jpg"}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest group-hover:text-primary transition-colors">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Selection */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-900 rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
          <div className="relative grid grid-cols-1 lg:grid-cols-2 items-center">
            <div className="p-12 lg:p-20 space-y-8">
              <div className="space-y-4">
                <span className="bg-primary/20 text-primary-foreground text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest inline-block border border-primary/20 backdrop-blur-sm">
                  Limited Edition
                </span>
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                  Premium Selection <br />
                  <span className="text-primary italic">Featured Picks</span>
                </h2>
                <p className="text-gray-400 text-lg max-w-md leading-relaxed">
                  Discover our hand-picked selection of high-quality products designed for your lifestyle.
                </p>
              </div>
              <Link 
                href="/search" 
                className="inline-flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-primary transition-all shadow-xl shadow-primary/20"
              >
                Shop The Collection <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 p-8 lg:p-12 bg-white/5 backdrop-blur-md">
              {featuredProducts.map((product) => (
                <div key={product.id} className="scale-90 hover:scale-100 transition-transform duration-500">
                   <ProductCard product={product as any} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 bg-primary"></div>
              <span className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">Hot Right Now</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900">Trending Now</h2>
          </div>
          <div className="flex gap-2">
             <button className="h-10 w-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all">
                <ArrowRight className="h-5 w-5 rotate-180" />
             </button>
             <button className="h-10 w-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all">
                <ArrowRight className="h-5 w-5" />
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {trendingProducts.length > 0 ? (
            trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))
          ) : (
             newArrivals.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))
          )}
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="group relative h-[300px] rounded-[2rem] overflow-hidden bg-gray-100">
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10"></div>
              <div className="relative z-20 h-full p-10 flex flex-col justify-center space-y-4">
                 <span className="text-white/80 font-bold text-[10px] uppercase tracking-widest">New Arrivals</span>
                 <h3 className="text-3xl font-black text-white">Modern Lifestyle <br /> Essential Kits</h3>
                 <Link href="/search" className="text-white font-bold text-sm underline underline-offset-8 decoration-primary decoration-2 hover:text-primary transition-colors">
                    Explore Now
                 </Link>
              </div>
           </div>
           <div className="group relative h-[300px] rounded-[2rem] overflow-hidden bg-gray-900">
              <div className="absolute inset-0 bg-primary/10 z-10"></div>
              <div className="relative z-20 h-full p-10 flex flex-col justify-center space-y-4">
                 <span className="text-primary font-bold text-[10px] uppercase tracking-widest">Best Deals</span>
                 <h3 className="text-3xl font-black text-white">Seasonal Sale <br /> Up to 50% Off</h3>
                 <Link href="/search" className="inline-flex items-center justify-center h-12 px-8 bg-white text-gray-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                    Shop The Sale
                 </Link>
              </div>
           </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
         <div className="bg-primary rounded-[3rem] p-12 lg:p-20 text-center space-y-10 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 h-60 w-60 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 h-60 w-60 bg-black/10 rounded-full blur-3xl"></div>
            
            <div className="max-w-2xl mx-auto space-y-4 relative z-10">
               <div className="flex items-center justify-center gap-3 text-white/80 mb-6">
                  <Mail className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-[0.3em]">Join the Club</span>
               </div>
               <h2 className="text-4xl md:text-5xl font-black text-white">Subscribe to get 20% off <br /> your first order</h2>
               <p className="text-white/70 text-sm font-medium leading-relaxed">
                  Be the first to know about new arrivals, exclusive collections, and seasonal sales.
               </p>
            </div>

            <div className="max-w-md mx-auto relative z-10">
               <form className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:bg-white focus:text-gray-900 focus:outline-none transition-all font-medium text-sm"
                  />
                  <button className="bg-white text-primary px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-xl">
                    Join Now
                  </button>
               </form>
               <p className="text-[10px] text-white/40 mt-4 font-medium uppercase tracking-widest">
                  Secure & Spam-free. Unsubscribe anytime.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
