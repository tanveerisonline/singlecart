"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { X, Search, RefreshCcw, CheckCircle2, Upload, Plus } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  name: string;
  url: string;
}

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  selectedUrl?: string;
}

export default function MediaModal({ isOpen, onClose, onSelect, selectedUrl }: MediaModalProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/upload");
      setMedia(response.data);
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result;
        await axios.post("/api/upload", {
          image: base64data,
          name: file.name
        });
        toast.success("Image uploaded successfully");
        fetchMedia(); // Refresh list
      };
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const filteredMedia = media.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Media Library</h2>
            <p className="text-sm text-gray-500 mt-1">Choose an image or upload a new one</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {uploading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload New
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search media by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm transition-all font-medium"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <RefreshCcw className="h-8 w-8 animate-spin text-primary opacity-20" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Library...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group border-2 transition-all ${
                    selectedUrl === item.url ? "border-primary shadow-md ring-4 ring-primary/10" : "border-transparent hover:border-primary/20"
                  }`}
                >
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {selectedUrl === item.url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-primary bg-white rounded-full p-0.5 shadow-sm" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white font-bold truncate text-center">{item.name}</p>
                  </div>
                </div>
              ))}
              
              {/* Add New Placeholder in Grid */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary/50 hover:bg-white transition-all cursor-pointer group"
              >
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">Add New</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
