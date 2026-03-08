import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import ReviewForm from "@/components/ReviewForm";
import ProductImageGallery from "@/components/ProductImageGallery";
import { Star } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
  });

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      type: "article",
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: {
      slug,
    },
    include: {
      images: true,
      category: true,
      reviews: {
        where: {
          isApproved: true,
        },
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const averageRating = product.reviews.length > 0 
    ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length 
    : 0;

  return (
    <div className="bg-white">
      <div className="pt-6">
        <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-2 lg:gap-x-12">
          {/* Left Column: Image Gallery */}
          <div className="mb-10 lg:mb-0">
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Product Info */}
          <div className="mt-4 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {product.name}
            </h1>
            
            <div className="mt-3 flex items-center">
               <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.round(averageRating) ? "fill-current" : "text-gray-300"}`} />
                  ))}
               </div>
               <p className="ml-3 text-sm text-gray-500">{product.reviews.length} reviews</p>
            </div>

            <p className="mt-6 text-3xl font-medium tracking-tight text-gray-900">
              ${product.price.toFixed(2)}
            </p>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <div className="mt-2 space-y-6 text-base text-gray-700">
                {product.description}
              </div>
            </div>

            <div className="mt-10">
              <AddToCartButton product={product as any} />
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
               <h3 className="text-sm font-medium text-gray-900">Category</h3>
               <p className="mt-2 text-sm text-gray-500">{product.category.name}</p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t mt-16">
           <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
              <div className="lg:col-span-4">
                 <ReviewForm productId={product.id} />
              </div>
              <div className="lg:col-span-8 mt-12 lg:mt-0">
                 <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                 {product.reviews.length === 0 ? (
                    <p className="text-gray-500">No approved reviews yet. Be the first to review this product!</p>
                 ) : (
                    <div className="space-y-8">
                       {product.reviews.map((review) => (
                          <div key={review.id} className="border-b pb-8">
                             <div className="flex items-center mb-2">
                                <div className="flex text-yellow-400 mr-2">
                                   {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`} />
                                   ))}
                                </div>
                                <span className="font-bold text-sm">{review.title}</span>
                             </div>
                             <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                             <div className="flex items-center text-xs text-gray-400">
                                <span className="font-medium text-gray-900">{review.user.name || "Anonymous"}</span>
                                <span className="mx-2">•</span>
                                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

