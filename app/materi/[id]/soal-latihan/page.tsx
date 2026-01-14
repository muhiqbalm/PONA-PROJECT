"use client";

import { useState, useEffect } from "react";
import HomeHeader from "@/components/homeHeader";
import Image from "next/image";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { createClient } from "@/utils/supabase-client";
import { getPracticeQuestions } from "@/utils/supabase-queries";
import { PracticeQuestion } from "@/types/database";
import { useParams } from "next/navigation";

// --- KOMPONEN SKELETON (UI Loading) ---
const SkeletonLoader = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans">
      <HomeHeader />
      <main className="flex-1 w-full px-6 pb-8 flex flex-col animate-pulse">
        {/* Skeleton Judul */}
        <div className="w-full flex justify-center mb-4">
          <div className="w-56 h-32 bg-gray-200 rounded-xl" />
        </div>

        {/* Skeleton Area Soal */}
        <div className="flex gap-4 mb-8 min-h-[120px]">
          {/* Skeleton Nomor */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
          </div>
          {/* Skeleton Teks Soal (3 baris) */}
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-11/12" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
          </div>
        </div>

        {/* Skeleton Area Jawaban */}
        <div className="flex-1 flex flex-col min-h-[300px] relative">
          {/* Area Textarea Dummy */}
          <div className="w-full flex-1 bg-gray-100 rounded-lg border border-gray-200" />

          {/* Skeleton Tombol Bantuan */}
          <div className="absolute bottom-20 right-0">
            <div className="w-20 h-20 bg-gray-200 rounded-full opacity-50" />
          </div>

          {/* Skeleton Navigasi */}
          <div className="w-full flex justify-between items-center py-4">
            {/* Tombol Kiri */}
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            {/* Tombol Kanan */}
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default function LatihanSoalPage() {
  const params = useParams();

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      const idParam = Array.isArray(params?.id) ? params?.id[0] : params?.id;

      if (!idParam) return;

      const parsedId = parseInt(idParam);

      if (isNaN(parsedId)) {
        console.error("ID Soal tidak valid");
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const data = await getPracticeQuestions(supabase, parsedId);
        setQuestions(data);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchQuestions();
    }
  }, [params?.id]);

  // --- TAMPILKAN SKELETON SAAT LOADING ---
  if (loading) {
    return <SkeletonLoader />;
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans">
        <HomeHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-lg text-gray-600">No questions available</div>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  // --- HANDLERS ---
  const handleAnswerChange = (text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: text,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowModal(false);
      setIsFlipped(false);
    } else {
      alert("Latihan selesai! Jawaban Anda telah tersimpan.");
    }
  };

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
          {/* Nomor Soal */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-violet-200 rounded-lg flex items-center justify-center text-3xl font-bold text-gray-700 transition-all duration-300">
              {currentQuestion.number}
            </div>
          </div>
          {/* Teks Soal */}
          <p className="text-sm text-gray-800 leading-relaxed text-justify animate-fadeIn">
            {currentQuestion.question_text}
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

            {currentIndex === questions.length - 1 ? (
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

      {/* MODAL (Sama seperti sebelumnya) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm aspect-[3/4] [perspective:1000px]">
            <div
              className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* SISI DEPAN */}
              <div
                className={`absolute inset-0 w-full h-full [backface-visibility:hidden] bg-transparent ${
                  isFlipped ? "pointer-events-none" : "z-10"
                }`}
              >
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={currentQuestion.flip_image_front}
                    alt="Front Card"
                    fill
                    className="object-fill"
                  />
                  <button
                    onClick={handleCloseModal}
                    className="cursor-pointer absolute top-4 right-4 z-20 p-1 bg-white hover:bg-red-100 rounded-full transition shadow-sm backdrop-blur-md"
                  >
                    <X className="w-6 h-6 text-black" />
                  </button>
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-30">
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="cursor-pointer transition bg-slate-300 hover:bg-slate-400 text-black font-bold py-2 px-8 rounded-md shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                  >
                    <span>Flip Card</span>
                  </button>
                </div>
              </div>

              {/* SISI BELAKANG */}
              <div
                className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-transparent ${
                  isFlipped ? "z-10" : "pointer-events-none"
                }`}
              >
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={currentQuestion.flip_image_back}
                    alt="Back Card"
                    fill
                    className="object-fill"
                  />
                  <button
                    onClick={handleCloseModal}
                    className="cursor-pointer absolute top-4 right-4 z-20 p-1 bg-white hover:bg-red-100 rounded-full transition shadow-sm backdrop-blur-md"
                  >
                    <X className="w-6 h-6 text-black" />
                  </button>
                </div>
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
