"use client";

import { useState, useRef, useEffect } from "react";
import HomeHeader from "@/components/homeHeader";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase-client";
import { getReadingMaterials } from "@/utils/supabase-queries";
import type { CSSProperties } from "react";

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

export default function MateriPage() {
  const params = useParams();
  const [materials, setMaterials] = useState<MaterialSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const rawId = params?.id;
        const subjectId = String(rawId);

        const data = await getReadingMaterials(supabase, subjectId);

        if (data && data.length > 0) {
          const formattedData: MaterialSlide[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            content: item.content as ContentBlock[],
          }));
          setMaterials(formattedData);
        } else {
          setMaterials([]);
        }
      } catch (error) {
        console.error("Gagal mengambil materi:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params]);

  // Scroll to top
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < materials.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // --- LOGIKA SMART LIST ---
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
        className={`text-sm text-gray-700 leading-relaxed text-justify list-none ${containerClass}`}
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
        <div className="text-gray-500 animate-pulse font-medium">
          Memuat Materi...
        </div>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] font-sans">
        <HomeHeader />
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 px-6 text-center">
          <p className="mb-2 font-semibold">Materi Tidak Ditemukan</p>
          <p className="text-sm">Belum ada data materi untuk topik ini.</p>
        </div>
      </div>
    );
  }

  const currentSlide = materials[currentIndex];

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] font-sans overflow-hidden">
      {/* HEADER */}
      <div className="flex-shrink-0">
        <HomeHeader />
      </div>

      {/* MAIN CONTENT */}
      <main
        ref={mainRef}
        className="flex-1 w-full px-5 py-4 overflow-y-auto scroll-smooth"
      >
        <h1 className="text-center font-bold text-lg text-black mb-6">
          {currentSlide.title}
        </h1>

        <div className="flex flex-col gap-5 max-w-lg mx-auto pb-6">
          {currentSlide.content?.map((block, index) => {
            // --- SUB HEADER ---
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

            // --- PARAGRAPH (PERBAIKAN DI SINI) ---
            if (block.type === "paragraph") {
              const parts = block.text.split(/(\*\*.*?\*\*)/g);
              return (
                <p
                  key={index}
                  style={block.style}
                  // TAMBAHKAN CLASS: whitespace-pre-line
                  className="text-sm text-gray-700 leading-relaxed text-justify whitespace-pre-line"
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

            // --- IMAGE ---
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
                      alt="Materi Image"
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
                      {block.caption.split("\n").map((line, i) => (
                        <span
                          key={i}
                          className={`block ${
                            i > 0
                              ? "text-[9px] text-gray-400 mt-0.5"
                              : "font-medium"
                          }`}
                        >
                          {line}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // --- VIDEO ---
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

            // --- GREEN LIST ---
            if (block.type === "green-list") {
              const listNum = block.number ? block.number : index + 1;
              const hasText = block.text && block.text.trim().length > 0;

              return (
                <div
                  key={index}
                  style={block.style}
                  className={`flex gap-3 ${
                    hasText ? "items-start" : "items-center"
                  }`}
                >
                  <div className={`flex-shrink-0 ${hasText ? "mt-0.5" : ""}`}>
                    {block.icon ? (
                      <div className="relative w-10 h-10">
                        <Image
                          src={block.icon}
                          alt={`Point ${listNum}`}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#C8E6C9] border border-[#A5D6A7] flex items-center justify-center text-green-900 font-bold text-sm shadow-sm font-sans">
                        {listNum}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {block.title && (
                      <h3
                        className={`font-bold text-black text-sm leading-snug ${
                          hasText ? "mb-1" : "mb-0"
                        }`}
                      >
                        {block.title}
                      </h3>
                    )}
                    {hasText && (
                      <div className="text-sm text-gray-700 leading-relaxed text-justify">
                        {block.text}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // --- SMART LIST ---
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

            // --- BULLET LIST ---
            if (block.type === "bullet-list") {
              return (
                <ul
                  key={index}
                  className="list-disc pl-5 space-y-2 marker:text-gray-500"
                  style={block.style}
                >
                  {block.items.map((item, i) => {
                    const parts = item.split(/(\*\*.*?\*\*)/g);
                    return (
                      <li
                        key={i}
                        className="text-sm text-gray-700 pl-1 leading-relaxed text-justify"
                      >
                        {parts.map((part, p) =>
                          part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={p} className="text-black">
                              {part.slice(2, -2)}
                            </strong>
                          ) : (
                            part
                          ),
                        )}
                      </li>
                    );
                  })}
                </ul>
              );
            }

            return null;
          })}
        </div>
      </main>

      {/* FOOTER */}
      <div className="flex-shrink-0 w-full bg-white border-t border-gray-100 p-4 flex justify-between items-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`p-2 rounded-full transition-all active:scale-95 ${
            currentIndex === 0
              ? "text-gray-300"
              : "hover:bg-gray-100 text-black font-bold"
          }`}
        >
          <ChevronLeft className="w-8 h-8 stroke-[3px]" />
        </button>
        <span className="text-xs font-semibold text-gray-400">
          {currentIndex + 1} / {materials.length}
        </span>
        <button
          onClick={handleNext}
          disabled={currentIndex === materials.length - 1}
          className={`p-2 rounded-full transition-all active:scale-95 ${
            currentIndex === materials.length - 1
              ? "text-gray-300"
              : "hover:bg-gray-100 text-black font-bold"
          }`}
        >
          <ChevronRight className="w-8 h-8 stroke-[3px]" />
        </button>
      </div>

      {/* MODAL */}
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
              alt="Zoomed Image"
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
