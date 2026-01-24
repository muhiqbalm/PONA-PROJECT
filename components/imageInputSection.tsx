"use client";

import { createClient } from "@/utils/supabase-client";
import { ExternalLink, Loader2, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

const ImageInputSection = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 3 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("Ukuran file maksimal 3MB!");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Harap upload file gambar (JPG/PNG).");
      return;
    }

    try {
      setIsUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `questions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      onChange(publicData.publicUrl);
      toast.success("Gambar berhasil diupload!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Gagal mengupload gambar.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">
        {label}
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg, image/webp"
      />

      {value ? (
        <div className="relative w-full h-56 bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 group shadow-sm transition-all hover:shadow-md">
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-contain p-2"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
            <p className="text-white text-xs font-bold mb-1">
              Gambar Terpasang
            </p>
            <div className="flex gap-2">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-xs font-bold backdrop-blur-md transition flex items-center gap-2"
              >
                <ExternalLink size={14} /> Lihat
              </a>
              <button
                onClick={() => onChange("")}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold backdrop-blur-md transition flex items-center gap-2"
              >
                <Trash2 size={14} /> Hapus
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group w-full">
          {isUploading && (
            <div className="absolute inset-0 z-20 bg-white/90 flex flex-col items-center justify-center rounded-2xl border-2 border-violet-200">
              <Loader2
                className="animate-spin text-violet-600 mb-2"
                size={32}
              />
              <p className="text-xs font-bold text-violet-700">Mengupload...</p>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <div className="relative bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-violet-400 transition-all h-auto min-h-[240px]">
            <div className="flex flex-col items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-violet-50 rounded-full flex items-center justify-center text-violet-500 group-hover:scale-110 transition-transform shadow-sm">
                <UploadCloud size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">Upload Gambar</p>
                <p className="text-[10px] text-gray-400">Max 3MB (JPG, PNG)</p>
              </div>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-full transition shadow-md active:scale-95 mb-5"
            >
              Pilih File
            </button>
            <div className="relative flex items-center w-full max-w-[200px] mb-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-3 text-[10px] text-gray-400 font-bold tracking-wider">
                ATAU URL
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <input
              type="text"
              className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-400 outline-none text-center bg-gray-50 focus:bg-white transition placeholder:text-gray-300"
              placeholder="https://example.com/image.png"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageInputSection;
