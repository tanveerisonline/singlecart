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

  const product = await db.product.findUnique({
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

  // Fetch Related Products (Same category, excluding current)
  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
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

  return (
    <ProductPageClient 
      product={product} 
      relatedProducts={relatedProducts as any} 
      recentProducts={recentProducts as any} 
    />
  );
}
