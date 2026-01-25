"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: "TEACHER" | "STUDENT";
  identity_value: string;
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Cek apakah ada cookie 'app_user_data'
    const userCookie = Cookies.get("app_user_data");

    if (userCookie) {
      try {
        // 2. Jika ada, parse JSON-nya dan simpan ke State
        const parsedUser = JSON.parse(userCookie);
        setUser(parsedUser);
      } catch (error) {
        console.error("Gagal parsing data user", error);
        // Hapus cookie jika corrupt, dengan path root agar bersih
        Cookies.remove("app_user_data", { path: "/" });
      }
    }

    setIsLoading(false);
  }, []);

  // Fungsi Logout Global
  const logout = () => {
    // PERBAIKAN DI SINI:
    // Tambahkan { path: '/' } agar cookie bisa dihapus dari sub-folder manapun.
    // Jika cookie dibuat dengan domain spesifik, tambahkan juga { domain: '...' }
    Cookies.remove("app_user_data", { path: "/" });

    // Reset state user
    setUser(null);

    // Redirect ke halaman login
    router.replace("/auth/login"); // Menggunakan replace agar user tidak bisa back ke halaman sebelumnya
    router.refresh(); // Refresh agar Server Components mereset cache data user
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook agar mudah dipanggil di mana saja
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
