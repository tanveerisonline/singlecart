"use client";

import { useState, useEffect, useMemo } from "react";
import { Product, ProductImage, Category, Review, Tag, ProductVariant, Brand, ThemeSetting } from "@prisma/client";
import { 
  Star, Check, Info, ShieldCheck, Truck, RefreshCw, ChevronRight, 
  Tag as TagIcon, Layers, Award, Package, Ruler, Weight as WeightIcon, 
  Settings, Share2, Eye, ShoppingCart, Sparkles, Zap, Timer, 
  ShieldAlert, CreditCard, Facebook, Twitter, Mail, Box
} from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import ProductImageGallery from "@/components/ProductImageGallery";
import ReviewForm from "@/components/ReviewForm";
import ProductCarousel from "@/components/ProductCarousel";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";

interface ProductWithRelations extends Product {
  images: ProductImage[];
  category: Category;
  tags: Tag[];
  variants: ProductVariant[];
  brand: Brand | null;
  reviews: (Review & { user: { name: string | null }, images: { url: string }[] })[];
}

interface ProductPageClientProps {
  product: ProductWithRelations;
  relatedProducts: any[];
  recentProducts: any[];
  crossSellProducts: any[];
  theme?: ThemeSetting | null;
}

export default function ProductPageClient({ 
  product, 
  relatedProducts, 
  recentProducts,
  crossSellProducts,
  theme
}: ProductPageClientProps) {
  const cart = useCart();
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants.length > 0 ? product.variants[0] : undefined
  );
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">("description");
  const [randomOrderCount, setRandomOrderCount] = useState(0);
  const [randomViewCount, setRandomViewCount] = useState(0);

  useEffect(() => {
    if (product.isEncourageOrder) {
      setRandomOrderCount(Math.floor(Math.random() * 99) + 1);
    }
    if (product.isEncourageView) {
      setRandomViewCount(Math.floor(Math.random() * 45) + 5);
    }

    // Handle Recently Viewed
    const recentlyViewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    const updatedRecentlyViewed = [
      {
        ...product, // Store the full product object
        category: product.category, // Ensure related fields are included
        images: product.images,
        brand: product.brand,
      },
      ...recentlyViewed.filter((p: any) => p.id !== product.id)
    ].slice(0, 10);
    localStorage.setItem("recentlyViewed", JSON.stringify(updatedRecentlyViewed));
  }, [product]);

  const averageRating = useMemo(() => 
    product.reviews.length > 0 
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
      : 0,
    [product.reviews]
  );

  const currentPrice = selectedVariant?.price || product.price;
  const originalPrice = product.compareAtPrice || (product.discount > 0 ? product.price / (1 - product.discount / 100) : null);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = product.name;
    let shareUrl = "";

    switch(platform) {
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`; break;
      case 'email': shareUrl = `mailto:?subject=${title}&body=${url}`; break;
    }
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  const onBuyNow = () => {
    cart.clearCart();
    cart.addItem(product as any, selectedVariant);
    router.push("/checkout");
  };

  const isOutOfStock = !product.isActive || (selectedVariant ? selectedVariant.stock === 0 : product.stock === 0);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-xs font-bold uppercase tracking-widest text-gray-400">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3 mx-2" />
          <Link href={`/search?category=${product.category.slug}`} className="hover:text-primary transition-colors">{product.category.name}</Link>
          <ChevronRight className="h-3 w-3 mx-2" />
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 items-start">
          {/* Left: Gallery */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-4 rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative">
                <ProductImageGallery 
                  images={product.images} 
                  productName={product.name} 
                  videoUrl={product.videoUrl}
                />
                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                  {product.isFeatured && (
                    <div className="bg-primary text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                      <Sparkles className="h-3.5 w-3.5" /> Featured
                    </div>
                  )}
                  {product.isTrending && (
                    <div className="bg-rose-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                      <Zap className="h-3.5 w-3.5" /> Trending
                    </div>
                  )}
                  {product.isFreeShipping && (
                    <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                      <Truck className="h-3.5 w-3.5" /> Free Shipping
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Engagement Bar */}
            {(product.isEncourageOrder || product.isEncourageView) && (
              <div className="flex gap-4">
                {product.isEncourageOrder && (
                  <div className="flex-1 bg-emerald-50 border border-emerald-100 p-4 rounded-[24px] flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-emerald-900 uppercase tracking-tighter">{randomOrderCount} people</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase">Bought this today</p>
                    </div>
                  </div>
                )}
                {product.isEncourageView && (
                  <div className="flex-1 bg-primary/10 border border-primary/20 p-4 rounded-[24px] flex items-center gap-3">
                    <div className="p-2 bg-primary/20 text-primary rounded-xl">
                      <Eye className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-primary/90 uppercase tracking-tighter">{randomViewCount} users</p>
                      <p className="text-[10px] text-primary font-bold uppercase">Viewing right now</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-5 mt-10 lg:mt-0 space-y-8">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {product.tags.map(tag => (
                    <Link 
                      key={tag.id} 
                      href={`/search?tag=${tag.slug}`}
                      className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 hover:text-white transition-all border border-gray-100"
                    >
                      #{tag.name}
                    </Link>
                  ))}
                </div>
                
                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                    <Star className="h-4 w-4 text-amber-500 fill-current" />
                    <span className="ml-1.5 text-sm font-black text-amber-700">{averageRating.toFixed(1)}</span>
                    <span className="mx-2 text-amber-200">|</span>
                    <span className="text-xs font-bold text-amber-600">{product.reviews.length} Reviews</span>
                  </div>
                  {product.brand && (
                    <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-tighter">
                      <Award className="h-4 w-4 mr-1.5 text-primary" />
                      {product.brand.name}
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Delivery */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-primary">${currentPrice.toFixed(2)}</span>
                  {originalPrice && originalPrice > currentPrice && (
                    <span className="text-lg text-gray-400 line-through font-bold">${originalPrice.toFixed(2)}</span>
                  )}
                  {product.discount > 0 && (
                    <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-lg text-xs font-black uppercase">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>
                {product.estimatedDeliveryText && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    <Timer className="h-3.5 w-3.5" />
                    {product.estimatedDeliveryText}
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                {product.shortDescription || product.description.substring(0, 200) + "..."}
              </p>

              {/* Variants */}
              {product.variants.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Select Option</label>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-5 py-3 rounded-2xl text-xs font-black transition-all border-2 ${
                          selectedVariant?.id === v.id
                            ? "border-primary bg-primary/10 text-primary shadow-md"
                            : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <AddToCartButton 
                      product={product as any} 
                      variant={selectedVariant}
                      disabled={isOutOfStock} 
                    />
                  </div>
                  <button
                    onClick={onBuyNow}
                    disabled={isOutOfStock}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl text-base font-black uppercase tracking-widest hover:bg-black transition-all active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-xl"
                  >
                    <Zap className="h-5 w-5 text-amber-400" />
                    Buy Now
                  </button>
                </div>
                
                {/* Social Share */}
                {product.isSocialShare && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Share Product</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleShare('facebook')} className="p-2 bg-white rounded-lg text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"><Facebook className="h-4 w-4" /></button>
                      <button onClick={() => handleShare('twitter')} className="p-2 bg-white rounded-lg text-sky-500 hover:bg-sky-50 transition-colors shadow-sm"><Twitter className="h-4 w-4" /></button>
                      <button onClick={() => handleShare('email')} className="p-2 bg-white rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"><Mail className="h-4 w-4" /></button>
                    </div>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="flex flex-col gap-4 pt-2">
                  {product.isSafeCheckout && (
                    <div className="relative h-16 w-full">
                      <Image 
                        src={theme?.safeCheckoutImage || "/safe-checkout.svg"} 
                        alt="Safe Checkout" 
                        fill 
                        className="object-contain object-left"
                      />
                    </div>
                  )}
                  {product.isSecureCheckout && (
                    <div className="relative h-16 w-full">
                      <Image 
                        src={theme?.secureCheckoutImage || "/secure-payment.svg"} 
                        alt="Secure Payment" 
                        fill 
                        className="object-contain object-left"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Features Info */}
            <div className="bg-gray-900 rounded-[32px] p-8 text-white shadow-2xl shadow-gray-900/20 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110">
                 <ShieldCheck className="h-40 w-40" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight relative z-10 flex items-center gap-3">
                Purchase Protection
                <div className="h-1 flex-1 bg-white/10 rounded-full"></div>
              </h3>
              <div className="grid grid-cols-1 gap-4 relative z-10">
                {[
                  { icon: RefreshCw, title: product.isReturnable ? "Hassle Free Returns" : "Final Sale", desc: product.isReturnable ? (product.returnPolicyText || "30-day money back guarantee") : "This item is not returnable" },
                  { icon: ShieldCheck, title: "Secure Transactions", desc: "Your data is encrypted and safe" },
                  { icon: Truck, title: product.isFreeShipping ? "Free Delivery" : "Fast Shipping", desc: product.estimatedDeliveryText || "Reliable shipping to your doorstep" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 bg-white/5 p-5 rounded-[1.5rem] backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="p-3 bg-white/10 rounded-xl text-white mt-0.5">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black tracking-wide">{item.title}</p>
                      <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Tabs Section */}
        <div className="mt-20 lg:col-span-12">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-wrap border-b border-gray-50 bg-gray-50/30 p-3 gap-2">
              {[
                { id: "description", label: "Description", icon: Layers },
                { id: "specifications", label: "Specifications", icon: Settings },
                { id: "reviews", label: "Reviews", icon: Star }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-8 py-4 rounded-[24px] text-sm font-black transition-all ${
                    activeTab === tab.id 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === "reviews" && <span className="ml-1 opacity-50">({product.reviews.length})</span>}
                </button>
              ))}
            </div>

            <div className="p-10">
              {activeTab === "description" && (
                <div className="prose prose-primary max-w-none">
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
                    {product.description}
                  </div>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <h4 className="text-xl font-black text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <Package className="h-5 w-5" />
                      </div>
                      Basic Info
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { label: "SKU", value: selectedVariant?.sku || product.sku, icon: TagIcon },
                        { label: "Category", value: product.category.name, icon: Layers },
                        { label: "Brand", value: product.brand?.name || "Generic", icon: Award },
                        { label: "Weight", value: product.weight ? `${product.weight} Gms` : "N/A", icon: WeightIcon }
                      ].map((spec, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                          <div className="flex items-center gap-3">
                            <spec.icon className="h-4 w-4 text-gray-400" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{spec.label}</span>
                          </div>
                          <span className="text-sm font-black text-gray-900">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h4 className="text-xl font-black text-gray-900 flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      Policies & Shipping
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { label: "Return Policy", value: product.isReturnable ? "Available" : "Not Returnable", icon: RefreshCw },
                        { label: "Tax", value: `${product.tax}% Included`, icon: ShieldAlert },
                        { label: "Stock", value: (selectedVariant?.stock || product.stock) + " units", icon: Check },
                        ...(product.showDimensions ? [{ label: "Size (LxWxH)", value: `${product.length}x${product.width}x${product.height} cm`, icon: Ruler }] : [])
                      ].map((spec, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                          <div className="flex items-center gap-3">
                            <spec.icon className="h-4 w-4 text-gray-400" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{spec.label}</span>
                          </div>
                          <span className="text-sm font-black text-gray-900">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                  <div className="lg:col-span-4">
                    <div className="sticky top-8">
                      <ReviewForm productId={product.id} />
                    </div>
                  </div>
                  <div className="lg:col-span-8 mt-12 lg:mt-0">
                    <h2 className="text-2xl font-black mb-8 text-gray-900">Customer Feedback</h2>
                    {product.reviews.length === 0 ? (
                      <div className="bg-gray-50 p-12 rounded-[32px] text-center border-2 border-dashed border-gray-200">
                        <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500 font-bold">No approved reviews yet.</p>
                        <p className="text-gray-400 text-xs mt-1">Be the first to share your experience!</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {product.reviews.map((review) => (
                          <div key={review.id} className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                              <div className="space-y-1">
                                <div className="flex text-amber-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
                                  ))}
                                </div>
                                <h4 className="font-black text-gray-900">{review.title}</h4>
                              </div>
                              <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 px-2 py-1 rounded-md">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4">{review.comment}</p>
                            
                            {review.images && review.images.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {review.images.map((img, idx) => (
                                  <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
                                    <Image 
                                      src={img.url} 
                                      alt={`Review image ${idx + 1}`} 
                                      fill 
                                      className="object-cover transition-transform group-hover:scale-110" 
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20 uppercase">
                                {review.user.name?.[0] || "U"}
                              </div>
                              <span className="text-xs font-black text-gray-900">{review.user.name || "Verified Customer"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Sections */}
        <div className="mt-20 space-y-16">
          {crossSellProducts.length > 0 && (
            <ProductCarousel 
              title="Frequently Bought Together" 
              products={crossSellProducts} 
              autoSlide={true}
            />
          )}
          <ProductCarousel 
            title="Related Products" 
            products={relatedProducts} 
            autoSlide={true}
          />
          <ProductCarousel 
            title="Recently Added" 
            products={recentProducts} 
            autoSlide={true}
          />
        </div>
      </div>
    </div>
  );
}
