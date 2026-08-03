import type { Metadata } from "next";
import "./globals.css";
import GlobalClickFeedback from "@/components/GlobalClickFeedback";

export const metadata: Metadata = {
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
