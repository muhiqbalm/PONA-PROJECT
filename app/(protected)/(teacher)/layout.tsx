"use client";

import { useAuth } from "@/components/authProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react"; // Pastikan install lucide-react

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 1. Tunggu loading selesai
    if (!isLoading) {
      // 2. Cek apakah user login
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // 3. Cek Role khusus TEACHER
      if (user.role !== "TEACHER") {
        // Jika siswa mencoba masuk halaman guru, lempar ke dashboard siswa atau unauthorized
        router.push("/dashboard/siswa");
        // atau router.push("/unauthorized");
      }
    }
  }, [user, isLoading, router]);

  // Tampilkan Loading Screen saat cek sesi
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  // Jika tidak login atau bukan teacher, jangan render children (hindari flash content)
  if (!user || user.role !== "TEACHER") {
    return null;
  }

  // Render Halaman Guru
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Di sini Anda bisa menaruh Sidebar/Navbar khusus Guru */}
      <main>{children}</main>
    </div>
  );
}
