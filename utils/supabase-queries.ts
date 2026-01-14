import { SupabaseClient } from "@supabase/supabase-js";
import { Subject, ReadingMaterial, PracticeQuestion } from "@/types/database";

export const getSubjects = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }

  return data as Subject[];
};

export const getReadingMaterials = async (
  supabase: SupabaseClient,
  subjectId: number
) => {
  const { data, error } = await supabase
    .from("reading_materials")
    .select("*")
    .eq("subject_id", subjectId)
    .order("order_number", { ascending: true });

  if (error) {
    console.error("Error fetching materials:", error);
    return [];
  }

  return data as ReadingMaterial[];
};

export const getPracticeQuestions = async (
  supabase: SupabaseClient,
  subjectId: number
) => {
  const { data, error } = await supabase
    .from("practice_questions")
    .select("*")
    .eq("subject_id", subjectId)
    .order("number", { ascending: true });

  if (error) {
    console.error("Error fetching questions:", error);
    return [];
  }

  return data as PracticeQuestion[];
};

export const getSubjectById = async (supabase: SupabaseClient, id: number) => {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching subject:", error);
    return null;
  }

  return data as Subject;
};
