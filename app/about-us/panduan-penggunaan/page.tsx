"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  UserCog,
  Zap,
  LogIn, // Import icon baru
  UserPlus, // Import icon baru
} from "lucide-react";
import HomeHeader from "@/components/homeHeader";

export default function PanduanPenggunaanPage() {
  const guides = [
    // --- FITUR BARU: REGISTRASI (Paling Atas) ---
    {
      step: "01",
      title: "Registrasi Akun",
      description:
        "Belum punya akun? Klik menu 'Daftar', isi data diri lengkap sesuai absensi, dan buat password yang aman.",
      icon: UserPlus,
      gradient: "from-indigo-600 to-blue-500",
      bgIcon: "bg-indigo-50",
      textIcon: "text-indigo-600",
    },
    // --- FITUR BARU: LOGIN ---
    {
      step: "02",
      title: "Login Aplikasi",
      description:
        "Masuk menggunakan Nama, Kelas, dan Password yang telah didaftarkan. Pastikan kredensial tidak diberikan ke orang lain.",
      icon: LogIn,
      gradient: "from-violet-600 to-fuchsia-500",
      bgIcon: "bg-violet-50",
      textIcon: "text-violet-600",
    },
    // --- KONTEN LAMA (Diurutkan ulang) ---
    {
      step: "03",
      title: "Akses Materi",
      description:
        "Cari materi pembelajaran di homepage. Lalu, buka menu 'Mari Belajar' untuk membaca materi pembelajaran interaktif.",
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-400",
      bgIcon: "bg-blue-50",
      textIcon: "text-blue-600",
    },
    {
      step: "04",
      title: "Pengerjaan Soal",
      description:
        "Kerjakan soal pada menu 'Ayo Berlatih'. Jika buntu, tekan tombol 'Perlu Bantuan?' untuk melihat Flash Card.",
      icon: BrainCircuit,
      gradient: "from-purple-500 to-pink-500",
      bgIcon: "bg-purple-50",
      textIcon: "text-purple-600",
    },
    {
      step: "05",
      title: "Review Jawaban",
      description:
        "Evaluasi hasil kerjamu. Cek jawaban benar dan pembahasan setelah submit.",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-400",
      bgIcon: "bg-emerald-50",
      textIcon: "text-emerald-600",
    },
    {
      step: "06",
      title: "Kelola Profil",
      description:
        "Ganti informasi kelas atau Log Out akun melalui menu Profil di pojok kanan atas.",
      icon: UserCog,
      gradient: "from-orange-500 to-amber-400",
      bgIcon: "bg-orange-50",
      textIcon: "text-orange-600",
    },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] font-sans overflow-hidden">
      {/* HomeHeader tetap di luar area scroll agar selalu terlihat di paling atas */}
      <div className="flex-shrink-0 bg-[#FAFAFA] z-40 relative">
        <HomeHeader />
      </div>

      <main className="flex-1 w-full overflow-y-auto relative">
        {/* Header Sticky Solid & Full Width */}
        <header className="sticky top-0 z-30 w-full flex items-center justify-center px-6 py-4 bg-[#FAFAFA] border-b border-gray-100 shrink-0 mb-6">
          <Link
            href="/about-us"
            className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
          </Link>

          <div className="text-center">
            <h1 className="text-xl font-bold text-black leading-none">
              Panduan Siswa
            </h1>
          </div>
        </header>

        <div className="flex flex-col gap-4 px-5">
          {guides.map((item, index) => (
            <div
              key={index}
              // Tetap mempertahankan 'transform-gpu' dan 'isolate' agar glow tidak bocor
              className="relative bg-white rounded-3xl p-5 shadow-sm border border-gray-100 overflow-hidden group transform-gpu isolate"
            >
              {/* Dekorasi Garis Gradasi di Kiri */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${item.gradient}`}
              />

              {/* Dekorasi Background Blob Halus */}
              <div
                className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-xl bg-gradient-to-br ${item.gradient} pointer-events-none`}
              />

              <div className="flex gap-4 items-start relative z-10">
                {/* Kolom Kiri: Icon & Step */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div
                    className={`w-12 h-12 rounded-2xl ${item.bgIcon} flex items-center justify-center shadow-sm`}
                  >
                    <item.icon
                      className={`w-6 h-6 ${item.textIcon}`}
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-[10px] font-black text-gray-300 tracking-widest font-mono">
                    {item.step}
                  </span>
                </div>

                {/* Kolom Kanan: Teks */}
                <div className="flex-1 pt-1">
                  <h3 className="text-base font-bold text-black mb-1 flex items-center gap-2">
                    {item.title}
                    {/* Hiasan Zap (petir) dipindahkan ke item Login (index 1) agar menarik */}
                    {index === 1 && (
                      <Zap
                        size={12}
                        className="text-yellow-400 fill-yellow-400"
                      />
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note Kecil */}
        <div className="mt-8 text-center px-6 mb-6">
          <p className="text-[10px] text-gray-400 font-medium bg-gray-100 py-2 px-4 rounded-full inline-block">
            Butuh bantuan lebih lanjut? Hubungi Guru pengampu.
          </p>
        </div>
      </main>
    </div>
  );
}
