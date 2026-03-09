"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { X, Search, RefreshCcw, CheckCircle2 } from "lucide-react";
import Image from "next/image";

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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
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
      fetchMedia();
    }
  }, [isOpen]);

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
            <h2 className="text-xl font-bold text-gray-900">Select Media</h2>
            <p className="text-sm text-gray-500 mt-1">Choose an image from your library</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
          {loading ? (
            <div className="flex justify-center py-20">
              <RefreshCcw className="h-8 w-8 animate-spin text-primary" />
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
                    selectedUrl === item.url ? "border-primary/20 shadow-md" : "border-transparent hover:border-primary/20"
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
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white truncate text-center">{item.name}</p>
                  </div>
                </div>
              ))}
              {filteredMedia.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-400">
                  No media found matching your search.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
