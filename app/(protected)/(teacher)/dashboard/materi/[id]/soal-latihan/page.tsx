"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  Key,
  ListChecks,
  Image as ImageIcon,
  StickyNote,
  ChevronDown,
} from "lucide-react";

import HomeHeader from "@/components/homeHeader";
import { useManageQuestions } from "@/utils/useManageQuestions";
import ImageInputSection from "@/components/imageInputSection";

export default function GuruManageQuestionsPage() {
  const params = useParams();
  const subjectId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  // PANGGIL HOOK DI SINI
  const {
    questions,
    loading,
    isSubmitting,
    isModalOpen,
    activeTab,
    formData,
    setIsModalOpen,
    setActiveTab,
    setFormData,
    openAddModal,
    openEditModal,
    deleteQuestion,
    saveQuestion,
    addRubricRow,
    removeRubricRow,
    updateRubric,
  } = useManageQuestions(subjectId);

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans overflow-hidden">
      <div className="flex-shrink-0 z-20 bg-[#FAFAFA]">
        <HomeHeader />
      </div>

      <main className="flex-1 w-full px-6 flex flex-col overflow-y-auto pb-20 relative">
        {/* HEADER PAGE */}
        <div className="flex items-center justify-between pt-2 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/materi"
              className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm text-gray-600 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Kelola Materi</h1>
              <p className="text-xs text-gray-500">Edit Soal, Kunci & Rubrik</p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2.5 rounded-full text-sm font-bold shadow-md hover:bg-violet-700 transition active:scale-95"
          >
            <Plus size={18} />{" "}
            <span className="hidden sm:inline">Tambah Soal</span>
          </button>
        </div>

        {/* LIST SOAL */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-violet-500" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
            Belum ada soal. Klik "Tambah Soal" untuk memulai.
          </div>
        ) : (
          <div className="grid gap-3">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-violet-200 transition group"
              >
                <div className="w-8 h-8 bg-violet-50 text-violet-700 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                  {idx + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-sm font-medium line-clamp-2 mb-2">
                    {q.question_text}
                  </p>

                  {/* BADGES */}
                  <div className="flex flex-wrap gap-2">
                    {(q.flip_image_front || q.flip_image_back) && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded flex items-center gap-1 border border-blue-100">
                        <ImageIcon size={10} /> Gambar
                      </span>
                    )}
                    {q.hasKey ? (
                      <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded flex items-center gap-1 border border-green-100">
                        <Key size={10} /> Kunci Ada
                      </span>
                    ) : (
                      <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded flex items-center gap-1 border border-gray-200">
                        <Key size={10} /> Belum Ada Kunci
                      </span>
                    )}
                    {q.hasRubric ? (
                      <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded flex items-center gap-1 border border-orange-100">
                        <ListChecks size={10} /> Rubrik Ada
                      </span>
                    ) : (
                      <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded flex items-center gap-1 border border-gray-200">
                        <ListChecks size={10} /> Belum Ada Rubrik
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
          <div className="bg-white w-full h-[95vh] sm:h-auto sm:max-h-[85vh] sm:max-w-2xl rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-800 leading-tight">
                  {formData.id ? "Edit Soal" : "Soal Baru"}
                </h2>
                <p className="text-xs text-gray-400">
                  Lengkapi data materi di bawah
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex px-6 border-b border-gray-100 overflow-x-auto no-scrollbar flex-shrink-0">
              {[
                {
                  id: "soal",
                  label: "Soal & Gambar",
                  icon: <StickyNote size={14} />,
                },
                {
                  id: "kunci",
                  label: "Kunci Jawaban",
                  icon: <Key size={14} />,
                },
                {
                  id: "rubrik",
                  label: "Rubrik Penilaian",
                  icon: <ListChecks size={14} />,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? "border-violet-600 text-violet-700"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#FAFAFA]">
              {/* Tab Soal */}
              {activeTab === "soal" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      Pertanyaan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.question_text}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          question_text: e.target.value,
                        })
                      }
                      className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-400 outline-none resize-none text-sm bg-white shadow-sm"
                      placeholder="Tuliskan pertanyaan disini..."
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ImageInputSection
                      label="Flip Image (Depan)"
                      value={formData.flip_image_front}
                      onChange={(val) =>
                        setFormData({ ...formData, flip_image_front: val })
                      }
                    />
                    <ImageInputSection
                      label="Flip Image (Belakang)"
                      value={formData.flip_image_back}
                      onChange={(val) =>
                        setFormData({ ...formData, flip_image_back: val })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Tab Kunci */}
              {activeTab === "kunci" && (
                <div className="h-full flex flex-col">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4 flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 p-1.5 rounded-lg shrink-0">
                      <Key size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-700 mb-0.5">
                        Info Guru
                      </p>
                      <p className="text-[11px] text-blue-600 leading-relaxed">
                        Kunci jawaban ini bersifat rahasia dan hanya dapat
                        dilihat oleh guru.
                      </p>
                    </div>
                  </div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Jawaban Benar <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.answer_key}
                    onChange={(e) =>
                      setFormData({ ...formData, answer_key: e.target.value })
                    }
                    className="w-full flex-1 min-h-[200px] p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none resize-none text-sm bg-white shadow-sm"
                    placeholder="Tuliskan kunci jawaban lengkap..."
                  />
                </div>
              )}

              {/* Tab Rubrik */}
              {activeTab === "rubrik" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-xs text-gray-500">
                        Kriteria penilaian (Max 4 baris).
                      </p>
                      <p className="text-[10px] text-gray-400">
                        Skor harus unik (1-4).
                      </p>
                    </div>
                    <button
                      onClick={addRubricRow}
                      disabled={formData.rubrics.length >= 4}
                      className="text-xs bg-violet-100 text-violet-700 px-3 py-1.5 rounded-lg font-bold hover:bg-violet-200 transition disabled:opacity-50"
                    >
                      + Tambah
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.rubrics.map((rubric, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-start animate-fadeIn"
                      >
                        <div className="w-20 shrink-0">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 text-center">
                            Skor
                          </label>
                          <div className="relative">
                            <select
                              value={rubric.score}
                              onChange={(e) =>
                                updateRubric(
                                  idx,
                                  "score",
                                  parseInt(e.target.value),
                                )
                              }
                              className="w-full p-2 rounded-lg border border-gray-200 text-center font-bold text-violet-700 focus:ring-2 focus:ring-violet-400 outline-none text-sm appearance-none bg-white"
                            >
                              {[1, 2, 3, 4].map((s) => {
                                const isUsed = formData.rubrics.some(
                                  (r, i) => i !== idx && r.score === s,
                                );
                                return (
                                  <option key={s} value={s} disabled={isUsed}>
                                    {s}
                                  </option>
                                );
                              })}
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                              <ChevronDown size={14} />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                            Deskripsi <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={rubric.description}
                            onChange={(e) =>
                              updateRubric(idx, "description", e.target.value)
                            }
                            className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-violet-400 outline-none resize-none h-[60px]"
                            placeholder="Deskripsi kriteria..."
                          />
                        </div>
                        <button
                          onClick={() => removeRubricRow(idx, rubric.id)}
                          className="mt-6 text-gray-300 hover:text-red-500 transition p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-white flex justify-end gap-3 flex-shrink-0 pb-8 sm:pb-6">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                onClick={saveQuestion}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-violet-600 text-white hover:bg-violet-700 transition shadow-lg shadow-violet-200 flex items-center gap-2 active:scale-95 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
