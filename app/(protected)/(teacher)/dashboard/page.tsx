"use client";

import { useAuth } from "@/components/authProvider";
import HomeHeader from "@/components/homeHeader";
import { BookOpen, Users, User, FileText } from "lucide-react";
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
        <div className="relative w-full h-32 mb-4 flex-shrink-0 rounded-xl overflow-hidden shadow-sm bg-gradient-to-r from-green-200 via-blue-200 to-purple-200 flex items-center z-0">
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
        <div className="flex-shrink-0 mb-4 w-full bg-[#D4EDDA] rounded-xl p-3 flex items-center gap-3 border border-green-100/50">
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
        <h3 className="font-bold text-lg text-black mb-4">Dashboard Guru</h3>

        {/* --- GRID MENU (2 KOLOM / 2x2) --- */}
        <div className="grid grid-cols-2 gap-4">
          {/* Menu 4: Pedoman Pemanfaatan */}
          <Link href="/panduan-penggunaan-guru" className="block w-full">
            <DashboardMenuCardSquare
              title="Pedoman Pemanfaatan"
              description="Panduan penggunaan fitur"
              icon={
                <FileText size={24} className="text-white" strokeWidth={2} />
              }
              iconBg="bg-orange-500"
            />
          </Link>

          {/* Menu 1: Kelola Materi */}
          <Link href="/dashboard/materi" className="block w-full">
            <DashboardMenuCardSquare
              title="Kelola Materi"
              description="Buat & atur materi pelajaran"
              icon={
                <BookOpen size={24} className="text-white" strokeWidth={2} />
              }
              iconBg="bg-green-500"
            />
          </Link>

          {/* Menu 2: Daftar Siswa */}
          <Link href="/dashboard/daftar-siswa" className="block w-full">
            <DashboardMenuCardSquare
              title="Daftar Siswa"
              description="Pantau data & progres siswa"
              icon={<Users size={24} className="text-white" strokeWidth={2} />}
              iconBg="bg-blue-500"
            />
          </Link>

          {/* Menu 3: Profil Pengembang */}
          <Link href="/profil-pengembang" className="block w-full">
            <DashboardMenuCardSquare
              title="Profil Pengembang"
              description="Informasi pengembang aplikasi"
              icon={<User size={24} className="text-white" strokeWidth={2} />}
              iconBg="bg-purple-500"
            />
          </Link>
        </div>
      </main>
    </div>
  );
}

// --- Komponen Card Baru (Mode Square dengan Deskripsi) ---
function DashboardMenuCardSquare({
  title,
  description,
  icon,
  iconBg,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="hover:shadow-slate-300 hover:shadow-md transitions bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-gray-200 transition-all active:scale-[0.98] flex flex-col items-start justify-start w-full h-36 relative overflow-hidden gap-3">
      {/* Icon Container */}
      <div
        className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shadow-md z-10 shrink-0`}
      >
        {icon}
      </div>

      {/* Teks */}
      <div className="flex flex-col z-10 w-full">
        <span className="font-bold text-black text-[14px] sm:text-[15px] leading-tight mb-1">
          {title}
        </span>
        <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium leading-snug line-clamp-2">
          {description}
        </span>
      </div>

      {/* Dekorasi Background Halus di Pojok Kanan Atas */}
      <div
        className={`absolute -right-4 -top-4 w-16 h-16 ${iconBg} opacity-10 rounded-full z-0`}
      ></div>
    </div>
  );
}
