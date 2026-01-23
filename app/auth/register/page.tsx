"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase-client";
import Image from "next/image";
import { registerUser } from "@/utils/supabase-queries";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    nama: "",
    identitas: "",
    kode: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue =
      name === "nama" || name === "identitas" ? value.toUpperCase() : value;

    setFormData({ ...formData, [name]: newValue });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password tidak cocok!", { icon: "⚠️" });
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      setIsLoading(false);
      return;
    }

    try {
      const res = await registerUser(
        formData.nama,
        formData.identitas,
        formData.kode,
        formData.password,
        supabase,
      );

      if (res.success) {
        toast.success("Registrasi Berhasil! Silahkan Login...", {
          duration: 2000,
          position: "top-center",
        });

        setTimeout(() => {
          router.push("/auth/login");
        }, 1000);
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
    // Container Utama: Full screen logic sama seperti Login
    <div className="min-h-dvh w-full flex flex-col md:items-center md:justify-center bg-white md:bg-[#EDEDED] font-sans">
      {/* Wrapper Konten: Flex-1 agar mengisi layar mobile, padding disesuaikan */}
      <div className="flex-1 flex flex-col justify-center px-6 py-4 md:flex-none md:bg-white md:p-10 md:rounded-[2.5rem] md:shadow-sm md:w-full md:max-w-[380px] md:min-h-0">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-5 md:mb-6 shrink-0">
          {/* Logo lebih kecil (w-16) di mobile karena input form lebih banyak */}
          <div className="relative w-16 h-16 mb-2 md:w-24 md:h-24">
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
            Register
          </h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">
            Create your account
          </p>
        </div>

        {/* Form Section - Gap dirapatkan (gap-2.5) agar muat 5 input + tombol */}
        <form
          onSubmit={handleRegister}
          className="flex flex-col gap-2.5 w-full"
        >
          {/* Input Nama */}
          <div className="relative">
            <input
              type="text"
              name="nama"
              placeholder="Nama Lengkap"
              value={formData.nama}
              onChange={handleChange}
              className="w-full bg-[#1E1E1E] text-white placeholder-gray-400/80 rounded-full px-5 py-3 md:px-6 md:py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-gray-800 transition-all"
              required
            />
          </div>

          {/* Input Identitas */}
          <div className="relative group">
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

          {/* Input Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Pass"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full bg-[#1E1E1E] text-white placeholder-gray-400/80 rounded-full px-5 py-3 md:px-6 md:py-3.5 text-sm font-medium outline-none focus:ring-2 transition-all pr-12 ${
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword
                  ? "ring-1 ring-red-500 focus:ring-red-500"
                  : "focus:ring-gray-800"
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full bg-white border-[1.5px] border-black text-black font-bold text-sm rounded-full py-3 hover:bg-black hover:text-white transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide shadow-sm"
          >
            {isLoading ? "MEMPROSES..." : "REGISTER"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-5 md:mt-6 text-center shrink-0">
          <p className="text-xs text-gray-400 font-medium">
            Sudah punya akun?{" "}
            <span
              onClick={() => router.push("/auth/login")}
              className="text-black font-bold cursor-pointer hover:underline"
            >
              Login disini
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
