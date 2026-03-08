import { db } from "@/lib/db";
import ProductCard from "@/components/ProductCard";

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  const categorySlug = searchParams.category || "";

  const products = await db.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query } },
        { description: { contains: query } },
        { tags: { contains: query } },
      ],
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    include: {
      images: true,
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const categories = await db.category.findMany();

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {query ? `Search results for "${query}"` : "All Products"}
        </h1>

        <div className="mt-8 lg:grid lg:grid-cols-4 lg:gap-x-8">
          {/* Filters */}
          <aside>
            <h2 className="text-sm font-semibold text-gray-900">Categories</h2>
            <ul className="mt-4 space-y-2 border-b border-gray-200 pb-6 text-sm font-medium text-gray-700">
              <li>
                <a href="/search" className={!categorySlug ? "text-indigo-600 font-bold" : ""}>
                  All
                </a>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <a
                    href={`/search?category=${category.slug}${query ? `&q=${query}` : ""}`}
                    className={categorySlug === category.slug ? "text-indigo-600 font-bold" : ""}
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {products.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No products found matching your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as any} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
