import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-auth-server";

// Rute publik yang bebas diakses tanpa perlu login
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/akun",
  "/auth/callback",
  "/u",
  "/verifikator",
  "/dashboard",
  "/game",
  "/kamus",
  "/knowledge",
  "/aksara",
  "/aksara-mongondow",
  "/ecosystem",
  "/info",
  "/proposal",
  "/dokumentasi",
  "/panduan",
  "/terms",
  "/privacy",
  "/robots.txt",
  "/sitemap.xml",
  "/api/auth/",
  "/api/public/",
  "/api/homepage/",
  "/api/kamus",
  "/api/knowledge",
  "/api/health",
  "/_next",
  "/favicon.ico",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/favicon-48x48.png",
  "/favicon-96x96.png",
  "/apple-touch-icon.png",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/og-image.png",
  "/manifest.json",
  "/Logo.png",
  "/logo.png",
  "/icon.png"
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Izinkan gambar statis & berkas media langsung
  if (/\.(png|jpg|jpeg|webp|svg|ico|gif)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // Halaman publik & API publik langsung diizinkan
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Proteksi Rute Khusus Admin (/api/admin/*)
  if (pathname.startsWith("/api/admin")) {
    const session = await getSession(req);
    const isAllowed = session && (session.role === 'owner' || session.role === 'developer' || session.role === 'admin');
    if (!isAllowed) {
      return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico|gif)$).*)",
  ],
};
