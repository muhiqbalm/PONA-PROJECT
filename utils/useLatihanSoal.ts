import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase-client";
import { getPracticeQuestions } from "@/utils/supabase-queries";
import { PracticeQuestion } from "@/types/database";
import { toast } from "react-hot-toast";
import { fetchExistingAnswers, fetchSubmissionStatus } from "./service-latihan";

export const useLatihanSoal = (
  questionIdParam: string | string[] | undefined,
  user: any,
) => {
  const supabase = createClient();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const idParam = Array.isArray(questionIdParam)
        ? questionIdParam[0]
        : questionIdParam;
      if (!idParam) return;

      const parsedId = parseInt(idParam);
      if (isNaN(parsedId)) {
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch Questions
        const questionsData = await getPracticeQuestions(supabase, parsedId);
        setQuestions(questionsData);

        if (user && questionsData.length > 0) {
          // 2. Fetch Answers & Status secara paralel (lebih cepat)
          const questionIds = questionsData.map((q) => q.id);

          const [existingAnswers, progressData] = await Promise.all([
            fetchExistingAnswers(supabase, user.id, questionIds),
            fetchSubmissionStatus(supabase, user.id, parsedId),
          ]);

          // Set Answers
          if (existingAnswers) {
            const initialAnswers: Record<number, string> = {};
            existingAnswers.forEach((ans: any) => {
              initialAnswers[ans.question_id] = ans.answer_text;
            });
            setAnswers(initialAnswers);
          }

          // Set Status
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
  }, [questionIdParam, user]);

  return {
    questions,
    loading,
    answers,
    setAnswers,
    hasSubmitted,
    setHasSubmitted,
    supabase, // Return supabase client jika butuh dipakai di mutation component
  };
};
