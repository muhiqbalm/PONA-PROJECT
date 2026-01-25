"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ClipboardCheck,
  Edit3,
  FileText,
  Loader2,
  Plus,
  Save,
  Search,
  X,
  Power,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { useAuth } from "@/components/authProvider";
import HomeHeader from "@/components/homeHeader";
import { useSubjectManager } from "@/utils/useSubjectManager";
import { createClient } from "@/utils/supabase-client";

export default function KelolaMateriPage() {
  const { isLoading: authLoading } = useAuth();
  const supabase = createClient();

  const {
    filteredSubjects,
    loading,
    searchQuery,
    setSearchQuery,
    isEditModalOpen,
    setIsEditModalOpen,
    newName,
    setNewName,
    isSaving,
    openEditModal,
    saveEditSubject,
    isAddModalOpen,
    setIsAddModalOpen,
    newSubjectName,
    setNewSubjectName,
    isAdding,
    addSubject,
    closeAddModal,
  } = useSubjectManager();

  // --- STATE TOGGLE STATUS ---
  const [isToggleModalOpen, setIsToggleModalOpen] = useState(false);
  const [subjectToToggle, setSubjectToToggle] = useState<any | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // --- HANDLER TOGGLE ---
  const handleToggleClick = (subject: any) => {
    setSubjectToToggle(subject);
    setIsToggleModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!subjectToToggle) return;

    setIsToggling(true);
    try {
      const newStatus = !subjectToToggle.is_active;

      const { error } = await supabase
        .from("subjects")
        .update({ is_active: newStatus })
        .eq("id", subjectToToggle.id);

      if (error) throw error;

      toast.success(
        `Materi berhasil ${newStatus ? "diaktifkan" : "dinonaktifkan"}`,
      );

      subjectToToggle.is_active = newStatus;

      setIsToggleModalOpen(false);
      setSubjectToToggle(null);
    } catch (error: any) {
      console.error(error);
      toast.error("Gagal mengubah status materi.");
    } finally {
      setIsToggling(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans overflow-hidden">
      {/* 1. Header Global */}
      <div className="flex-shrink-0 z-40 bg-[#FAFAFA]">
        <HomeHeader />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full px-6 pb-20 pt-2 overflow-y-auto relative scroll-smooth">
        {/* --- Bagian Non-Sticky --- */}
        <div className="mb-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 mb-3 w-fit text-green-800 hover:text-blue-600 transition-colors duration-200"
          >
            <ArrowLeft size={12} />
            <p className="text-xs font-medium leading-relaxed">Kembali</p>
          </Link>

          {/* HERO HEADER */}
          <div className="relative w-full h-32 rounded-xl overflow-hidden bg-gradient-to-r from-green-200 via-emerald-100 to-teal-100 flex items-center mb-2 z-0">
            <div className="w-2/3 pl-6 z-10">
              <h1 className="font-black text-lg leading-tight text-green-900">
                Kelola Materi
              </h1>
              <p className="text-xs text-green-800 font-medium mt-1 leading-relaxed opacity-90">
                Atur konten pelajaran, buat soal latihan, dan tinjau jawaban
                siswa di sini.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 h-full w-1/3 opacity-20">
              <div className="relative w-full h-full">
                <BookOpen className="w-full h-full text-green-600 p-4" />
              </div>
            </div>
          </div>
        </div>

        {/* --- STICKY SECTION (Search & Tambah Sejajar) --- */}
        <div className="sticky top-0 z-30 bg-[#FAFAFA]/95 backdrop-blur-sm pt-2 pb-4 transition-all">
          <div className="flex items-center gap-3">
            {/* SEARCH BAR */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Cari materi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-400 rounded-lg pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-green-400 focus:outline-none transition font-medium placeholder-gray-400 h-10 text-sm"
              />
            </div>

            {/* TOMBOL TAMBAH */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="cursor-pointer flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center shadow-md shadow-green-200 hover:bg-green-700 active:scale-90 transition-transform"
              title="Tambah Materi Baru"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>

          <div className="absolute bottom-[-10px] left-0 w-full h-4 bg-gradient-to-b from-[#FAFAFA] to-transparent pointer-events-none"></div>
        </div>

        {/* --- LIST MATERI --- */}
        <div className="flex flex-col gap-4 mt-2">
          {filteredSubjects.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100">
              {searchQuery ? (
                <div className="flex flex-col items-center gap-2">
                  <Search size={32} className="opacity-20" />
                  <span>Materi "{searchQuery}" tidak ditemukan.</span>
                </div>
              ) : (
                "Belum ada materi tersedia."
              )}
            </div>
          ) : (
            filteredSubjects.map((subject, index) => (
              <div
                key={subject.id}
                // PERUBAHAN 1: Menghapus "opacity-75 grayscale" agar card tetap terlihat aktif/bisa diedit
                // Saya ganti menjadi border-l-4 gray-300 untuk penanda visual halus jika non-aktif, opsional.
                className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden transition hover:shadow-md 
                  ${!subject.is_active ? "bg-gray-50/30" : ""}
                `}
              >
                {/* Badge Status */}
                {!subject.is_active && (
                  <div className="absolute top-0 left-0 bg-gray-200 text-gray-500 text-[9px] font-bold px-3 py-1 rounded-br-xl z-20 shadow-sm tracking-wide">
                    NON-AKTIF
                  </div>
                )}

                <div
                  className={`flex justify-between items-start z-10 ${!subject.is_active ? "mt-5" : ""}`}
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-green-700 font-black text-md shadow-inner shrink-0">
                      {index + 1}
                    </div>

                    <div>
                      <h3 className="text-md font-bold text-gray-800 leading-tight line-clamp-2">
                        {subject.name}
                      </h3>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center gap-3">
                    {/* TOGGLE SWITCH BUTTON */}
                    <button
                      onClick={() => handleToggleClick(subject)}
                      className={`
                        relative w-12 h-7 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 border border-transparent
                        ${subject.is_active ? "bg-green-600" : "bg-gray-300"}
                      `}
                      title={
                        subject.is_active
                          ? "Nonaktifkan Materi"
                          : "Aktifkan Materi"
                      }
                    >
                      <span
                        className={`
                          absolute left-1 top-1 w-5 h-5 rounded-full shadow-sm transform transition-transform duration-200 ease-in-out border border-gray-200 bg-gray-100 
                          ${subject.is_active ? "translate-x-5" : "translate-x-0"}
                        `}
                      />
                    </button>

                    <button
                      onClick={() => openEditModal(subject)}
                      className="cursor-pointer p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-amber-50 hover:text-amber-500 transition"
                    >
                      <Edit3 size={18} />
                    </button>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-50"></div>

                {/* Menu Navigasi */}
                {/* PERUBAHAN 2: Menghapus "pointer-events-none opacity-50" agar tombol tetap bisa diklik */}
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href={`/dashboard/materi/${subject.id}/materi-bacaan`}
                    className="flex flex-col items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-xl transition active:scale-95"
                  >
                    <BookOpen size={20} />
                    <span className="text-[10px] font-bold">Bacaan</span>
                  </Link>
                  <Link
                    href={`/dashboard/materi/${subject.id}/soal-latihan`}
                    className="flex flex-col items-center justify-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-600 p-2 rounded-xl transition active:scale-95"
                  >
                    <FileText size={20} />
                    <span className="text-[10px] font-bold">Soal</span>
                  </Link>
                  <Link
                    href={`/dashboard/materi/${subject.id}/review-jawaban`}
                    className="flex flex-col items-center justify-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-600 p-2 rounded-xl transition active:scale-95"
                  >
                    <ClipboardCheck size={20} />
                    <span className="text-[10px] font-bold">Review</span>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* --- MODAL KONFIRMASI TOGGLE --- */}
      {isToggleModalOpen && subjectToToggle && (
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
                  subjectToToggle.is_active
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {subjectToToggle.is_active ? (
                  <Power size={24} strokeWidth={3} />
                ) : (
                  <ClipboardCheck size={24} strokeWidth={3} />
                )}
              </div>
              <h3 className="text-xl font-black text-gray-900">
                {subjectToToggle.is_active
                  ? "Nonaktifkan Materi?"
                  : "Aktifkan Materi?"}
              </h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {subjectToToggle.is_active ? (
                  <>
                    Siswa tidak akan bisa melihat atau mengakses materi{" "}
                    <span className="font-bold text-gray-800">
                      "{subjectToToggle.name}"
                    </span>{" "}
                    hingga Anda mengaktifkannya kembali.
                  </>
                ) : (
                  <>
                    Materi{" "}
                    <span className="font-bold text-gray-800">
                      "{subjectToToggle.name}"
                    </span>{" "}
                    akan muncul kembali di halaman siswa dan dapat diakses.
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
                  subjectToToggle.is_active
                    ? "bg-red-600 hover:bg-red-700 shadow-red-200"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
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

      {/* Modal Edit dan Tambah tetap sama... */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-2 bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3">
                <Edit3 size={24} />
              </div>
              <h3 className="text-xl font-black text-gray-900">
                Ubah Nama Materi
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Nama materi akan berubah untuk semua siswa.
              </p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={newName}
                  maxLength={30}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 pr-16 focus:ring-2 focus:ring-green-500 focus:outline-none transition font-bold text-sm"
                  placeholder="Nama Materi..."
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium bg-gray-50 px-1">
                  {newName.length}/30
                </span>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={saveEditSubject}
                  disabled={isSaving}
                  className="w-full py-3.5 rounded-full font-bold text-sm text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition disabled:opacity-70 active:scale-95"
                >
                  {isSaving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={closeAddModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-2 bg-gray-100 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
                <Plus size={24} strokeWidth={3} />
              </div>
              <h3 className="text-xl font-black text-gray-900">
                Tambah Materi Baru
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Masukkan nama materi yang ingin ditambahkan.
              </p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={newSubjectName}
                  maxLength={30}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 pr-16 focus:ring-2 focus:ring-green-500 focus:outline-none transition font-bold text-sm"
                  placeholder="Contoh: Sistem Pencernaan"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium bg-gray-50 px-1">
                  {newSubjectName.length}/30
                </span>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={addSubject}
                  disabled={isAdding}
                  className="w-full py-3.5 rounded-full font-bold text-sm text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 flex items-center justify-center gap-2 transition disabled:opacity-70 active:scale-95"
                >
                  {isAdding ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Plus size={18} strokeWidth={3} />
                  )}
                  Tambah Materi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
