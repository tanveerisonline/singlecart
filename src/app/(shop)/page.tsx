import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import HomeSlider from "@/components/HomeSlider";
import DynamicSection from "@/components/DynamicSection";
import ProductFilter from "@/components/ProductFilter";
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
  Mail,
  Search,
  PackageX
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const categoryId = params.categoryId as string | undefined;
  const brandId = params.brandId as string | undefined;
  const minPrice = params.minPrice ? parseFloat(params.minPrice as string) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice as string) : undefined;
  const inStock = params.inStock === "true";
  const onSale = params.onSale === "true";
  const rating = params.rating ? parseInt(params.rating as string) : undefined;

  const where: any = { isActive: true };
  if (categoryId) where.categoryId = categoryId;
  if (brandId) where.brandId = brandId;
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }
  
  if (inStock) where.stock = { gt: 0 };
  
  if (onSale) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { discount: { gt: 0 } },
          { compareAtPrice: { gt: 0 } }
        ]
      }
    ];
  }

  const products = await db.product.findMany({
    include: {
      images: true,
      category: true,
      reviews: { select: { rating: true } }
    },
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  // Client-side rating filter
  let filteredProducts = products;
  if (rating) {
    filteredProducts = products.filter(p => {
      if (p.reviews.length === 0) return false;
      const avg = p.reviews.reduce((acc, r) => acc + r.rating, 0) / p.reviews.length;
      return avg >= rating;
    });
  }

  const isFiltered = categoryId || brandId || minPrice || maxPrice || inStock || onSale || rating;

  const categories = await db.category.findMany({
    where: { isActive: true },
    take: 6,
  });

  const dynamicSections = await db.dynamicSection.findMany({
    where: {
      page: "HOME",
      isActive: true,
    },
    include: {
      banners: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const trendingProducts = products.filter(p => p.isTrending).slice(0, 8);
  const newArrivals = products.slice(0, 8);

  const topSections = dynamicSections.filter(s => s.location === "TOP");
  const middleSections = dynamicSections.filter(s => s.location === "MIDDLE");
  const beforeProductsSections = dynamicSections.filter(s => s.location === "BEFORE_PRODUCTS");
  const bottomSections = dynamicSections.filter(s => s.location === "BOTTOM");

  return (
    <div className="bg-white space-y-20 pb-20">
      {/* Dynamic Top Sections */}
      {topSections.map(section => (
        <DynamicSection key={section.id} section={section} />
      ))}

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

      {/* Dynamic Middle Sections (Priority) */}
      {middleSections.map(section => (
        <DynamicSection key={section.id} section={section} />
      ))}

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/search?category=${category.slug}`}
              className="group space-y-4"
            >
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-gray-100 border border-gray-50 group-hover:shadow-2xl group-hover:shadow-primary/20 transition-all duration-500">
                <Image
                  src={category.imageUrl || "/placeholder-category.svg"}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                   <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      Explore <ArrowRight className="h-3 w-3" />
                   </span>
                </div>
              </div>
              <div className="px-2">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  Discover Collection
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dynamic Before Products Sections */}
      {beforeProductsSections.map(section => (
        <DynamicSection key={section.id} section={section} />
      ))}


      {/* Trending Section / Product Listing */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="products">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1 w-8 bg-primary"></div>
              <span className="text-primary font-bold text-[10px] uppercase tracking-[0.2em]">
                {isFiltered ? "Filtered Results" : "Hot Right Now"}
              </span>
            </div>
            <h2 className="text-3xl font-black text-gray-900">
              {isFiltered ? `${filteredProducts.length} Products Found` : "Trending Now"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
             <ProductFilter />
             {!isFiltered && (
               <div className="flex gap-2">
                  <button className="h-10 w-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all">
                     <ArrowRight className="h-5 w-5 rotate-180" />
                  </button>
                  <button className="h-10 w-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all">
                     <ArrowRight className="h-5 w-5" />
                  </button>
               </div>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="bg-gray-50 h-20 w-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <PackageX className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">No products found</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto font-medium">
                Try adjusting your filters or search criteria to find what you're looking for.
              </p>
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mt-4 hover:gap-3 transition-all"
              >
                Clear all filters <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Bottom Sections */}
      {bottomSections.map(section => (
        <DynamicSection key={section.id} section={section} />
      ))}

      {/* Promotional Banner (Keeping as fallback or legacy) */}
      {dynamicSections.length === 0 && (
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
      )}

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
