"use client";

import { useState } from "react";
import HomeHeader from "@/components/homeHeader"; // Pastikan path import sesuai
import Image from "next/image";
import { Search, Star } from "lucide-react";
import { useRouter } from "next/navigation";

// --- DATA STATIS UNTUK PENCARIAN ---
const SEARCH_DATA = ["Sistem Sirkulasi"];

export default function Home() {
  // State untuk menangani input dan dropdown
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelectItem = (item: string) => {
    setQuery(item);
    setShowDropdown(false);

    // 3. Tambahkan logika navigasi
    if (item === "Sistem Sirkulasi") {
      router.push("/sistem-sirkulasi");
    }
  };

  // Fungsi saat user mengetik
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 0) {
      // Filter data berdasarkan input (case insensitive)
      const filtered = SEARCH_DATA.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans">
      {/* Header dipanggil di sini */}
      <HomeHeader />

      {/* Main Content mengisi sisa layar */}
      <main className="flex-1 w-full px-6 pb-8 pt-2 overflow-y-auto">
        {/* 1. SEARCH BAR AREA */}
        <div className="relative mb-6 z-50">
          {/* Input Field */}
          <input
            type="text"
            value={query}
            onChange={handleSearchChange}
            placeholder="Cari materi..."
            className="w-full h-12 pl-5 pr-12 rounded-xl border border-slate-300 shadow-sm transition focus:ring-2 focus:ring-green-400 outline-none text-gray-700 bg-white"
            // Opsional: Tutup dropdown saat focus hilang (perlu handling click event agar tidak bentrok)
            // onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search className="w-6 h-6 text-black" strokeWidth={2.5} />
          </div>

          {/* --- DROPDOWN HASIL SEARCH --- */}
          {showDropdown && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {filteredData.length > 0 ? (
                <ul>
                  {filteredData.map((item, index) => (
                    <li
                      key={index}
                      onClick={() => handleSelectItem(item)}
                      className="px-5 py-3 hover:bg-green-50 cursor-pointer text-gray-700 border-b last:border-none border-gray-50 transition-colors"
                    >
                      {item}
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

        {/* 2. HERO BANNER */}
        {/* Tambahkan z-0 agar tidak menutupi dropdown jika dropdown sangat panjang */}
        <div className="relative w-full h-44 rounded-3xl overflow-hidden shadow-sm bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 flex items-center mb-6 z-0">
          {/* Teks Kiri */}
          <div className="w-1/2 pl-6 z-10">
            <h2 className="font-bold text-lg leading-tight text-black mb-2">
              FunBio <br />
              Digital Learning <br />
              Media
            </h2>
            <p className="text-xs text-gray-600 font-medium">
              Suitable for <br /> Senior High School
            </p>
          </div>

          {/* Gambar Kanan (Blood Cells) */}
          <div className="absolute right-0 top-0 h-full w-2/5">
            <Image
              src="/blood-cells.png"
              alt="Hero Banner"
              fill
              className="object-cover object-left"
            />
            <div className="absolute inset-0"></div>
          </div>
        </div>

        {/* 3. SECTION TITLE */}
        <h3 className="font-bold text-lg text-black mb-4">Featured FunBio</h3>

        {/* 4. GRID MENU (4 KOTAK) */}
        <div className="grid grid-cols-2 gap-4">
          <MenuCard
            title="Materi Bacaan"
            imageSrc="/materi-bacaan2.png"
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
    <div
      className={`${bgColor} cursor-pointer transitions hover:shadow-lg hover:outline-2 hover:outline-green-100 shadow-slate-200 hover:shadow-green-200/50 p-4 rounded-3xl shadow-sm h-44 flex flex-col justify-between relative transition-transform`}
    >
      <div className="flex justify-center items-center flex-1">
        <div className="relative w-28 h-24">
          <Image src={imageSrc} alt={title} fill className="object-contain" />
        </div>
      </div>

      <div className="flex items-end justify-between w-full mt-2">
        <span className="font-bold text-black leading-tight w-2/3">
          {title.split(" ").map((word, i) => (
            <span key={i} className="block">
              {word}
            </span>
          ))}
        </span>
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mb-1" />
      </div>
    </div>
  );
}
