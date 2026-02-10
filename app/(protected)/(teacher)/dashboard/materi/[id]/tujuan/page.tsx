"use client";

import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  MoveUp,
  MoveDown,
  Loader2,
  X,
  Target,
  Edit3,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { useAuth } from "@/components/authProvider";
import HomeHeader from "@/components/homeHeader";
import { createClient } from "@/utils/supabase-client";

// --- TIPE DATA ---
type LearningObjective = {
  id: string;
  description: string;
  order_number: number;
  subject_id: string;
};

export default function KelolaTujuanPembelajaranPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { isLoading: authLoading } = useAuth();

  // Unwrap params
  const { id: SUBJECT_ID } = use(params);

  // Supabase Client
  const supabase = useMemo(() => createClient(), []);

  // --- STATE ---
  const [objectives, setObjectives] = useState<LearningObjective[]>([]);
  const [subjectName, setSubjectName] = useState("");
  const [loading, setLoading] = useState(true);

  // State Modal Tambah/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] =
    useState<LearningObjective | null>(null);
  const [descriptionInput, setDescriptionInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // State Modal Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [objectiveToDelete, setObjectiveToDelete] =
    useState<LearningObjective | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    if (!SUBJECT_ID) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        if (isMounted) setLoading(true);

        // 1. Ambil Nama Subject
        const { data: subjectData, error: subjectError } = await supabase
          .from("subjects")
          .select("name")
          .eq("id", SUBJECT_ID)
          .single();

        if (subjectError) throw subjectError;

        // 2. Ambil Objectives
        const { data: objectivesData, error: objectivesError } = await supabase
          .from("learning_objectives")
          .select("*")
          .eq("subject_id", SUBJECT_ID)
          .order("order_number", { ascending: true });

        if (objectivesError) throw objectivesError;

        if (isMounted) {
          setSubjectName(subjectData.name);
          setObjectives(objectivesData || []);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) toast.error("Gagal memuat data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [SUBJECT_ID, supabase]);

  // --- ACTIONS ---

  // 1. Buka Modal Tambah
  const openAddModal = () => {
    setEditingObjective(null);
    setDescriptionInput("");
    setIsModalOpen(true);
  };

  // 2. Buka Modal Edit
  const openEditModal = (obj: LearningObjective) => {
    setEditingObjective(obj);
    setDescriptionInput(obj.description);
    setIsModalOpen(true);
  };

  // 3. Simpan (Tambah / Update)
  const handleSave = async () => {
    if (!descriptionInput.trim())
      return toast.error("Deskripsi tidak boleh kosong");

    setIsSaving(true);
    try {
      if (editingObjective) {
        // --- UPDATE ---
        const { error } = await supabase
          .from("learning_objectives")
          .update({ description: descriptionInput })
          .eq("id", editingObjective.id);

        if (error) throw error;

        setObjectives((prev) =>
          prev.map((item) =>
            item.id === editingObjective.id
              ? { ...item, description: descriptionInput }
              : item,
          ),
        );
        toast.success("Tujuan diperbarui!");
      } else {
        // --- CREATE ---
        // Hitung order number baru (paling bawah)
        const nextOrder =
          objectives.length > 0
            ? Math.max(...objectives.map((o) => o.order_number)) + 1
            : 1;

        const { data, error } = await supabase
          .from("learning_objectives")
          .insert([
            {
              subject_id: SUBJECT_ID,
              description: descriptionInput,
              order_number: nextOrder,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setObjectives((prev) => [...prev, data]);
        toast.success("Tujuan ditambahkan!");
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Buka Modal Hapus
  const confirmDelete = (obj: LearningObjective) => {
    setObjectiveToDelete(obj);
    setIsDeleteModalOpen(true);
  };

  // 5. Eksekusi Hapus
  const handleDelete = async () => {
    if (!objectiveToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("learning_objectives")
        .delete()
        .eq("id", objectiveToDelete.id);

      if (error) throw error;

      setObjectives((prev) =>
        prev.filter((o) => o.id !== objectiveToDelete.id),
      );
      toast.success("Tujuan dihapus.");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus data.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 6. Re-order (Naik/Turun)
  const handleMove = async (index: number, direction: -1 | 1) => {
    const newObjectives = [...objectives];
    const targetIndex = index + direction;

    // Cek bound
    if (targetIndex < 0 || targetIndex >= newObjectives.length) return;

    // Swap di local state
    const temp = newObjectives[index];
    newObjectives[index] = newObjectives[targetIndex];
    newObjectives[targetIndex] = temp;

    // Update order_number di local state
    // Kita asumsikan order visual = index + 1
    newObjectives[index].order_number = index + 1;
    newObjectives[targetIndex].order_number = targetIndex + 1;

    setObjectives([...newObjectives]); // Trigger re-render UI instan

    // Update ke Database (Optimistic Update)
    try {
      const updates = [
        { id: newObjectives[index].id, order_number: index + 1 },
        { id: newObjectives[targetIndex].id, order_number: targetIndex + 1 },
      ];

      for (const update of updates) {
        await supabase
          .from("learning_objectives")
          .update({ order_number: update.order_number })
          .eq("id", update.id);
      }
    } catch (error) {
      console.error("Gagal reorder di DB", error);
      toast.error("Gagal menyimpan urutan.");
      // Rollback state bisa dilakukan di sini jika perlu strict consistency
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans overflow-hidden">
      {/* Header Global */}
      <div className="flex-shrink-0 z-40 bg-[#FAFAFA]">
        <HomeHeader />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full px-6 pb-20 pt-2 overflow-y-auto relative scroll-smooth">
        {/* Navigation & Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/materi"
            className="flex items-center gap-2 mb-3 w-fit text-blue-800 hover:text-blue-600 transition-colors duration-200"
          >
            <ArrowLeft size={12} />
            <p className="text-xs font-medium leading-relaxed">Kembali</p>
          </Link>

          {/* Banner Title */}
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-r from-orange-200 via-amber-100 to-yellow-100 flex items-center mb-2 z-0 shadow-sm border border-orange-100">
            <div className="w-2/3 pl-6 z-10">
              <h1 className="font-black text-lg leading-tight text-orange-900 line-clamp-2">
                Tujuan Pembelajaran: <br /> {subjectName}
              </h1>
              <p className="text-xs text-orange-800 font-medium mt-1 leading-relaxed opacity-90">
                Tentukan apa yang akan dicapai siswa.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 h-full w-1/3 opacity-20">
              <div className="relative w-full h-full">
                <Target className="w-full h-full text-orange-600 p-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="sticky top-0 z-30 bg-[#FAFAFA]/95 backdrop-blur-sm pt-0 pb-4">
          <button
            onClick={openAddModal}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> Tambah Tujuan
          </button>
        </div>

        {/* List Objectives */}
        <div className="flex flex-col gap-3">
          {objectives.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
              <Target size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">
                Belum ada tujuan pembelajaran.
              </p>
            </div>
          ) : (
            objectives.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-3 relative transition hover:shadow-md animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="flex gap-3">
                  {/* Nomor Urut */}
                  <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0 mt-1">
                    {index + 1}
                  </div>

                  {/* Deskripsi */}
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-50 my-1"></div>

                {/* Controls */}
                <div className="flex justify-between items-center">
                  {/* Reorder Buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Up"
                    >
                      <MoveUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMove(index, 1)}
                      disabled={index === objectives.length - 1}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                      title="Move Down"
                    >
                      <MoveDown size={16} />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 transition"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(item)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* --- MODAL TAMBAH/EDIT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-2 bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
                {editingObjective ? (
                  <Edit3 size={24} />
                ) : (
                  <Plus size={24} strokeWidth={3} />
                )}
              </div>
              <h3 className="text-xl font-black text-gray-900">
                {editingObjective ? "Edit Tujuan" : "Tambah Tujuan"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Tuliskan poin tujuan pembelajaran dengan jelas.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase ml-1 mb-1.5 block">
                  Deskripsi
                </label>
                <textarea
                  value={descriptionInput}
                  onChange={(e) => setDescriptionInput(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none h-32 resize-none leading-relaxed"
                  placeholder="Contoh: Siswa mampu menjelaskan fungsi jantung..."
                />
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3.5 rounded-full font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-70"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL HAPUS --- */}
      {isDeleteModalOpen && objectiveToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="text-red-500" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Hapus Tujuan Ini?
              </h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition text-sm"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition text-sm flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Hapus"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
