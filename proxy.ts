import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Routes that do NOT require authentication
const PUBLIC_PATHS = [
  "/login",
  "/kamus",
  "/knowledge",
  "/aksara",
  "/ecosystem",
  "/info",
  "/dokumentasi",
  "/panduan",
  "/terms",
  "/privacy",
  "/docs",
  "/api-reference",
  "/examples",
  "/guides",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/v1/chat/completions",
  "/api/homepage/chat",
  "/api/kamus",
  "/api/health",
  "/_next",
  "/favicon.ico",
  "/favicon.png",
  "/logo.webp",
  "/logo.png",
  "/Logo.png",
  "/icon.png"
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static images and media directly
  if (/\.(png|jpg|jpeg|webp|svg|ico|gif)$/i.test(pathname)) {
    return NextResponse.next();
  }

  // Public MyAI OS chat homepage (consumer-facing, no login required)
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protect all other routes
  const session = await getSession(req);
  if (!session || session.role !== 'owner') {
    // API routes return 401, pages redirect to login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except static files and _next internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico|gif)$).*)",
  ],
};
