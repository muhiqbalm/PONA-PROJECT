"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AboutUsPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans">
      <header className="relative flex items-center justify-center px-6 py-6 bg-transparent">
        <button
          onClick={() => {
            router.back();
          }}
          className="cursor-pointer absolute left-6 p-2 -ml-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
        </button>

        <h1 className="text-xl font-bold text-black">About Us</h1>
      </header>

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 w-full p-6 flex flex-col gap-4">
        <ActionCard
          title="Panduan Penggunaan"
          imageSrc="/panduan-penggunaan.png"
          href="/about-us/panduan-penggunan"
        />

        <ActionCard
          title="Profil Pengembang"
          imageSrc="/profil-pengembang.png"
          href="/about-us/profil-pengembang"
        />
      </main>
    </div>
  );
}

// --- Komponen Kartu (ActionCard) ---
function ActionCard({
  title,
  imageSrc,
  href,
}: {
  title: string;
  imageSrc: string;
  href: string;
}) {
  return (
    <Link href={href} className="w-full">
      <div className="bg-white rounded-3xl p-4 h-28 flex items-center shadow-sm transitions hover:shadow-lg hover:outline-2 hover:outline-green-100 shadow-slate-200 hover:shadow-green-200/50 transition-transform cursor-pointer">
        {/* Area Gambar (Kiri) */}
        <div className="w-24 h-20 relative flex-shrink-0 mr-4">
          <Image src={imageSrc} alt={title} fill className="object-contain" />
        </div>
        {/* Area Teks (Kanan) */}
        <div className="flex-1">
          {/* Memecah text jadi 2 baris jika perlu, atau render langsung */}
          <h2 className="text-lg font-bold text-black leading-tight">
            {title.split(" ").map((word, i) => (
              <span key={i} className="block">
                {word}
              </span>
            ))}
          </h2>
        </div>
      </div>
    </Link>
  );
}
