"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase-client";
import HomeHeader from "@/components/homeHeader"; // Import HomeHeader

// --- TIPE DATA ---
type Subject = {
  id: string;
  name: string;
};

type LearningObjective = {
  id: string;
  description: string;
  order_number: number;
};

// --- KOMPONEN UTAMA (PAGE) ---
export default function TujuanPembelajaranPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Fetch Subject List saat pertama kali load
  useEffect(() => {
    const fetchSubjects = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from("subjects")
          .select("id, name")
          .order("name", { ascending: true });

        if (error) throw error;
        setSubjects(data || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] font-sans overflow-hidden">
      {/* 1. GLOBAL HEADER (HomeHeader) */}
      <div className="flex-shrink-0 z-10">
        <HomeHeader />
      </div>

      {/* 2. SUB-HEADER (Back Button & Page Title) */}
      <div className="px-6 pt-4 pb-2 flex items-center relative justify-center flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="absolute left-6 p-2 -ml-2 text-black hover:bg-gray-200 rounded-full transition cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold text-black text-center leading-tight">
          Tujuan <br /> Pembelajaran
        </h1>
      </div>

      {/* 3. CONTENT (Scrollable List) */}
      <main className="flex-1 w-full overflow-y-auto px-6 py-4 pb-20">
        <div className="flex flex-col gap-4">
          {loadingSubjects ? (
            // Skeleton Loading
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-[24px] animate-pulse"
              />
            ))
          ) : subjects.length > 0 ? (
            subjects.map((subject) => (
              <SubjectAccordion key={subject.id} subject={subject} />
            ))
          ) : (
            <div className="text-center text-gray-400 mt-10">
              Belum ada materi tersedia.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- KOMPONEN ANAK (ACCORDION ITEM) ---
function SubjectAccordion({ subject }: { subject: Subject }) {
  const [isOpen, setIsOpen] = useState(false);
  const [objectives, setObjectives] = useState<LearningObjective[]>([]);
  const [loadingObjectives, setLoadingObjectives] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const toggleOpen = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    // Fetch on Demand: Hanya fetch jika dibuka & belum pernah fetch
    if (nextState && !hasFetched) {
      setLoadingObjectives(true);
      const supabase = createClient();

      try {
        const { data, error } = await supabase
          .from("learning_objectives")
          .select("id, description, order_number")
          .eq("subject_id", subject.id)
          .order("order_number", { ascending: true });

        if (error) throw error;
        setObjectives(data || []);
        setHasFetched(true);
      } catch (error) {
        console.error("Error fetching objectives:", error);
      } finally {
        setLoadingObjectives(false);
      }
    }
  };

  return (
    <div
      className={`bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
        isOpen ? "ring-2 ring-blue-500/20" : ""
      }`}
    >
      {/* Header Card */}
      <div
        onClick={toggleOpen}
        className="p-5 flex justify-between items-center cursor-pointer select-none active:bg-gray-50 transition-colors"
      >
        <h2
          className={`font-bold text-base sm:text-lg leading-snug transition-colors ${isOpen ? "text-blue-600" : "text-black"}`}
        >
          {subject.name}
        </h2>

        <div
          className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
        >
          <ChevronDown
            className={`w-6 h-6 ${isOpen ? "text-blue-600" : "text-gray-400"}`}
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* Body Content */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-6 pt-0 text-black text-sm sm:text-[15px] leading-relaxed">
          <div className="border-t border-gray-100 mb-4"></div>

          {loadingObjectives ? (
            <div className="flex justify-center items-center py-4 text-gray-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Memuat data...</span>
            </div>
          ) : objectives.length > 0 ? (
            <ol className="list-none flex flex-col gap-3">
              {objectives.map((item, index) => (
                <li
                  key={item.id}
                  className="flex items-start gap-2 text-gray-700"
                >
                  <span className="font-bold min-w-[20px] text-blue-600">
                    {item.order_number || index + 1}.
                  </span>
                  <span className="text-justify leading-relaxed">
                    {item.description}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="text-center text-gray-400 italic py-2 text-sm">
              Belum ada tujuan pembelajaran.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
