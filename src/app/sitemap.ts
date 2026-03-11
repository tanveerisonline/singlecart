import { db } from "@/lib/db";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Static routes
  const routes = [
    "",
    "/search",
    "/cart",
    "/login",
    "/register",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Dynamic products
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic categories
  const categories = await db.category.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/collections/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...routes, ...productRoutes, ...categoryRoutes];
}
