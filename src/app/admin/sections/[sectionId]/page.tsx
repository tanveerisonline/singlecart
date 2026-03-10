import { db } from "@/lib/db";
import SectionForm from "@/components/admin/SectionForm";
import { notFound } from "next/navigation";

export default async function SectionPage({
  params
}: {
  params: Promise<{ sectionId: string }>
}) {
  const { sectionId } = await params;
  const section = await db.dynamicSection.findUnique({
    where: {
      id: sectionId,
    },
    include: {
      banners: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });

  if (!section) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <SectionForm initialData={section} />
    </div>
  );
}
