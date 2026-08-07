import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security headers replacing helmet middleware
  async headers() {
    return [
      {
        source: "/(.*)",
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
              "img-src 'self' data: blob:",
              // Media: allow mic/audio stream capture (getUserMedia, AudioContext, TTS)
              "media-src 'self' blob: mediastream:",
              // Worker: AudioWorklet & Web Workers for audio processing
              "worker-src 'self' blob:",
              // Connect: Supabase, Gemini AI, Google Speech API (Chrome STT on Android)
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://www.google.com wss://www.google.com https://speech.googleapis.com https://*.googleapis.com wss://*.googleapis.com",
            ].join("; "),
          },
        ],
      },
    ];
  },

  // Vercel-friendly output
  output: "standalone",

  // TypeScript — fail build on errors
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
