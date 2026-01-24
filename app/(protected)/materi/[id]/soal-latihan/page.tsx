"use client";

import {
  AlertTriangle,
  ArrowLeft, // Import Icon ArrowLeft
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link"; // Import Link
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { useAuth } from "@/components/authProvider";
import HomeHeader from "@/components/homeHeader";
import { submitFinalQuiz } from "@/utils/service-latihan";
import { useLatihanSoal } from "@/utils/useLatihanSoal";

// --- KOMPONEN SKELETON ---
const SkeletonLoader = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans">
      <HomeHeader />
      <main className="flex-1 w-full px-6 pb-8 flex flex-col animate-pulse">
        <div className="w-full flex justify-center mb-4">
          <div className="w-56 h-32 bg-gray-200 rounded-xl" />
        </div>
        <div className="flex gap-4 mb-8 min-h-[120px]">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-200 rounded-lg" />
          </div>
          <div className="flex-1 space-y-3 pt-1">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-11/12" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
          </div>
        </div>
        <div className="flex-1 flex flex-col min-h-[300px] relative">
          <div className="w-full flex-1 bg-gray-100 rounded-lg border border-gray-200" />
          <div className="absolute bottom-20 right-0">
            <div className="w-20 h-20 bg-gray-200 rounded-full opacity-50" />
          </div>
          <div className="w-full flex justify-between items-center py-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default function LatihanSoalPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // Ekstrak ID untuk link kembali
  const idParam = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  // --- GUNAKAN CUSTOM HOOK ---
  const {
    questions,
    loading,
    answers,
    setAnswers,
    hasSubmitted,
    setHasSubmitted,
    supabase,
  } = useLatihanSoal(params?.id, user);

  // State UI Lokal
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- LOGIC SIMPAN ---
  const saveAnswerToDb = async (questionId: string, answerText: string) => {
    if (!user || hasSubmitted) return;
    if (!answerText || answerText.trim() === "") return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from("student_responses").upsert(
        {
          student_id: user.id,
          question_id: questionId,
          answer_text: answerText,
        },
        { onConflict: "student_id, question_id" },
      );

      if (error) throw error;
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LOGIC FINAL SUBMIT ---
  const onConfirmSubmit = async () => {
    setShowSubmitModal(false);
    setIsSubmitting(true);
    try {
      const idParam = Array.isArray(params?.id) ? params?.id[0] : params?.id;
      await submitFinalQuiz(supabase, user!.id, idParam!);

      toast.success("Jawaban berhasil dikumpulkan!", { duration: 4000 });
      setHasSubmitted(true);
      router.push(`/materi/${idParam}`); // Redirect kembali ke materi
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengumpulkan jawaban.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLERS ---
  const handleAnswerChange = (text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentIndex].id]: text,
    }));
  };

  const handleNext = async () => {
    const currentQ = questions[currentIndex];
    const currentAns = answers[currentQ.id] || "";
    await saveAnswerToDb(currentQ.id, currentAns);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowModal(false);
      setIsFlipped(false);
    } else {
      if (hasSubmitted) {
        router.push(`/materi/${idParam}`);
      } else {
        setShowSubmitModal(true);
      }
    }
  };

  const handlePrev = async () => {
    const currentQ = questions[currentIndex];
    const currentAns = answers[currentQ.id] || "";
    await saveAnswerToDb(currentQ.id, currentAns);

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

  // --- RENDER ---
  if (loading) return <SkeletonLoader />;

  if (questions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans">
        <HomeHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Soal tidak ditemukan.</div>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans relative">
      <HomeHeader />

      <main className="flex-1 w-full px-6 pb-8 flex flex-col relative">
        {/* --- TOMBOL KEMBALI (BARU) --- */}
        {/* Diposisikan absolute agar judul tetap di tengah */}
        <div className="absolute top-0 z-10">
          <Link
            href={`/materi/${idParam}`}
            className="absolute top-0 p-2 rounded-full hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
          </Link>
        </div>

        {/* JUDUL */}
        <div className="w-full flex justify-center mb-4 mt-2">
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

        {/* AREA SOAL */}
        <div className="flex gap-4 mb-8 min-h-[120px]">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-violet-200 rounded-lg flex items-center justify-center text-3xl font-bold text-gray-700">
              {currentQuestion.number}
            </div>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed text-justify animate-fadeIn">
            {currentQuestion.question_text}
          </p>
        </div>

        {/* AREA JAWABAN */}
        <div className="flex-1 relative flex flex-col min-h-[300px]">
          <textarea
            value={answers[currentQuestion.id] || ""}
            onChange={(e) =>
              !hasSubmitted && handleAnswerChange(e.target.value)
            }
            disabled={hasSubmitted || isSubmitting}
            className={`w-full flex-1 border-none outline-none resize-none text-base leading-[32px] focus:ring-0 p-2 transition-all duration-300 rounded-lg ${
              hasSubmitted
                ? "bg-gray-50 text-gray-800 select-text cursor-default"
                : "bg-transparent text-gray-800"
            }`}
            style={{
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 31px, #9CA3AF 31px, #9CA3AF 32px)",
              backgroundAttachment: "local",
              lineHeight: "32px",
            }}
            spellCheck={false}
            placeholder={
              hasSubmitted ? "Tidak ada jawaban." : "Ketik Jawaban Disini..."
            }
          />

          <div
            onClick={() => setShowModal(true)}
            className="absolute bottom-20 right-0 cursor-pointer hover:scale-105 transition-transform z-20"
          >
            <div className="relative w-20 h-20">
              <Image
                src="/perlu-bantuan.png"
                alt="Bantuan"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* NAVIGASI */}
          <div className="w-full flex justify-between items-center py-4 z-40 relative">
            <div className="w-12">
              {currentIndex > 0 && (
                <button
                  onClick={handlePrev}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-gray-200 rounded-full transition disabled:opacity-50"
                >
                  <ChevronLeft className="w-8 h-8 text-black stroke-[3px]" />
                </button>
              )}
            </div>

            <div className="flex-1 flex justify-center">
              {isSubmitting && !hasSubmitted && (
                <div className="flex items-center gap-2 text-xs text-gray-400 font-medium animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Menyimpan...</span>
                </div>
              )}
            </div>

            <div className="flex justify-end min-w-[3rem]">
              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className={`font-bold px-6 py-2 h-max rounded-md text-white shadow-md transition-all flex items-center gap-2 ${
                    hasSubmitted
                      ? "bg-gray-500 hover:bg-gray-600"
                      : "bg-red-700 hover:bg-red-600"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Proses...
                    </>
                  ) : hasSubmitted ? (
                    "Kembali"
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Submit Final
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="p-2 hover:bg-gray-200 rounded-full transition disabled:opacity-50"
                >
                  <ChevronRight className="w-8 h-8 text-black stroke-[3px]" />
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL 1: FLIP CARD (BANTUAN) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm aspect-[3/4] [perspective:1000px]">
            <div
              className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
            >
              {/* Depan */}
              <div
                className={`absolute inset-0 w-full h-full [backface-visibility:hidden] bg-transparent ${isFlipped ? "pointer-events-none" : "z-10"}`}
              >
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl bg-white flex items-center justify-center">
                  {currentQuestion.flip_image_front ? (
                    <Image
                      src={currentQuestion.flip_image_front}
                      alt="Front"
                      fill
                      className="object-fill"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
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
                    onClick={() => setIsFlipped(true)}
                    className="bg-slate-300 hover:bg-slate-400 text-black font-bold py-2 px-8 rounded-md shadow-lg active:scale-95"
                  >
                    Flip Card
                  </button>
                </div>
              </div>
              {/* Belakang */}
              <div
                className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-transparent ${isFlipped ? "z-10" : "pointer-events-none"}`}
              >
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl bg-white flex items-center justify-center">
                  {currentQuestion.flip_image_back ? (
                    <Image
                      src={currentQuestion.flip_image_back}
                      alt="Back"
                      fill
                      className="object-fill"
                    />
                  ) : (
                    <span className="text-gray-400">No Image</span>
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

      {/* --- MODAL 2: KONFIRMASI SUBMIT --- */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSubmitModal(false)}
          ></div>

          <div className="bg-white rounded-[2rem] p-6 w-full max-w-xs shadow-2xl transform transition-all scale-100 relative z-10 flex flex-col items-center text-center animate-fadeIn">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
              <AlertTriangle size={28} />
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-2">
              Kumpulkan Jawaban?
            </h3>
            <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">
              Apakah Anda yakin sudah selesai? Jawaban{" "}
              <span className="font-bold text-red-500">tidak bisa diubah</span>{" "}
              setelah dikumpulkan.
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-full font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Periksa Lagi
              </button>
              <button
                onClick={onConfirmSubmit}
                className="flex-1 py-3 rounded-full font-bold text-sm text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all active:scale-95"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
