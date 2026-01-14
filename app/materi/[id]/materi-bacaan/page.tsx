"use client";

import { useState } from "react";
import HomeHeader from "@/components/homeHeader";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- 1. DEFINISI TIPE DATA KONTEN ---
// Agar struktur data rapi dan konsisten
type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "image"; src: string; caption?: string }
  | { type: "green-list"; title?: string; text: string; subItems?: string[] } // Untuk list angka hijau
  | { type: "bullet-list"; items: string[] }; // Untuk list titik biasa

interface MaterialSlide {
  id: number;
  title: string;
  content: ContentBlock[];
}

// --- 2. DATA MATERI (DATABASE) ---
// Anda bisa menambah/mengurangi slide di sini tanpa ubah kodingan UI
const MATERIALS_DATA: MaterialSlide[] = [
  {
    id: 1,
    title: "Tahukah Kamu?",
    content: [
      {
        type: "paragraph",
        text: "Bagaimana sistem tubuh kita mendistribusikan sari makanan dan mengeluarkan zat sisa, sehingga kebutuhan tubuh tercukupi tanpa terkecuali?",
      },
      {
        type: "image",
        src: "/diagram-sirkulasi.png", // Pastikan ada gambar ini di public folder
        caption: "Gambar 1: Curah Jantung Saat Istirahat",
      },
    ],
  },
  {
    id: 2,
    title: "Fungsi Sistem Peredaran Darah",
    content: [
      {
        type: "green-list",
        title: "Transportasi",
        text: "Mengedarkan garam mineral, gas, hormon, enzim, dan zat lainnya menuju ke seluruh tubuh. Membawa zat sisa metabolisme menuju ke paru-paru, ginjal, dan kulit untuk diekskresikan.",
      },
      {
        type: "green-list",
        title: "Penjaga Suhu Tubuh",
        text: "Darah membawa energi panas ke seluruh tubuh akibat proses metabolisme.",
      },
      {
        type: "green-list",
        title: "Perlindungan",
        text: "Darah memiliki mekanisme perlindungan dari benda asing yang dilakukan oleh sel darah putih. Adanya mekanisme pembekuan darah mencegah tubuh kehilangan banyak darah.",
      },
    ],
  },
  {
    id: 3,
    title: "Komposisi Darah",
    content: [
      {
        type: "green-list",
        title: "Plasma Darah",
        text: "Total plasma darah = 55% dari keseluruhan darah.",
        subItems: [
          "90% air",
          "8% protein darah (Albumin, Globulin, Fibrinogen)",
          "0.9% garam mineral (NaCl, NaHCO3, dll)",
        ],
      },
      {
        type: "green-list",
        title: "Sel-sel Darah",
        text: "Komponen padat darah yang terdiri dari:",
        subItems: [
          "Eritrosit (Sel Darah Merah)",
          "Leukosit (Sel Darah Putih)",
          "Trombosit (Keping Darah)",
        ],
      },
      {
        type: "image",
        src: "/komposisi-darah.png",
        caption: "Gambar 2: Komponen Darah",
      },
    ],
  },
  {
    id: 4,
    title: "Mekanisme Pembekuan Darah",
    content: [
      {
        type: "paragraph",
        text: "Terdapat beberapa faktor yang terlibat dalam proses pembekuan darah, yakni:",
      },
      {
        type: "bullet-list",
        items: [
          "Protrombin: Diproduksi di hati dengan bantuan vit K.",
          "Fibrinogen: Protein yang akan diubah menjadi fibrin.",
          "Ion Kalsium",
          "Tromboplastin",
          "Vitamin K: Penting dalam sintesis protrombin.",
        ],
      },
      {
        type: "image",
        src: "/mekanisme-beku.png",
        caption: "Gambar 4: Proses Pembekuan Darah",
      },
    ],
  },
];

export default function MateriPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Navigasi Next/Prev
  const handleNext = () => {
    if (currentIndex < MATERIALS_DATA.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo(0, 0); // Scroll ke atas saat ganti halaman
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const currentSlide = MATERIALS_DATA[currentIndex];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans">
      <HomeHeader />

      {/* --- KONTEN AREA (SCROLLABLE) --- */}
      <main className="flex-1 w-full px-6 pb-24 pt-4 overflow-y-auto">
        {/* Judul Materi */}
        <h1 className="text-center font-bold text-lg text-black mb-6">
          {currentSlide.title}
        </h1>

        {/* Render Konten Secara Dinamis */}
        <div className="flex flex-col gap-6">
          {currentSlide.content.map((block, index) => {
            // 1. RENDER TEXT
            if (block.type === "paragraph") {
              return (
                <p
                  key={index}
                  className="text-sm text-gray-700 leading-relaxed text-justify"
                >
                  {block.text}
                </p>
              );
            }

            // 2. RENDER IMAGE
            if (block.type === "image") {
              return (
                <div key={index} className="flex flex-col items-center my-2">
                  <div className="relative w-full h-56 rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <Image
                      src={block.src}
                      alt="Materi Image"
                      fill
                      className="object-contain bg-white"
                    />
                  </div>
                  {block.caption && (
                    <span className="text-xs text-gray-500 mt-2 italic text-center">
                      {block.caption}
                    </span>
                  )}
                </div>
              );
            }

            // 3. RENDER GREEN NUMBERED LIST
            if (block.type === "green-list") {
              // Hitung nomor urut dalam slide ini (opsional, atau hardcode di data)
              // Disini saya pakai index mapping sederhana atau bisa manual dari data
              return (
                <div key={index} className="flex gap-4">
                  {/* Lingkaran Hijau Angka */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-sm shadow-sm">
                      {index + 1}
                    </div>
                  </div>
                  {/* Teks */}
                  <div className="flex-1">
                    {block.title && (
                      <h3 className="font-bold text-black text-sm mb-1">
                        {block.title}
                      </h3>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">
                      {block.text}
                    </p>
                    {/* Sub Items (Bullet kecil) */}
                    {block.subItems && (
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {block.subItems.map((sub, i) => (
                          <li key={i} className="text-xs text-gray-600 pl-1">
                            {sub}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            }

            // 4. RENDER BULLET LIST BIASA
            if (block.type === "bullet-list") {
              return (
                <ul key={index} className="list-disc pl-5 space-y-2">
                  {block.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-700 pl-1 leading-relaxed"
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

      {/* --- FOOTER NAVIGATION (FIXED BOTTOM) --- */}
      <div className="fixed bottom-0 w-full max-w-[420px] bg-white border-t border-gray-100 p-4 flex justify-between items-center z-50">
        {/* Tombol Previous */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`p-3 rounded-full transition ${
            currentIndex === 0
              ? "text-gray-300"
              : "hover:bg-gray-100 text-black"
          }`}
        >
          <ChevronLeft className="w-8 h-8 stroke-[3px]" />
        </button>

        {/* Indikator Halaman (Opsional) */}
        <span className="text-xs font-medium text-gray-400">
          {currentIndex + 1} / {MATERIALS_DATA.length}
        </span>

        {/* Tombol Next */}
        <button
          onClick={handleNext}
          disabled={currentIndex === MATERIALS_DATA.length - 1}
          className={`p-3 rounded-full transition ${
            currentIndex === MATERIALS_DATA.length - 1
              ? "text-gray-300"
              : "hover:bg-gray-100 text-black"
          }`}
        >
          <ChevronRight className="w-8 h-8 stroke-[3px]" />
        </button>
      </div>
    </div>
  );
}
