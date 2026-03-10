import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { notFound } from "next/navigation";

interface CollectionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;

  let title = "";
  let description = "";
  let products: any[] = [];

  if (slug === "new-arrivals") {
    title = "New Arrivals";
    description = "Check out our latest products just added to the store.";
    products = await db.product.findMany({
      where: { isActive: true },
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  } else if (slug === "best-sellers") {
    title = "Best Sellers";
    description = "Our most popular products loved by customers.";
    // Simple logic: products with most order items (simulated if no real analytics)
    products = await db.product.findMany({
      where: { isActive: true },
      include: { 
        images: true, 
        category: true,
        _count: {
          select: { orderItems: true }
        }
      },
      orderBy: {
        orderItems: {
          _count: "desc"
        }
      },
      take: 20,
    });
  } else if (slug === "on-sale") {
    title = "On Sale";
    description = "Great deals on premium products. Grab them while they last!";
    products = await db.product.findMany({
      where: { 
        isActive: true,
        OR: [
            { compareAtPrice: { gt: db.product.fields.price } },
            { discount: { gt: 0 } }
        ]
      },
      include: { images: true, category: true },
      take: 20,
    });
  } else {
    // Check if it's a category slug
    const category = await db.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          include: { images: true, category: true }
        }
      }
    });

    if (!category) {
      notFound();
    }

    title = category.name;
    description = category.description || `Browse our ${category.name} collection.`;
    products = category.products;
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="border-b border-gray-100 pb-10 mb-10">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{title}</h1>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl">{description}</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">No products found in this collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
