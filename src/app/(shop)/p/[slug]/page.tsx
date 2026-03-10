import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, FileText, Clock, Share2 } from "lucide-react";

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
    title: `${page.title} | Shop`,
    description: page.content.substring(0, 160).replace(/<[^>]*>?/gm, ''),
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
    <div className="bg-white min-h-screen pb-24">
      {/* Hero Header */}
      <div className="bg-gray-50 py-20 border-b border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3 mx-2" />
              <span className="text-gray-900">{page.title}</span>
            </nav>
            
            <div className="space-y-6">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg text-primary text-[10px] font-black uppercase tracking-widest">
                  <FileText className="h-3.5 w-3.5" />
                  Official Policy
               </div>
               <h1 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tight leading-tight">
                  {page.title}
               </h1>
               <div className="flex items-center gap-6 text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                     <Clock className="h-4 w-4" />
                     Last Updated: {new Date(page.updatedAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </div>
                  <div className="h-1 w-1 rounded-full bg-gray-200"></div>
                  <div className="flex items-center gap-2">
                     <Share2 className="h-4 w-4" />
                     Share Information
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl">
          <div 
            className="prose prose-primary prose-lg max-w-none 
              prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-gray-900
              prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-lg
              prose-strong:text-gray-900 prose-strong:font-black
              prose-li:text-gray-600
              prose-img:rounded-[2rem] prose-img:shadow-2xl"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </div>

      {/* Help Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
         <div className="bg-primary rounded-[3rem] p-12 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <FileText className="h-48 w-48" />
            </div>
            <div className="relative z-10 max-w-2xl space-y-6">
               <h2 className="text-3xl font-black uppercase tracking-tight">Need more clarification?</h2>
               <p className="text-white/70 font-medium leading-relaxed">
                  If our {page.title.toLowerCase()} doesn't answer your specific question, please don't hesitate to reach out to our dedicated support team.
               </p>
               <Link 
                 href="/contact" 
                 className="inline-flex items-center gap-3 bg-white text-primary px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-xl"
               >
                 Contact Support
               </Link>
            </div>
         </div>
      </div>
    </div>
  );
}
