import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import HomeSlider from "@/components/HomeSlider";
import { Sparkles, Zap, TrendingUp, ShoppingBag } from "lucide-react";

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

  const settings = await db.storeSetting.findUnique({
    where: { id: "default" },
  });

  const layout = settings?.homeLayout || "default";

  // Layout 1: Default (Standard with Slider)
  if (layout === "default") {
    return (
      <div className="bg-white">
        <HomeSlider />
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              New Arrivals
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl text-gray-500">
              No products available at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Layout 2: Grid Focus (No Slider, clean grid)
  if (layout === "grid") {
    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <div className="bg-white border-b py-12 mb-12">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Our Catalog</h1>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Discover our full range of premium products selected just for you.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Layout 3: Elegant Premium (Centered typography, elegant spacing)
  if (layout === "elegant") {
    return (
      <div className="bg-[#fafafa] min-h-screen">
        <HomeSlider />
        <div className="mx-auto max-w-7xl px-4 py-24">
          <div className="text-center mb-20 space-y-4">
            <span className="text-indigo-600 font-bold tracking-[0.2em] text-xs uppercase">Premium Selection</span>
            <h2 className="text-5xl font-serif text-gray-900">Featured Curations</h2>
            <div className="h-1 w-20 bg-indigo-600 mx-auto mt-4"></div>
          </div>
          
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <ProductCard product={product as any} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Layout 4: Compact Dense (High density, informative)
  if (layout === "compact") {
    return (
      <div className="bg-white">
        <div className="bg-indigo-900 text-white py-2 text-center text-sm font-medium">
          Free shipping on all orders over ${settings?.freeShippingThreshold || 100}
        </div>
        <div className="mx-auto max-w-[1600px] px-4 py-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-widest">Shop All</h2>
            </div>
            <div className="text-sm text-gray-500 font-medium">{products.length} Products</div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
