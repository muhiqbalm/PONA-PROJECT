"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Home, Info } from "lucide-react";
import { useAppUserData } from "@/utils/useAppUserData";

export default function HomeHeader() {
  // Panggil hook untuk dapatkan datanya
  const { userData, loading } = useAppUserData();

  // --- LOGIKA PENENTUAN LINK ---
  // Default ke "/"
  let homeLink = "/";

  // Jika loading selesai & data ada & role adalah teacher/guru, ubah link
  if (!loading && userData) {
    if (userData.role === "TEACHER") {
      homeLink = "/dashboard";
    }
  }

  return (
    <header className="w-full flex justify-between items-center py-4 px-6 bg-transparent">
      {/* --- BAGIAN KIRI: LOGO --- */}
      <div className="flex-shrink-0">
        <Link href={homeLink}>
          <div className="relative w-32 h-16">
            <Image
              src="/funbioIcon.png"
              alt="Fun Bio Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>
      </div>

      {/* --- BAGIAN KANAN: ICON NAVIGASI --- */}
      <nav className="flex items-center gap-5">
        <Link href="/profile">
          <button className="cursor-pointer flex items-center justify-center text-black hover:text-gray-600 transition-colors">
            {/* Opsional: Tampilkan nama user jika ada, atau icon default */}
            <User className="w-7 h-7 stroke-[2]" />
          </button>
        </Link>

        {/* Link Home menggunakan variabel homeLink yang sudah dihitung */}
        <Link href={homeLink}>
          <button className="cursor-pointer flex items-center justify-center text-black hover:text-gray-600 transition-colors">
            <Home className="w-7 h-7 stroke-[2]" />
          </button>
        </Link>

        <Link href="/about-us">
          <button className="cursor-pointer flex items-center justify-center text-black hover:text-gray-600 transition-colors">
            <Info className="w-7 h-7 stroke-[2]" />
          </button>
        </Link>
      </nav>
    </header>
  );
}
