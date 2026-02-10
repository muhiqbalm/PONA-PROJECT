"use client";

import { useState, useEffect } from "react";
import HomeHeader from "@/components/homeHeader";
import Image from "next/image";
import { Star } from "lucide-react";
// import { useRouter } from "next/navigation"; // Router tidak lagi dibutuhkan untuk navigasi menu
import Link from "next/link"; // Import Link
import { createClient } from "@/utils/supabase-client";

export default function Home() {
  // const router = useRouter(); // Tidak perlu router instance untuk Link
  const [loading, setLoading] = useState(true);

  // State untuk menyimpan link panduan yang dinamis
  const [panduanLink, setPanduanLink] = useState("/panduan-penggunaan");

  // --- LOGIC: Cek Session & Role (Siswa vs Guru) ---
  useEffect(() => {
    const initPage = async () => {
      const supabase = createClient();

      // 1. Cek Session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        try {
          // 2. Cek apakah user ini ada di tabel 'teachers'
          const { data: teacherData } = await supabase
            .from("teachers")
            .select("id")
            .eq("id", session.user.id)
            .single();

          if (teacherData) {
            // === JIKA GURU ===
            setPanduanLink("/panduan-penggunaan-guru");
          } else {
            // === JIKA SISWA ===
            setPanduanLink("/panduan-penggunaan");
          }
        } catch (error) {
          console.error("Error checking role:", error);
          setPanduanLink("/panduan-penggunaan");
        }
      }

      setLoading(false);
    };

    initPage();
  }, []);

  // Menu items didefinisikan dengan properti 'href' bukan 'action'
  const menuItems = [
    {
      title: "Panduan Penggunaan",
      imageSrc: "/panduan-penggunaan.png",
      href: panduanLink, // Menggunakan state dinamis
    },
    {
      title: "Tujuan Pembelajaran",
      imageSrc: "/tujuan-pembelajaran.png",
      href: "/tujuan",
    },
    {
      title: "Mari Belajar",
      imageSrc: "/book.png",
      href: "/materi",
    },
    {
      title: "Ayo Berlatih",
      imageSrc: "/soal-latihan.png",
      href: "/ayo-berlatih",
    },
    {
      title: "Review Jawaban",
      imageSrc: "/review-jawaban.png",
      href: "/review-jawaban",
    },
    {
      title: "Profil Pengembang",
      imageSrc: "/profil-pengembang.png",
      href: "/profil",
    },
  ];

  if (loading)
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[#FAFAFA]">
        Loading...
      </div>
    );

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] font-sans overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <HomeHeader />
      </div>

      <main className="flex-1 flex flex-col w-full px-5 pb-2 gap-3 overflow-y-auto min-h-0">
        {/* HERO BANNER */}
        <div className="relative w-full h-32 flex-shrink-0 rounded-xl overflow-hidden shadow-sm bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 flex items-center z-0">
          <div className="flex-1 pl-6 z-10">
            <h2 className="font-black leading-tight text-lg mb-2">
              FunBioLearn
            </h2>

            <p className="text-sm font-bold">
              Media Pembelajaran <br /> Digital Materi Biologi
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

        {/* INFO BOX */}
        <div className="flex-shrink-0 w-full bg-[#D4EDDA] rounded-xl p-3 flex items-center gap-3 border border-green-100/50">
          <div className="flex-shrink-0 relative w-14 h-14">
            <Image
              src="/flash-cards.png"
              alt="Info"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-[10px] sm:text-xs text-gray-900 font-medium leading-relaxed">
            Media pembelajaran ini menggunakan strategi <i>scaffolding</i>{" "}
            berupa <i>flashcard</i> yang tersedia pada menu mari belajar dan ayo
            berlatih.
          </p>
        </div>

        {/* SECTION TITLE */}
        <div className="flex-shrink-0 mt-1">
          <h3 className="font-extrabold text-base text-black">
            Featured FunBioLearn
          </h3>
        </div>

        {/* GRID MENU */}
        <div className="grid grid-cols-3 gap-3">
          {menuItems.map((item, index) => (
            <MenuCard
              key={index}
              title={item.title}
              imageSrc={item.imageSrc}
              href={item.href}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function MenuCard({
  title,
  imageSrc,
  href,
}: {
  title: string;
  imageSrc: string;
  href: string;
}) {
  return (
    // Menggunakan Link untuk navigasi yang smooth dan support prefetch
    <Link
      href={href}
      className="aspect-square w-full bg-white p-2 rounded-lg hover:shadow-lg border border-transparent hover:border-gray-300 shadow-sm active:scale-95 transition-transform cursor-pointer flex flex-col items-center justify-between h-full relative"
    >
      <div className="absolute top-1.5 right-1.5">
        <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
      </div>

      <div className="flex-1 w-full relative my-1 min-h-[40px]">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-contain p-1"
          sizes="(max-width: 768px) 16vw, 64px"
        />
      </div>

      <div className="w-full p-1">
        <p className="font-bold text-black text-[10px] sm:text-[12px] leading-tight text-left line-clamp-2">
          {title}
        </p>
      </div>
    </Link>
  );
}
