"use client";

import { useState } from "react";
import HomeHeader from "@/components/homeHeader";
import Image from "next/image";
import { ChevronRight, ChevronLeft, X } from "lucide-react";

// --- 1. DATA SOAL (DATABASE STATIS) ---
// Anda bisa mengubah teks, gambar, dan konten flip card untuk setiap soal di sini.
const QUESTIONS_DATA = [
  {
    id: 1,
    number: 1,
    text: "Seorang pasien mengalami pendarahan yang berkepanjangan setelah cedera ringan. Hasil tes laboratorium menunjukkan jumlah trombosit yang normal tetapi kadar fibrinogen yang sangat rendah. Analisislah bagaimana kondisi ini memengaruhi mekanisme pembekuan darah dan jelaskan mengapa pendarahan terus berlanjut.",
    flipImage: "/flip-1.png",
    flipImageBack: "/flip-1-back.png",
  },
  {
    id: 2,
    number: 2,
    text: "Jelaskan perbedaan mendasar antara arteri dan vena dilihat dari struktur dinding, katup, dan arah aliran darahnya. Mengapa pembuluh nadi (arteri) memiliki dinding yang lebih tebal dan elastis dibandingkan pembuluh balik (vena)?",
    // Data untuk Flip Card Soal 2
    flipImage: "/flip-2.png",
    flipImageBack: "/flip-2-back.png",
  },
  {
    id: 3,
    number: 3,
    text: "Seorang atlet lari jarak jauh memiliki denyut jantung istirahat yang lebih rendah dibandingkan orang yang jarang berolahraga. Analisislah mengapa hal tersebut bisa terjadi dan hubungannya dengan efisiensi kerja jantung.",
    flipImage: "/flip-3.png",
    flipImageBack: "/flip-3-back.png",
  },
  {
    id: 4,
    number: 4,
    text: "Eritroblastosis fetalis adalah kelainan darah yang terjadi pada bayi baru lahir. Jelaskan mekanisme terjadinya kelainan tersebut hubungannya dengan Rhesus ibu dan janin!",
    flipImage: "/flip-4.png",
    flipImageBack: "/flip-4-back.png",
  },
  {
    id: 5,
    number: 5,
    text: "Mengapa orang yang tinggal di pegunungan tinggi cenderung memiliki jumlah eritrosit yang lebih banyak dibandingkan orang yang tinggal di dataran rendah? Jelaskan hubungannya dengan ketersediaan oksigen!",
    flipImage: "/flip-5.png",
    flipImageBack: "/flip-5-back.png",
  },
  {
    id: 6,
    number: 6,
    text: "Mengapa orang yang tinggal di pegunungan tinggi cenderung memiliki jumlah eritrosit yang lebih banyak dibandingkan orang yang tinggal di dataran rendah? Jelaskan hubungannya dengan ketersediaan oksigen!",
    flipImage: "/flip-6.png",
    flipImageBack: "/flip-6-back.png",
  },
];

