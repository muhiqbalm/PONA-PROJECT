"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase-client";
import { toast } from "react-hot-toast";
import { loginUser } from "@/utils/supabase-queries";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    nama: "",
    identitas: "",
    kode: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue =
      name === "nama" || name === "identitas" ? value.toUpperCase() : value;
    setFormData({ ...formData, [name]: newValue });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await loginUser(
        formData.nama,
        formData.identitas,
        formData.kode,
        formData.password,
        supabase,
      );

      if (res.success) {
        toast.success("Login Berhasil!", {
          duration: 2000,
          position: "top-center",
        });

        const role = res.data?.user.user_metadata.role;

        setTimeout(() => {
          if (role === "TEACHER") {
            router.push("/dashboard");
          } else {
            router.push("/");
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
    // Container Utama: Gunakan min-h-dvh untuk mobile browser bar fix
    // Mobile: bg-white (full screen), Desktop: bg-gray (centered card)
    <div className="min-h-dvh w-full flex flex-col md:items-center md:justify-center bg-white md:bg-[#EDEDED] font-sans">
      {/* Wrapper Konten */}
      <div className="flex-1 flex flex-col justify-center px-6 py-4 md:flex-none md:bg-white md:p-10 md:rounded-[2.5rem] md:shadow-sm md:w-full md:max-w-[380px] md:min-h-0">
        {/* Header Section - Dibuat lebih compact */}
        <div className="flex flex-col items-center text-center mb-6 md:mb-8 shrink-0">
          <div className="relative w-20 h-20 mb-2 md:w-24 md:h-24">
            <Image
              src="/funbioIcon.png"
              alt="Fun Bio Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-black mb-1 tracking-tight">
            Login
          </h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">
            Sign in to continue
          </p>
        </div>

        {/* Form Section - Gap dikurangi jadi gap-3 agar muat */}
        <form onSubmit={handleLogin} className="flex flex-col gap-3 w-full">
          {/* Input Nama */}
          <div className="relative">
            <input
              type="text"
              name="nama"
              placeholder="Nama Lengkap"
              value={formData.nama}
              onChange={handleChange}
              // Padding vertical (py) dikurangi sedikit untuk mobile
              className="w-full bg-[#1E1E1E] text-white placeholder-gray-400/80 rounded-full px-5 py-3 md:px-6 md:py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-gray-800 transition-all"
              required
            />
          </div>

          {/* Input Identitas */}
          <div className="relative">
            <input
              type="text"
              name="identitas"
              placeholder="NPP (Guru) / Kelas (Siswa)"
              value={formData.identitas}
              onChange={handleChange}
              className="w-full bg-[#1E1E1E] text-white placeholder-gray-400/80 rounded-full px-5 py-3 md:px-6 md:py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-gray-800 transition-all"
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
              className="w-full bg-[#1E1E1E] text-white placeholder-gray-400/80 rounded-full px-5 py-3 md:px-6 md:py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-gray-800 transition-all"
              required
            />
          </div>

          {/* Input Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#1E1E1E] text-white placeholder-gray-400/80 rounded-full px-5 py-3 md:px-6 md:py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-gray-800 transition-all pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full bg-white border-[1.5px] border-black text-black font-bold text-sm rounded-full py-3 hover:bg-black hover:text-white transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide shadow-sm"
          >
            {isLoading ? "MEMERIKSA..." : "LOGIN"}
          </button>
        </form>

        {/* Footer - Margin top otomatis (mt-auto) untuk mendorong ke bawah jika ada sisa ruang, atau jarak fix jika sempit */}
        <div className="mt-6 md:mt-6 text-center shrink-0">
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
