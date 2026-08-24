import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      // ─── 1. Static Assets: Cache 1 tahun (immutable) ────────────────────
      {
        source: "/favicon.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/favicon-16x16.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/favicon-32x32.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/favicon-48x48.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/favicon-96x96.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/apple-touch-icon.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/icon-192x192.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/icon-512x512.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/og-image.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=3600" },
        ],
      },
      {
        source: "/fonts/:slug*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/Logo.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // ─── 2. Next.js Static Chunks: Cache 1 tahun ────────────────────────
      {
        source: "/_next/static/:slug*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // ─── 3. Next.js Image Optimization ──────────────────────────────────
      {
        source: "/_next/image",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=3600" },
        ],
      },
      // ─── 4. API Publik (Knowledge, Kamus): Cache 5 menit ────────────────
      {
        source: "/api/public/knowledge/:slug*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=60" },
        ],
      },
      {
        source: "/api/kamus/:slug*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=60" },
        ],
      },
      {
        source: "/api/knowledge/:slug*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300, stale-while-revalidate=60" },
        ],
      },
      // ─── 5. Voice Lookup (TTS Kamus): Cache 30 menit ────────────────────
      {
        source: "/api/public/voice-lookup",
        headers: [
          { key: "Cache-Control", value: "public, max-age=1800, stale-while-revalidate=300" },
        ],
      },
      // ─── 6. API Sensitif: No Cache ──────────────────────────────────────
      {
        source: "/api/auth/:slug*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
        ],
      },
      {
        source: "/api/homepage/:slug*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/public/conversations",
        headers: [
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      // ─── 7. Knowledge Pages: Cache 10 menit ─────────────────────────────
      {
        source: "/knowledge/:slug*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=600, stale-while-revalidate=120" },
        ],
      },
      // ─── 8. Security Headers — semua route ──────────────────────────────
      {
        source: "/:slug*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
              "media-src 'self' blob: mediastream:",
              "worker-src 'self' blob:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://www.google.com wss://www.google.com https://speech.googleapis.com https://*.googleapis.com wss://*.googleapis.com",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // "output: standalone" SENGAJA DIHAPUS (2026-08-24) -- Vercel eksplisit
  // TIDAK menganjurkan setting ini di platform mereka (dokumentasi resmi
  // Vercel: "you do not need this option"). Root-cause insiden nyata: SEMUA
  // route yg import `sharp` (native binary, dipakai lib/file-parser.ts &
  // app/api/upload-image/route.ts) crash total di production (generic 500
  // Next.js) -- termasuk /api/homepage/chat (via file-parser.ts), yg bikin
  // SELURUH chat Bogani AI (teks maupun Voice Mode) mati total di
  // production, padahal jalan normal di localhost.
  //
  // Menghapus "output: standalone" saja TERNYATA BELUM CUKUP -- log runtime
  // Vercel (dicek Boss Bayu langsung, 2026-08-24) masih menunjukkan error
  // persis: "Failed to load external module sharp-<hash>: Could not load
  // the sharp module". Ini bug spesifik Turbopack (dipakai build ini,
  // lihat package.json) dlm men-trace binary native sharp utk server
  // bundle -- fix aslinya adalah `serverExternalPackages` di bawah, yg
  // memberi tahu Next.js supaya TIDAK mencoba bundle sharp sama sekali,
  // cukup require() dari node_modules apa adanya saat runtime (persis spt
  // cara kerja `sharp` yg memang dirancang, krn binary native platform-
  // spesifik tidak bisa di-bundle).
  serverExternalPackages: ["sharp"],
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
