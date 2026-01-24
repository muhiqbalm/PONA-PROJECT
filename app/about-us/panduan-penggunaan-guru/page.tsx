"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Library,
  FileImage,
  Layers,
  ClipboardCheck,
  Users,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import HomeHeader from "@/components/homeHeader";

// Fungsi helper untuk parsing cookie secara manual
const getUserDataFromCookie = () => {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; app_user_data=`);

  if (parts.length === 2) {
    try {
      const cookieValue = parts.pop()?.split(";").shift();
      if (!cookieValue) return null;
      return JSON.parse(decodeURIComponent(cookieValue));
    } catch (e) {
      console.error("Gagal parsing cookie user data", e);
      return null;
    }
  }
  return null;
};

export default function PanduanGuruPage() {
  const router = useRouter();

  // State untuk otorisasi
  const [authStatus, setAuthStatus] = useState<
    "loading" | "authorized" | "unauthorized"
  >("loading");

  // --- LOGIKA PROTEKSI HALAMAN (COOKIE BASED) ---
  useEffect(() => {
    const checkAuth = () => {
      const userData = getUserDataFromCookie();

      if (!userData) {
        router.push("/about-us");
        setAuthStatus("unauthorized");
      } else if (userData.role !== "TEACHER") {
        router.push("/about-us");
        setAuthStatus("unauthorized");
      } else {
        setAuthStatus("authorized");
      }
    };

    checkAuth();
  }, [router]);

  // Data Panduan Guru
  const teacherGuides = [
    {
      step: "01",
      title: "Kelola Subjek Materi",
      description:
        "Menambahkan topik pembelajaran baru atau mengedit judul subjek materi yang sudah ada.",
      icon: Library,
      gradient: "from-blue-600 to-indigo-500",
      bgIcon: "bg-blue-50",
      textIcon: "text-blue-700",
    },
    {
      step: "02",
      title: "Kelola Bacaan & Media",
      description:
        "Menyusun materi bacaan. Anda dapat menyisipkan teks, gambar, dan video visual untuk memperkaya materi.",
      icon: FileImage,
      gradient: "from-cyan-500 to-teal-400",
      bgIcon: "bg-cyan-50",
      textIcon: "text-cyan-600",
    },
    {
      step: "03",
      title: "Bank Soal & Flash Card",
      description:
        "Membuat soal latihan interaktif. Tambahkan fitur Flash Card (Flip), Kunci Jawaban, dan Rubrik Skor.",
      icon: Layers,
      gradient: "from-violet-600 to-purple-500",
      bgIcon: "bg-violet-50",
      textIcon: "text-violet-700",
    },
    {
      step: "04",
      title: "Review Jawaban Siswa",
      description:
        "Memantau progres pengerjaan siswa. Anda dapat melihat jawaban asli siswa dan memberikan review/koreksi.",
      icon: ClipboardCheck,
      gradient: "from-amber-500 to-orange-400",
      bgIcon: "bg-amber-50",
      textIcon: "text-amber-600",
    },
    {
      step: "05",
      title: "Data Kelas & Siswa",
      description:
        "Melihat daftar lengkap siswa yang terdaftar, dikelompokkan berdasarkan kelas masing-masing.",
      icon: Users,
      gradient: "from-rose-500 to-pink-500",
      bgIcon: "bg-rose-50",
      textIcon: "text-rose-600",
    },
  ];

  // --- TAMPILAN LOADING / UNAUTHORIZED ---
  if (authStatus !== "authorized") {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <Loader2 className="animate-spin w-8 h-8" />
          <span className="text-xs font-medium">Memeriksa Akses Guru...</span>
        </div>
      </div>
    );
  }

  // --- TAMPILAN UTAMA ---
  return (
    <div className="flex flex-col h-[100dvh] bg-[#FAFAFA] font-sans overflow-hidden">
      {/* HomeHeader tetap di luar area scroll agar selalu terlihat di paling atas */}
      <div className="flex-shrink-0 bg-[#FAFAFA] z-40 relative">
        <HomeHeader />
      </div>

      <main className="flex-1 w-full overflow-y-auto relative">
        {/* PERUBAHAN DISINI: Header Sticky Solid & Full Width */}
        <header className="sticky top-0 z-30 w-full flex items-center justify-center px-6 py-4 bg-[#FAFAFA] border-b border-gray-100 shrink-0 mb-6">
          <Link
            href="/about-us"
            className="absolute left-6 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-black leading-none">
              Panduan Guru
            </h1>
            <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full mt-1 inline-block font-medium tracking-wide">
              TEACHER MODE
            </span>
          </div>
        </header>

        <div className="flex flex-col gap-4 px-5 pb-8">
          {/* Intro Card */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-5 shadow-lg text-white mb-2 relative overflow-hidden">
            <div className="relative z-10 flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-yellow-400 shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-sm mb-1">Akses Administrator</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Fitur di bawah ini hanya tersedia untuk akun Guru. Gunakan
                  Dashboard PC untuk pengalaman editing materi yang lebih
                  maksimal.
                </p>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          </div>

          {/* List Panduan */}
          {teacherGuides.map((item, index) => (
            <div
              key={index}
              className="relative bg-white rounded-3xl p-5 shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${item.gradient}`}
              />
              <div
                className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-xl bg-gradient-to-br ${item.gradient}`}
              />

              <div className="flex gap-4 items-start relative z-10">
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

                <div className="flex-1 pt-1">
                  <h3 className="text-base font-bold text-black mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed text-justify">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
