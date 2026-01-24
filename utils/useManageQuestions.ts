// src/hooks/useManageQuestions.ts
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase-client";
import { toast } from "react-hot-toast";
import { PracticeQuestion } from "@/types/database";

// --- Tipe Data ---
export interface RubricForm {
  id?: number;
  score: number;
  description: string;
}

export interface QuestionFormData {
  id?: string;
  question_text: string;
  flip_image_front: string;
  flip_image_back: string;
  answer_key: string;
  rubrics: RubricForm[];
}

export interface QuestionWithMeta extends PracticeQuestion {
  hasKey: boolean;
  hasRubric: boolean;
}

export const useManageQuestions = (subjectId: string | undefined) => {
  const supabase = createClient();

  // --- STATE ---
  const [questions, setQuestions] = useState<QuestionWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"soal" | "kunci" | "rubrik">(
    "soal",
  );

  const [formData, setFormData] = useState<QuestionFormData>({
    question_text: "",
    flip_image_front: "",
    flip_image_back: "",
    answer_key: "",
    rubrics: [{ score: 1, description: "" }],
  });

  // --- ACTIONS ---

  // 1. Fetch Data List Soal
  const fetchData = async () => {
    if (!subjectId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("practice_questions")
        .select(`*, answer_keys(count), scoring_rubrics(count)`)
        .eq("subject_id", subjectId)
        .order("number", { ascending: true });

      if (error) throw error;

      const formattedData: QuestionWithMeta[] = (data || []).map((q: any) => ({
        ...q,
        hasKey: q.answer_keys?.[0]?.count > 0,
        hasRubric: q.scoring_rubrics?.[0]?.count > 0,
      }));

      setQuestions(formattedData);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat daftar soal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subjectId]);

  // 2. Buka Modal Tambah
  const openAddModal = () => {
    setFormData({
      question_text: "",
      flip_image_front: "",
      flip_image_back: "",
      answer_key: "",
      rubrics: [{ score: 1, description: "" }],
    });
    setActiveTab("soal");
    setIsModalOpen(true);
  };

  // 3. Buka Modal Edit (Fetch Detail)
  const openEditModal = async (question: PracticeQuestion) => {
    try {
      setIsSubmitting(true); // Loading state saat fetch detail
      const { data: keyData } = await supabase
        .from("answer_keys")
        .select("answer")
        .eq("question_id", question.id)
        .single();

      const { data: rubricData } = await supabase
        .from("scoring_rubrics")
        .select("id, score, description")
        .eq("question_id", question.id)
        .order("score", { ascending: true });

      setFormData({
        id: question.id,
        question_text: question.question_text || "",
        flip_image_front: question.flip_image_front || "",
        flip_image_back: question.flip_image_back || "",
        answer_key: keyData?.answer || "",
        rubrics:
          rubricData && rubricData.length > 0
            ? rubricData
            : [{ score: 1, description: "" }],
      });

      setActiveTab("soal");
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat detail soal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Hapus Soal
  const deleteQuestion = async (id: string) => {
    if (!confirm("Hapus soal ini? Data terkait akan hilang.")) return;
    try {
      const { error } = await supabase
        .from("practice_questions")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Soal dihapus.");
      fetchData();
    } catch (error) {
      toast.error("Gagal menghapus.");
    }
  };

  // 5. Simpan Data (Create/Update)
  const saveQuestion = async () => {
    if (!subjectId) return;

    // --- Validasi ---
    if (!formData.question_text.trim()) {
      setActiveTab("soal");
      return toast.error("Teks soal wajib diisi!");
    }
    if (!formData.answer_key.trim()) {
      setActiveTab("kunci");
      return toast.error("Kunci jawaban wajib diisi!");
    }
    if (formData.rubrics.length === 0) {
      setActiveTab("rubrik");
      return toast.error("Minimal harus ada 1 rubrik penilaian!");
    }
    const incompleteRubrics = formData.rubrics.some(
      (r) => !r.description || r.description.trim() === "",
    );
    if (incompleteRubrics) {
      setActiveTab("rubrik");
      return toast.error("Semua deskripsi rubrik harus diisi!");
    }

    setIsSubmitting(true);
    try {
      // A. Save Soal
      const questionPayload = {
        subject_id: subjectId,
        question_text: formData.question_text,
        flip_image_front: formData.flip_image_front || null,
        flip_image_back: formData.flip_image_back || null,
        number: formData.id ? undefined : questions.length + 1,
      };

      let questionId = formData.id;

      if (questionId) {
        const { error } = await supabase
          .from("practice_questions")
          .update(questionPayload)
          .eq("id", questionId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("practice_questions")
          .insert(questionPayload)
          .select()
          .single();
        if (error) throw error;
        questionId = data.id;
      }

      if (!questionId) throw new Error("ID Soal Error");

      // B. Save Kunci (Upsert)
      const { data: existingKey } = await supabase
        .from("answer_keys")
        .select("id")
        .eq("question_id", questionId)
        .single();
      if (existingKey) {
        await supabase
          .from("answer_keys")
          .update({ answer: formData.answer_key })
          .eq("id", existingKey.id);
      } else {
        await supabase
          .from("answer_keys")
          .insert({ question_id: questionId, answer: formData.answer_key });
      }

      // C. Save Rubrik (Upsert Loop)
      for (const rubric of formData.rubrics) {
        const payload = {
          question_id: questionId,
          score: rubric.score,
          description: rubric.description,
        };
        if (rubric.id) {
          await supabase
            .from("scoring_rubrics")
            .update(payload)
            .eq("id", rubric.id);
        } else {
          await supabase.from("scoring_rubrics").insert(payload);
        }
      }

      toast.success("Berhasil disimpan!");
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Helper Rubrik ---
  const addRubricRow = () => {
    if (formData.rubrics.length >= 4) return toast.error("Maksimal 4 rubrik.");
    const usedScores = formData.rubrics.map((r) => r.score);
    const availableScores = [1, 2, 3, 4].filter((s) => !usedScores.includes(s));
    if (availableScores.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      rubrics: [
        ...prev.rubrics,
        { score: availableScores[0], description: "" },
      ],
    }));
  };

  const removeRubricRow = (index: number, id?: number) => {
    const newRubrics = [...formData.rubrics];
    newRubrics.splice(index, 1);
    setFormData({ ...formData, rubrics: newRubrics });
    if (id) supabase.from("scoring_rubrics").delete().eq("id", id);
  };

  const updateRubric = (
    index: number,
    field: keyof RubricForm,
    value: string | number,
  ) => {
    const newRubrics = [...formData.rubrics];
    newRubrics[index] = { ...newRubrics[index], [field]: value };
    setFormData({ ...formData, rubrics: newRubrics });
  };

  return {
    // State
    questions,
    loading,
    isSubmitting,
    isModalOpen,
    activeTab,
    formData,
    // Setters (jika butuh manual override di UI)
    setIsModalOpen,
    setActiveTab,
    setFormData,
    // Actions
    openAddModal,
    openEditModal,
    deleteQuestion,
    saveQuestion,
    addRubricRow,
    removeRubricRow,
    updateRubric,
  };
};
