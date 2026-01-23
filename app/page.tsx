"use client";

import { useState, useEffect } from "react";
import HomeHeader from "@/components/homeHeader";
import Image from "next/image";
import { Search, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase-client";
import { getSubjects } from "@/utils/supabase-queries";
import { Subject } from "@/types/database";

export default function Home() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredData, setFilteredData] = useState<Subject[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- 1. LOGIC KHUSUS: Cek apakah user adalah GURU ---
  useEffect(() => {
    const checkGuruRedirect = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        try {
          const { data: userData } = await supabase
            .from("teachers")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (userData) {
            router.replace("/dashboard");
          }
        } catch (error) {
          console.error("Error checking role:", error);
        }
      }
    };

    checkGuruRedirect();
  }, [router]);

  // --- 2. Fetch Subjects (Data Materi) ---
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const supabase = createClient();
        const data = await getSubjects(supabase);
        setSubjects(data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  const handleSelectItem = (subject: Subject) => {
    setQuery(subject.name);
    setShowDropdown(false);
    router.push(`/materi/${subject.id}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 0) {
      const filtered = subjects.filter((subject) =>
        subject.name.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredData(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  return (
    // UBAH: h-[100dvh] agar pas satu layar device, overflow-hidden agar tidak scroll
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] font-sans overflow-hidden">
      {/* Header biarkan fixed height contentnya */}
      <div className="flex-shrink-0">
        <HomeHeader />
      </div>

      {/* Main menggunakan flex-1 agar mengisi sisa ruang, padding disesuaikan */}
      <main className="flex-1 flex flex-col w-full px-6 pb-4 pt-2 min-h-0">
        {/* SEARCH BAR AREA - margin bottom dikurangi sedikit */}
        <div className="relative mb-3 z-50 flex-shrink-0">
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder={loading ? "Loading..." : "Cari materi..."}
            disabled={loading}
            className="w-full h-12 pl-5 pr-12 rounded-xl border border-slate-300 shadow-sm transition focus:ring-2 focus:ring-green-400 outline-none text-gray-700 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-6 h-6 text-black" strokeWidth={2.5} />
          </div>

          {/* DROPDOWN HASIL SEARCH */}
          {showDropdown && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 max-h-60 overflow-y-auto">
              {filteredData.length > 0 ? (
                <ul>
                  {filteredData.map((subject) => (
                    <li
                      key={subject.id}
                      onClick={() => handleSelectItem(subject)}
                      className="px-5 py-3 hover:bg-green-50 cursor-pointer text-gray-700 border-b last:border-none border-gray-50 transition-colors"
                    >
                      {subject.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-5 py-3 text-gray-400 text-sm">
                  Materi tidak ditemukan
                </div>
              )}
            </div>
          )}
        </div>

        {/* HERO BANNER 
            UBAH: Tinggi dikurangi dari h-44 (176px) ke h-32 (128px) atau h-[20%] 
            agar sisa ruang untuk menu lebih banyak.
        */}
        <div className="relative w-full h-32 flex-shrink-0 rounded-xl overflow-hidden shadow-sm bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 flex items-center mb-3 z-0">
          <div className="w-1/2 pl-4 z-10">
            <h2 className="font-bold text-base leading-tight text-black mb-1">
              FunBio <br />
              Digital Learning <br />
              Media
            </h2>
            <p className="text-[10px] text-gray-600 font-medium">
              Suitable for <br /> Senior High School
            </p>
          </div>

          <div className="absolute right-0 top-[-10] h-full w-2/5">
            <Image
              src="/blood-cells.png"
              alt="Hero Banner"
              fill
              className="object-cover object-left"
            />
            <div className="absolute inset-0"></div>
          </div>
        </div>

        {/* SECTION TITLE */}
        <h3 className="font-bold text-base text-black mb-2 flex-shrink-0">
          Featured FunBio
        </h3>

        {/* GRID MENU 
            UBAH: flex-1 agar grid mengambil SEMUA sisa ruang vertical. 
            Card di dalamnya akan menyesuaikan (h-full).
        */}
        <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
          <MenuCard
            title="Materi Bacaan"
            imageSrc="https://aemfbowlzgerzztfryre.supabase.co/storage/v1/object/public/images/materi-bacaan.png"
            bgColor="bg-white"
          />
          <MenuCard
            title="Media Visual"
            imageSrc="/media-visual.png"
            bgColor="bg-white"
          />
          <MenuCard
            title="Soal Latihan"
            imageSrc="/soal-latihan.png"
            bgColor="bg-white"
          />
          <MenuCard
            title="Flash Card"
            imageSrc="/flash-cards.png"
            bgColor="bg-white"
          />
        </div>
      </main>
    </div>
  );
}

// --- Komponen Kecil untuk Card ---
function MenuCard({
  title,
  imageSrc,
  bgColor,
}: {
  title: string;
  imageSrc: string;
  bgColor: string;
}) {
  return (
    // UBAH: Hapus fixed height (h-44), ganti dengan h-full agar mengikuti grid parent.
    <div
      className={`${bgColor} transitions shadow-slate-200 p-4 rounded-xl shadow-sm h-full flex flex-col justify-between relative transition-transform`}
    >
      <div className="flex justify-center items-center flex-1 w-full h-full overflow-hidden">
        {/* Image wrapper dibuat responsive relative terhadap card */}
        <div className="relative w-full h-full max-h-22">
          <Image src={imageSrc} alt={title} fill className="object-contain" />
        </div>
      </div>

      <div className="flex items-end justify-between w-full">
        {/* Ukuran font sedikit dikecilkan agar aman di layar kecil */}
        <span className="font-bold text-black text-sm leading-tight w-2/3">
          {title.split(" ").map((word, i) => (
            <span key={i} className="block">
              {word}
            </span>
          ))}
        </span>
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mb-1 flex-shrink-0" />
      </div>
    </div>
  );
}
