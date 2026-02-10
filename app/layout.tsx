import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Pastikan tailwind sudah di-setup
import ToasterContext from "@/components/toastProvider";
import NextTopLoader from "nextjs-toploader";
// import { User, Home, Info } from "lucide-react"; // Install lucide-react atau ganti dengan SVG icon biasa

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FUNBIOLEARN | Media Pembelajaran Biologi Siswa SMA",
  description: "Media Pembelajaran Biologi Siswa SMA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} !bg-[#EEEEEE] min-h-screen flex flex-col items-center justify-center`}
      >
        <NextTopLoader
          color="#00cf75" // Ubah warna sesuai tema (misal: hitam atau merah)
          initialPosition={0.08}
          crawlSpeed={200}
          height={6}
          crawl={true}
          showSpinner={false} // False agar tidak ada spinner muter di pojok kanan
          easing="ease"
          speed={200}
          shadow="0 0 10px #2299DD,0 0 5px #2299DD" // Efek bayangan (opsional)
          zIndex={1600}
        />

        <ToasterContext />
        {/* === WRAPPER UTAMA === */}
        {/* Di Mobile: lebar 100%. Di Desktop: lebar max 480px (seukuran HP) */}
        <div className="w-full md:max-w-[420px] flex flex-col items-center">
          {/* <header className="w-full px-6 flex justify-between items-center text-black">
            
          </header> */}

          {/* === KONTEN UTAMA (FRAME HP) === */}
          <main className="w-full min-h-screen md:h-auto 2xl overflow-hidden relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
