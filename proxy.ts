import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// PENTING: Nama fungsi diubah menjadi 'proxy'
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const userCookie = request.cookies.get("app_user_data")?.value;

  // --- 1. PROTECTED ROUTES ---
  // Daftar halaman yang butuh login
  const protectedPaths = ["/materi", "/dashboard", "/profile"];
  const isProtected = protectedPaths.some((p) => path.startsWith(p));

  if (isProtected) {
    if (!userCookie) {
      // Pastikan redirect ke /auth/login (sesuai struktur folder Anda)
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
  }

  // --- 2. AUTH GUARD ---
  // Mencegah user yang sudah login masuk kembali ke halaman auth
  // Menggunakan startsWith("/auth") agar mencakup login & register sekaligus
  if (path.startsWith("/auth")) {
    if (userCookie) {
      try {
        // Cek validitas JSON cookie
        JSON.parse(userCookie);

        // Redirect user yang sudah login ke halaman utama / dashboard
        return NextResponse.redirect(new URL("/", request.url));
      } catch (e) {
        // Jika cookie rusak, biarkan lanjut (nanti akan dianggap logout)
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|funbioIcon.png).*)"],
};
