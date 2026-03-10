"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Search, Layout, Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "./ConfirmModal";

interface SectionClientProps {
  sections: any[];
}

export default function SectionClient({ sections }: SectionClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);

  const filteredSections = sections.filter((section) =>
    section.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onDeleteClick = (id: string) => {
    setTargetId(id);
    setIsModalOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!targetId) return;

    try {
      setLoadingId(targetId);
      await axios.delete(`/api/admin/sections/${targetId}`);
      toast.success("Section deleted successfully");
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while deleting the section.");
    } finally {
      setLoadingId(null);
      setTargetId(null);
    }
  };

  return (
    <>
      <ConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onConfirmDelete}
        loading={loadingId !== null}
        title="Delete Section"
        description="Are you sure you want to delete this section? All banners within this section will also be deleted."
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full sm:w-96 group">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search sections..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary transition-all outline-none font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-widest">
                <th className="px-6 py-4">Section Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Layout</th>
                <th className="px-6 py-4">Banners</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <Layout className="h-8 w-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">No sections found</p>
                      <Link href="/admin/sections/new" className="text-primary text-sm font-bold mt-2">Create your first section</Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSections.map((section) => (
                  <tr key={section.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{section.name}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{section.page}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                        {section.location}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-purple-50 text-purple-600 border border-purple-100">
                        {section.layout.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {section.banners.slice(0, 3).map((banner: any, i: number) => (
                          <div key={banner.id} className="h-8 w-8 rounded-lg bg-gray-100 border-2 border-white overflow-hidden relative" title={banner.title || "Banner"}>
                            {banner.imageUrl ? (
                              <img src={banner.imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gray-50 text-[10px] font-bold text-gray-400">
                                {i + 1}
                              </div>
                            )}
                          </div>
                        ))}
                        {section.banners.length > 3 && (
                          <div className="h-8 w-8 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500">
                            +{section.banners.length - 3}
                          </div>
                        )}
                        {section.banners.length === 0 && (
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Empty</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {section.isActive ? (
                        <span className="inline-flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-rose-500 text-[10px] font-black uppercase tracking-widest gap-1">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/sections/${section.id}`}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => onDeleteClick(section.id)}
                          disabled={loadingId === section.id}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
