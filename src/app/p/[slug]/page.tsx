import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface StaticPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: StaticPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await db.page.findUnique({
    where: { slug, isActive: true },
  });

  if (!page) return { title: "Page Not Found" };

  return {
    title: page.title,
    description: page.content.substring(0, 160),
  };
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { slug } = await params;
  const page = await db.page.findUnique({
    where: {
      slug,
      isActive: true,
    },
  });

  if (!page) {
    notFound();
  }

  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{page.title}</h1>
        <div 
          className="prose prose-primary prose-lg text-gray-500"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </div>
  );
}
