"use client";

import { useState, useEffect } from "react";

// Definisikan tipe data yang diharapkan ada di cookie (sesuaikan dengan data asli Anda)
export interface AppUserData {
  id: string;
  role: "TEACHER" | "STUDENT"; // Sesuaikan dengan role yang ada
  name?: string;
  email?: string;
  // tambahkan properti lain jika ada
}

export function useAppUserData() {
  const [userData, setUserData] = useState<AppUserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    try {
      const cookieValue = getCookie("app_user_data");

      if (cookieValue) {
        // Decode URI component (penting jika cookie mengandung karakter khusus)
        const decodedValue = decodeURIComponent(cookieValue);
        const parsedData = JSON.parse(decodedValue);
        setUserData(parsedData);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Gagal parsing cookie app_user_data:", error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Return data mentah, biar komponen yang mengolahnya
  return { userData, loading };
}
