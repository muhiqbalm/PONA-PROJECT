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
  Key,
  ListChecks, // Icon untuk Rubrik
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

import { useAuth } from "@/components/authProvider";
import HomeHeader from "@/components/homeHeader";
import { createClient } from "@/utils/supabase-client";
import { PracticeQuestion } from "@/types/database";
import { getPracticeQuestions } from "@/utils/supabase-queries";

// Interface untuk Rubrik
interface RubricItem {
  id: number;
  question_id: number;
  score: number;
  description: string;
}

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

  // State Jawaban Siswa
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>(
    {},
  );
  const [studentAdditionalAnswers, setStudentAdditionalAnswers] = useState<
    Record<string, string>
  >({});

  // State Kunci Jawaban
  const [answerKeys, setAnswerKeys] = useState<Record<string, string>>({});

  // State Rubrik Skor (BARU)
  // Menyimpan array rubrik untuk setiap question_id
  const [rubricsMap, setRubricsMap] = useState<Record<string, RubricItem[]>>(
    {},
  );

  // State UI: Toggle Rubrik (buka/tutup)
  const [isRubricOpen, setIsRubricOpen] = useState(false);

  const [studentInfo, setStudentInfo] = useState<{
    name: string;
    class: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // State Modal Flip Card
  const [showModal, setShowModal] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset Rubrik toggle saat pindah soal
  useEffect(() => {
    setIsRubricOpen(false);
  }, [currentIndex]);

  // --- FETCH DATA ---
  useEffect(() => {
    const initData = async () => {
      if (!subjectIdParam || !studentIdParam) return;

      const parsedSubjectId = subjectIdParam;
      if (!parsedSubjectId) return;

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

        if (questionsData.length > 0) {
          const questionIds = questionsData.map((q) => q.id);

          // 3. Ambil Jawaban Siswa
          const { data: answersData } = await supabase
            .from("student_responses")
            .select("question_id, answer_text, additional_answer")
            .eq("student_id", studentIdParam)
            .in("question_id", questionIds);

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

          // 4. Ambil Kunci Jawaban
          const { data: keysData } = await supabase
            .from("answer_keys")
            .select("question_id, answer")
            .in("question_id", questionIds);

          if (keysData) {
            const keyMap: Record<number, string> = {};
            keysData.forEach((item) => {
              keyMap[item.question_id] = item.answer;
            });
            setAnswerKeys(keyMap);
          }

          // 5. Ambil Rubrik Skor (BARU)
          const { data: rubricsData } = await supabase
            .from("scoring_rubrics")
            .select("id, question_id, score, description")
            .in("question_id", questionIds)
            .order("score", { ascending: true }); // Urutkan skor 1, 2, 3...

          if (rubricsData) {
            const rMap: Record<number, RubricItem[]> = {};
            rubricsData.forEach((item) => {
              if (!rMap[item.question_id]) {
                rMap[item.question_id] = [];
              }
              rMap[item.question_id].push(item);
            });
            setRubricsMap(rMap);
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
  const currentKey = answerKeys[currentQuestion.id] || "";
  const currentRubrics = rubricsMap[currentQuestion.id] || []; // Ambil rubrik soal ini

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans overflow-hidden">
      {/* Header Sticky */}
      <div className="flex-shrink-0 z-20 bg-[#FAFAFA]">
        <HomeHeader />
      </div>

      {/* Main Content Scrollable */}
      <main className="flex-1 w-full px-6 flex flex-col overflow-y-auto pb-4 relative">
        {/* --- HEADER --- */}
        <div className="flex items-center gap-3 pt-2 mb-6">
          <Link
            href={`/dashboard/materi/${subjectIdParam}/review-jawaban`}
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 flex-shrink-0"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </Link>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-tight">
              Review Jawaban Siswa
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-lg font-black text-gray-800 leading-none truncate">
                {studentInfo?.name || "Nama Siswa"}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100 flex-shrink-0">
                {studentInfo?.class || "-"}
              </span>
            </div>
          </div>
        </div>

        {/* AREA SOAL */}
        <div className="flex gap-4 mb-4 min-h-[100px] flex-shrink-0">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-violet-200 rounded-lg flex items-center justify-center text-3xl font-bold text-gray-700">
              {currentQuestion.number}
            </div>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed ">
            {currentQuestion.question_text}
          </p>
        </div>

        {/* === AREA 1: JAWABAN SISWA === */}
        <div className="mb-6 relative flex flex-col min-h-[150px] flex-1 flex-shrink-0">
          <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider pl-1">
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

        {/* === AREA 3: JAWABAN TAMBAHAN (READ ONLY) === */}
        <div className="flex-1 flex flex-col min-h-[120px]">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-wider pl-1">
              <StickyNote size={14} /> Catatan Tambahan Siswa
            </label>
          </div>

          <div className="relative rounded-xl border-2 border-green-100 bg-green-50/50 h-[160px] p-4 overflow-y-auto shadow-sm">
            {currentAdditional ? (
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                {currentAdditional}
              </p>
            ) : (
              <p className="text-gray-400 italic text-sm">
                Tidak ada catatan tambahan dari siswa.
              </p>
            )}
          </div>
        </div>

        {/* === TOMBOL TOGGLE RUBRIK === */}
        <div className="mt-4">
          <button
            onClick={() => setIsRubricOpen(!isRubricOpen)}
            className="flex items-center gap-2 text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors bg-violet-50 px-3 py-2 rounded-lg w-fit border border-violet-100"
          >
            <ListChecks size={16} />
            {isRubricOpen
              ? "Sembunyikan Rubrik Penilaian"
              : "Lihat Rubrik Penilaian"}
            {isRubricOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* KONTEN RUBRIK (EXPANDABLE) */}
          {isRubricOpen && (
            <div className="mt-3 bg-white border border-violet-100 rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
              {currentRubrics.length > 0 ? (
                <div className="space-y-3">
                  {/* HEADER KOLOM (BARU) */}
                  <div className="flex gap-3 pb-2 border-b border-gray-100">
                    <span className="w-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Skor
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Deskripsi
                    </span>
                  </div>

                  {/* LIST ITEMS */}
                  {currentRubrics.map((rubric) => (
                    <div
                      key={rubric.id}
                      className="flex gap-3 text-sm border-b border-gray-50 last:border-0 pb-2 last:pb-0"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs">
                        {rubric.score}
                      </div>
                      <p className="text-gray-600 leading-snug pt-1">
                        {rubric.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic text-sm">
                  Belum ada rubrik penilaian untuk soal ini.
                </p>
              )}
            </div>
          )}
        </div>

        {/* === AREA 2: KUNCI JAWABAN === */}
        <div className="flex-shrink-0 mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider pl-1">
              <Key size={14} /> Kunci Jawaban
            </label>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
            {currentKey ? (
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {currentKey}
              </p>
            ) : (
              <p className="text-gray-400 italic text-sm">
                Kunci jawaban belum tersedia.
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
