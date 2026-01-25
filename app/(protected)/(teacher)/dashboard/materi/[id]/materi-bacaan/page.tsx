"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  MoveUp,
  MoveDown,
  Type,
  Image as ImageIcon,
  Video,
  List,
  MoreHorizontal,
  Loader2,
  X,
  UploadCloud,
  ExternalLink,
  Layout,
  Hash,
  Link2,
  MessageSquareText, // IMPORT ICON BARU DISINI
} from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

import { useAuth } from "@/components/authProvider";
import HomeHeader from "@/components/homeHeader";
import { createClient } from "@/utils/supabase-client";
import { getReadingMaterials } from "@/utils/supabase-queries";
import { ContentBlock } from "@/app/(protected)/materi/[id]/materi-bacaan/page";

// --- TYPES ---
interface MaterialSlide {
  id?: string;
  subject_id?: string;
  title: string;
  content: ContentBlock[];
}

// ... (Bagian BlockMediaUploader tetap sama, tidak perlu diubah) ...

const BlockMediaUploader = ({
  type,
  src,
  onUpload,
}: {
  type: "image" | "video";
  src: string;
  onUpload: (url: string) => void;
}) => {
  // ... (Isi component BlockMediaUploader sama seperti sebelumnya) ...
  // Biarkan kode ini seperti yang sebelumnya saya kirim
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = type === "video" ? 50 * 1024 * 1024 : 3 * 1024 * 1024;
    if (file.size > maxSize) {
      return toast.error(`Max size ${type === "video" ? "50MB" : "3MB"}`);
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `materi/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("images").getPublicUrl(fileName);

      onUpload(data.publicUrl);
      toast.success("Upload successful");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  if (src) {
    return (
      <div className="relative w-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden group">
        {type === "image" ? (
          <div className="relative h-48 w-full">
            <Image
              src={src}
              alt="Content"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : (
          <video src={src} controls className="w-full max-h-60 bg-black" />
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
          <a
            href={src}
            target="_blank"
            className="p-2 bg-white/20 text-white rounded-full backdrop-blur-sm hover:bg-white/40"
          >
            <ExternalLink size={16} />
          </a>
          <button
            onClick={() => onUpload("")}
            className="cursor-pointer p-2 bg-red-500/80 text-white rounded-full backdrop-blur-sm hover:bg-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      className="border-2 border-dashed border-violet-200 bg-violet-50/50 rounded-xl h-32 flex flex-col items-center justify-center text-violet-400 cursor-pointer hover:bg-violet-50 transition active:scale-95"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={type === "image" ? "image/*" : "video/*"}
      />
      {isUploading ? (
        <Loader2 className="animate-spin mb-2" />
      ) : (
        <UploadCloud size={24} className="mb-2" />
      )}
      <span className="text-xs font-bold">
        {isUploading
          ? "Uploading..."
          : `Upload ${type === "image" ? "Image" : "Video"}`}
      </span>
      <span className="text-[10px] opacity-70">
        {type === "image" ? "Max 3MB" : "Max 50MB"}
      </span>
    </div>
  );
};

export default function GuruManageMateriPage() {
  const params = useParams();
  const { user } = useAuth();
  const supabase = createClient();

  const subjectId = params?.id ? String(params.id) : "";

  // --- STATE ---
  const [slides, setSlides] = useState<MaterialSlide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // State untuk Modal Tambah Block
  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);

  // State Baru untuk Modal Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const tabsRef = useRef<HTMLDivElement>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId) return;
      setIsLoading(true);
      try {
        const data = await getReadingMaterials(supabase, subjectId);
        if (data && data.length > 0) {
          const formattedData = data.map((item: any) => ({
            id: item.id,
            subject_id: item.subject_id,
            title: item.title,
            content: (item.content || []).map((block: any) => {
              if (block.type === "image" || block.type === "video") {
                const fullCaption = block.caption || "";
                const parts = fullCaption.split("\n");
                return {
                  ...block,
                  caption: parts[0] || "",
                  source: parts.length > 1 ? parts.slice(1).join("\n") : "",
                };
              }
              return block;
            }),
          }));
          setSlides(formattedData);
        } else {
          setSlides([
            { title: "Pendahuluan", content: [], subject_id: subjectId },
          ]);
        }
      } catch (error) {
        toast.error("Failed to load materials.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [subjectId]);

  // --- ACTIONS ---

  const handleAddSlide = () => {
    const newSlide: MaterialSlide = {
      title: `Slide ${slides.length + 1}`,
      content: [],
      subject_id: subjectId,
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setCurrentSlideIndex(newSlides.length - 1);
    setTimeout(() => {
      if (tabsRef.current)
        tabsRef.current.scrollLeft = tabsRef.current.scrollWidth;
    }, 100);
    toast.success("New slide added");
  };

  // 1. Handler saat tombol tong sampah diklik (Hanya membuka modal)
  const handleDeleteClick = () => {
    if (slides.length <= 1) return toast.error("Minimal 1 slide required.");
    setIsDeleteModalOpen(true);
  };

  // 2. Handler Eksekusi Hapus (Dipanggil dari dalam modal)
  const confirmDeleteSlide = async () => {
    setIsDeleting(true);
    try {
      const slideToDelete = slides[currentSlideIndex];

      // Hapus dari database jika sudah tersimpan (punya ID)
      if (slideToDelete.id) {
        const { error } = await supabase
          .from("reading_materials")
          .delete()
          .eq("id", slideToDelete.id);

        if (error) throw error;
      }

      // Update State Lokal
      const newSlides = slides.filter((_, i) => i !== currentSlideIndex);
      setSlides(newSlides);

      // Sesuaikan index slide aktif
      if (currentSlideIndex >= newSlides.length) {
        setCurrentSlideIndex(newSlides.length - 1);
      }

      toast.success("Slide berhasil dihapus");
      setIsDeleteModalOpen(false); // Tutup modal
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus slide");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTitleChange = (val: string) => {
    const updated = [...slides];
    updated[currentSlideIndex].title = val;
    setSlides(updated);
  };

  const addBlock = (type: ContentBlock["type"]) => {
    const updated = [...slides];
    const newBlock: any = {
      type,
      text: "",
      src: "",
      caption: "",
      source: "",
      items: ["Point 1"],
      title: "Title",
    };
    if (type === "sub-header") newBlock.text = "Sub Header";
    if (type === "green-list") {
      const existingGreenLists = updated[currentSlideIndex].content.filter(
        (b) => b.type === "green-list",
      );
      // @ts-ignore
      const lastNumber =
        existingGreenLists.length > 0
          ? (existingGreenLists[existingGreenLists.length - 1] as any).number ||
            existingGreenLists.length
          : 0;
      newBlock.title = "Important Point";
      newBlock.text = "Description...";
      newBlock.number = lastNumber + 1;
    }
    updated[currentSlideIndex].content.push(newBlock);
    setSlides(updated);
    setIsAddBlockModalOpen(false);
    setTimeout(() => {
      const editorContainer = document.getElementById("editor-container");
      if (editorContainer)
        editorContainer.scrollTo({
          top: editorContainer.scrollHeight,
          behavior: "smooth",
        });
    }, 100);
  };

  const removeBlock = (blockIndex: number) => {
    const updated = [...slides];
    updated[currentSlideIndex].content.splice(blockIndex, 1);
    setSlides(updated);
  };

  const moveBlock = (blockIndex: number, direction: -1 | 1) => {
    const content = [...slides[currentSlideIndex].content];
    if (blockIndex + direction < 0 || blockIndex + direction >= content.length)
      return;
    const temp = content[blockIndex];
    content[blockIndex] = content[blockIndex + direction];
    content[blockIndex + direction] = temp;
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex].content = content;
    setSlides(updatedSlides);
  };

  const updateBlock = (blockIndex: number, field: string, value: any) => {
    const updatedSlides = [...slides];
    // @ts-ignore
    updatedSlides[currentSlideIndex].content[blockIndex][field] = value;
    setSlides(updatedSlides);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      for (const [index, slide] of slides.entries()) {
        const cleanContent = slide.content.map((block: any) => {
          if (block.type === "image" || block.type === "video") {
            const visualCaption = block.caption || "";
            const visualSource = block.source || "";
            const combinedCaption = visualSource
              ? `${visualCaption}\n${visualSource}`
              : visualCaption;
            const { source, ...rest } = block;
            return { ...rest, caption: combinedCaption };
          }
          return block;
        });

        const payload = {
          subject_id: subjectId,
          title: slide.title,
          content: cleanContent,
          order_number: index + 1,
        };

        if (slide.id) {
          await supabase
            .from("reading_materials")
            .update(payload)
            .eq("id", slide.id);
        } else {
          const { data } = await supabase
            .from("reading_materials")
            .insert(payload)
            .select()
            .single();
          if (data) {
            setSlides((prev) => {
              const newSlides = [...prev];
              newSlides[index] = { ...newSlides[index], id: data.id };
              return newSlides;
            });
          }
        }
      }
      toast.success("Materi Tersimpan!");
    } catch (error: any) {
      console.error(error);
      toast.error(
        `Gagal menyimpan: ${error.message || "Error tidak diketahui"}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDER BLOCK EDITOR ---
  const renderBlockEditor = (
    block: ContentBlock & { source?: string },
    index: number,
  ) => {
    // ... (Kode Render Block Editor Anda Tetap Sama - Saya persingkat untuk fokus ke Modal) ...
    // Pastikan kode renderBlockEditor yang sebelumnya Anda miliki di-paste di sini
    return (
      <div
        key={index}
        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4 relative animate-in fade-in slide-in-from-bottom-2"
      >
        {/* ... Isi komponen editor block ... */}
        {/* Gunakan kode renderBlockEditor dari jawaban sebelumnya */}
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="bg-gray-100 text-gray-500 p-1.5 rounded-md">
              {block.type === "sub-header" && <Type size={14} />}
              {block.type === "paragraph" && <MoreHorizontal size={14} />}
              {block.type === "image" && <ImageIcon size={14} />}
              {block.type === "video" && <Video size={14} />}
              {block.type.includes("bullet-list") && <List size={14} />}
              {block.type === "green-list" && (
                <List size={14} className="text-green-600" />
              )}
            </span>
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">
              {block.type === "green-list"
                ? "NUMBER LIST"
                : block.type.replace("-", " ")}
            </span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => moveBlock(index, -1)}
              className="cursor-pointer p-2 hover:bg-gray-100 rounded text-gray-500 active:bg-gray-200"
            >
              <MoveUp size={16} />
            </button>
            <button
              onClick={() => moveBlock(index, 1)}
              className="cursor-pointer p-2 hover:bg-gray-100 rounded text-gray-500 active:bg-gray-200"
            >
              <MoveDown size={16} />
            </button>
            <div className="w-[1px] h-6 bg-gray-200 mx-1 self-center"></div>
            <button
              onClick={() => removeBlock(index)}
              className="cursor-pointer p-2 hover:bg-red-50 text-red-500 rounded active:bg-red-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        {/* Inputs... (Singkat untuk contoh, gunakan full code Anda) */}
        <div className="space-y-3">
          {/* ... Logic Render Input ... */}
          {(block.type === "sub-header" || block.type === "paragraph") && (
            <textarea
              value={block.text}
              onChange={(e) => updateBlock(index, "text", e.target.value)}
              className={`w-full p-3 border border-gray-200 rounded-lg text-base focus:ring-2 focus:ring-violet-500 outline-none resize-none ${block.type === "sub-header" ? "font-bold h-14" : "h-32"}`}
            />
          )}
          {/* ... dst ... */}
          {/* Note: Karena keterbatasan karakter di chat, pastikan Anda menggunakan logic renderBlockEditor lengkap Anda di sini */}
          {/* Jika Anda copy paste langsung, bagian ini akan error karena logic render inputnya saya potong. Gunakan fungsi renderBlockEditor Anda yang lama, isinya tidak berubah. */}
        </div>
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="animate-spin text-violet-600" />
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans">
      <div className="flex-shrink-0 z-30 bg-white shadow-sm">
        <HomeHeader />
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <Link
            href={`/dashboard/materi`}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <ArrowLeft size={22} />
          </Link>
          <div className="flex items-center gap-2">
            {/* BUTTON DELETE - SEKARANG MEMANGGIL handleDeleteClick */}
            <button
              onClick={handleDeleteClick}
              className="cursor-pointer p-2 rounded-full text-red-500 hover:bg-red-50"
              title="Delete Slide"
            >
              <Trash2 size={20} />
            </button>

            <button
              onClick={() => setIsAddBlockModalOpen(true)}
              className="cursor-pointer flex items-center gap-2 bg-white text-violet-600 px-4 py-2 rounded-full font-bold text-sm shadow-sm border border-violet-100 hover:bg-violet-50 transition active:scale-95"
              title="Add Content"
            >
              <Plus size={16} strokeWidth={3} /> Konten
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              style={{ cursor: isSaving ? "not-allowed" : "pointer" }}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-full font-bold text-sm shadow-md transition disabled:opacity-70 active:scale-95"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}{" "}
              Save
            </button>
          </div>
        </div>
        <div
          ref={tabsRef}
          className="flex overflow-x-auto gap-2 px-4 py-3 border-b border-gray-100 bg-white no-scrollbar items-center sticky top-0"
        >
          {slides.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${currentSlideIndex === idx ? "bg-violet-600 text-white border-violet-600 shadow-md transform scale-105" : "cursor-pointer bg-white text-gray-500 border-gray-200 hover:border-gray-300"}`}
            >
              Slide {idx + 1}
            </button>
          ))}
          <button
            onClick={handleAddSlide}
            className="cursor-pointer flex-shrink-0 w-8 h-8 rounded-full bg-violet-50 text-violet-600 border border-violet-200 flex items-center justify-center hover:bg-violet-100 active:scale-90 transition"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div
        id="editor-container"
        className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50"
      >
        <div className="max-w-2xl mx-auto pb-10">
          <div className="mb-6">
            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
              Slide Title {currentSlideIndex + 1}
            </label>
            <input
              type="text"
              value={slides[currentSlideIndex]?.title || ""}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full font-bold text-2xl text-gray-800 outline-none bg-transparent placeholder:text-gray-300 border-b border-gray-200 focus:border-violet-300 pb-2 transition-colors"
              placeholder="Enter Title..."
            />
          </div>
          {slides[currentSlideIndex]?.content.length === 0 ? (
            <div className="text-center py-12 px-4 text-gray-400 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center">
              <Layout size={32} className="mb-2 opacity-50" />
              <p className="font-medium text-sm">Empty Slide</p>
              <p className="text-xs mt-1">
                Tap the <b>+</b> button above to add content.
              </p>
            </div>
          ) : (
            slides[currentSlideIndex]?.content.map((block, idx) =>
              renderBlockEditor(block, idx),
            )
          )}
        </div>
      </div>

      {/* --- MODAL ADD CONTENT (YANG LAMA) --- */}
      {isAddBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/60 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0"
            onClick={() => setIsAddBlockModalOpen(false)}
          ></div>
          <div className="bg-white w-full sm:max-w-xl rounded-t-[2rem] sm:rounded-[2rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom-12 zoom-in-95 duration-300 border border-gray-100">
            {/* ... (Isi modal add content Anda yang sebelumnya) ... */}
            <div className="text-center mb-8 relative">
              <h3 className="text-xl font-bold text-gray-900">
                Pilih Jenis Konten
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Tambahkan elemen baru ke dalam slide Anda
              </p>
              <button
                onClick={() => setIsAddBlockModalOpen(false)}
                className="absolute right-0 top-0 sm:-right-2 sm:-top-2 p-2 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <BlockOption
                icon={<Type size={24} />}
                label="Sub Header"
                onClick={() => addBlock("sub-header")}
                color="bg-blue-50 text-blue-600 border-blue-100"
              />
              <BlockOption
                icon={<MoreHorizontal size={24} />}
                label="Paragraf"
                onClick={() => addBlock("paragraph")}
                color="bg-gray-50 text-gray-600 border-gray-200"
              />
              <BlockOption
                icon={<ImageIcon size={24} />}
                label="Gambar"
                onClick={() => addBlock("image")}
                color="bg-pink-50 text-pink-600 border-pink-100"
              />
              <BlockOption
                icon={<Video size={24} />}
                label="Video"
                onClick={() => addBlock("video")}
                color="bg-red-50 text-red-600 border-red-100"
              />
              <BlockOption
                icon={<List size={24} />}
                label="Bullet List"
                onClick={() => addBlock("bullet-list")}
                color="bg-yellow-50 text-yellow-600 border-yellow-100"
              />
              <BlockOption
                icon={<Hash size={24} />}
                label="Number List"
                onClick={() => addBlock("green-list")}
                color="bg-green-50 text-green-600 border-green-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DELETE (BARU & LEBIH BAGUS) --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200 relative">
            <div className="flex flex-col items-center text-center">
              {/* Icon Warning Besar */}
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="text-red-500" size={28} />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Hapus Slide Ini?
              </h3>

              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Tindakan ini <b>tidak dapat dibatalkan</b>. Seluruh konten teks,
                gambar, dan video di dalam slide ini akan hilang permanen.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={confirmDeleteSlide}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isDeleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Hapus Slide"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BlockOption({
  icon,
  label,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border ${color} hover:brightness-95 transition active:scale-95`}
    >
      <div className="mb-2">{icon}</div>
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}
