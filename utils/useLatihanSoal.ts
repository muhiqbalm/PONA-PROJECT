import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase-client";
import { getPracticeQuestions } from "@/utils/supabase-queries";
import { PracticeQuestion } from "@/types/database";
import { toast } from "react-hot-toast";
import { fetchExistingAnswers, fetchSubmissionStatus } from "./service-latihan";

// --- HELPER FUNCTION: PARSE COOKIE ---
const getUserIdFromCookie = (): string | null => {
  if (typeof document === "undefined") return null;

  // Mencari cookie dengan nama 'app_user_data'
  const value = `; ${document.cookie}`;
  const parts = value.split(`; app_user_data=`);

  if (parts.length === 2) {
    try {
      // Ambil string cookie, decode URI component, lalu parse JSON
      const cookieValue = parts.pop()?.split(";").shift();
      if (!cookieValue) return null;

      const decodedValue = decodeURIComponent(cookieValue);
      const parsedData = JSON.parse(decodedValue);

      // Sesuaikan key ini dengan struktur JSON di cookie kamu
      // Misalnya: { id: "...", ... } atau { user_id: "...", ... }
      return parsedData.id || parsedData.user_id || null;
    } catch (err) {
      console.error("Gagal parsing cookie user:", err);
      return null;
    }
  }
  return null;
};

export const useLatihanSoal = (
  questionIdParam: string | string[] | undefined,
  user: any, // User dari useAuth (bisa null di awal)
) => {
  const supabase = createClient();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const idParam = Array.isArray(questionIdParam)
        ? questionIdParam[0]
        : questionIdParam;

      if (!idParam) return;

      const parsedId = idParam;

      if (!parsedId) {
        setLoading(false);
        return;
      }

      // --- LOGIC BARU: PRIORITAS USER ID ---
      // 1. Cek dari props user (useAuth)
      // 2. Jika null, cek dari cookie 'app_user_data'
      let activeUserId = user?.id;

      if (!activeUserId) {
        console.log("User prop null, mencoba ambil dari cookie...");
        activeUserId = getUserIdFromCookie();
      }

      // Jika setelah cek cookie masih tidak ada ID, stop (tunggu useAuth update)
      if (!activeUserId) {
        console.log(
          "User ID tidak ditemukan di Auth maupun Cookie. Menunggu...",
        );
        return;
      }

      console.log("✅ Menggunakan User ID:", activeUserId);

      try {
        setLoading(true);

        // 1. Fetch Questions
        // Catatan: Jika RLS di Supabase strictly pakai auth.uid(),
        // pastikan session Supabase client juga sudah terbentuk,
        // bukan cuma kita punya string ID-nya saja.
        const questionsData = await getPracticeQuestions(supabase, parsedId);
        setQuestions(questionsData);

        if (questionsData.length > 0) {
          const questionIds = questionsData.map((q) => q.id);

          // Gunakan activeUserId yang kita dapatkan (baik dari hook atau cookie)
          const [existingAnswers, progressData] = await Promise.all([
            fetchExistingAnswers(supabase, activeUserId, questionIds),
            fetchSubmissionStatus(supabase, activeUserId, parsedId),
          ]);

          if (existingAnswers) {
            const initialAnswers: Record<number, string> = {};
            existingAnswers.forEach((ans: any) => {
              initialAnswers[ans.question_id] = ans.answer_text;
            });
            setAnswers(initialAnswers);
          }

          if (progressData?.is_submitted) {
            setHasSubmitted(true);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };

    initData();
    // Tambahkan dependency kosong agar fetch jalan sekali saat mount,
    // atau biarkan user mentrigger ulang jika useAuth update.
  }, [questionIdParam, user]);

  return {
    questions,
    loading,
    answers,
    setAnswers,
    hasSubmitted,
    setHasSubmitted,
    supabase,
  };
};
