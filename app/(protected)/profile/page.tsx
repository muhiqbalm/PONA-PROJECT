"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/authProvider";
import { createClient } from "@/utils/supabase-client";
import {
  LogOut,
  Mail,
  School,
  BookOpen,
  Pencil,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import HomeHeader from "@/components/homeHeader";

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const supabase = createClient();

  // State Utama
  const [isEditing, setIsEditing] = useState(false);
  const [tempIdentity, setTempIdentity] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // State Lokal untuk Tampilan User (Agar bisa update tanpa reload)
  const [displayUser, setDisplayUser] = useState(user);

  // Sinkronisasi data user dari Auth Context ke State Lokal saat load awal
  useEffect(() => {
    setDisplayUser(user);
  }, [user]);

  // Gunakan currentUser untuk rendering (prioritas ke state lokal yang baru diedit)
  const currentUser = displayUser || user;

  // Helper Initials
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // --- LOGIC ---
  const handleStartEdit = () => {
    setTempIdentity(currentUser?.identity_value || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempIdentity("");
  };

  const handleSaveEdit = async () => {
    if (!tempIdentity.trim()) {
      toast.error("Kelas tidak boleh kosong!");
      return;
    }
    setIsSaving(true);

    try {
      // 1. Update Supabase
      const { error } = await supabase.auth.updateUser({
        data: { identity_value: tempIdentity },
      });
      if (error) throw error;

      // 2. Update Cookie
      const currentCookie = Cookies.get("app_user_data");
      if (currentCookie) {
        const parsedCookie = JSON.parse(currentCookie);
        const updatedCookie = { ...parsedCookie, identity_value: tempIdentity };
        Cookies.set("app_user_data", JSON.stringify(updatedCookie), {
          expires: 7,
        });
      }

      // 3. Update State Lokal (UI Update Instan)
      if (currentUser) {
        setDisplayUser({
          ...currentUser,
          identity_value: tempIdentity,
        });
      }

      toast.success("Data berhasil diperbarui!");
      setIsEditing(false);

      // HAPUS: window.location.reload(); -> Tidak diperlukan lagi
    } catch (error: any) {
      console.error(error);
      toast.error("Gagal update: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutClick = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400 font-medium animate-pulse">
          Memuat Profil...
        </p>
      </div>
    );
  }

  // Pastikan user ada sebelum render konten
  if (!currentUser) return null;

  const isTeacher = currentUser.role === "TEACHER";
  const themeColor = isTeacher
    ? "text-purple-600 bg-purple-50"
    : "text-green-600 bg-green-50";

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans relative">
      {/* Header */}
      <HomeHeader />

      {/* Dekorasi Background */}
      <div
        className={`absolute top-0 left-0 w-full h-40 opacity-10 pointer-events-none ${
          isTeacher ? "bg-purple-600" : "bg-green-600"
        }`}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 pb-8 pt-4 w-full relative z-10">
        {/* Avatar & Nama */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-xl border-4 border-white mb-4 ${
              isTeacher ? "bg-purple-600" : "bg-green-600"
            }`}
          >
            {getInitials(currentUser.full_name)}
          </div>
          <h1 className="text-2xl font-black text-black leading-tight mb-2">
            {currentUser.full_name}
          </h1>
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase ${themeColor}`}
          >
            {isTeacher ? "Guru Pengajar" : "Siswa"}
          </span>
        </div>

        {/* List Data */}
        <div className="flex flex-col gap-4">
          {/* Identitas (NPP/Kelas) */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${themeColor}`}>
              {isTeacher ? <School size={22} /> : <BookOpen size={22} />}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">
                {isTeacher ? "NPP" : "Kelas"}
              </p>

              {isEditing ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={tempIdentity}
                    onChange={(e) => setTempIdentity(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-green-500"
                    autoFocus
                  />
                </div>
              ) : (
                <p className="text-base font-bold text-gray-800">
                  {currentUser.identity_value}
                </p>
              )}
            </div>

            {/* Tombol Edit (Khusus Siswa) */}
            {!isTeacher && (
              <div className="flex items-center gap-1">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="cursor-pointer p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="cursor-pointer p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleStartEdit}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                  >
                    <Pencil size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tombol Logout */}
        <div className="mt-auto pt-8">
          <button
            onClick={handleLogoutClick}
            className="w-full bg-white border-[1.5px] border-red-100 text-red-500 font-bold text-sm rounded-full py-4 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut size={18} /> LOGOUT
          </button>
        </div>
      </main>

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          ></div>
          <div className="bg-white rounded-[2rem] p-6 w-full max-w-xs shadow-2xl relative z-10 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">
              Konfirmasi Keluar
            </h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">
              Apakah Anda yakin ingin keluar dari aplikasi?
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="cursor-pointer flex-1 py-3 rounded-full font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                className="cursor-pointer flex-1 py-3 rounded-full font-bold text-sm text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
