import { Metadata } from "next";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductPageClient from "@/components/ProductPageClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    select: {
      name: true,
      description: true,
      metaTitle: true,
      metaDescription: true,
      metaImageUrl: true,
      thumbnailUrl: true,
    }
  });

  if (!product) return {};

  const title = product.metaTitle || product.name;
  const description = product.metaDescription || product.description?.substring(0, 160);
  const image = product.metaImageUrl || product.thumbnailUrl;

  return {
    title: `${title} | Shop`,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const [product, theme] = await Promise.all([
    db.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: {
            order: "asc",
          },
        },
        category: true,
        tags: true,
        variants: true,
        brand: true,
        reviews: {
          where: {
            isApproved: true,
          },
          include: {
            user: {
              select: {
                name: true,
              },
            },
            images: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    }),
    db.themeSetting.findFirst({
      where: { id: "default" }
    })
  ]);

  if (!product) {
    notFound();
  }

  // Fetch Related Products (Same category, excluding current)
  let relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    include: {
      images: true,
      category: true,
    },
    take: 15, // Take more if we want to shuffle
    orderBy: {
      createdAt: "desc",
    },
  });

  if (product.isRandomRelated && relatedProducts.length > 0) {
    relatedProducts = relatedProducts
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);
  } else {
    relatedProducts = relatedProducts.slice(0, 10);
  }

  // Fetch Recent Products
  const recentProducts = await db.product.findMany({
    where: {
      isActive: true,
      id: { not: product.id },
    },
    include: {
      images: true,
      category: true,
    },
    take: 10,
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch Cross-sell products if IDs exist
  let crossSellProducts: any[] = [];
  if (product.crossSellIds) {
    try {
      // Handle potential formats: JSON string array or comma-separated string
      let ids: string[] = [];
      if (product.crossSellIds.startsWith('[')) {
        ids = JSON.parse(product.crossSellIds);
      } else {
        ids = product.crossSellIds.split(',').map(id => id.trim()).filter(id => id);
      }

      if (ids.length > 0) {
        crossSellProducts = await db.product.findMany({
          where: {
            id: { in: ids },
            isActive: true,
          },
          include: {
            images: true,
            category: true,
          }
        });
      }
    } catch (e) {
      console.error("Error parsing crossSellIds:", e);
    }
  }

  return (
    <ProductPageClient 
      product={product} 
      relatedProducts={relatedProducts as any} 
      recentProducts={recentProducts as any}
      crossSellProducts={crossSellProducts as any}
      theme={theme}
    />
  );
}
