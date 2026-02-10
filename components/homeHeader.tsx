"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Home, Info, LogIn } from "lucide-react"; // Import icon LogIn
import { useAppUserData } from "@/utils/useAppUserData";

export default function HomeHeader() {
  // Panggil hook untuk dapatkan datanya
  const { userData, loading } = useAppUserData();

  // --- LOGIKA PENENTUAN LINK HOME ---
  // Default ke "/"
  let homeLink = "/";

  // Jika loading selesai & data ada & role adalah teacher/guru, ubah link
  if (!loading && userData) {
    if (userData.role === "TEACHER") {
      homeLink = "/dashboard";
    }
  }

  return (
    <header className="w-full flex justify-between items-center py-1 px-6 bg-transparent">
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
        {/* --- LOGIKA PROFILE vs LOGIN --- */}
        {loading ? (
          // 1. Tampilan saat Loading (Skeleton bulat)
          <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse" />
        ) : userData ? (
          // 2. Jika SUDAH Login -> Tampilkan Icon Profile
          <Link href="/profile">
            <button className="cursor-pointer flex items-center justify-center text-black hover:text-gray-600 transition-colors">
              <User className="w-7 h-7 stroke-[2]" />
            </button>
          </Link>
        ) : (
          // 3. Jika BELUM Login -> Tampilkan Tombol Login
          <Link href="/auth/login">
            <button className="cursor-pointer flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-sm">
              <span>LOGIN</span>
              <LogIn className="w-4 h-4" />
            </button>
          </Link>
        )}

        {/* Link Home */}
        <Link href={homeLink}>
          <button className="cursor-pointer flex items-center justify-center text-black hover:text-gray-600 transition-colors">
            <Home className="w-7 h-7 stroke-[2]" />
          </button>
        </Link>

        {/* Link About Us */}
        {/* <Link href="/about-us">
          <button className="cursor-pointer flex items-center justify-center text-black hover:text-gray-600 transition-colors">
            <Info className="w-7 h-7 stroke-[2]" />
          </button>
        </Link> */}
      </nav>
    </header>
  );
}