export default function LatihanSoalPage() {
  // --- STATE MANAGEMENT ---
  const [currentIndex, setCurrentIndex] = useState(0); // 0 = Soal pertama
  const [answers, setAnswers] = useState<Record<number, string>>({}); // { 1: "Jawab A", 2: "Jawab B" }

  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Mengambil data soal saat ini berdasarkan index
  const currentQuestion = QUESTIONS_DATA[currentIndex];
  const isLastQuestion = currentIndex === QUESTIONS_DATA.length - 1;

  // --- HANDLERS ---

  // 1. Simpan jawaban ke State saat mengetik
  const handleAnswerChange = (text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: text, // Simpan berdasarkan ID soal
    }));
  };

  // 2. Navigasi Next
  const handleNext = () => {
    if (currentIndex < QUESTIONS_DATA.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowModal(false); // Tutup modal jika terbuka
      setIsFlipped(false);
    } else {
      alert("Latihan selesai! Jawaban Anda telah tersimpan.");
      // Di sini bisa tambahkan logika redirect ke halaman hasil
    }
  };

  // 3. Navigasi Previous (Opsional, jika ingin bisa kembali)
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowModal(false);
      setIsFlipped(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => setIsFlipped(false), 300);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans relative">
      <HomeHeader />

      <main className="flex-1 w-full px-6 pb-8 flex flex-col">
        {/* JUDUL */}
        <div className="w-full flex justify-center mb-4">
          <div className="relative w-56 h-32">
            <Image
              src="/title-soal-latihan.png"
              alt="Soal Latihan Title"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* --- AREA SOAL DINAMIS --- */}
        <div className="flex gap-4 mb-8 min-h-[120px]">
          {/* Nomor Soal (Berubah sesuai state) */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-violet-200 rounded-lg flex items-center justify-center text-3xl font-bold text-gray-700 transition-all duration-300">
              {currentQuestion.number}
            </div>
          </div>
          {/* Teks Soal (Berubah sesuai state) */}
          <p className="text-sm text-gray-800 leading-relaxed text-justify animate-fadeIn">
            {currentQuestion.text}
          </p>
        </div>

        {/* --- AREA JAWABAN DINAMIS --- */}
        <div className="flex-1 relative flex flex-col min-h-[300px]">
          <textarea
            value={answers[currentQuestion.id] || ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full flex-1 bg-transparent border-none outline-none resize-none text-gray-800 text-base leading-[32px] focus:ring-0 p-0 transition-opacity duration-300"
            style={{
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 31px, #9CA3AF 31px, #9CA3AF 32px)",
              backgroundAttachment: "local",
              lineHeight: "32px",
            }}
            spellCheck={false}
            placeholder="Ketik Jawaban Disini"
          />

          {/* TOMBOL BANTUAN */}
          <div
            onClick={() => setShowModal(true)}
            className="absolute bottom-20 right-0 cursor-pointer hover:scale-105 transition-transform z-20"
          >
            <div className="relative w-20 h-20">
              <Image
                src="/perlu-bantuan.png"
                alt="Tombol Perlu Bantuan"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* --- NAVIGASI --- */}
          <div className="w-full flex justify-between items-center py-4">
            {/* Tombol Back (Hanya muncul jika bukan soal nomor 1) */}
            <div className="w-12">
              {currentIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="p-2 hover:bg-gray-200 rounded-full transition"
                >
                  <ChevronLeft className="w-8 h-8 text-black stroke-[3px]" />
                </button>
              )}
            </div>

            {/* Tombol Next */}
            {currentIndex === QUESTIONS_DATA.length - 1 ? (
              <button
                onClick={handleNext}
                className="bg-red-700 font-bold px-4 py-1 h-max rounded-md hover:bg-red-500"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="p-2 hover:bg-gray-200 rounded-full transition"
              >
                <ChevronRight className="w-8 h-8 text-black stroke-[3px]" />
              </button>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          {/* Container Perspective */}
          <div className="relative w-full max-w-sm aspect-[3/4] [perspective:1000px]">
            {/* Inner Card (Rotator) */}
            <div
              className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* =========================== */}
              {/* SISI DEPAN (FRONT)          */}
              {/* =========================== */}
              <div
                className={`absolute inset-0 w-full h-full [backface-visibility:hidden] bg-transparent ${
                  isFlipped ? "pointer-events-none" : "z-10"
                }`}
              >
                {/* 1. Wrapper Gambar (Rounded & Overflow Hidden disini) */}
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={currentQuestion.flipImage}
                    alt="Front Card"
                    fill
                    className="object-fill"
                  />

                  {/* Tombol Close (Di dalam wrapper gambar agar rapi) */}
                  <button
                    onClick={handleCloseModal}
                    className="absolute top-4 right-4 z-20 p-1 bg-white hover:bg-red-100 rounded-full transition shadow-sm backdrop-blur-md"
                  >
                    <X className="w-6 h-6 text-black" />
                  </button>
                </div>

                {/* 2. Tombol Putar (Di LUAR wrapper gambar agar bisa menonjol/keluar) */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-30">
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="cursor-pointer transition bg-slate-300 hover:bg-slate-400 text-black font-bold py-2 px-8 rounded-md shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                  >
                    <span>Flip Card</span>
                  </button>
                </div>
              </div>

              {/* =========================== */}
              {/* SISI BELAKANG (BACK)        */}
              {/* =========================== */}
              <div
                className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-transparent ${
                  isFlipped ? "z-10" : "pointer-events-none"
                }`}
              >
                {/* Wrapper Gambar Belakang */}
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={currentQuestion.flipImageBack}
                    alt="Back Card"
                    fill
                    className="object-fill"
                  />

                  {/* Tombol Close */}
                  <button
                    onClick={handleCloseModal}
                    className="absolute top-4 right-4 z-20 p-1 bg-white hover:bg-red-100 rounded-full transition shadow-sm backdrop-blur-md"
                  >
                    <X className="w-6 h-6 text-black" />
                  </button>
                </div>

                {/* Tombol Putar Balik (Menonjol di atas juga) */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-30">
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="cursor-pointer transition bg-slate-300 hover:bg-slate-400 text-black font-bold py-2 px-8 rounded-md shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                  >
                    <span>Flip Card</span>
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
