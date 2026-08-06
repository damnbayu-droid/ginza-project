import type { Metadata } from "next";
import "./globals.css";
import GlobalClickFeedback from "@/components/GlobalClickFeedback";

export const metadata: Metadata = {
  metadataBase: new URL("https://mongondowpedia.com"),
  alternates: {
    canonical: "https://mongondowpedia.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/logo.webp", type: "image/webp" }
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.png",
  },
  title: {
    default: "MongondowPedia — Ginza Project",
    template: "%s — MongondowPedia"
  },
  description: "MongondowPedia adalah platform ensiklopedia dan portal informasi terpadu yang didukung oleh Bogani AI (Ginza Project).",
  openGraph: {
    title: "MongondowPedia — Bogani AI",
    description: "Platform Ensiklopedia & Portal Informasi Mongondow didukung oleh Bogani AI.",
    url: "https://mongondowpedia.com",
    siteName: "MongondowPedia",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MongondowPedia — Bogani AI",
    description: "Platform Ensiklopedia & Portal Informasi Mongondow (Ginza Project).",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo.webp" type="image/webp" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <GlobalClickFeedback />
        {children}
      </body>
    </html>
  );
}
