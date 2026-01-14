"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { User, Home, Info } from "lucide-react";

export default function HomeHeader() {
  return (
    <header className="w-full flex justify-between items-center py-4 px-6 bg-transparent">
      {/* --- BAGIAN KIRI: LOGO --- */}
      <div className="flex-shrink-0">
        <Link href="/">
          {/* Catatan: Pastikan Anda sudah menyimpan gambar logo Anda 
            (FunBio + Daun) sebagai file 'logo.png' di folder 'public' 
          */}
          <div className="relative w-32 h-16">
            <Image
              src="/funbioIcon.png" // Ganti dengan path logo asli Anda
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
        {/* Icon User / Profil */}
        <Link href="/profile">
          <button className="cursor-pointer flex items-center justify-center text-black hover:text-gray-600 transition-colors">
            <User className="w-7 h-7 stroke-[2]" />
          </button>
        </Link>

        {/* Icon Home */}
        <Link href="/dashboard">
          <button className="cursor-pointer flex items-center justify-center text-black hover:text-gray-600 transition-colors">
            <Home className="w-7 h-7 stroke-[2]" />
          </button>
        </Link>

        {/* Icon Info */}
        <Link href="/about-us">
          <button className="cursor-pointer flex items-center justify-center text-black hover:text-gray-600 transition-colors">
            <Info className="w-7 h-7 stroke-[2]" />
          </button>
        </Link>
      </nav>
    </header>
  );
}
