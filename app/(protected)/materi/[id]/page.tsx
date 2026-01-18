"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation"; // 1. Import useParams

export default function DetailMateriPage() {
  // 2. Ambil parameter ID dari URL
  // Jika URL browser adalah /materi/123, maka id = "123"
  const params = useParams();
  const id = params.id;

  // Opsi Alternatif: Jika ini halaman statis dan ID untuk Sistem Sirkulasi
  // di database selalu "1", Anda bisa ganti baris di atas menjadi:
  // const id = "1";

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] font-sans">
      {/* --- HEADER KHUSUS DETAIL PAGE --- */}
      <header className="relative flex items-center justify-center px-6 py-6 bg-transparent">
        <Link
          href="/"
          className="absolute left-6 p-2 -ml-2 rounded-full hover:bg-gray-200 transition"
        >
          <ArrowLeft className="w-6 h-6 text-black" strokeWidth={2.5} />
        </Link>

        <h1 className="text-xl font-bold text-black">Sistem Sirkulasi</h1>
      </header>

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 w-full p-6 flex flex-col gap-4">
        {/* 3. PERBAIKAN HREF:
            Gunakan tanda backtick (`) dan ${id} untuk menyisipkan variabel.
        */}

        {/* Card 1: Mari Belajar */}
        <ActionCard
          title="Mari Belajar"
          imageSrc="/materi-bacaan2.png"
          href={`/materi/${id}/materi-bacaan`}
        />

        {/* Card 2: Ayo Berlatih */}
        <ActionCard
          title="Ayo Berlatih"
          imageSrc="/soal-latihan.png"
          href={`/materi/${id}/soal-latihan`}
        />

        {/* Card 3: Review Jawaban */}
        <ActionCard
          title="Review Jawaban"
          imageSrc="/review-jawaban.png"
          href={`/materi/${id}/review`}
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
