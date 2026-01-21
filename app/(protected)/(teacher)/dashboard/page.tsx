"use client";

import { useAuth } from "@/components/authProvider";
import HomeHeader from "@/components/homeHeader";
import { BookOpen, ChevronRight, Users } from "lucide-react"; // Ganti Star dgn ChevronRight agar lebih informatif untuk list view
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function TeacherDashboardHome() {
  const { user, isLoading: loading } = useAuth();
  const router = useRouter();

  // Opsional: Proteksi halaman
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
    if (!loading && user?.role !== "TEACHER") {
      router.push("/unauthorized");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const userName = user?.full_name || "Guru";

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans">
      <HomeHeader />

      <main className="flex-1 w-full px-6 pb-8 pt-2 overflow-y-auto">
        {/* HERO / GREETING BANNER */}
        <div className="relative w-full h-44 rounded-3xl overflow-hidden shadow-sm bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 flex items-center mb-6 z-0">
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

        {/* SECTION TITLE */}
        <h3 className="font-bold text-lg text-black mb-4">Dashboard Guru</h3>

        {/* --- GRID MENU (1 KOLOM / FULL WIDTH) --- */}
        <div className="grid grid-cols-1 gap-4">
          {" "}
          {/* UBAH: grid-cols-1 */}
          {/* Menu 1: Kelola Materi */}
          <Link href="/dashboard/materi" className="block w-full">
            <DashboardMenuCardWide
              title="Kelola Materi"
              icon={
                <BookOpen size={32} className="text-white" strokeWidth={2} />
              }
              description="Buat & atur materi pelajaran"
              iconBg="bg-green-500" // Warna background icon
            />
          </Link>
          {/* Menu 2: Daftar Siswa */}
          <Link href="/dashboard/siswa" className="block w-full">
            <DashboardMenuCardWide
              title="Daftar Siswa"
              icon={<Users size={32} className="text-white" strokeWidth={2} />}
              description="Pantau data & progres siswa"
              iconBg="bg-blue-500" // Warna background icon
            />
          </Link>
        </div>
      </main>
    </div>
  );
}

// --- Komponen Card Baru (Mode Wide/Horizontal) ---
function DashboardMenuCardWide({
  title,
  icon,
  description,
  iconBg,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  iconBg: string;
}) {
  return (
    <div className="hover:shadow-slate-300 hover:shadow-md transitions bg-white p-5 rounded-3xl shadow-sm border border-transparent hover:border-gray-200 transition-all active:scale-[0.98] flex items-center justify-between w-full h-24 relative overflow-hidden">
      {/* Bagian Kiri: Icon & Teks */}
      <div className="flex items-center gap-4 z-10">
        {/* Icon Container */}
        <div
          className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center shadow-md`}
        >
          {icon}
        </div>

        {/* Teks */}
        <div className="flex flex-col">
          <span className="font-bold text-black text-lg leading-tight">
            {title}
          </span>
          <span className="text-xs text-gray-500 font-medium mt-1">
            {description}
          </span>
        </div>
      </div>

      {/* Bagian Kanan: Chevron (Indikator Klik) */}
      <div className="z-10">
        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
          <ChevronRight size={20} />
        </div>
      </div>

      {/* Dekorasi Background Halus (Opsional) */}
      <div
        className={`absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-gray-50 to-transparent opacity-50 z-0`}
      ></div>
    </div>
  );
}
