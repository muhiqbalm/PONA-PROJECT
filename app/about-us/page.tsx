"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import HomeHeader from "@/components/homeHeader";
import Cookies from "js-cookie";

export default function AboutUsPage() {
  const [panduanLink, setPanduanLink] = useState(
    "/about-us/panduan-penggunaan",
  );

  useEffect(() => {
    const userDataCookie = Cookies.get("app_user_data");

    if (userDataCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataCookie));
        if (userData && userData.role === "TEACHER") {
          setPanduanLink("/about-us/panduan-penggunaan-guru");
        } else {
          setPanduanLink("/about-us/panduan-penggunaan");
        }
      } catch (error) {
        console.error("Gagal memproses data user dari cookie:", error);
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans">
      {/* 1. Header Utama */}
      <HomeHeader />

      {/* 2. Header Halaman (DIPERBAIKI) */}
      {/* Menggunakan py-6 agar padding atas dan bawah seimbang, sehingga items-center bekerja sempurna */}
      <header className="relative flex items-center justify-center px-6 py-6 bg-transparent shrink-0">
        <Link
          href="/"
          // top-1/2 dengan -translate-y-1/2 akan menempatkan icon persis di tengah vertikal container
          className="absolute left-6 top-1/2 -translate-y-1/2 p-2 -ml-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
        </Link>
        <h1 className="text-xl font-bold text-black">About Us</h1>
      </header>

      {/* 3. Konten Utama */}
      <main className="flex-1 w-full p-6 flex flex-col gap-4">
        <MenuCard
          title="Panduan Penggunaan"
          imageSrc="/panduan-penggunaan.png"
          href={panduanLink}
        />

        <MenuCard
          title="Profil Pengembang"
          imageSrc="/profil-pengembang.png"
          href="/about-us/profil-pengembang"
        />
      </main>
    </div>
  );
}

// --- Komponen Kartu Menu ---
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
    <Link href={href} className="w-full relative group cursor-pointer">
      <div className="bg-white rounded-3xl p-4 h-32 flex items-center outline-2 outline-transparent shadow-sm hover:shadow-lg hover:outline-slate-200 shadow-slate-200 hover:shadow-slate-200 transition-all relative overflow-hidden">
        <div className="w-24 h-24 relative flex-shrink-0 mr-4 flex items-center justify-center">
          <div className="relative w-20 h-20">
            <Image
              src={imageSrc}
              alt={title}
              fill
              className="object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-bold text-black leading-tight">
            {title.split(" ").map((word, i) => (
              <span key={i} className="block">
                {word}
              </span>
            ))}
          </h2>
        </div>
      </div>
    </Link>
  );
}
