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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://mongondowpedia.com/#organization",
  "name": "MongondowPedia",
  "legalName": "MongondowPedia (Ginza Project)",
  "url": "https://mongondowpedia.com",
  "logo": "https://mongondowpedia.com/logo.webp",
  "description": "MongondowPedia adalah platform ensiklopedia dan portal informasi terpadu seputar sejarah, adat budaya, bahasa, dan aksara Mongondow, didukung oleh asisten AI Bogani AI.",
  "knowsAbout": [
    "Sejarah Bolaang Mongondow",
    "Bahasa Mongondow",
    "Aksara Mongondow",
    "Adat & Budaya Mongondow",
    "Ensiklopedia Budaya Mongondow",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://mongondowpedia.com/#website",
  "url": "https://mongondowpedia.com",
  "name": "MongondowPedia",
  "description": "Ensiklopedia dan portal informasi terpadu Bolaang Mongondow.",
  "publisher": { "@id": "https://mongondowpedia.com/#organization" },
  "inLanguage": "id-ID",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://mongondowpedia.com/kamus?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <GlobalClickFeedback />
        {children}
      </body>
    </html>
  );
}
