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
} from "lucide-react";
import { createClient } from "@/utils/supabase-client";
import { Subject } from "@/types/database";
import HomeHeader from "@/components/homeHeader";
import { useAuth } from "@/components/authProvider";

export default function AyoBerlatih() {
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
            Ayo Berlatih
          </h1>
        </div>

        {/* --- CONTENT LIST (FLAT LIST) --- */}
        <div className="px-6 flex flex-col gap-4 pb-10">
          {subjects.length > 0 ? (
            subjects.map((subject) => (
              <SubjectQuizCard key={subject.id} subject={subject} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center mt-10 text-gray-400 gap-2">
              <BookOpen className="w-10 h-10 opacity-20" />
              <p className="text-sm">Belum ada latihan soal tersedia.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- KOMPONEN CARD DENGAN LOGIC CEK STATUS PER SUBJECT ---
function SubjectQuizCard({ subject }: { subject: Subject }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<"idle" | "in_progress" | "completed">(
    "idle",
  );
  const [checking, setChecking] = useState(true);

  // LOGIC PENGECEKAN STATUS (LEVEL SUBJECT)
  useEffect(() => {
    const checkProgress = async () => {
      if (!user) return;

      const supabase = createClient();
      try {
        // 1. Cek apakah sudah SUBMIT (Completed) di tabel progress utama
        const { data: progressData } = await supabase
          .from("student_quiz_progress")
          .select("is_submitted")
          .eq("student_id", user.id)
          .eq("subject_id", subject.id) // Cek berdasarkan Subject ID
          .maybeSingle();

        if (progressData?.is_submitted) {
          setStatus("completed");
          return;
        }

        // 2. Cek apakah sedang IN PROGRESS (Ada respon di practice_questions subject ini)
        // Kita join ke practice_questions untuk filter by subject_id
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

  return (
    <Link
      href={`/ayo-berlatih/${subject.id}`}
      className="group bg-white rounded-2xl p-4 shadow-sm border border-transparent hover:border-blue-200 hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-between relative overflow-hidden"
    >
      {/* Kiri: Icon & Text */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Icon Placeholder / Image */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-500 flex items-center justify-center flex-shrink-0 border border-blue-100">
          {/* Jika subject punya image column, bisa diganti Image src={subject.image} */}
          <BookOpen size={24} />
        </div>

        <div className="flex flex-col gap-1 pr-2">
          <h3 className="font-bold text-black text-base leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {subject.name}
          </h3>
        </div>
      </div>

      {/* Kanan: Status Badge / Arrow */}
      <div className="flex-shrink-0 pl-2 flex flex-col items-end gap-1">
        {checking ? (
          <div className="w-20 h-6 bg-gray-100 rounded-full animate-pulse"></div>
        ) : (
          <>
            {status === "completed" && (
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-[10px] flex items-center gap-1 shadow-sm border border-green-200">
                <CheckCircle size={12} />
                <span>Selesai</span>
              </div>
            )}

            {status === "in_progress" && (
              <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold text-[10px] flex items-center gap-1 shadow-sm border border-blue-100">
                <Loader2 size={12} className="animate-spin" />
                <span>Lanjut</span>
              </div>
            )}

            {status === "idle" && (
              <div className="bg-gray-50 w-8 h-8 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
              </div>
            )}
          </>
        )}
      </div>
    </Link>
  );
}
