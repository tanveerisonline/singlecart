"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { 
  Upload, 
  Trash2, 
  File as FileIcon, 
  Search, 
  RefreshCcw, 
  Copy, 
  Check, 
  Grid, 
  List as ListIcon,
  X,
  Info,
  Calendar,
  FileType,
  HardDrive,
  ExternalLink,
  ChevronRight,
  Filter,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Deletion state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/upload");
      setMedia(response.data);
    } catch (error) {
      console.error("Error fetching media:", error);
      toast.error("Failed to load media library");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | undefined;
    
    if ('files' in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Only image files are supported currently.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        setIsUploading(true);
        await axios.post("/api/upload", { 
          image: reader.result as string,
          name: file!.name
        });
        fetchMedia();
        toast.success("Image uploaded successfully!");
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Upload failed.");
      } finally {
        setIsUploading(false);
        setIsDragging(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const copyToClipboard = (url: string, id: string) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const onDeleteClick = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTargetId(id);
    setIsConfirmOpen(true);
  };

  const onConfirmDelete = async () => {
    if (!targetId) return;
    try {
      setIsDeleting(true);
      await axios.delete(`/api/upload/${targetId}`);
      toast.success("File deleted successfully");
      if (selectedItem?.id === targetId) setSelectedItem(null);
      fetchMedia();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete file");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setTargetId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredMedia = useMemo(() => 
    media.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [media, searchTerm]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e);
  };

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 overflow-hidden">
      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={onConfirmDelete}
        loading={isDeleting}
        title="Delete Media"
        description="Are you sure you want to delete this file? This will permanently remove it from the server. Products using this image might show broken links."
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Media Assets</h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage and organize your store's visual resources.</p>
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-primary text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center text-sm font-semibold shadow-lg shadow-primary/20/50 hover:translate-y-[-1px] active:translate-y-[0px] disabled:opacity-50 disabled:translate-y-0"
            >
              {isUploading ? (
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload New
            </button>
          </div>
        </div>

        <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3 items-center justify-between mb-6">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border-none rounded-xl focus:ring-2 focus:ring-primary/10 focus:bg-white outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2 pr-1">
            <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div 
          className={cn(
            "flex-1 overflow-y-auto pr-2 custom-scrollbar transition-all duration-300 rounded-2xl",
            isDragging ? "bg-primary/10 ring-2 ring-primary/20 ring-dashed" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center py-32">
              <div className="relative">
                <div className="h-16 w-16 border-4 border-primary/20 rounded-full animate-pulse"></div>
                <RefreshCcw className="h-8 w-8 animate-spin text-primary absolute inset-0 m-auto" />
              </div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mt-6">Indexing Library</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-20 bg-white/50 border-2 border-dashed border-gray-200 rounded-3xl">
              <div className="bg-gray-50 p-6 rounded-full mb-4">
                <ImageIcon className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg">No media found</h3>
              <p className="text-gray-500 text-sm max-w-[250px] text-center mt-1">
                Try adjusting your search or upload new assets to get started.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              <AnimatePresence>
                {filteredMedia.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      "group relative bg-white rounded-2xl overflow-hidden cursor-pointer border-2 transition-all duration-300",
                      selectedItem?.id === item.id 
                        ? "border-primary/20 ring-4 ring-primary/20" 
                        : "border-transparent hover:border-gray-200 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1"
                    )}
                  >
                    <div className="aspect-square relative bg-gray-50 overflow-hidden">
                      <Image
                        src={item.url}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <div className="flex justify-between items-center translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                           <span className="text-[9px] font-bold text-white uppercase tracking-wider bg-white/20 backdrop-blur-md px-1.5 py-0.5 rounded">
                            {item.type.split('/')[1]}
                           </span>
                           <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.url, item.id);
                            }}
                            className="p-1.5 bg-white rounded-lg text-primary hover:opacity-90/10 transition-colors shadow-sm"
                           >
                            {copiedId === item.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                           </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-[11px] font-bold text-gray-700 truncate">{item.name}</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5 tracking-tight">{formatSize(item.size)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase font-bold tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4">Preview</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Format</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredMedia.map((item) => (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedItem(item)}
                      className={cn(
                        "group cursor-pointer transition-colors",
                        selectedItem?.id === item.id ? "bg-primary/5" : "hover:bg-gray-50/50"
                      )}
                    >
                      <td className="px-6 py-3">
                        <div className="h-10 w-10 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 relative">
                          <Image src={item.url} alt={item.name} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="text-sm font-bold text-gray-900 truncate max-w-[300px]">{item.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium truncate max-w-[300px]">{item.url}</div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-bold uppercase">
                          {item.type.split('/')[1]}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-500 font-semibold uppercase">
                        {formatSize(item.size)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.url, item.id);
                            }}
                            className="p-2 text-gray-400 hover:text-primary hover:opacity-90/10 rounded-lg"
                          >
                            {copiedId === item.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                          <button 
                            onClick={(e) => onDeleteClick(item.id, e)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Details */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-96 bg-white border-l border-gray-100 shadow-2xl z-10 flex flex-col rounded-l-[32px] overflow-hidden"
          >
            <div className="p-6 flex items-center justify-between border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Details
              </h2>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div className="aspect-square relative rounded-3xl overflow-hidden bg-gray-50 group border border-gray-100">
                <Image 
                  src={selectedItem.url} 
                  alt={selectedItem.name} 
                  fill 
                  className="object-contain p-2"
                />
                <a 
                  href={selectedItem.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-gray-700 hover:text-primary transition-all shadow-xl border border-white/50 opacity-0 group-hover:opacity-100"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filename</span>
                  <p className="text-sm font-bold text-gray-900 break-all bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {selectedItem.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <FileType className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Format</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 uppercase">{selectedItem.type.split('/')[1]}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <HardDrive className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Size</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 uppercase">{formatSize(selectedItem.size)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Uploaded On</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(selectedItem.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                   <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Public URL</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-white border border-gray-200 p-2 rounded-lg text-[10px] font-mono text-primary truncate">
                      {selectedItem.url}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(selectedItem.url, selectedItem.id)}
                      className="p-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors shadow-sm"
                    >
                       {copiedId === selectedItem.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-50 bg-gray-50/50">
              <button 
                onClick={() => onDeleteClick(selectedItem.id)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm hover:bg-rose-100 transition-all"
              >
                <Trash2 className="h-4 w-4" />
                Delete Permanently
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-primary/90 backdrop-blur-sm flex flex-col items-center justify-center text-white"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="p-12 border-4 border-dashed border-white/50 rounded-[40px] flex flex-col items-center gap-6">
              <div className="bg-white text-primary p-6 rounded-full shadow-2xl animate-bounce">
                <Upload className="h-12 w-12" />
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-black">Drop to Upload</h3>
                <p className="text-primary/20 mt-2 font-medium">Release to add files to your library</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
