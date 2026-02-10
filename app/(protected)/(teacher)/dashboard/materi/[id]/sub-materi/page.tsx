"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, use } from "react"; // 1. Import 'use'
import {
  ArrowLeft,
  Book,
  Edit3,
  Loader2,
  Plus,
  Save,
  Search,
  X,
  Power,
  ClipboardCheck,
  FileText,
  ImagesIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { useAuth } from "@/components/authProvider";
import HomeHeader from "@/components/homeHeader";
import { createClient } from "@/utils/supabase-client";

// Definisi tipe data untuk Sub Materi (Topics)
type Topic = {
  id: string;
  name: string;
  is_active: boolean;
  subject_id: string;
  created_at?: string;
};

export default function KelolaSubMateriPage({
  params,
}: {
  // 2. Ubah tipe params menjadi Promise
  params: Promise<{ id: string }>;
}) {
  const { isLoading: authLoading } = useAuth();

  // 3. Unwrap params menggunakan React.use()
  const { id: SUBJECT_ID } = use(params);

  // Gunakan useMemo agar supabase client tidak dibuat ulang setiap render
  const supabase = useMemo(() => createClient(), []);

  // --- STATE DATA ---
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjectName, setSubjectName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // --- STATE MODALS ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<Topic | null>(null);
  const [editName, setEditName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [topicToToggle, setTopicToToggle] = useState<Topic | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    if (!SUBJECT_ID) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        if (isMounted) setLoading(true);

        // 1. Ambil nama Subject
        const { data: subjectData, error: subjectError } = await supabase
          .from("subjects")
          .select("name")
          .eq("id", SUBJECT_ID)
          .single();

        if (subjectError) throw subjectError;

        // 2. Ambil daftar Topics
        const { data: topicsData, error: topicsError } = await supabase
          .from("topics")
          .select("*")
          .eq("subject_id", SUBJECT_ID)
          .order("sort_order", { ascending: true });

        if (topicsError) throw topicsError;

        if (isMounted) {
          setSubjectName(subjectData.name);
          setTopics(topicsData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        if (isMounted) toast.error("Gagal memuat data sub-materi");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [SUBJECT_ID, supabase]);

  // --- FILTERING ---
  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // --- HANDLER FUNCTIONS ---

  const handleToggleClick = (topic: Topic) => {
    setTopicToToggle(topic);
    setIsToggleModalOpen(true);
  };

  const openEditModal = (topic: Topic) => {
    setTopicToEdit(topic);
    setEditName(topic.name);
    setIsEditModalOpen(true);
  };

  const handleAddTopic = async () => {
    if (!newTopicName.trim())
      return toast.error("Nama sub-materi tidak boleh kosong");

    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from("topics")
        .insert([
          { name: newTopicName, subject_id: SUBJECT_ID, is_active: true },
        ])
        .select()
        .single();

      if (error) throw error;

      setTopics([...topics, data]);
      toast.success("Sub-materi berhasil ditambahkan");
      setNewTopicName("");
      setIsAddModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menambahkan sub-materi");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!topicToEdit || !editName.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("topics")
        .update({ name: editName })
        .eq("id", topicToEdit.id);

      if (error) throw error;

      setTopics(
        topics.map((t) =>
          t.id === topicToEdit.id ? { ...t, name: editName } : t,
        ),
      );
      toast.success("Nama sub-materi diperbarui");
      setIsEditModalOpen(false);
      setTopicToEdit(null);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui sub-materi");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmToggleStatus = async () => {
    if (!topicToToggle) return;

    setIsToggling(true);
    try {
      const newStatus = !topicToToggle.is_active;
      const { error } = await supabase
        .from("topics")
        .update({ is_active: newStatus })
        .eq("id", topicToToggle.id);

      if (error) throw error;

      setTopics(
        topics.map((t) =>
          t.id === topicToToggle.id ? { ...t, is_active: newStatus } : t,
        ),
      );
      toast.success(`Sub-materi ${newStatus ? "diaktifkan" : "dinonaktifkan"}`);
      setIsToggleModalOpen(false);
      setTopicToToggle(null);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengubah status");
    } finally {
      setIsToggling(false);
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
        {/* Header Content */}
        <div className="mb-2">
          <Link
            href={`/dashboard/materi`}
            className="flex items-center gap-2 mb-3 w-fit text-blue-800 hover:text-blue-600 transition-colors duration-200"
          >
            <ArrowLeft size={12} />
            <p className="text-xs font-medium leading-relaxed">
              Kembali ke Materi
            </p>
          </Link>

          {/* HERO HEADER */}
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-r from-blue-200 via-indigo-100 to-sky-100 flex items-center mb-2 z-0">
            <div className="w-2/3 pl-6 z-10">
              <h1 className="font-black text-lg leading-tight text-blue-900 line-clamp-2">
                Kelola Sub-Materi
              </h1>
              <p className="text-xs text-blue-800 font-medium mt-1 leading-relaxed opacity-90">
                {subjectName}
              </p>
            </div>
            <div className="absolute right-0 bottom-0 h-full w-1/3 opacity-20">
              <div className="relative w-full h-full">
                <Book className="w-full h-full text-blue-600 p-4" />
              </div>
            </div>
          </div>
        </div>

        {/* STICKY SEARCH & ADD */}
        <div className="sticky top-0 z-30 bg-[#FAFAFA]/95 backdrop-blur-sm pt-2 pb-4 transition-all">
          <div className="flex items-center gap-3">
            {/* SEARCH BAR */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Cari sub-materi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-400 rounded-lg pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-blue-400 focus:outline-none transition font-medium placeholder-gray-400 h-10 text-sm"
              />
            </div>

            {/* TOMBOL TAMBAH */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="cursor-pointer flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-90 transition-transform"
              title="Tambah Sub-Materi Baru"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>
          <div className="absolute bottom-[-10px] left-0 w-full h-4 bg-gradient-to-b from-[#FAFAFA] to-transparent pointer-events-none"></div>
        </div>

        {/* LIST SUB MATERI */}
        <div className="flex flex-col gap-4 mt-2">
          {filteredTopics.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100">
              {searchQuery ? (
                <div className="flex flex-col items-center gap-2">
                  <Search size={32} className="opacity-20" />
                  <span>Sub-materi "{searchQuery}" tidak ditemukan.</span>
                </div>
              ) : (
                "Belum ada sub-materi tersedia."
              )}
            </div>
          ) : (
            filteredTopics.map((topic, index) => (
              <div
                key={topic.id}
                className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden transition hover:shadow-md 
                  ${!topic.is_active ? "bg-gray-50/30" : ""}
                `}
              >
                {!topic.is_active && (
                  <div className="absolute top-0 left-0 bg-gray-200 text-gray-500 text-[9px] font-bold px-3 py-1 rounded-br-xl z-20 shadow-sm tracking-wide">
                    NON-AKTIF
                  </div>
                )}

                <div
                  className={`flex justify-between items-start z-10 gap-4 ${
                    !topic.is_active ? "mt-5" : ""
                  }`}
                >
                  <div className="flex gap-3 items-center flex-1 min-w-0">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 font-black text-md shadow-inner shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-md font-bold text-gray-800 leading-tight line-clamp-2">
                        {topic.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleToggleClick(topic)}
                      className={`
                        relative w-12 h-7 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border border-transparent
                        ${topic.is_active ? "bg-blue-600" : "bg-gray-300"}
                      `}
                    >
                      <span
                        className={`
                          absolute left-1 top-1 w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out border border-gray-200 bg-gray-100 
                          ${topic.is_active ? "translate-x-5" : "translate-x-0"}
                        `}
                      />
                    </button>
                    <button
                      onClick={() => openEditModal(topic)}
                      className="cursor-pointer p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-amber-50 hover:text-amber-500 transition"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-50"></div>

                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href={`/dashboard/materi/${SUBJECT_ID}/sub-materi/${topic.id}/konten`}
                    className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-lg transition active:scale-95"
                  >
                    <FileText size={16} />
                    <span className="text-xs font-bold">Kelola Isi Konten</span>
                  </Link>

                  <Link
                    href={`/dashboard/materi/${SUBJECT_ID}/sub-materi/${topic.id}/flashcard`}
                    className="flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-600 p-2 rounded-lg transition active:scale-95"
                  >
                    <ImagesIcon size={16} />
                    <span className="text-xs font-bold">
                      Kelola Flash Cards
                    </span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL TOGGLE */}
      {isToggleModalOpen && topicToToggle && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative animate-scaleIn">
            <button
              onClick={() => setIsToggleModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-2 bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  topicToToggle.is_active
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {topicToToggle.is_active ? (
                  <Power size={24} />
                ) : (
                  <ClipboardCheck size={24} />
                )}
              </div>
              <h3 className="text-xl font-black text-gray-900">
                {topicToToggle.is_active
                  ? "Nonaktifkan Sub-Materi?"
                  : "Aktifkan Sub-Materi?"}
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {topicToToggle.is_active ? (
                  <>
                    Siswa tidak akan bisa melihat sub-materi{" "}
                    <b>"{topicToToggle.name}"</b>.
                  </>
                ) : (
                  <>
                    Sub-materi <b>"{topicToToggle.name}"</b> akan muncul kembali
                    di halaman siswa.
                  </>
                )}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsToggleModalOpen(false)}
                className="flex-1 py-3 rounded-full font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmToggleStatus}
                disabled={isToggling}
                className={`flex-1 py-3 rounded-full font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-70 active:scale-95 ${
                  topicToToggle.is_active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isToggling ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Ya, Konfirmasi"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 p-2 bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3">
                <Edit3 size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900">
                Ubah Nama Sub-Materi
              </h3>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={editName}
                  maxLength={50}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="w-full py-3.5 rounded-full font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}{" "}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 p-2 bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-3">
                <Plus size={24} strokeWidth={3} />
              </div>
              <h3 className="text-xl font-black text-gray-900">
                Tambah Sub-Materi
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Masukkan topik pembahasan baru.
              </p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={newTopicName}
                  maxLength={50}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Contoh: Pembuluh Darah"
                  autoFocus
                />
              </div>
              <button
                onClick={handleAddTopic}
                disabled={isAdding}
                className="w-full py-3.5 rounded-full font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2"
              >
                {isAdding ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Plus size={18} strokeWidth={3} />
                )}{" "}
                Tambah Sub-Materi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
