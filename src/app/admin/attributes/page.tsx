"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Trash2, Settings, List, Edit2, Check, X, RefreshCcw, Settings2, PlusCircle, LayoutGrid, Layers, Info } from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface AttributeValue {
  id: string;
  value: string;
}

interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
}

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newAttribute, setNewAttribute] = useState({ name: "", values: "" });
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAttributes = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/attributes");
      setAttributes(response.data);
    } catch (error) {
      console.error("Error fetching attributes:", error);
      toast.error("Failed to load attributes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const valuesArray = newAttribute.values.split(",").map(v => v.trim()).filter(v => v !== "");
      await axios.post("/api/admin/attributes", {
        name: newAttribute.name,
        values: valuesArray
      });
      setIsAdding(false);
      setNewAttribute({ name: "", values: "" });
      fetchAttributes();
      toast.success("Attribute created successfully!");
    } catch (error) {
      console.error("Error adding attribute:", error);
      toast.error("Failed to create attribute");
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
      await axios.delete(`/api/admin/attributes/${targetId}`);
      fetchAttributes();
      toast.success("Attribute deleted successfully!");
    } catch (error) {
      console.error("Error deleting attribute:", error);
      toast.error("Failed to delete attribute");
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
        title="Delete Attribute"
        description="Are you sure you want to delete this attribute? This will remove it from all products using it."
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Attributes</h1>
          <p className="text-gray-500 text-sm mt-1">Manage global attributes like Color, Size, and Material for your products.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 rounded-xl flex items-center transition-all shadow-sm font-semibold text-sm ${
            isAdding 
              ? "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50" 
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 shadow-sm"
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
              Add Attribute
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Settings2 className="h-24 w-24 text-indigo-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mr-3">
              <Plus className="h-5 w-5" />
            </div>
            Create New Attribute
          </h2>
          <form onSubmit={handleAdd} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Attribute Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Color"
                  value={newAttribute.name}
                  onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Values (Comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red, Blue, Green"
                  value={newAttribute.values}
                  onChange={(e) => setNewAttribute({ ...newAttribute, values: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl hover:bg-indigo-700 font-bold text-sm shadow-sm shadow-indigo-100 disabled:bg-indigo-300 transition-all"
              >
                {saving ? "Saving..." : "Save Attribute"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-gray-100">
          <RefreshCcw className="h-10 w-10 animate-spin text-indigo-500 mb-4 opacity-20" />
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Loading attributes...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attributes.map((attr) => (
              <div key={attr.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group">
                <div className="p-5 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="p-1.5 rounded-lg bg-white shadow-sm mr-3 group-hover:scale-110 transition-transform">
                      <Settings2 className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="font-bold text-gray-900">{attr.name}</span>
                  </div>
                  <button 
                    onClick={() => onDeleteClick(attr.id)}
                    className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2">
                    {attr.values.map((val) => (
                      <span key={val.id} className="px-3 py-1 bg-indigo-50/50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-indigo-100/50 transition-colors hover:bg-indigo-50">
                        {val.value}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center">
                      <LayoutGrid className="h-3 w-3 mr-1.5" />
                      {attr.values.length} Options
                    </span>
                    <button className="text-[10px] font-bold text-indigo-600 hover:underline uppercase tracking-widest">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {attributes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border-2 border-dashed border-gray-100">
              <div className="bg-gray-50 p-6 rounded-full mb-6">
                <Settings2 className="h-12 w-12 text-gray-300" />
              </div>
              <p className="text-gray-500 font-bold">No attributes defined yet</p>
              <p className="text-gray-400 text-xs mt-1">Start by adding global attributes like Size or Color.</p>
              <button 
                onClick={() => setIsAdding(true)}
                className="mt-6 text-indigo-600 text-sm font-bold hover:underline"
              >
                Add your first attribute
              </button>
            </div>
          )}

          {attributes.length > 0 && (
            <div className="mt-8 bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-start gap-4">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <p className="text-amber-900 font-bold text-sm uppercase tracking-wider">Note on Attributes</p>
                <p className="text-amber-800 text-xs mt-1 leading-relaxed">
                  These global attributes can be assigned to any product during creation. 
                  Deleting an attribute will remove it from all associated products.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
