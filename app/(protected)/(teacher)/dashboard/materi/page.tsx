"use client";

import Link from "next/link";
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
} from "lucide-react";

import { useAuth } from "@/components/authProvider";
import HomeHeader from "@/components/homeHeader";
import { useSubjectManager } from "@/utils/useSubjectManager";

export default function KelolaMateriPage() {
  const { isLoading: authLoading } = useAuth();

  const {
    filteredSubjects,
    loading,
    searchQuery,
    setSearchQuery,

    // Edit logic
    isEditModalOpen,
    setIsEditModalOpen,
    newName,
    setNewName,
    isSaving,
    openEditModal,
    saveEditSubject,

    // Add logic
    isAddModalOpen,
    setIsAddModalOpen,
    newSubjectName,
    setNewSubjectName,
    isAdding,
    addSubject,
    closeAddModal,
  } = useSubjectManager();

  // --- RENDER LOADING ---
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
            {/* SEARCH BAR (flex-1 agar memenuhi ruang sisa) */}
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

            {/* TOMBOL TAMBAH (KOTAK) */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="cursor-pointer flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-lg flex items-center justify-center shadow-md shadow-green-200 hover:bg-green-700 active:scale-90 transition-transform"
              title="Tambah Materi Baru"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>

          {/* Shadow gradient kecil di bawah sticky area */}
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
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4 relative overflow-hidden transition hover:shadow-md"
              >
                <div className="flex justify-between items-start z-10">
                  <div className="flex gap-3 items-center">
                    <div className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-green-700 font-black text-md shadow-inner">
                      {index + 1}
                    </div>

                    <div>
                      <h3 className="text-md font-bold text-gray-800 leading-tight line-clamp-2">
                        {subject.name}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={() => openEditModal(subject)}
                    className="cursor-pointer p-2 bg-gray-50 text-gray-400 rounded-full hover:bg-amber-50 hover:text-amber-500 transition"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>

                <div className="h-px w-full bg-gray-50"></div>

                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href={`/dashboard/materi/${subject.id}/content`}
                    className="flex flex-col items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-xl transition active:scale-95"
                  >
                    <BookOpen size={20} />
                    <span className="text-[10px] font-bold">Bacaan</span>
                  </Link>
                  <Link
                    href={`/dashboard/materi/${subject.id}/soal`}
                    className="flex flex-col items-center justify-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-600 p-2 rounded-xl transition active:scale-95"
                  >
                    <FileText size={20} />
                    <span className="text-[10px] font-bold">Soal</span>
                  </Link>
                  <Link
                    href={`/dashboard/materi/${subject.id}/review`}
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

      {/* Pastikan Modal Edit dan Modal Tambah tetap ada di sini seperti kode sebelumnya */}
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
