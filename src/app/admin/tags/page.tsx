"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Tags as TagsIcon, 
  PlusCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  RefreshCcw, 
  Trash2, 
  X, 
  ChevronRight,
  Info,
  Tag,
  Edit,
  Download,
  Upload
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: {
    products: number;
  };
}

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [saving, setSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: ""
  });

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/tags");
      setTags(response.data);
    } catch (error) {
      console.error("Error fetching tags:", error);
      toast.error("Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleExport = () => {
    const dataStr = JSON.stringify(tags, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tags-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Tags exported successfully!");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const importedData = JSON.parse(content);
        
        if (!Array.isArray(importedData)) {
          throw new Error("Invalid format: Expected an array of tags.");
        }

        setSaving(true);
        await axios.post("/api/tags/bulk", { tags: importedData });
        toast.success(`${importedData.length} tags imported successfully!`);
        fetchTags();
      } catch (error: any) {
        console.error("Import error:", error);
        toast.error(error.message || "Failed to import tags. Check file format.");
      } finally {
        setSaving(false);
        if (e.target) e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
    setFormData({ ...formData, name, slug });
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      slug: tag.slug
    });
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingTag(null);
    setFormData({ name: "", slug: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingTag) {
        await axios.patch(`/api/tags/${editingTag.id}`, formData);
        toast.success("Tag updated successfully!");
      } else {
        await axios.post("/api/tags", formData);
        toast.success("Tag created successfully!");
      }
      handleCancel();
      fetchTags();
      router.refresh();
    } catch (error: any) {
      console.error("Error saving tag:", error);
      toast.error(error.response?.data || "Failed to save tag");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteClick = (id: string) => {
    setTargetId(id);
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!targetId) return;
    try {
      setSaving(true);
      await axios.delete(`/api/tags/${targetId}`);
      fetchTags();
      router.refresh();
      toast.success("Tag deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting tag:", error);
      toast.error(error.response?.data || "Failed to delete tag");
    } finally {
      setSaving(false);
      setIsConfirmOpen(false);
      setTargetId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onConfirmDelete}
        loading={saving}
        title="Delete Tag"
        description="Are you sure you want to delete this tag? It will be removed from all products it's currently attached to."
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Tags</h1>
          <p className="text-gray-500 text-sm mt-1">Manage descriptive labels for better product filtering and SEO.</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm font-semibold text-sm flex items-center hover:text-primary hover:border-primary/50 transition-all">
            <Upload className="h-4 w-4 mr-2" />
            Import
            <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={saving} />
          </label>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all shadow-sm font-semibold text-sm flex items-center hover:text-primary hover:border-primary/50 transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => {
              if (isAdding) handleCancel();
              else setIsAdding(true);
            }}
            className={`px-4 py-2 rounded-xl flex items-center transition-all shadow-sm font-semibold text-sm ${
              isAdding 
                ? "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50" 
                : "bg-primary text-white hover:opacity-90 shadow-primary/20 shadow-sm"
            }`}
          >
            {isAdding ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Tag
              </>
            )}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-primary/20 animate-in fade-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TagsIcon className="h-24 w-24 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3">
              {editingTag ? <Edit className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
            </div>
            {editingTag ? "Edit Tag" : "Create New Tag"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tag Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Arrival"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">URL Slug</label>
                <input
                  type="text"
                  required
                  placeholder="new-arrival"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-medium"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-primary text-white px-8 py-2.5 rounded-xl hover:opacity-90 font-bold text-sm shadow-sm shadow-primary/20 disabled:bg-primary/30 transition-all"
              >
                {saving ? "Saving..." : editingTag ? "Update Tag" : "Create Tag"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <div className="relative w-full sm:w-96 group">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search tags..." 
              className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <RefreshCcw className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Loading tags...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-6 py-4">Tag Info</th>
                  <th className="px-6 py-4">URL Slug</th>
                  <th className="px-6 py-4">Connected Products</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tags.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                          <TagsIcon className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-bold">No tags found</p>
                        <button 
                          onClick={() => setIsAdding(true)}
                          className="mt-2 text-primary text-sm font-bold hover:underline"
                        >
                          Create your first tag
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-gray-50/50 transition-all duration-200 group">
                      <td className="px-6 py-5">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm mr-3 border border-primary/20">
                            <Tag className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{tag.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">/{tag.slug}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{tag._count?.products || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(tag)}
                            className="p-2 text-gray-400 hover:text-primary hover:opacity-90/10 rounded-lg transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => onDeleteClick(tag.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
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
          )}
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4">
        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
          <Info className="h-5 w-5" />
        </div>
        <div>
          <p className="text-blue-900 font-bold text-sm uppercase tracking-wider">About Tags</p>
          <p className="text-blue-800 text-xs mt-1 leading-relaxed">
            Tags allow you to group products together across different categories. They are great for "Trending," "Sale," or "Gift Ideas" collections.
          </p>
        </div>
      </div>
    </div>
  );
}
