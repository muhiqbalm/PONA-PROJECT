import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Pastikan tailwind sudah di-setup
import ToasterContext from "@/components/toastProvider";
// import { User, Home, Info } from "lucide-react"; // Install lucide-react atau ganti dengan SVG icon biasa

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FUNBIO",
  description: "Responsive mobile web view",
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
