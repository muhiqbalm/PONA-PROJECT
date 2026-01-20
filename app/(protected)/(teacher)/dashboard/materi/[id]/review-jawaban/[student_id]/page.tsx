"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  StickyNote,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

import { useAuth } from "@/components/authProvider";
import HomeHeader from "@/components/homeHeader";
import { createClient } from "@/utils/supabase-client";
import { PracticeQuestion } from "@/types/database";
import { getPracticeQuestions } from "@/utils/supabase-queries";

export default function GuruReviewStudentPage() {
  const params = useParams();
  const { user } = useAuth();
  const supabase = createClient();

  // Ambil ID Materi & ID Siswa dari URL
  const subjectIdParam = Array.isArray(params?.id) ? params?.id[0] : params?.id;
  const studentIdParam = Array.isArray(params?.student_id)
    ? params?.student_id[0]
    : params?.student_id;

  // --- STATE ---
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);

  // State Jawaban
  const [studentAnswers, setStudentAnswers] = useState<Record<number, string>>(
    {},
  );
  const [studentAdditionalAnswers, setStudentAdditionalAnswers] = useState<
    Record<number, string>
  >({});

  const [studentInfo, setStudentInfo] = useState<{
    name: string;
    class: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // State Modal Flip Card
  const [showModal, setShowModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    const initData = async () => {
      if (!subjectIdParam || !studentIdParam) return;

      const parsedSubjectId = parseInt(subjectIdParam);
      if (isNaN(parsedSubjectId)) return;

      try {
        setLoading(true);

        // 1. Ambil Info Siswa
        const { data: studentData } = await supabase
          .from("students")
          .select("full_name, class_name")
          .eq("id", studentIdParam)
          .single();

        if (studentData) {
          setStudentInfo({
            name: studentData.full_name,
            class: studentData.class_name,
          });
        }

        // 2. Ambil Daftar Soal
        const questionsData = await getPracticeQuestions(
          supabase,
          parsedSubjectId,
        );
        setQuestions(questionsData);

        // 3. Ambil Jawaban Siswa
        if (questionsData.length > 0) {
          const { data: answersData } = await supabase
            .from("student_responses")
            .select("question_id, answer_text, additional_answer")
            .eq("student_id", studentIdParam)
            .in(
              "question_id",
              questionsData.map((q) => q.id),
            );

          if (answersData) {
            const ansMap: Record<number, string> = {};
            const addAnsMap: Record<number, string> = {};

            answersData.forEach((item) => {
              ansMap[item.question_id] = item.answer_text || "";
              addAnsMap[item.question_id] = item.additional_answer || "";
            });

            setStudentAnswers(ansMap);
            setStudentAdditionalAnswers(addAnsMap);
          }
        }
      } catch (error) {
        console.error("Error fetching review data:", error);
        toast.error("Gagal memuat data review siswa.");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [subjectIdParam, studentIdParam, supabase]);

  // --- HANDLERS ---
  const handleNext = () => {
    setIsFlipped(false);
    setShowModal(false);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
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
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans">
        <HomeHeader />
        <main className="flex-1 flex items-center justify-center text-gray-500">
          Data soal tidak ditemukan.
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = studentAnswers[currentQuestion.id] || "";
  const currentAdditional = studentAdditionalAnswers[currentQuestion.id] || "";

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans overflow-hidden">
      {/* Header Sticky */}
      <div className="flex-shrink-0 z-20 bg-[#FAFAFA]">
        <HomeHeader />
      </div>

      {/* Main Content Scrollable */}
      <main className="flex-1 w-full px-6 flex flex-col overflow-y-auto pb-4 relative">
        {/* --- HEADER UPDATE --- */}
        <div className="flex items-center gap-2 pt-2 mb-6">
          <Link
            href={`/dashboard/materi/${subjectIdParam}/review-jawaban`}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all active:scale-95 flex-shrink-0"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Link>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {/* LABEL ATAS */}
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider leading-tight">
              Review Jawaban Siswa
            </p>

            {/* NAMA DAN KELAS SEJAJAR */}
            <div className="flex items-center gap-2 mt-0.5">
              <h4 className="text-base font-extrabold text-gray-800 leading-none truncate">
                {studentInfo?.name || "Nama Siswa"}
              </h4>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100 flex-shrink-0">
                {studentInfo?.class || "-"}
              </span>
            </div>
          </div>
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

        {/* === AREA 1: JAWABAN SISWA (UI KERTAS BERGARIS) === */}
        <div className="mb-8 relative flex flex-col min-h-[150px] flex-1 flex-shrink-0">
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
            Jawaban Siswa:
          </label>

          <textarea
            value={currentAnswer || ""}
            readOnly
            className="w-full flex-1 bg-transparent border-none outline-none resize-none text-base leading-[32px] p-0 text-gray-700"
            style={{
              backgroundImage:
                "repeating-linear-gradient(transparent, transparent 31px, #9CA3AF 31px, #9CA3AF 32px)",
              backgroundAttachment: "local",
              lineHeight: "32px",
            }}
            placeholder="Siswa tidak menjawab soal ini."
          />

          {/* TOMBOL LIHAT KUNCI / BANTUAN */}
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

        {/* === AREA 2: JAWABAN TAMBAHAN (READ ONLY) === */}
        <div className="flex-1 flex flex-col min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-wider">
              <StickyNote size={14} /> Review Jawaban Siswa
            </label>
          </div>

          <div className="relative rounded-xl border-2 border-green-100 bg-green-50/50 h-[160px] p-4 overflow-y-auto">
            {currentAdditional ? (
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                {currentAdditional}
              </p>
            ) : (
              <p className="text-gray-400 italic text-sm">
                Tidak ada review jawaban dari siswa.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* --- FOOTER NAVIGATION --- */}
      <div className="flex-shrink-0 px-6 py-4 bg-[#FAFAFA] border-t border-gray-100 z-20">
        <div className="w-full flex justify-between items-center">
          <div className="w-12">
            {currentIndex > 0 && (
              <button
                onClick={handlePrev}
                className="p-3 hover:bg-gray-200 rounded-full transition active:scale-90"
              >
                <ChevronLeft className="w-8 h-8 text-black stroke-[3px]" />
              </button>
            )}
          </div>

          <span className="text-sm font-bold text-gray-400">
            {currentIndex + 1} / {questions.length}
          </span>

          <div className="w-12 flex justify-end">
            {currentIndex < questions.length - 1 && (
              <button
                onClick={handleNext}
                className="p-3 hover:bg-gray-200 rounded-full transition active:scale-90"
              >
                <ChevronRight className="w-8 h-8 text-black stroke-[3px]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL FLIP CARD --- */}
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
                    <span className="text-gray-400 font-medium">
                      Tidak ada gambar depan
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
                    <span className="text-gray-400 font-medium">
                      Tidak ada gambar belakang
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
