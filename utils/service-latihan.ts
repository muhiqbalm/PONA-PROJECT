import { SupabaseClient } from "@supabase/supabase-js";

// Ambil jawaban yang sudah ada
export const fetchExistingAnswers = async (
  supabase: SupabaseClient,
  userId: string,
  questionIds: string[],
) => {
  const { data, error } = await supabase
    .from("student_responses")
    .select("question_id, answer_text")
    .eq("student_id", userId)
    .in("question_id", questionIds);

  if (error) throw error;
  return data;
};

// Cek status submit
export const fetchSubmissionStatus = async (
  supabase: SupabaseClient,
  userId: string,
  subjectId: string,
) => {
  const { data, error } = await supabase
    .from("student_quiz_progress")
    .select("is_submitted")
    .eq("student_id", userId)
    .eq("subject_id", subjectId)
    .maybeSingle();

  // Supabase return error code PGRST116 jika .single() tidak menemukan data
  if (error && error.code !== "PGRST116") throw error;
  return data;
};

// Simpan jawaban (Upsert)
export const upsertAnswer = async (
  supabase: SupabaseClient,
  userId: string,
  questionId: number,
  answerText: string,
) => {
  const { error } = await supabase.from("student_responses").upsert(
    {
      student_id: userId,
      question_id: questionId,
      answer_text: answerText,
    },
    { onConflict: "student_id, question_id" },
  );
  if (error) throw error;
};

// Final Submit
export const submitFinalQuiz = async (
  supabase: SupabaseClient,
  userId: string,
  subjectId: string,
) => {
  const { error } = await supabase.from("student_quiz_progress").upsert(
    {
      student_id: userId,
      subject_id: subjectId,
      is_submitted: true,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "student_id, subject_id" },
  );
  if (error) throw error;
};

export const updateAdditionalAnswer = async (
  supabase: SupabaseClient,
  userId: string,
  questionId: string,
  text: string,
) => {
  const { error } = await supabase
    .from("student_responses")
    .update({
      additional_answer: text,
      updated_at: new Date().toISOString(),
    })
    .eq("student_id", userId)
    .eq("question_id", questionId);

  if (error) throw error;
};

// Fungsi fetch khusus Review (mengambil additional_answer juga)
export const fetchReviewData = async (
  supabase: SupabaseClient,
  userId: string,
  questionIds: string[],
) => {
  const { data, error } = await supabase
    .from("student_responses")
    .select("question_id, answer_text, additional_answer") // Ambil additional_answer
    .eq("student_id", userId)
    .in("question_id", questionIds);

  if (error) throw error;
  return data;
};
