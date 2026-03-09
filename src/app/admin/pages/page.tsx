"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  FileText, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  Save,
  X,
  RefreshCcw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Page } from "@prisma/client";

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPage, setEditingPage] = useState<Partial<Page> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/pages");
      setPages(response.data);
    } catch (error) {
      console.error("Failed to fetch pages", error);
      toast.error("Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleEdit = (page: Page) => {
    setEditingPage(page);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditingPage({
      title: "",
      slug: "",
      content: "",
      isActive: true,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    
    try {
      await axios.delete(`/api/admin/pages/${id}`);
      toast.success("Page deleted successfully");
      fetchPages();
    } catch (error) {
      toast.error("Failed to delete page");
    }
  };

  const onSave = async () => {
    if (!editingPage?.title || !editingPage?.slug || !editingPage?.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSaving(true);
      if (editingPage.id) {
        await axios.patch(`/api/admin/pages/${editingPage.id}`, editingPage);
        toast.success("Page updated successfully");
      } else {
        await axios.post("/api/admin/pages", editingPage);
        toast.success("Page created successfully");
      }
      setIsEditing(false);
      setEditingPage(null);
      fetchPages();
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to save page");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-gray-100">
        <RefreshCcw className="h-10 w-10 animate-spin text-primary mb-4 opacity-20" />
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Loading pages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Pages</h1>
          <p className="text-gray-500 text-sm mt-1">Manage static content like policies, terms, and informational pages.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-primary text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create New Page
        </button>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {editingPage?.id ? "Edit Page" : "New Page"}
            </h2>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Page Title</label>
                <input 
                  type="text"
                  value={editingPage?.title || ""}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                    setEditingPage({ ...editingPage, title, slug: editingPage?.id ? editingPage.slug : slug });
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none font-medium"
                  placeholder="e.g. Shipping Policy"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">URL Slug</label>
                <div className="flex items-center">
                  <span className="bg-gray-100 border border-r-0 border-gray-100 px-3 py-3 rounded-l-xl text-gray-400 text-xs font-bold">/p/</span>
                  <input 
                    type="text"
                    value={editingPage?.slug || ""}
                    onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-r-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none font-medium"
                    placeholder="shipping-policy"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Page Content (HTML)</label>
                <span className="text-[10px] text-gray-400 italic">Supports HTML formatting</span>
              </div>
              <textarea 
                value={editingPage?.content || ""}
                onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                rows={15}
                className="w-full px-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none font-medium text-sm font-mono"
                placeholder="<h1>Your Title</h1><p>Your content here...</p>"
              />
            </div>

            <div className="flex items-center gap-2 bg-gray-50 p-4 rounded-xl">
              <input 
                type="checkbox"
                id="isActive"
                checked={editingPage?.isActive || false}
                onChange={(e) => setEditingPage({ ...editingPage, isActive: e.target.checked })}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">
                Publish this page (Visible to customers)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
              <button 
                onClick={() => setIsEditing(false)}
                className="px-8 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={onSave}
                disabled={isSaving}
                className="bg-primary text-white px-10 py-3 rounded-xl hover:opacity-90 disabled:bg-primary/30 transition-all font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                {isSaving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editingPage?.id ? "Update Page" : "Save Page"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96 group">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search pages..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest">
                  <th className="px-6 py-4">Page Details</th>
                  <th className="px-6 py-4">URL Slug</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Updated</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPages.length > 0 ? (
                  filteredPages.map((page) => (
                    <tr key={page.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{page.title}</p>
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">Static Content</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-500">
                        /p/{page.slug}
                      </td>
                      <td className="px-6 py-4">
                        {page.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                            <CheckCircle2 className="h-3 w-3" /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                            <AlertCircle className="h-3 w-3" /> Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-400">
                        {new Date(page.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <a 
                            href={`/p/${page.slug}`} 
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            title="View Page"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button 
                            onClick={() => handleEdit(page)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(page.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                      No pages found. Create your first page to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
