"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link"; // 1. Import Link
import { ArrowLeft, ChevronDown } from "lucide-react";
import { createClient } from "@/utils/supabase-client";
import { Subject, Topic } from "@/types/database"; // Pastikan path ini sesuai
import HomeHeader from "@/components/homeHeader";

export default function MariBelajar() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch daftar Subject saat pertama kali load
  useEffect(() => {
    const fetchSubjects = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from("subjects")
          .select("*")
          .order("name", { ascending: true });

        if (error) throw error;
        setSubjects(data || []);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] font-sans overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <HomeHeader />
      </div>

      <main className="flex-1 flex flex-col w-full overflow-y-auto min-h-0">
        {/* --- HEADER --- */}
        <div className="px-6 pb-4 flex items-center relative mb-4">
          <button
            onClick={() => router.back()}
            className="absolute left-6 p-1 rounded-full active:bg-gray-200 transition cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
          </button>
          <h1 className="flex-1 text-center font-bold text-lg text-black">
            Mari Belajar
          </h1>
        </div>

        {/* --- CONTENT LIST --- */}
        <div className="px-6 flex flex-col gap-4">
          {subjects.length > 0 ? (
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

function SubjectAccordion({ subject }: { subject: Subject }) {
  const [isOpen, setIsOpen] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const toggleOpen = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && !hasFetched) {
      setIsLoadingTopics(true);
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from("topics")
          .select("*")
          .eq("subject_id", subject.id)
          .order("sort_order", { ascending: true });

        if (error) throw error;
        setTopics(data || []);
        setHasFetched(true);
      } catch (err) {
        console.error("Error fetching topics:", err);
      } finally {
        setIsLoadingTopics(false);
      }
    }
  };

  return (
    <div
      className={`flex flex-col overflow-hidden transition-all duration-300 ${
        isOpen ? "gap-1" : "gap-0"
      }`}
    >
      {/* CARD UTAMA (SUBJECT) */}
      <div
        onClick={toggleOpen}
        className={`bg-white rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all duration-300 border-2 ${
          isOpen ? "border-blue-500" : "border-gray-200/50"
        } active:scale-[0.98] z-10`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`font-bold text-base sm:text-lg transition-colors ${
              isOpen ? "text-blue-600" : "text-black"
            }`}
          >
            <span className="ml-1">{subject.name}</span>
          </span>
        </div>

        <div
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <ChevronDown
            className={`w-6 h-6 ${isOpen ? "text-blue-500" : "text-gray-400"}`}
            strokeWidth={2.5}
          />
        </div>
      </div>

      {/* LIST TOPICS (MUNCUL SAAT EXPANDED) */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen
            ? "grid-rows-[1fr] opacity-100 mt-2"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 pl-4 pr-1 pb-2">
            {isLoadingTopics ? (
              <div className="space-y-3">
                <div className="h-20 bg-gray-200 rounded-2xl animate-pulse w-full"></div>
                <div className="h-20 bg-gray-200 rounded-2xl animate-pulse w-full"></div>
              </div>
            ) : topics.length > 0 ? (
              topics.map((topic) => <TopicCard key={topic.id} topic={topic} />)
            ) : (
              <div className="p-6 text-center text-sm text-gray-400 italic bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                Topik belum tersedia untuk materi ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN ITEM TOPIC ---
function TopicCard({ topic }: { topic: Topic }) {
  // Router dihapus karena digantikan oleh Link
  // const router = useRouter();

  return (
    // 2. Menggunakan Link sebagai wrapper utama
    <Link
      href={`/materi/${topic.id}`}
      className="group bg-white rounded-2xl p-3 shadow-sm flex items-center gap-4 cursor-pointer hover:border-blue-200 border-2 border-transparent hover:shadow-md transition-all active:scale-[0.97]"
    >
      {/* Image / Icon Wrapper */}
      <div className="flex-shrink-0 w-14 h-14 relative rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center group-hover:scale-105 transition-transform">
        {topic.image ? (
          <Image
            src={topic.image}
            alt={topic.name}
            fill
            className="object-contain p-1"
          />
        ) : (
          <div className="bg-blue-50 text-blue-400 text-[10px] text-center font-bold px-2 py-1 rounded-lg">
            DOC
          </div>
        )}
      </div>

      {/* Title & Subtitle */}
      <div className="flex-1">
        <h4 className="font-bold text-gray-800 text-sm sm:text-base leading-tight group-hover:text-blue-600 transition-colors">
          {topic.name}
        </h4>
      </div>

      <div className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-blue-50 p-2 rounded-full">
          <ArrowLeft className="w-4 h-4 text-blue-500 rotate-180" />
        </div>
      </div>
    </Link>
  );
}
