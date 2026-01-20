"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
// 1. Import Icon Eye dan EyeOff
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

  // 2. State untuk kontrol visibilitas password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle perubahan input (Auto Capitalize untuk Nama & Identitas)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newValue =
      name === "nama" || name === "identitas" ? value.toUpperCase() : value;

    setFormData({ ...formData, [name]: newValue });
  };

  // Handle submit form
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 3. VALIDASI: Cek apakah Password & Confirm Password sama
    if (formData.password !== formData.confirmPassword) {
      toast.error("Password dan Konfirmasi Password tidak cocok!", {
        icon: "⚠️",
      });
      setIsLoading(false);
      return;
    }

    // Validasi panjang password (Opsional, tapi disarankan)
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
    <div className="min-h-screen flex items-center justify-center bg-[#EDEDED] font-sans px-4 py-6">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm w-full max-w-[350px] flex flex-col relative">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-24 h-24 mb-4">
            <Image
              src="/funbioIcon.png"
              alt="Fun Bio Logo"
              fill
              className="object-contain"
              priority
              sizes="64px"
            />
          </div>

          <h1 className="text-4xl font-black text-black mb-2 tracking-tight">
            Register
          </h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">
            Create your account
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleRegister} className="flex flex-col gap-3">
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

          {/* Input Identitas */}
          <div className="relative group">
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

          {/* --- INPUT PASSWORD DENGAN ICON MATA --- */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} // Toggle tipe input
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-[#1E1E1E] text-white placeholder-gray-400/80 rounded-full px-6 py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-gray-800 transition-all pr-12" // pr-12 untuk space icon
              required
            />
            {/* Tombol Toggle Icon */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* --- INPUT CONFIRM PASSWORD DENGAN ICON MATA --- */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"} // Toggle tipe input
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full bg-[#1E1E1E] text-white placeholder-gray-400/80 rounded-full px-6 py-3.5 text-sm font-medium outline-none focus:ring-2 transition-all pr-12 ${
                // Optional: Berikan border merah tipis jika tidak cocok saat mengetik (dan tidak kosong)
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
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Button Register */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-white border-[1.5px] border-black text-black font-bold text-sm rounded-full py-3 hover:bg-black hover:text-white transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide"
          >
            {isLoading ? "MEMPROSES..." : "REGISTER"}
          </button>
        </form>

        <div className="mt-6 text-center">
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
