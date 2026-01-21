"use client";

import {
  ArrowLeft,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Save,
  StickyNote,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { useAuth } from "@/components/authProvider";
import HomeHeader from "@/components/homeHeader";
import { PracticeQuestion } from "@/types/database";
import {
  fetchReviewData,
  updateAdditionalAnswer,
} from "@/utils/service-latihan";
import { createClient } from "@/utils/supabase-client";
import { getPracticeQuestions } from "@/utils/supabase-queries";

const SkeletonLoader = () => {
  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans">
      <div className="flex-shrink-0">
        <HomeHeader />
      </div>
      <main className="flex-1 w-full px-6 pb-8 flex flex-col animate-pulse overflow-hidden">
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
        </div>
      </main>
    </div>
  );
};

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const idParam = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  // --- STATE ---
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // State Data Jawaban
  const [originalAnswers, setOriginalAnswers] = useState<
    Record<string, string>
  >({});
  const [additionalAnswers, setAdditionalAnswers] = useState<
    Record<string, string>
  >({});

  // State Editing Jawaban Tambahan
  const [isEditingAdditional, setIsEditingAdditional] = useState(false);
  const [tempAdditional, setTempAdditional] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // State Modal Flip Card
  const [showModal, setShowModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const initData = async () => {
      const idParam = Array.isArray(params?.id) ? params?.id[0] : params?.id;
      if (!idParam || !user) return;

      const parsedId = parseInt(idParam);
      if (isNaN(parsedId)) {
        setLoading(false);
        return;
      }

      try {
        const questionsData = await getPracticeQuestions(supabase, parsedId);
        setQuestions(questionsData);

        if (questionsData.length > 0) {
          const questionIds = questionsData.map((q) => q.id);
          const reviewData = await fetchReviewData(
            supabase,
            user.id,
            questionIds,
          );

          if (reviewData) {
            const orgAns: Record<number, string> = {};
            const addAns: Record<number, string> = {};

            reviewData.forEach((item) => {
              orgAns[item.question_id] = item.answer_text || "";
              addAns[item.question_id] = item.additional_answer || "";
            });

            setOriginalAnswers(orgAns);
            setAdditionalAnswers(addAns);
          }
        }
      } catch (error) {
        console.error("Error fetching review:", error);
        toast.error("Gagal memuat review.");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [params?.id, user]);

  // --- HANDLERS ---
  const handleStartEdit = () => {
    const currentQId = questions[currentIndex].id;
    setTempAdditional(additionalAnswers[currentQId] || "");
    setIsEditingAdditional(true);
  };

  const handleCancelEdit = () => {
    setIsEditingAdditional(false);
    setTempAdditional("");
  };

  const handleSaveAdditional = async () => {
    if (!user) return;
    const currentQId = questions[currentIndex].id;

    setIsSaving(true);
    try {
      await updateAdditionalAnswer(
        supabase,
        user.id,
        currentQId,
        tempAdditional,
      );

      setAdditionalAnswers((prev) => ({
        ...prev,
        [currentQId]: tempAdditional,
      }));

      setIsEditingAdditional(false);
      toast.success("Catatan berhasil disimpan!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan catatan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    setIsEditingAdditional(false);
    setIsFlipped(false);
    setShowModal(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsEditingAdditional(false);
    setIsFlipped(false);
    setShowModal(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
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
      <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans">
        <HomeHeader />
        <main className="flex-1 flex items-center justify-center text-gray-500">
          Data review tidak ditemukan.
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentOrgAnswer = originalAnswers[currentQuestion.id] || "";
  const currentAddAnswer = additionalAnswers[currentQuestion.id] || "";

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans overflow-hidden">
      {/* Header Sticky */}
      <div className="flex-shrink-0 z-20 bg-[#FAFAFA]">
        <HomeHeader />
      </div>

      {/* Main Content Scrollable */}
      <main className="flex-1 w-full px-6 flex flex-col overflow-y-auto pb-4 relative">
        {/* Tombol Kembali */}
        <div className="absolute top-2 left-6 z-10">
          <Link
            href={`/materi/${idParam}`}
            className="p-2 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:text-black hover:bg-gray-50 transition-all"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
          </Link>
        </div>

        {/* HEADER REVIEW */}
        <div className="flex items-center justify-center gap-2 mb-6 mt-4 opacity-70 flex-shrink-0">
          <BookOpenCheck className="text-green-600 pt-0.5" size={24} />
          <h2 className="text-lg font-bold text-gray-700">Review Jawaban</h2>
        </div>

        {/* AREA SOAL */}
        <div className="flex gap-4 mb-6 min-h-[100px] flex-shrink-0">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-violet-200 rounded-lg flex items-center justify-center text-3xl font-bold text-gray-700">
              {currentQuestion.number}
            </div>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed text-justify">
            {currentQuestion.question_text}
          </p>
        </div>

        {/* === BAGIAN 1: JAWABAN ORIGINAL === */}
        <div className="mb-8 relative flex flex-col min-h-[150px] flex-1 flex-shrink-0">
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
            Jawaban Anda:
          </label>

          <textarea
            value={currentOrgAnswer || ""}
            readOnly
            className="w-full flex-1 bg-transparent border-none outline-none resize-none text-base leading-[32px] p-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 31px, #9CA3AF 31px, #9CA3AF 32px)",
              backgroundAttachment: "local",
              lineHeight: "32px",
            }}
            placeholder="Tidak ada jawaban."
          />

          {/* TOMBOL FLIP CARD */}
          <div
            onClick={() => setShowModal(true)}
            className="absolute bottom-0 right-0 cursor-pointer hover:scale-105 transition-transform z-10"
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
        </div>

        {/* === BAGIAN 2: JAWABAN TAMBAHAN / REFLEKSI === */}
        {/* UBAH: Height dikurangi dari min-h-[200px] jadi min-h-[120px] */}
        <div className="flex-1 flex flex-col min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-wider">
              <StickyNote size={14} /> Review Jawaban
            </label>

            {!isEditingAdditional && (
              <button
                onClick={handleStartEdit}
                className="cursor-pointer text-xs flex items-center gap-1 text-green-600 font-bold hover:bg-green-50 px-3 py-1 rounded-full transition"
              >
                <Pencil size={12} /> {currentAddAnswer ? "Ubah" : "Tambah"}
              </button>
            )}
          </div>

          {/* Container Input / View */}
          <div
            // UBAH: min-h dikurangi dari 150px jadi 100px
            className={`relative rounded-xl border-2 transition-all duration-300 h-[160px] ${
              isEditingAdditional
                ? "border-green-400 bg-white shadow-lg"
                : "border-green-100 bg-green-50/50"
            }`}
          >
            {isEditingAdditional ? (
              <textarea
                value={tempAdditional}
                onChange={(e) => setTempAdditional(e.target.value)}
                className="w-full h-full bg-transparent resize-none outline-none text-gray-800 p-3 text-base rounded-xl"
                placeholder="Tulis jawaban yang lebih baik atau catatan refleksi di sini..."
                autoFocus
              />
            ) : (
              <div className="w-full h-full p-4 text-gray-700 whitespace-pre-wrap">
                {currentAddAnswer ? (
                  currentAddAnswer
                ) : (
                  <span className="text-gray-400 text-sm italic">
                    Belum ada review jawaban. Klik tombol di atas untuk
                    menambahkan.
                  </span>
                )}
              </div>
            )}
          </div>

          {/* --- TOMBOL AKSI (Mode Edit) --- */}
          {isEditingAdditional && (
            <div className="flex justify-end gap-2 mt-3 animate-fadeIn pb-4">
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="p-2.5 px-6 cursor-pointer bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-full transition shadow-sm"
                title="Batal"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAdditional}
                disabled={isSaving}
                className="cursor-pointer flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-full font-bold text-sm hover:bg-green-700 transition shadow-md disabled:opacity-70 active:scale-95"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Simpan
              </button>
            </div>
          )}
        </div>
      </main>

      {/* --- FOOTER NAVIGATION (STICKY BOTTOM) --- */}
      <div className="flex-shrink-0 px-6 py-4 bg-[#FAFAFA] border-t border-gray-100 z-20">
        <div className="w-full flex justify-between items-center">
          <div className="w-12">
            {currentIndex > 0 && (
              <button
                onClick={handlePrev}
                disabled={isEditingAdditional}
                className="p-3 hover:bg-gray-200 rounded-full transition disabled:opacity-30"
              >
                <ChevronLeft className="w-8 h-8 text-black stroke-[3px]" />
              </button>
            )}
          </div>

          <div className="w-12 flex justify-end">
            {currentIndex < questions.length - 1 && (
              <button
                onClick={handleNext}
                disabled={isEditingAdditional}
                className="p-3 hover:bg-gray-200 rounded-full transition disabled:opacity-30"
              >
                <ChevronRight className="w-8 h-8 text-black stroke-[3px]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL FLIP CARD (BANTUAN) --- */}
      {showModal && (
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
                  {currentQuestion.flip_image_front ? (
                    <Image
                      src={currentQuestion.flip_image_front}
                      alt="Front Card"
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

              {/* Sisi Belakang */}
              <div
                className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-transparent ${isFlipped ? "z-10" : "pointer-events-none"}`}
              >
                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl bg-white flex items-center justify-center">
                  {currentQuestion.flip_image_back ? (
                    <Image
                      src={currentQuestion.flip_image_back}
                      alt="Back Card"
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
    </div>
  );
}
