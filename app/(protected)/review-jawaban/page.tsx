"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  BookOpen,
  ChevronRight,
  Lock,
  ClipboardCheck,
} from "lucide-react";
import { createClient } from "@/utils/supabase-client";
import { Subject } from "@/types/database";
import HomeHeader from "@/components/homeHeader";
import { useAuth } from "@/components/authProvider";

export default function ReviewJawabanPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch daftar Subject
  useEffect(() => {
    const fetchSubjects = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        setSubjects(data || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] text-gray-500 font-sans">
        <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] font-sans overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <HomeHeader />
      </div>

      <main className="flex-1 flex flex-col w-full overflow-y-auto min-h-0">
        {/* --- HEADER TITLE --- */}
        <div className="px-6 pb-4 flex items-center relative mb-4 pt-2">
          <button
            onClick={() => router.push("/")}
            className="absolute left-6 hover:bg-gray-200 p-1 rounded-full active:bg-gray-200 transition cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg text-black">
            Review Jawaban
          </h1>
        </div>

        {/* --- CONTENT LIST (FLAT LIST) --- */}
        <div className="px-6 flex flex-col gap-4 pb-10">
          {subjects.length > 0 ? (
            subjects.map((subject) => (
              <SubjectReviewCard key={subject.id} subject={subject} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center mt-10 text-gray-400 gap-2">
              <BookOpen className="w-10 h-10 opacity-20" />
              <p className="text-sm">Belum ada review jawaban tersedia.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- KOMPONEN CARD DENGAN LOGIC DISABLED ---
function SubjectReviewCard({ subject }: { subject: Subject }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "in_progress" | "completed">(
    "idle",
  );
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkProgress = async () => {
      if (!user) return;

      const supabase = createClient();
      try {
        // 1. Cek apakah sudah SUBMIT (Completed)
        const { data: progressData } = await supabase
          .from("student_quiz_progress")
          .select("is_submitted")
          .eq("student_id", user.id)
          .eq("subject_id", subject.id)
          .maybeSingle();

        if (progressData?.is_submitted) {
          setStatus("completed");
          return;
        }

        // 2. Cek apakah IN PROGRESS (untuk keperluan data, tapi tetap akan dilock)
        const { count } = await supabase
          .from("student_responses")
          .select("id, practice_questions!inner(subject_id)", {
            count: "exact",
            head: true,
          })
          .eq("student_id", user.id)
          .eq("practice_questions.subject_id", subject.id);

        if (count && count > 0) {
          setStatus("in_progress");
        } else {
          setStatus("idle");
        }
      } catch (error) {
        console.error("Error checking subject progress:", error);
      } finally {
        setChecking(false);
      }
    };

    checkProgress();
  }, [user, subject.id]);

  // Logic Lock: Jika checking selesai DAN status BUKAN completed -> Locked
  const isLocked = !checking && status !== "completed";

  // Base Styling untuk Card
  const cardClasses = `
    group rounded-2xl p-4 shadow-sm border flex items-center justify-between relative overflow-hidden transition-all
    ${
      isLocked
        ? "bg-gray-50 border-gray-100 cursor-not-allowed opacity-75 grayscale-[0.8]" // Style saat Locked
        : "bg-white border-transparent hover:border-green-200 hover:shadow-md cursor-pointer active:scale-[0.98]" // Style saat Active
    }
  `;

  // Content di dalam Card (Dipisah agar reusable)
  const CardContent = (
    <>
      {/* Kiri: Icon & Text */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${
            isLocked
              ? "bg-gray-200 text-gray-400 border-gray-200"
              : "bg-gradient-to-br from-green-50 to-indigo-50 text-green-500 border-green-100"
          }`}
        >
          {isLocked ? <Lock size={20} /> : <ClipboardCheck size={24} />}
        </div>

        <div className="flex flex-col gap-1 pr-2">
          <h3
            className={`font-bold text-base leading-tight line-clamp-2 transition-colors ${
              isLocked
                ? "text-gray-500"
                : "text-black group-hover:text-green-600"
            }`}
          >
            {subject.name}
          </h3>
          {/* --- BAGIAN INI YANG DIUBAH --- */}
          {isLocked && (
            <p className="text-[10px] text-red-500 font-medium">
              Mohon kerjakan latihan soal terlebih dahulu.
            </p>
          )}
        </div>
      </div>

      {/* Kanan: Status Badge / Arrow */}
      <div className="flex-shrink-0 pl-2 flex flex-col items-end gap-1">
        {checking ? (
          <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
        ) : (
          <>
            {status !== "completed" && (
              // Jika Terkunci
              <div className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full font-bold text-[10px] flex items-center gap-1 shadow-sm">
                <Lock size={12} />
                <span>Terkunci</span>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );

  // Jika Locked, render DIV. Jika Unlocked, render LINK.
  if (isLocked) {
    return <div className={cardClasses}>{CardContent}</div>;
  }

  return (
    <Link href={`/review-jawaban/${subject.id}`} className={cardClasses}>
      {CardContent}
    </Link>
  );
}
