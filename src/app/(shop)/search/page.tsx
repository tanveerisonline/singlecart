import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import ProductFilter from "@/components/ProductFilter";
import Link from "next/link";
import { Filter, SlidersHorizontal, ShoppingBag, LayoutGrid, List as ListIcon, Search as SearchIcon, PackageX, ArrowRight } from "lucide-react";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    categoryId?: string;
    brand?: string;
    brandId?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
    onSale?: string;
    rating?: string;
    tag?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const categorySlug = params.category || "";
  const categoryId = params.categoryId || "";
  const brandSlug = params.brand || "";
  const brandId = params.brandId || "";
  const tagSlug = params.tag || "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const inStock = params.inStock === "true";
  const onSale = params.onSale === "true";
  const rating = params.rating ? parseInt(params.rating) : undefined;
  const page = params.page ? parseInt(params.page) : 1;
  const limit = 12;

  // Split multi-word queries
  const words = query.trim().split(/\s+/).filter(w => w.length > 0);

  const where: any = {
    isActive: true,
    AND: words.map(word => ({
      OR: [
        { name: { contains: word } },
        { description: { contains: word } },
        { tags: { some: { name: { contains: word } } } },
      ],
    }))
  };

  if (categorySlug) where.AND.push({ category: { slug: categorySlug } });
  if (categoryId) where.AND.push({ categoryId: categoryId });
  if (brandSlug) where.AND.push({ brand: { slug: brandSlug } });
  if (brandId) where.AND.push({ brandId: brandId });
  if (tagSlug) where.AND.push({ tags: { some: { slug: tagSlug } } });
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceRange: any = {};
    if (minPrice !== undefined) priceRange.gte = minPrice;
    if (maxPrice !== undefined) priceRange.lte = maxPrice;
    where.AND.push({ price: priceRange });
  }

  if (inStock) where.AND.push({ stock: { gt: 0 } });
  
  if (onSale) {
    where.AND.push({
      OR: [
        { discount: { gt: 0 } },
        { compareAtPrice: { gt: 0 } }
      ]
    });
  }

  const products = await db.product.findMany({
    where,
    include: {
      images: { take: 1 },
      category: true,
      brand: true,
      reviews: { select: { rating: true } }
    },
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

  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / limit);
  const skip = (page - 1) * limit;
  const paginatedProducts = filteredProducts.slice(skip, skip + limit);

  const categories = await db.category.findMany({
    where: { isActive: true }
  });

  // Base URL for pagination links
  const createPageUrl = (pageNumber: number) => {
    const searchParams = new URLSearchParams();
    if (query) searchParams.set("q", query);
    if (categorySlug) searchParams.set("category", categorySlug);
    if (categoryId) searchParams.set("categoryId", categoryId);
    if (brandSlug) searchParams.set("brand", brandSlug);
    if (brandId) searchParams.set("brandId", brandId);
    if (tagSlug) searchParams.set("tag", tagSlug);
    if (minPrice) searchParams.set("minPrice", minPrice.toString());
    if (maxPrice) searchParams.set("maxPrice", maxPrice.toString());
    if (inStock) searchParams.set("inStock", "true");
    if (onSale) searchParams.set("onSale", "true");
    if (rating) searchParams.set("rating", rating.toString());
    searchParams.set("page", pageNumber.toString());
    return `/search?${searchParams.toString()}`;
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Search Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-gray-50 pb-10">
           <div className="space-y-2">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">
                {query ? `Results: ${query}` : categorySlug ? `Category: ${categorySlug.replace(/-/g, ' ')}` : tagSlug ? `Tag: #${tagSlug}` : "Store Collection"}
              </h1>
              <div className="flex items-center gap-3 text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                 <ShoppingBag className="h-3 w-3 text-primary" />
                 <span>{totalProducts} Items Found</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 group">
                 <input 
                   type="text" 
                   defaultValue={query}
                   placeholder="Search within results..." 
                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none"
                 />
                 <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
              </div>
              <ProductFilter />
           </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3 space-y-10">
            <div className="sticky top-32 space-y-10">
               <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                     <Filter className="h-4 w-4 text-primary" />
                     <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Categories</h2>
                  </div>
                  <ul className="space-y-2">
                    <li>
                      <Link 
                        href="/search" 
                        className={`flex items-center justify-between p-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${!categorySlug ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" : "text-gray-400 hover:bg-gray-50 hover:text-primary"}`}
                      >
                        All Products
                        <ChevronRight className={`h-3 w-3 ${!categorySlug ? "opacity-100" : "opacity-0"}`} />
                      </Link>
                    </li>
                    {categories.map((category) => (
                      <li key={category.id}>
                        <Link
                          href={`/search?category=${category.slug}${query ? `&q=${query}` : ""}`}
                          className={`flex items-center justify-between p-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${categorySlug === category.slug ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" : "text-gray-400 hover:bg-gray-50 hover:text-primary"}`}
                        >
                          {category.name}
                          <ChevronRight className={`h-3 w-3 ${categorySlug === category.slug ? "opacity-100" : "opacity-0"}`} />
                        </Link>
                      </li>
                    ))}
                  </ul>
               </div>

               <div className="p-8 bg-gray-900 rounded-[2rem] text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                     <ShoppingBag className="h-24 w-24" />
                  </div>
                  <div className="relative z-10 space-y-4">
                     <span className="text-primary font-black text-[8px] uppercase tracking-[0.3em]">Season Sale</span>
                     <h3 className="text-xl font-black uppercase tracking-tight leading-tight">Get Up To <br /> <span className="text-primary italic">50% Off</span></h3>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Limited time offer on premium items.</p>
                     <button className="w-full bg-white text-gray-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Shop Now</button>
                  </div>
               </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9 mt-10 lg:mt-0">
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100 space-y-6">
                <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                   <PackageX className="h-8 w-8 text-gray-200" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">No products found</h2>
                   <p className="text-gray-400 text-sm font-medium">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
                <Link href="/search" className="inline-block bg-primary text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all">Clear All Filters</Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product as any} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-between border-t border-gray-50 pt-8">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Showing {skip + 1} to {Math.min(skip + limit, totalProducts)} of {totalProducts}
                    </p>
                    <div className="flex items-center gap-2">
                      {page > 1 ? (
                        <Link href={createPageUrl(page - 1)} className="px-5 py-3 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-primary transition-all">
                          Previous
                        </Link>
                      ) : (
                        <button disabled className="px-5 py-3 rounded-2xl border border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-300 cursor-not-allowed">Previous</button>
                      )}

                      <div className="hidden sm:flex items-center gap-1 mx-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <Link
                            key={p}
                            href={createPageUrl(p)}
                            className={`w-10 h-10 flex items-center justify-center rounded-2xl text-[10px] font-black transition-all ${
                              page === p
                                ? "bg-gray-900 text-white shadow-xl shadow-gray-900/20"
                                : "text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-100"
                            }`}
                          >
                            {p}
                          </Link>
                        ))}
                      </div>

                      {page < totalPages ? (
                        <Link href={createPageUrl(page + 1)} className="px-5 py-3 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-primary transition-all">
                          Next
                        </Link>
                      ) : (
                        <button disabled className="px-5 py-3 rounded-2xl border border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-300 cursor-not-allowed">Next</button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
