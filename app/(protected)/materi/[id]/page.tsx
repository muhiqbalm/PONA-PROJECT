"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react"; // Import Loader2
import { useParams } from "next/navigation";

import { useAuth } from "@/components/authProvider";
import { createClient } from "@/utils/supabase-client";

// Tipe status pengerjaan
type QuizStatus = "idle" | "in_progress" | "completed";

export default function DetailMateriPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const { user } = useAuth();
  const supabase = createClient();

  // Ubah state boolean jadi string status
  const [quizStatus, setQuizStatus] = useState<QuizStatus>("idle");

  useEffect(() => {
    const checkProgress = async () => {
      if (!user || !id) return;
      const subjectId = parseInt(id);

      try {
        // 1. Cek apakah sudah SUBMIT FINAL (Selesai)
        const { data: progressData } = await supabase
          .from("student_quiz_progress")
          .select("is_submitted")
          .eq("student_id", user.id)
          .eq("subject_id", subjectId)
          .maybeSingle();

        if (progressData?.is_submitted) {
          setQuizStatus("completed");
          return; // Jika sudah selesai, stop disini
        }

        // 2. Jika belum selesai, Cek apakah DALAM PROSES (Ada jawaban tersimpan)
        // Kita gunakan count, dengan join ke practice_questions untuk filter subject_id
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
        console.error("Error fetching progress:", error);
      }
    };

    checkProgress();
  }, [user, id]);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans">
      {/* HEADER */}
      <header className="relative flex items-center justify-center px-6 py-6 bg-transparent">
        <Link
          href="/"
          className="absolute left-6 p-2 -ml-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
        </Link>

        <h1 className="text-xl font-bold text-black">Materi Pembelajaran</h1>
      </header>

      {/* KONTEN UTAMA */}
      <main className="flex-1 w-full p-6 flex flex-col gap-4">
        <ActionCard
          title="Mari Belajar"
          imageSrc="https://aemfbowlzgerzztfryre.supabase.co/storage/v1/object/public/images/materi-bacaan.png"
          href={`/materi/${id}/materi-bacaan`}
        />

        {/* Kirim status ke komponen ActionCard */}
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
          // Opsional: Kunci jika belum pernah mengerjakan sama sekali
          // isLocked={quizStatus === 'idle'}
        />
      </main>
    </div>
  );
}

// --- Komponen Kartu ---
function ActionCard({
  title,
  imageSrc,
  href,
  status = "idle", // Default idle
}: {
  title: string;
  imageSrc: string;
  href: string;
  status?: QuizStatus;
}) {
  return (
    <Link href={href} className="w-full relative group">
      <div className="bg-white rounded-3xl p-4 h-28 flex items-center outline-2 outline-transparent shadow-sm hover:shadow-lg hover:outline-green-100 shadow-slate-200 hover:shadow-green-200/50 transition-all cursor-pointer relative overflow-hidden">
        {/* --- BADGE SELESAI (HIJAU) --- */}
        {status === "completed" && (
          <div className="absolute top-3 right-3 bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm z-10 border border-green-200">
            <CheckCircle size={16} /> Selesai
          </div>
        )}

        {/* --- BADGE DALAM PROSES (BIRU) --- */}
        {status === "in_progress" && (
          <div className="absolute top-3 right-3 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm z-10 border border-blue-100">
            <Loader2 size={16} className="animate-spin" /> Dalam Proses
          </div>
        )}

        {/* Area Gambar */}
        <div className="w-24 h-20 relative flex-shrink-0 mr-4">
          <Image src={imageSrc} alt={title} fill className="object-contain" />
        </div>

        {/* Area Teks */}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-black leading-tight">
            {title.split(" ").map((word, i) => (
              <span key={i} className="block">
                {word}
              </span>
            ))}
          </h2>
        </div>
      </div>
    </Link>
  );
}
