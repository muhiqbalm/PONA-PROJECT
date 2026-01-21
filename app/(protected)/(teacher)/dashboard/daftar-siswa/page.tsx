"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Users,
  MoreVertical,
  Loader2,
  RefreshCw,
  User,
} from "lucide-react";
import HomeHeader from "@/components/homeHeader";
import { createClient } from "@/utils/supabase-client";
import { toast } from "react-hot-toast";

// --- TIPE DATA DISESUAIKAN ---
interface Student {
  id: string; // Biasanya kolom 'id' atau 'uuid' di Supabase
  full_name: string; // Nama Lengkap
  class_name: string; // Kelas
}

interface ClassGroup {
  className: string;
  students: Student[];
}

export default function GuruSiswaPage() {
  const supabase = createClient();

  // --- STATE ---
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [groupedStudents, setGroupedStudents] = useState<ClassGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedClasses, setExpandedClasses] = useState<string[]>([]);

  // --- 1. FETCH DATA ---
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Mengambil data sesuai kolom yang tersedia
      // Pastikan nama tabel Anda benar ('students')
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("class_name", { ascending: true })
        .order("full_name", { ascending: true });

      if (error) throw error;

      if (data) {
        // Mapping data jika nama kolom di DB berbeda dengan state (opsional)
        // Misal kolom DB 'uuid' tapi kita pakai 'id' di frontend
        const mappedData = data.map((item: any) => ({
          id: item.id || item.uuid, // Handle jika nama kolomnya 'uuid'
          full_name: item.full_name,
          class_name: item.class_name,
        }));
        setAllStudents(mappedData);
      }
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error("Gagal memuat data siswa.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // --- 2. FILTER & GROUPING LOGIC ---
  useEffect(() => {
    // A. Filter (Hanya Nama & Kelas)
    const filtered = allStudents.filter((s) => {
      const query = searchQuery.toLowerCase();
      return (
        s.full_name.toLowerCase().includes(query) ||
        s.class_name?.toLowerCase().includes(query)
      );
    });

    // B. Grouping
    const groups: Record<string, Student[]> = {};

    filtered.forEach((student) => {
      const cls = student.class_name || "Tanpa Kelas";
      if (!groups[cls]) {
        groups[cls] = [];
      }
      groups[cls].push(student);
    });

    // C. Convert ke Array
    const groupArray: ClassGroup[] = Object.keys(groups)
      .sort()
      .map((className) => ({
        className,
        students: groups[className],
      }));

    setGroupedStudents(groupArray);

    // D. Auto Expand
    if (searchQuery.trim() !== "") {
      setExpandedClasses(groupArray.map((g) => g.className));
    }
  }, [allStudents, searchQuery]);

  // --- HANDLERS ---
  const toggleClass = (className: string) => {
    setExpandedClasses((prev) =>
      prev.includes(className)
        ? prev.filter((c) => c !== className)
        : [...prev, className],
    );
  };

  // Helper untuk inisial nama
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans">
      <div className="flex-shrink-0 z-30 bg-white shadow-sm">
        <HomeHeader />

        <div className="px-6 py-4 pb-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">Daftar Siswa</h1>
            <button
              onClick={fetchStudents}
              className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-full transition"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition sm:text-sm"
              placeholder="Cari nama atau kelas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20">
        <div className="max-w-3xl mx-auto space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2
                size={32}
                className="animate-spin mb-3 text-violet-500"
              />
              <p className="text-sm">Memuat data siswa...</p>
            </div>
          ) : groupedStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users size={48} className="mx-auto mb-3 opacity-30" />
              <p>Tidak ada data siswa ditemukan.</p>
            </div>
          ) : (
            groupedStudents.map((group) => {
              const isExpanded = expandedClasses.includes(group.className);

              return (
                <div
                  key={group.className}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300"
                >
                  {/* HEADER KELAS */}
                  <button
                    onClick={() => toggleClass(group.className)}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 flex-shrink-0">
                        <Users size={20} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-gray-800 text-sm">
                          {group.className}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {group.students.length} Siswa
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <ChevronDown size={20} />
                    </div>
                  </button>

                  {/* LIST SISWA */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded
                        ? "max-h-[2000px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="border-t border-gray-100 bg-gray-50/30">
                      <div className="divide-y divide-gray-100">
                        {group.students.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-3 pl-4 hover:bg-violet-50 transition-colors group"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Avatar Inisial (Tanpa Gambar) */}
                              <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm uppercase flex-shrink-0">
                                {getInitials(student.full_name)}
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-700 truncate">
                                  {student.full_name}
                                </p>
                                {/* Opsional: Tampilkan kelas lagi di sini atau biarkan kosong */}
                              </div>
                            </div>

                            {/* Tombol Opsi */}
                            {/* <button className="p-2 text-gray-300 hover:text-violet-600 rounded-full hover:bg-violet-100 transition-opacity">
                              <MoreVertical size={16} />
                            </button> */}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
