"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  ChevronRight,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  CalendarDays,
  School,
  Filter,
  ChevronDown,
  Check, // Tambah icon Check
} from "lucide-react";
import { toast } from "react-hot-toast";

import { useAuth } from "@/components/authProvider";
import HomeHeader from "@/components/homeHeader";
import { createClient } from "@/utils/supabase-client";

interface StudentSubmission {
  student_id: string;
  is_submitted: boolean;
  submitted_at: string | null;
  // Relasi ke students
  students: {
    full_name: string;
    class_name: string;
  } | null;
  // Relasi ke subjects
  subjects: {
    name: string;
  } | null;
}

export default function GuruReviewListPage() {
  const params = useParams();
  const { user } = useAuth();
  const supabase = createClient();

  const subjectId = Array.isArray(params?.id) ? params?.id[0] : params?.id;

  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectName, setSubjectName] = useState("");

  const [selectedClass, setSelectedClass] = useState("Semua Kelas");

  // STATE BARU: Untuk kontrol buka/tutup dropdown custom
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- HELPER: Format Tanggal ---
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId) return;

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("student_quiz_progress")
          .select(
            `
            student_id,
            is_submitted,
            submitted_at,
            students (    
                full_name,
                class_name
            ),
            subjects (
                name
            )
          `,
          )
          .eq("subject_id", subjectId)
          .order("submitted_at", { ascending: false, nullsFirst: false });

        if (error) throw error;

        if (data) {
          const typedData = data as unknown as StudentSubmission[];
          setSubmissions(typedData);

          if (typedData.length > 0 && typedData[0].subjects) {
            setSubjectName(typedData[0].subjects.name);
          }
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);
        toast.error("Gagal memuat data submisi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subjectId, supabase]);

  // --- LOGIC FILTER KELAS ---
  const uniqueClasses = useMemo(() => {
    const classes = submissions
      .map((item) => item.students?.class_name)
      .filter((c): c is string => !!c);
    return ["Semua Kelas", ...Array.from(new Set(classes)).sort()];
  }, [submissions]);

  const filteredData = submissions.filter((item) => {
    const name = item.students?.full_name?.toLowerCase() || "";
    const className = item.students?.class_name || "";
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      name.includes(query) || className.toLowerCase().includes(query);

    const matchesClass =
      selectedClass === "Semua Kelas" || className === selectedClass;

    return matchesSearch && matchesClass;
  });

  if (loading) {
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
      <div className="flex-shrink-0 z-40 bg-[#FAFAFA]">
        <HomeHeader />
      </div>

      <main className="flex-1 w-full px-6 pb-20 pt-2 overflow-y-auto relative scroll-smooth">
        {/* HEADER */}
        <div className="mb-2">
          <Link
            href="/dashboard/materi"
            className="flex items-center gap-2 mb-3 w-fit text-green-800 hover:text-blue-600 transition-colors duration-200"
          >
            <ArrowLeft size={16} />
            <p className="text-sm font-medium leading-relaxed">Kembali</p>
          </Link>

          {/* --- HERO HEADER --- */}
          <div className="relative w-full h-20 rounded-2xl overflow-hidden border border-teal-200 bg-gradient-to-r from-teal-100 via-emerald-100 to-green-100 flex items-center mb-2 z-0">
            <div className="w-2/3 pl-5 z-10">
              <h1 className="font-black text-md leading-tight text-teal-900">
                Review Jawaban
              </h1>
              <p className="text-[11px] text-teal-800 font-medium mt-0.5 leading-relaxed opacity-90 line-clamp-1">
                Materi:{" "}
                {subjectName ||
                  (submissions.length === 0
                    ? "Belum ada submisi"
                    : "Loading...")}
              </p>
            </div>
            <div className="absolute right-0 bottom-0 h-full w-1/3 opacity-20 flex items-center justify-end">
              <CheckCircle2 className="w-14 h-14 text-teal-600 mr-4" />
            </div>
          </div>
        </div>

        {/* --- STICKY SECTION: SEARCH & FILTER SEJAJAR --- */}
        <div className="sticky top-0 z-30 bg-[#FAFAFA]/95 backdrop-blur-sm pt-2 pb-2 transition-all">
          <div className="flex items-center gap-3 relative z-50">
            {/* 1. SEARCH BAR (Flex-1 agar lebar maksimal) */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-teal-400 focus:outline-none transition font-medium placeholder-gray-400 h-12 shadow-sm"
              />
            </div>

            {/* 2. CUSTOM DROPDOWN FILTER (Width Auto) */}
            <div className="relative shrink-0">
              {/* Trigger Button */}
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`h-12 pl-4 pr-3 bg-white border flex items-center gap-2 rounded-2xl transition-all duration-200 shadow-sm ${
                  isDropdownOpen
                    ? "border-teal-400 ring-2 ring-teal-100"
                    : "border-gray-200 hover:border-teal-300"
                }`}
              >
                <Filter
                  size={18}
                  className={isDropdownOpen ? "text-teal-600" : "text-gray-400"}
                />
                <span className="text-sm font-bold text-gray-700 max-w-[100px] truncate">
                  {selectedClass}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  {/* Backdrop Transparan untuk menutup dropdown saat klik luar */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />

                  {/* List Item */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1">
                      {uniqueClasses.map((cls) => (
                        <button
                          key={cls}
                          onClick={() => {
                            setSelectedClass(cls);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl flex items-center justify-between transition-colors ${
                            selectedClass === cls
                              ? "bg-teal-50 text-teal-700"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {cls}
                          {selectedClass === cls && (
                            <Check size={14} className="text-teal-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="absolute bottom-[-10px] left-0 w-full h-4 bg-gradient-to-b from-[#FAFAFA] to-transparent pointer-events-none"></div>
        </div>

        {/* LIST SISWA */}
        <div className="flex flex-col gap-3 mt-2">
          {filteredData.length === 0 ? (
            <div className="text-center py-10 text-gray-400 bg-white rounded-3xl border border-gray-100 flex flex-col items-center gap-2 mt-4">
              <AlertCircle size={32} className="opacity-20" />
              <span>
                {searchQuery || selectedClass !== "Semua Kelas"
                  ? "Siswa tidak ditemukan."
                  : "Belum ada siswa yang mengerjakan."}
              </span>
            </div>
          ) : (
            filteredData.map((item) => (
              <Link
                key={item.student_id}
                href={`/dashboard/materi/${subjectId}/review-jawaban/${item.student_id}`}
                className="block group"
              >
                <div
                  className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100
                              transition-all duration-300 ease-in-out
                              hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)] hover:border-teal-200 hover:-translate-y-0.5
                              active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    {/* DETAIL SISWA */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-bold text-gray-900 leading-tight truncate pr-2">
                            {item.students?.full_name || "Tanpa Nama"}
                          </h3>
                          <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-1">
                            <School size={14} className="text-gray-400" />
                            {item.students?.class_name || "-"}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-1">
                          <ChevronRight size={20} className="text-gray-300" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                        {/* STATUS BADGE */}
                        <div className="flex items-center">
                          {item.is_submitted ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-700 text-white">
                              <CheckCircle2 size={12} strokeWidth={2.5} />{" "}
                              Selesai
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-700 text-white">
                              <Clock size={12} strokeWidth={2.5} /> Mengerjakan
                            </span>
                          )}
                        </div>

                        {/* TANGGAL SUBMIT */}
                        {item.is_submitted && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded-md">
                            <CalendarDays size={12} className="text-teal-500" />
                            {formatDate(item.submitted_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
