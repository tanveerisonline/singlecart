import { db } from "@/lib/db";
import SectionClient from "@/components/admin/SectionClient";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function SectionsPage() {
  const sections = await db.dynamicSection.findMany({
    include: {
      banners: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Banners & Sections</h2>
          <p className="text-sm text-muted-foreground">
            Manage dynamic sections and banners for your store.
          </p>
        </div>
        <Link
          href="/admin/sections/new"
          className="bg-primary text-white px-4 py-2 rounded-xl flex items-center text-sm font-bold shadow-sm hover:opacity-90 transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Link>
      </div>
      <SectionClient sections={sections} />
    </div>
  );
}
