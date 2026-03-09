"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Plus, Trash2, Globe, ExternalLink, RefreshCcw, Upload, Link as LinkIcon } from "lucide-react";
import Image from "next/image";

interface SliderImage {
  id: string;
  title: string | null;
  link: string | null;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

export default function AdminSliderPage() {
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    imageUrl: "",
    order: "0",
    isActive: true,
  });

  const fetchSliderImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/slider");
      setSliderImages(response.data);
    } catch (error) {
      console.error("Error fetching slider images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliderImages();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client side preview/read
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        setIsUploading(true);
        const response = await axios.post("/api/upload", { image: base64String });
        setFormData(prev => ({ ...prev, imageUrl: response.data.url }));
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert("Please provide an image URL or upload a file.");
      return;
    }

    try {
      await axios.post("/api/admin/slider", formData);
      setIsAdding(false);
      setFormData({
        title: "",
        link: "",
        imageUrl: "",
        order: "0",
        isActive: true,
      });
      fetchSliderImages();
    } catch (error) {
      console.error("Error adding slider image:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slider image?")) return;
    try {
      await axios.delete(`/api/admin/slider/${id}`);
      fetchSliderImages();
    } catch (error) {
      console.error("Error deleting slider image:", error);
    }
  };

  const handleToggleActive = async (image: SliderImage) => {
    try {
      await axios.patch(`/api/admin/slider/${image.id}`, {
        isActive: !image.isActive,
      });
      fetchSliderImages();
    } catch (error) {
      console.error("Error updating slider image:", error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Home Page Slider</h1>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-primary text-white px-4 py-2 rounded-md hover:opacity-90 flex items-center transition-colors"
        >
          {isAdding ? "Cancel" : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Slider Image
            </>
          )}
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-primary/20">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Add New Slider Image</h2>
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Image Source</label>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setUploadMethod("file")}
                    className={`flex items-center px-4 py-2 rounded-md border transition-all ${
                      uploadMethod === "file" 
                      ? "bg-primary/10 border-primary/20 text-primary ring-1 ring-primary" 
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadMethod("url")}
                    className={`flex items-center px-4 py-2 rounded-md border transition-all ${
                      uploadMethod === "url" 
                      ? "bg-primary/10 border-primary/20 text-primary ring-1 ring-primary" 
                      : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Direct URL
                  </button>
                </div>

                {uploadMethod === "file" ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/20 hover:opacity-90/5 transition-all bg-gray-50/50"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                    />
                    {isUploading ? (
                      <RefreshCcw className="h-10 w-10 text-primary animate-spin mb-2" />
                    ) : formData.imageUrl ? (
                      <div className="relative h-32 w-full max-w-md rounded overflow-hidden shadow-sm">
                        <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 font-medium">Click to upload from your computer</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
                      </>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="e.g. https://example.com/banner.jpg"
                    required
                  />
                )}
                {formData.imageUrl && uploadMethod === "url" && (
                   <div className="mt-4 relative h-32 w-full max-w-md rounded overflow-hidden border">
                     <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                   </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Summer Sale 2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (Optional)</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="e.g. /category/electronics"
                />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    min="0"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
                    Active
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isUploading || !formData.imageUrl}
                className="bg-primary text-white px-8 py-2.5 rounded-md hover:opacity-90 disabled:bg-primary/30 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
              >
                Save Slider Image
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCcw className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sliderImages.length === 0 ? (
            <div className="col-span-full bg-white p-20 text-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No slider images found</p>
              <p className="text-sm">Click "Add Slider Image" to upload your first banner</p>
            </div>
          ) : (
            sliderImages.map((image) => (
              <div key={image.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100 flex flex-col">
                <div className="relative h-56 w-full group">
                  <Image
                    src={image.imageUrl}
                    alt={image.title || "Slider Image"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleToggleActive(image)}
                      className={`p-2.5 rounded-full ${image.isActive ? 'bg-green-500' : 'bg-gray-500'} text-white hover:scale-110 active:scale-95 transition-all`}
                      title={image.isActive ? "Deactivate" : "Activate"}
                    >
                      <Globe className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-2.5 bg-red-500 text-white rounded-full hover:scale-110 active:scale-95 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    {image.link && (
                      <a
                        href={image.link}
                        target="_blank"
                        className="p-2.5 bg-blue-500 text-white rounded-full hover:scale-110 active:scale-95 transition-all"
                        title="Open Link"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider shadow-sm ${
                      image.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {image.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 truncate pr-4">
                      {image.title || "Untitled Slide"}
                    </h3>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                      #{image.order}
                    </span>
                  </div>
                  {image.link ? (
                    <p className="text-xs text-primary truncate underline decoration-primary/30 underline-offset-2 mt-auto">
                      {image.link}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-auto">No link attached</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
