"use client";

import { useState, useRef, useEffect, useMemo, use } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import type { CSSProperties } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  ArrowLeft,
  CheckCircle2,
  Lock,
  RotateCw,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

import HomeHeader from "@/components/homeHeader";
import { useAuth } from "@/components/authProvider";
import { createClient } from "@/utils/supabase-client";
import { getReadingMaterials } from "@/utils/supabase-queries";

// --- TIPE DATA ---
export type ContentBlock =
  | { type: "sub-header"; text: string; style?: CSSProperties }
  | { type: "paragraph"; text: string; style?: CSSProperties }
  | { type: "image"; src: string; caption?: string; style?: CSSProperties }
  | { type: "video"; src: string; caption?: string; style?: CSSProperties }
  | { type: "bullet-list"; items: string[]; style?: CSSProperties }
  | {
      type: "green-list";
      number?: number;
      icon?: string;
      title?: string;
      text: string;
      style?: CSSProperties;
    }
  | { type: "smart-list"; items: string[]; style?: CSSProperties };

interface MaterialSlide {
  id: number;
  title: string;
  content: ContentBlock[];
}

type Flashcard = {
  id: string;
  front_image_url: string;
  back_image_url: string;
  order_number: number;
};

export default function MateriPage({
  params,
}: {
  params: Promise<{ id: string; submateri_id: string }>;
}) {
  // Unwrap params untuk Next.js 15
  const { id: TOPIC_ID } = useParams();

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // --- STATE UMUM ---
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE MATERI ---
  const [showMaterial, setShowMaterial] = useState(false); // Default false: Tampilkan Flashcard dulu
  const [materials, setMaterials] = useState<MaterialSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // --- STATE FLASHCARD ---
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- FETCH DATA (Flashcards & Material) ---
  useEffect(() => {
    const fetchData = async () => {
      if (!TOPIC_ID) return;
      setIsLoading(true);

      try {
        // 1. Fetch Flashcards
        const { data: fcData, error: fcError } = await supabase
          .from("topic_flashcard")
          .select("id, front_image_url, back_image_url, order_number")
          .eq("topic_id", TOPIC_ID)
          .order("order_number", { ascending: true });

        if (fcError) console.error("Error flashcard:", fcError);

        // Sortir flashcard (fallback jika order_number null)
        const sortedFc = (fcData || []).sort(
          (a, b) => (a.order_number || 0) - (b.order_number || 0),
        );
        setFlashcards(sortedFc);

        // 2. Fetch Reading Materials
        const matData = await getReadingMaterials(supabase, TOPIC_ID as string);
        if (matData && matData.length > 0) {
          const formattedData: MaterialSlide[] = matData.map((item: any) => ({
            id: item.id,
            title: item.title,
            content: item.content as ContentBlock[],
          }));
          setMaterials(formattedData);
        } else {
          setMaterials([]);
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        toast.error("Gagal memuat konten.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [TOPIC_ID, supabase]);

  // Scroll to top saat pindah slide materi
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

  // --- LOGIKA FLASHCARD ---
  const handleOpenCard = (index: number) => {
    // Cek apakah kartu sebelumnya sudah selesai
    const isPreviousCompleted =
      index === 0 || completedIndices.includes(index - 1);

    if (isPreviousCompleted) {
      setActiveCardIndex(index);
      setIsFlipped(false);

      // Tandai "dibaca" saat dibuka
      if (!completedIndices.includes(index)) {
        setCompletedIndices((prev) => [...prev, index]);
      }
    } else {
      toast.error("Buka kartu secara berurutan!");
    }
  };

  const handleCloseModal = () => {
    setActiveCardIndex(null);
    setIsFlipped(false);
  };

  const handleNextCard = () => {
    if (activeCardIndex !== null && activeCardIndex < flashcards.length - 1) {
      setIsFlipped(false);
      // Delay sedikit agar animasi flip reset terlihat natural
      setTimeout(() => {
        const nextIndex = activeCardIndex + 1;
        setActiveCardIndex(nextIndex);
        if (!completedIndices.includes(nextIndex)) {
          setCompletedIndices((prev) => [...prev, nextIndex]);
        }
      }, 300);
    } else {
      handleCloseModal();
    }
  };

  const allFlashcardsCompleted =
    flashcards.length > 0 && completedIndices.length === flashcards.length;

  // --- LOGIKA MATERI ---
  const handleNextSlide = () => {
    if (currentIndex < materials.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // --- RENDER HELPERS ---
  const renderSmartListItem = (item: string, index: number) => {
    const isStrip = item.trim().match(/^-\s/);
    const isBullet = item.trim().match(/^o\s/);
    let cleanText = item;
    let containerClass = "ml-0";
    let marker = null;

    if (isStrip) {
      cleanText = item.replace(/^-\s/, "");
      containerClass = "pl-8 relative";
      marker = (
        <span className="absolute left-4 top-[9px] w-2.5 h-[1.5px] bg-gray-500 block"></span>
      );
    } else if (isBullet) {
      cleanText = item.replace(/^o\s/, "");
      containerClass = "pl-4 relative";
      marker = (
        <span className="absolute left-0 top-[7px] w-1.5 h-1.5 border border-gray-600 rounded-full block bg-transparent"></span>
      );
    } else {
      containerClass = "pl-0";
    }

    return (
      <li
        key={index}
        className={`text-sm text-gray-700 leading-relaxed list-none ${containerClass}`}
      >
        {marker}
        {cleanText.split(/(\*\*.*?\*\*)/g).map((part, p) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={p} className="text-black font-semibold">
              {part.slice(2, -2)}
            </strong>
          ) : (
            part
          ),
        )}
      </li>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] font-sans items-center justify-center">
        <Loader2 className="animate-spin text-gray-400 w-8 h-8" />
        <span className="text-gray-500 font-medium mt-2">Memuat Konten...</span>
      </div>
    );
  }

  // =====================================================================
  // TAMPILAN 1: FLASHCARD SECTION
  // =====================================================================
  if (!showMaterial) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] font-sans overflow-hidden">
        <div className="flex-shrink-0">
          <HomeHeader />
        </div>

        <main className="flex-1 w-full px-6 py-8 flex flex-col items-center relative overflow-y-auto">
          {/* Tombol Back */}
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-6 p-2 -ml-2 rounded-full hover:bg-gray-100 transition z-20 text-gray-600 flex items-center gap-1"
          >
            <ArrowLeft size={20} />{" "}
            <span className="text-xs font-bold">Kembali</span>
          </button>

          <div className="mt-12 text-center mb-10">
            <h1 className="text-2xl font-black text-gray-800 mb-2">
              Flash Card
            </h1>
            <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
              Buka kartu secara berurutan untuk membuka materi pembelajaran.
            </p>
          </div>

          {/* CIRCLE INDICATORS */}
          {flashcards.length > 0 ? (
            <div className="flex items-center justify-center gap-6 sm:gap-10 mb-16 relative w-full max-w-md">
              {/* Progress Bar Background */}
              <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-200 -z-10 -translate-y-1/2 rounded-full" />
              {/* Progress Bar Active */}
              <div
                className="absolute top-1/2 left-4 h-1 bg-green-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
                style={{
                  width: `${(completedIndices.length / (flashcards.length - 1 || 1)) * 100}%`,
                  maxWidth: "calc(100% - 2rem)",
                }}
              />

              {flashcards.map((_, index) => {
                const isCompleted = completedIndices.includes(index);
                const isLocked =
                  index > 0 && !completedIndices.includes(index - 1);
                return (
                  <button
                    key={index}
                    onClick={() => handleOpenCard(index)}
                    disabled={isLocked}
                    className={`
                       relative w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black transition-all duration-300 shadow-sm
                        ${
                          isCompleted
                            ? " cursor-pointer bg-green-500 text-white shadow-green-200 hover:bg-green-600 scale-110 border-4 border-[#FAFAFA]"
                            : isLocked
                              ? "bg-gray-100 text-gray-300 border-2 border-gray-200 cursor-not-allowed"
                              : " cursor-pointer bg-white text-gray-800 border-4 border-blue-100 hover:border-blue-400 hover:scale-105 cursor-pointer shadow-md"
                        }
                        `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={32} />
                    ) : isLocked ? (
                      <Lock size={24} />
                    ) : (
                      index + 1
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-400 mb-10 bg-white p-6 rounded-xl border border-dashed">
              <p>Belum ada flashcard untuk materi ini.</p>
            </div>
          )}

          {/* BUTTON UNLOCK MATERI */}
          <div className="w-full max-w-xs mt-auto pb-10">
            <button
              onClick={() => setShowMaterial(true)}
              // Jika tidak ada flashcard, tombol tetap aktif agar siswa tidak terjebak
              disabled={flashcards.length > 0 && !allFlashcardsCompleted}
              className={`
                w-full py-4 rounded-2xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all duration-300
                ${
                  flashcards.length === 0 || allFlashcardsCompleted
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:scale-105 cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                }
              `}
            >
              {flashcards.length === 0 || allFlashcardsCompleted ? (
                <>
                  Lanjut ke Materi <ChevronRight size={18} strokeWidth={3} />
                </>
              ) : (
                <>
                  <Lock size={16} /> Selesaikan Flashcard
                </>
              )}
            </button>
          </div>
        </main>

        {/* --- MODAL FLASHCARD UI (Gaya Baru) --- */}
        {activeCardIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-sm aspect-[3/4] [perspective:1000px]">
              <div
                className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
              >
                {/* Sisi Depan */}
                <div
                  className={`absolute inset-0 w-full h-full [backface-visibility:hidden] bg-transparent ${isFlipped ? "pointer-events-none" : "z-10"}`}
                >
                  <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl bg-white flex items-center justify-center">
                    {flashcards[activeCardIndex].front_image_url ? (
                      <Image
                        src={flashcards[activeCardIndex].front_image_url}
                        alt="Front Card"
                        fill
                        className="object-fill"
                      />
                    ) : (
                      <span className="text-gray-400">
                        Flash card tidak tersedia
                      </span>
                    )}
                    <button
                      onClick={handleCloseModal}
                      className="cursor-pointer absolute top-4 right-4 z-20 p-1 bg-white/80 rounded-full"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-30">
                    <button
                      onClick={() => setIsFlipped(true)}
                      className="bg-slate-300 hover:bg-slate-400 text-black font-bold py-2 px-8 rounded-md shadow-lg active:scale-95"
                    >
                      Flip Card
                    </button>
                  </div>
                </div>

                {/* Sisi Belakang */}
                <div
                  className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-transparent ${isFlipped ? "z-10" : "pointer-events-none"}`}
                >
                  <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl bg-white flex items-center justify-center">
                    {flashcards[activeCardIndex].back_image_url ? (
                      <Image
                        src={flashcards[activeCardIndex].back_image_url}
                        alt="Back Card"
                        fill
                        className="object-fill"
                      />
                    ) : (
                      <span className="text-gray-400">
                        Flash card tidak tersedia
                      </span>
                    )}
                    <button
                      onClick={handleCloseModal}
                      className="absolute top-4 right-4 z-20 p-1 bg-white/80 rounded-full"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-30">
                    <button
                      onClick={() => setIsFlipped(false)}
                      className="bg-slate-300 hover:bg-slate-400 text-black font-bold py-2 px-8 rounded-md shadow-lg active:scale-95"
                    >
                      Flip Card
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =====================================================================
  // TAMPILAN 2: MATERI SECTION (SLIDER)
  // =====================================================================
  const currentSlide = materials[currentIndex];

  if (materials.length === 0) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] font-sans">
        <HomeHeader />
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 px-6 text-center">
          <p className="mb-2 font-semibold">Materi Tidak Ditemukan</p>
          <p className="text-sm">Belum ada konten materi untuk topik ini.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-black text-white rounded-full text-sm font-bold"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] font-sans overflow-hidden">
      <div className="flex-shrink-0">
        <HomeHeader />
      </div>

      <main
        ref={mainRef}
        className="flex-1 w-full px-5 py-4 overflow-y-auto scroll-smooth relative animate-in slide-in-from-right duration-300"
      >
        <button
          // Saat di Materi, tombol Back kembali ke tampilan Flashcard
          onClick={() => setShowMaterial(false)}
          className="absolute top-2 left-2 p-2 rounded-full hover:bg-gray-200 transition z-20 cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
        </button>

        <h1 className="text-center font-bold text-lg text-black mb-6 px-10">
          {currentSlide.title}
        </h1>

        <div className="flex flex-col gap-5 max-w-lg mx-auto pb-6">
          {currentSlide.content?.map((block, index) => {
            // Render Konten Materi (Sama seperti sebelumnya)
            if (block.type === "sub-header") {
              return (
                <h2
                  key={index}
                  style={block.style}
                  className="font-bold text-black text-base mt-2 uppercase tracking-wide"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.type === "paragraph") {
              const parts = block.text.split(/(\*\*.*?\*\*)/g);
              return (
                <p
                  key={index}
                  style={block.style}
                  className="text-sm text-gray-700 leading-relaxed whitespace-pre-line"
                >
                  {parts.map((part, i) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                      <strong key={i} className="font-bold text-black">
                        {part.slice(2, -2)}
                      </strong>
                    ) : (
                      part
                    ),
                  )}
                </p>
              );
            }
            if (block.type === "image") {
              return (
                <div
                  key={index}
                  style={block.style}
                  className="flex flex-col items-center my-2 w-full"
                >
                  <div
                    className="relative w-full flex justify-center group cursor-zoom-in bg-white p-2 rounded-xl border border-gray-100 shadow-sm"
                    onClick={() => setSelectedImage(block.src)}
                  >
                    <Image
                      src={block.src}
                      alt="Materi"
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{
                        width: "auto",
                        height: "auto",
                        maxWidth: "100%",
                        maxHeight: "400px",
                        objectFit: "contain",
                      }}
                      className="rounded-lg"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/50 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn size={16} />
                    </div>
                  </div>
                  {block.caption && (
                    <div className="text-[10px] text-gray-500 mt-2 text-center w-3/4 mx-auto leading-tight">
                      {block.caption}
                    </div>
                  )}
                </div>
              );
            }
            if (block.type === "video") {
              return (
                <div
                  key={index}
                  style={block.style}
                  className="flex flex-col items-center my-2"
                >
                  <div className="relative w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-black">
                    <video
                      controls
                      preload="metadata"
                      className="w-full h-auto"
                    >
                      <source src={block.src} type="video/mp4" />
                    </video>
                  </div>
                  {block.caption && (
                    <span className="text-[10px] text-gray-500 mt-2 text-center w-3/4 mx-auto">
                      {block.caption}
                    </span>
                  )}
                </div>
              );
            }
            if (block.type === "green-list") {
              const listNum =
                block.number !== undefined ? block.number : index + 1;
              const hasText = block.text && block.text.trim().length > 0;
              return (
                <div
                  key={index}
                  style={block.style}
                  className={`flex gap-3 my-2 ${hasText ? "items-start" : "items-center"}`}
                >
                  <div className={`flex-shrink-0 ${hasText ? "mt-0.5" : ""}`}>
                    {block.icon ? (
                      <div className="relative w-8 h-8">
                        <Image
                          src={block.icon}
                          alt={`Point ${listNum}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-700 font-bold text-xs shadow-sm font-sans">
                        {listNum}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {block.title && (
                      <h3
                        className={`font-bold text-black text-sm leading-snug ${hasText ? "mb-1" : "mb-0"}`}
                      >
                        {block.title}
                      </h3>
                    )}
                    {hasText && (
                      <div className="text-sm text-gray-700 leading-relaxed ">
                        {block.text}
                      </div>
                    )}
                  </div>
                </div>
              );
            }
            if (block.type === "smart-list") {
              return (
                <ul
                  key={index}
                  style={block.style}
                  className="space-y-1.5 mt-2"
                >
                  {block.items.map((item, i) => renderSmartListItem(item, i))}
                </ul>
              );
            }
            if (block.type === "bullet-list") {
              return (
                <ul
                  key={index}
                  className="list-disc pl-5 space-y-2 marker:text-gray-500"
                  style={block.style}
                >
                  {block.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-700 pl-1 leading-relaxed "
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }
            return null;
          })}
        </div>
      </main>

      {/* FOOTER NAVIGASI MATERI */}
      <div className="flex-shrink-0 w-full bg-white border-t border-gray-100 p-4 flex justify-between items-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={handlePrevSlide}
          disabled={currentIndex === 0}
          className={`p-2 rounded-full transition-all active:scale-95 ${currentIndex === 0 ? "text-gray-300" : "hover:bg-gray-100 text-black font-bold"}`}
        >
          <ChevronLeft className="w-8 h-8 stroke-[3px]" />
        </button>
        <span className="text-xs font-semibold text-gray-400">
          {currentIndex + 1} / {materials.length}
        </span>
        <button
          onClick={handleNextSlide}
          disabled={currentIndex === materials.length - 1}
          className={`p-2 rounded-full transition-all active:scale-95 ${currentIndex === materials.length - 1 ? "text-gray-300" : "hover:bg-gray-100 text-black font-bold"}`}
        >
          <ChevronRight className="w-8 h-8 stroke-[3px]" />
        </button>
      </div>

      {/* MODAL ZOOM GAMBAR */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
            onClick={() => setSelectedImage(null)}
          >
            <X size={24} />
          </button>
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Zoomed"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  );
}
