import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Offline",
  description: "Anda sedang offline. Periksa koneksi internet lalu coba lagi.",
  robots: { index: false, follow: false }, // halaman fallback service worker (public/sw.js), tidak perlu diindeks
};

// Di-precache oleh public/sw.js, jadi harus statis (tanpa database).
export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#07080A] text-white font-sans flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
          <WifiOff className="w-9 h-9 text-blue-400" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
            Anda sedang offline
          </h1>
          <p className="text-base text-gray-300 leading-relaxed">
            Koneksi internet tidak tersedia. Periksa jaringan Anda, lalu coba lagi.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke beranda</span>
        </Link>
      </div>
    </div>
  );
}
