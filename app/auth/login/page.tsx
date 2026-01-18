"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase-client";
// Import Toast
import { toast } from "react-hot-toast";
import { loginUser } from "@/utils/supabase-queries";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    nama: "",
    identitas: "", // Bisa Kelas (Siswa) atau NPP (Guru)
    kode: "",
    password: "", // Wajib ada untuk auth supabase
  });

  const [isLoading, setIsLoading] = useState(false);

  // Handle perubahan input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle submit form
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Panggil fungsi loginUser dari helper
      const res = await loginUser(
        formData.nama,
        formData.identitas,
        formData.kode,
        formData.password,
        supabase
      );

      if (res.success) {
        // Tampilkan Toast Sukses
        toast.success("Login Berhasil! Masuk ke dashboard...", {
          duration: 2000,
          position: "top-center",
        });

        // Redirect berdasarkan Role
        // Kita ambil role dari metadata user
        const role = res.data?.user.user_metadata.role;

        setTimeout(() => {
          if (role === "TEACHER") {
            router.push("/dashboard/guru"); // Sesuaikan route dashboard guru
          } else {
            router.push("/dashboard/siswa"); // Sesuaikan route dashboard siswa
          }
        }, 1500);
      } else {
        toast.error("Gagal: " + res.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EDEDED] font-sans px-4">
      {/* Container Card */}
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm w-full max-w-[350px] flex flex-col relative">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* --- IMAGE FUNBIO --- */}
          {/* Container relative untuk Next Image */}
          <div className="relative w-24 h-24 mb-2">
            <Image
              src="/funbioIcon.png" // Pastikan file ada di public folder
              alt="Fun Bio Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>

          <h1 className="text-4xl font-black text-black mb-2 tracking-tight">
            Login
          </h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">
            Sign in to continue
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Input Nama */}
          <div className="relative">
            <input
              type="text"
              name="nama"
              placeholder="Nama Lengkap"
              value={formData.nama}
              onChange={handleChange}
              className="w-full bg-[#1E1E1E] text-white placeholder-gray-400/80 rounded-full px-6 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-gray-800 transition-all"
              required
            />
          </div>

          {/* Input Identitas (Kelas / NPP) */}
          <div className="relative">
            <input
              type="text"
              name="identitas"
              placeholder="NPP (Guru) / Kelas (Siswa)"
              value={formData.identitas}
              onChange={handleChange}
              className="w-full bg-[#1E1E1E] text-white placeholder-gray-400/80 rounded-full px-6 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-gray-800 transition-all"
              required
            />
          </div>

          {/* Input Kode */}
          <div className="relative">
            <input
              type="text"
              name="kode"
              placeholder="Kode"
              value={formData.kode}
              onChange={handleChange}
              className="w-full bg-[#1E1E1E] text-white placeholder-gray-400/80 rounded-full px-6 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-gray-800 transition-all"
              required
            />
          </div>

          {/* Input Password (WAJIB ADA UNTUK AUTH) */}
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#1E1E1E] text-white placeholder-gray-400/80 rounded-full px-6 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-gray-800 transition-all"
              required
            />
          </div>

          {/* Button Login */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-white border-[1.5px] border-black text-black font-bold text-sm rounded-full py-3 hover:bg-black hover:text-white transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide"
          >
            {isLoading ? "MEMERIKSA..." : "LOGIN"}
          </button>
        </form>

        {/* Link to Register */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 font-medium">
            Belum punya akun?{" "}
            <span
              onClick={() => router.push("/auth/register")}
              className="text-black font-bold cursor-pointer hover:underline"
            >
              Daftar disini
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
