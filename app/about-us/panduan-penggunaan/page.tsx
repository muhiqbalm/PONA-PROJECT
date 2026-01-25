"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  UserCog,
  Zap,
} from "lucide-react";
import HomeHeader from "@/components/homeHeader";

export default function PanduanPenggunaanPage() {
  const guides = [
    {
      step: "01",
      title: "Akses Materi",
      description:
        "Buka menu 'Mari Belajar' untuk membaca materi pembelajaran interaktif.",
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-400",
      bgIcon: "bg-blue-50",
      textIcon: "text-blue-600",
    },
    {
      step: "02",
      title: "Pengerjaan Soal",
      description:
        "Kerjakan 'Soal Latihan'. Jika buntu, gunakan fitur bantuan Flash Card.",
      icon: BrainCircuit,
      gradient: "from-purple-500 to-pink-500",
      bgIcon: "bg-purple-50",
      textIcon: "text-purple-600",
    },
    {
      step: "03",
      title: "Review Jawaban",
      description:
        "Evaluasi hasil kerjamu. Cek jawaban benar dan pembahasan setelah submit.",
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-teal-400",
      bgIcon: "bg-emerald-50",
      textIcon: "text-emerald-600",
    },
    {
      step: "04",
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
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans">
      <HomeHeader />

      <header className="relative flex items-center justify-center px-6 pb-6 pt-2 bg-transparent shrink-0">
        <Link
          href="/about-us"
          className="absolute left-6 top-5 -translate-y-1/2 p-2 -ml-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
        </Link>
        <h1 className="text-xl font-bold text-black">Panduan Siswa</h1>
      </header>

      <main className="flex-1 w-full px-5 pb-8 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {guides.map((item, index) => (
            <div
              key={index}
              // PERUBAHAN DISINI:
              // Menambahkan 'transform-gpu' dan 'isolate' untuk memperbaiki bug clipping pada border-radius
              className="relative bg-white rounded-3xl p-5 shadow-sm border border-gray-100 overflow-hidden group transform-gpu isolate"
            >
              {/* Dekorasi Garis Gradasi di Kiri */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${item.gradient}`}
              />

              {/* Dekorasi Background Blob Halus */}
              <div
                // Tips tambahan: pointer-events-none agar glow tidak mengganggu klik mouse/touch
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
        <div className="mt-8 text-center px-6">
          <p className="text-[10px] text-gray-400 font-medium bg-gray-100 py-2 px-4 rounded-full inline-block">
            Butuh bantuan lebih lanjut? Hubungi Guru pengampu.
          </p>
        </div>
      </main>
    </div>
  );
}
