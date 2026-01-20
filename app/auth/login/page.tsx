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

  // --- MODIFIKASI HANDLE CHANGE ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Jika field adalah 'nama' atau 'identitas', paksa jadi huruf besar
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
            router.push("/");
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
    <div className="min-h-screen flex items-center justify-center bg-[#EDEDED] font-sans px-4">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm w-full max-w-[350px] flex flex-col relative">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative w-24 h-24 mb-2">
            <Image
              src="/funbioIcon.png"
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
          {/* Input Nama (Auto Capitalize) */}
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

          {/* Input Identitas (Auto Capitalize) */}
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

          {/* Input Password dengan Toggle Icon */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#1E1E1E] text-white placeholder-gray-400/80 rounded-full px-6 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-gray-800 transition-all pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-white border-[1.5px] border-black text-black font-bold text-sm rounded-full py-3 hover:bg-black hover:text-white transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide"
          >
            {isLoading ? "MEMERIKSA..." : "LOGIN"}
          </button>
        </form>

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
