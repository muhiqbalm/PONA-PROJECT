"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  UserCog,
  Zap,
  LogIn,
  UserPlus,
  // Icon baru untuk bagian Profil
  Smartphone,
  Users,
  Dna,
  Code2,
} from "lucide-react";
import HomeHeader from "@/components/homeHeader";

export default function PanduanPenggunaanPage() {
  // Data Profil Produk (Informasi Statis)
  const productProfile = [
    {
      title: "Pengembang",
      desc: "Disusun oleh Ponasari Baron Mutiara Kenya.",
      icon: Code2,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      title: "Sasaran Pengguna",
      desc: "Dirancang khusus untuk siswa SMA.",
      icon: Users,
      color: "text-rose-600",
      bg: "bg-rose-100",
    },
    {
      title: "Cakupan Konten",
      desc: "Materi Biologi komprehensif, disajikan secara visual, interaktif, dan kontekstual.",
      icon: Dna,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Dukungan Perangkat",
      desc: "Fleksibel diakses melalui Smartphone (Mobile), Tablet, hingga Laptop/PC.",
      icon: Smartphone,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
  ];

  // Data Langkah Panduan
  const guides = [
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
    {
      step: "02",
      title: "Login Aplikasi",
      description:
        "Masuk menggunakan Nama, Kelas, dan Password yang telah didaftarkan. Jaga kerahasiaan akunmu.",
      icon: LogIn,
      gradient: "from-violet-600 to-fuchsia-500",
      bgIcon: "bg-violet-50",
      textIcon: "text-violet-600",
    },
    {
      step: "03",
      title: "Akses Materi",
      description:
        "Buka menu 'Mari Belajar' untuk mempelajari materi Biologi interaktif yang dilengkapi visualisasi.",
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-400",
      bgIcon: "bg-blue-50",
      textIcon: "text-blue-600",
    },
    {
      step: "04",
      title: "Pengerjaan Soal",
      description:
        "Uji pemahamanmu di menu 'Ayo Berlatih'. Gunakan fitur bantuan (Flash Card) jika mengalami kesulitan.",
      icon: BrainCircuit,
      gradient: "from-purple-500 to-pink-500",
      bgIcon: "bg-purple-50",
      textIcon: "text-purple-600",
    },
    {
      step: "05",
      title: "Review Jawaban",
      description:
        "Evaluasi hasil belajarmu. Cek kunci jawaban dan pembahasan mendalam setelah menyelesaikan kuis.",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-400",
      bgIcon: "bg-emerald-50",
      textIcon: "text-emerald-600",
    },
    {
      step: "06",
      title: "Kelola Profil",
      description:
        "Perbarui informasi kelas atau lakukan Log Out melalui menu Profil di pojok kanan atas.",
      icon: UserCog,
      gradient: "from-orange-500 to-amber-400",
      bgIcon: "bg-orange-50",
      textIcon: "text-orange-600",
    },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] font-sans overflow-hidden">
      {/* HomeHeader tetap di luar area scroll */}
      <div className="flex-shrink-0 bg-[#FAFAFA] z-40 relative">
        <HomeHeader />
      </div>

      <main className="flex-1 w-full overflow-y-auto relative pb-10">
        {/* Header Sticky - Judul Diperbarui */}
        <header className="sticky top-0 z-30 w-full flex items-center justify-center px-6 py-4 bg-[#FAFAFA]/95 backdrop-blur-sm border-b border-gray-100 shrink-0 mb-4 transition-all">
          <Link
            href="/"
            className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
          </Link>

          <div className="text-center">
            <h1 className="text-lg font-bold text-black leading-tight">
              Pedoman Pemanfaatan <br /> Media
            </h1>
          </div>
        </header>

        <div className="flex flex-col gap-6 px-5">
          {/* --- SECTION 1: PROFIL PRODUK (Baru) --- */}
          <section className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                Profil Media
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {productProfile.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div
                    className={`shrink-0 w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mt-0.5`}
                  >
                    <item.icon
                      className={`w-4 h-4 ${item.color}`}
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pemisah Visual Kecil */}
          <div className="flex items-center gap-4 px-2">
            <div className="h-[1px] bg-gray-200 flex-1"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Langkah Penggunaan
            </span>
            <div className="h-[1px] bg-gray-200 flex-1"></div>
          </div>

          {/* --- SECTION 2: PANDUAN LANGKAH (Existing) --- */}
          <div className="flex flex-col gap-4">
            {guides.map((item, index) => (
              <div
                key={index}
                className="relative bg-white rounded-3xl p-5 shadow-sm border border-gray-100 overflow-hidden group transform-gpu isolate"
              >
                {/* Dekorasi Garis Gradasi */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${item.gradient}`}
                />

                {/* Dekorasi Blob */}
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
                      {/* Hiasan Petir untuk Login */}
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
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center px-6 mb-6">
          <p className="text-[10px] text-gray-400 font-medium bg-gray-100 py-2 px-4 rounded-full inline-block">
            Selamat Belajar & Semoga Sukses!
          </p>
        </div>
      </main>
    </div>
  );
}
