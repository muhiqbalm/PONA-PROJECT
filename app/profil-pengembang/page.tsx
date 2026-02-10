"use client";

import Link from "next/link";
import { ArrowLeft, GraduationCap, Building2, Award } from "lucide-react";
import HomeHeader from "@/components/homeHeader";

export default function ProfilPengembangPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans">
      <HomeHeader />

      <header className="relative flex items-center justify-center px-6 pb-6 pt-2 bg-transparent">
        <Link
          href="/"
          className="absolute left-6 top-5 -translate-y-1/2 p-2 -ml-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
        </Link>
        <h1 className="text-xl font-bold text-black">Profil Pengembang</h1>
      </header>

      {/* PERUBAHAN DISINI: */}
      {/* 1. Dihapus 'justify-center' (agar tidak di tengah vertikal) */}
      {/* 2. Ditambah 'pt-4' (memberi jarak sedikit dari header) */}
      <main className="flex-1 w-full px-6 pb-10 flex flex-col items-center pt-4">
        {/* Kartu Profil Modern */}
        <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-lg shadow-gray-100 border border-gray-100">
          {/* Banner Dekoratif Atas */}
          <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-md rotate-45">
                {/* Icon di tengah (dirotasi balik agar lurus) */}
                <GraduationCap className="w-10 h-10 text-blue-600 -rotate-45" />
              </div>
            </div>
          </div>

          {/* Konten Text */}
          <div className="pt-14 pb-8 px-6 text-center">
            <h2 className="text-xl font-black text-gray-900 mb-1">
              Ponasari Baron Mutiara Kenya
            </h2>
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-6">
              Pengembang Aplikasi
            </p>

            {/* List Detail dengan Icon Kecil */}
            <div className="space-y-4 text-left bg-gray-50 p-5 rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="bg-white p-1.5 rounded-full shadow-sm text-blue-500 mt-0.5">
                  <Award size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">
                    Program Studi
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    S2 Teknologi Pembelajaran
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-white p-1.5 rounded-full shadow-sm text-blue-500 mt-0.5">
                  <Building2 size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">
                    Institusi
                  </p>
                  <p className="text-sm text-gray-700 font-medium">
                    Departemen Teknologi Pendidikan
                    <br />
                    Fakultas Ilmu Pendidikan
                    <br />
                    Universitas Negeri Malang
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
