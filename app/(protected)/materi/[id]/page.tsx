"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, Loader2, Lock } from "lucide-react";
import { useParams } from "next/navigation";

import { useAuth } from "@/components/authProvider";
import { createClient } from "@/utils/supabase-client";
import HomeHeader from "@/components/homeHeader";

type QuizStatus = "idle" | "in_progress" | "completed";

export default function DetailMateriPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const { user } = useAuth();
  const supabase = createClient();

  const [quizStatus, setQuizStatus] = useState<QuizStatus>("idle");
  // 1. Tambah state untuk menyimpan nama subject
  const [subjectTitle, setSubjectTitle] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !id) return;
      const subjectId = id;

      try {
        // --- A. AMBIL NAMA SUBJECT ---
        const { data: subjectData } = await supabase
          .from("subjects") // Pastikan nama tabelnya 'subjects'
          .select("name") // Pastikan nama kolomnya 'title'
          .eq("id", subjectId)
          .single();

        if (subjectData) {
          setSubjectTitle(subjectData.name);
        }

        // --- B. CEK PROGRESS (Logic Lama) ---
        const { data: progressData } = await supabase
          .from("student_quiz_progress")
          .select("is_submitted")
          .eq("student_id", user.id)
          .eq("subject_id", subjectId)
          .maybeSingle();

        if (progressData?.is_submitted) {
          setQuizStatus("completed");
          return;
        }

        const { count } = await supabase
          .from("student_responses")
          .select("id, practice_questions!inner(subject_id)", {
            count: "exact",
            head: true,
          })
          .eq("student_id", user.id)
          .eq("practice_questions.subject_id", subjectId);

        if (count && count > 0) {
          setQuizStatus("in_progress");
        } else {
          setQuizStatus("idle");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user, id]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans">
      <HomeHeader />

      <header className="relative flex items-center justify-center px-6 pb-6 bg-transparent">
        <Link
          href="/"
          className="absolute left-6 top-0 p-2 -ml-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
        </Link>

        {/* 2. Update Tampilan Header */}
        <div className="flex flex-col items-center text-center pt-1">
          <h1 className="text-xl font-bold text-black leading-none">
            Materi Pembelajaran
          </h1>
          {/* Tampilkan Nama Subject di sini */}
          <p className="text-sm text-gray-500 font-medium mt-1">
            {subjectTitle ? (
              subjectTitle
            ) : (
              <span className="animate-pulse">Memuat...</span>
            )}
          </p>
        </div>
      </header>

      <main className="flex-1 w-full p-6 flex flex-col gap-4">
        <ActionCard
          title="Mari Belajar"
          imageSrc="https://aemfbowlzgerzztfryre.supabase.co/storage/v1/object/public/images/materi-bacaan.png"
          href={`/materi/${id}/materi-bacaan`}
        />

        <ActionCard
          title="Ayo Berlatih"
          imageSrc="/soal-latihan.png"
          href={`/materi/${id}/soal-latihan`}
          status={quizStatus}
        />

        <ActionCard
          title="Review Jawaban"
          imageSrc="/review-jawaban.png"
          href={`/materi/${id}/review-jawaban`}
          isLocked={quizStatus !== "completed"}
        />
      </main>
    </div>
  );
}

// --- Komponen ActionCard (Versi Final Tanpa Error TS) ---
function ActionCard({
  title,
  imageSrc,
  href,
  status = "idle",
  isLocked = false,
}: {
  title: string;
  imageSrc: string;
  href: string;
  status?: QuizStatus;
  isLocked?: boolean;
}) {
  const CardContent = (
    <div
      className={`
        rounded-3xl p-4 h-28 flex items-center outline-2 outline-transparent shadow-sm transition-all relative overflow-hidden
        ${
          isLocked
            ? "bg-gray-100 opacity-80"
            : "bg-white hover:shadow-lg hover:outline-slate-200 shadow-slate-200 hover:shadow-slate-200"
        }
      `}
    >
      {/* --- BADGE STATUS --- */}
      {status === "completed" && (
        <div className="absolute top-3 right-3 bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold text-xs flex items-center gap-1 shadow-sm z-10 border border-green-200">
          <CheckCircle size={14} /> Selesai
        </div>
      )}

      {status === "in_progress" && (
        <div className="absolute top-3 right-3 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold text-xs flex items-center gap-1 shadow-sm z-10 border border-blue-100">
          <Loader2 size={14} className="animate-spin" /> Proses
        </div>
      )}

      {/* --- ICON GEMBOK (JIKA LOCKED) --- */}
      {isLocked && (
        <div className="absolute top-3 right-3 bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-bold text-xs flex items-center gap-1 shadow-sm z-10">
          <Lock size={14} /> Terkunci
        </div>
      )}

      {/* Area Gambar */}
      <div
        className={`w-24 h-20 relative flex-shrink-0 mr-4 ${
          isLocked ? "grayscale opacity-50" : ""
        }`}
      >
        <Image src={imageSrc} alt={title} fill className="object-contain" />
      </div>

      {/* Area Teks */}
      <div className="flex-1">
        <h2
          className={`text-lg font-bold leading-tight ${
            isLocked ? "text-gray-400" : "text-black"
          }`}
        >
          {title.split(" ").map((word, i) => (
            <span key={i} className="block">
              {word}
            </span>
          ))}
        </h2>
      </div>
    </div>
  );

  if (isLocked) {
    return (
      <div className="w-full relative group cursor-not-allowed">
        {CardContent}
      </div>
    );
  }

  return (
    <Link href={href} className="w-full relative group cursor-pointer">
      {CardContent}
    </Link>
  );
}
