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
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/icon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/favicon-32x32.png" },
    ],
  },
  title: {
    default: "MongondowPedia | Culture. Language. Future | AI Powered",
    template: "%s | MongondowPedia"
  },
  description: "MongondowPedia adalah ensiklopedia digital dan portal informasi terpadu tentang sejarah, bahasa, aksara, adat-istiadat, dan budaya Bolaang Mongondow (BMR). Didukung oleh Bogani AI — asisten kecerdasan buatan berbasis MyAI OS.",
  keywords: [
    "MongondowPedia",
    "Bogani AI",
    "Bolaang Mongondow",
    "sejarah Mongondow",
    "bahasa Mongondow",
    "aksara Mongondow",
    "adat budaya Mongondow",
    "kamus Mongondow",
    "ensiklopedia Mongondow",
    "BMR",
    "Kotamobagu",
    "Sulawesi Utara",
    "suku Mongondow",
    "Ginza Project",
    "MyAI OS",
    "AI Mongondow",
    "portal informasi Mongondow",
    "budaya Bolaang",
    "kebudayaan BMR",
    "kamus bahasa daerah Mongondow",
    "sejarah Kerajaan Mongondow",
    "Bogani",
    "Niondon",
    "Indonesian Visas Agency",
  ],
  authors: [{ name: "MongondowPedia Team", url: "https://mongondowpedia.com" }],
  creator: "MyAI OS — PT Indonesian Visas Agency",
  publisher: "PT Indonesian Visas Agency",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "MongondowPedia | Culture. Language. Future | AI Powered",
    description: "Ensiklopedia digital, kamus bahasa, aksara, sejarah, dan portal informasi Bolaang Mongondow. Didukung Bogani AI (MyAI OS).",
    url: "https://mongondowpedia.com",
    siteName: "MongondowPedia",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MongondowPedia | Culture. Language. Future | AI Powered",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MongondowPedia | Culture. Language. Future | AI Powered",
    description: "Ensiklopedia digital Bolaang Mongondow: bahasa, aksara, sejarah, adat-istiadat, dan Bogani AI.",
    images: ["/og-image.png"],
    creator: "@mongondowpedia",
  },
  category: "education",
  classification: "Encyclopedia, Cultural Heritage, AI",
};

// ─── JSON-LD: Hierarki Organisasi ───────────────────────────────────────────
// PT Indonesian Visas Agency → MyAI OS → MongondowPedia (Ginza Project)

const parentOrganizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Corporation",
  "@id": "https://indonesianvisas.com/#organization",
  "name": "PT Indonesian Visas Agency",
  "legalName": "PT Indonesian Visas Agency",
  "url": "https://indonesianvisas.com",
  "logo": "https://indonesianvisas.com/logo.png",
  "description": "PT Indonesian Visas Agency adalah perusahaan teknologi dan jasa yang beroperasi di Indonesia, bergerak di bidang layanan visa, solusi digital, dan platform kecerdasan buatan melalui MyAI OS.",
  "foundingDate": "2019",
  "areaServed": "ID",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "url": "https://indonesianvisas.com",
  },
  "sameAs": [
    "https://indonesianvisas.com",
  ],
};

const myaiOsJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://indonesianvisas.com/#myai-os",
  "name": "MyAI OS",
  "applicationCategory": "AIApplication",
  "operatingSystem": "Web",
  "url": "https://indonesianvisas.com",
  "description": "MyAI OS adalah platform kecerdasan buatan (AI Gateway) milik PT Indonesian Visas Agency yang menyediakan akses ke berbagai model AI (GPT, Claude, Gemini, DeepSeek, Grok) untuk berbagai produk digital, termasuk MongondowPedia (Ginza Project).",
  "provider": { "@id": "https://indonesianvisas.com/#organization" },
  "author": { "@id": "https://indonesianvisas.com/#organization" },
  "featureList": [
    "Multi-provider AI Gateway",
    "GPT-4o Integration",
    "Claude Integration",
    "Gemini Integration",
    "DeepSeek Integration",
    "Grok Integration",
    "Bogani AI persona for MongondowPedia",
    "Real-time AI chat",
    "Voice mode AI",
  ],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://mongondowpedia.com/#organization",
  "name": "MongondowPedia",
  "legalName": "MongondowPedia — Ginza Project",
  "url": "https://mongondowpedia.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://mongondowpedia.com/icon-512x512.png",
    "width": 512,
    "height": 512,
  },
  "image": "https://mongondowpedia.com/og-image.png",
  "description": "MongondowPedia adalah platform ensiklopedia digital dan portal informasi terpadu tentang sejarah, bahasa Mongondow, aksara, adat-istiadat, dan kebudayaan Bolaang Mongondow Raya (BMR). Didukung oleh asisten AI Bogani AI (Abo') melalui MyAI OS.",
  "parentOrganization": { "@id": "https://indonesianvisas.com/#organization" },
  "foundingDate": "2024",
  "areaServed": {
    "@type": "AdministrativeArea",
    "name": "Bolaang Mongondow Raya, Sulawesi Utara, Indonesia",
  },
  "knowsAbout": [
    "Sejarah Kerajaan Bolaang Mongondow",
    "Bahasa Mongondow (BMR)",
    "Aksara Mongondow",
    "Adat & Budaya Mongondow",
    "Ensiklopedia Budaya Mongondow",
    "Kamus Bahasa Mongondow",
    "Suku Mongondow",
    "Bogani (pemimpin adat Mongondow)",
    "Hukum Adat Momondo",
    "Sistem kekerabatan Mongondow",
    "Kotamobagu",
    "Sulawesi Utara",
    "Budaya Nusantara",
    "AI Asisten Bahasa Daerah",
  ],
  "sameAs": [
    "https://mongondowpedia.com",
    "https://github.com/damnbayu-droid/ginza-project",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://mongondowpedia.com/#website",
  "url": "https://mongondowpedia.com",
  "name": "MongondowPedia",
  "alternateName": ["MongondowPedia.com", "Ginza Project", "Bogani AI"],
  "description": "Ensiklopedia digital dan portal informasi Bolaang Mongondow Raya: sejarah, bahasa, aksara, adat-istiadat, kamus, pengetahuan budaya — didukung Bogani AI.",
  "publisher": { "@id": "https://mongondowpedia.com/#organization" },
  "inLanguage": ["id-ID", "en-US"],
  "copyrightHolder": { "@id": "https://indonesianvisas.com/#organization" },
  "potentialAction": [
    {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://mongondowpedia.com/kamus?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
      "name": "Cari Kamus Mongondow",
    },
    {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://mongondowpedia.com/knowledge?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
      "name": "Cari Pengetahuan Mongondow",
    },
    {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://mongondowpedia.com/artikel?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
      "name": "Cari Artikel Mongondow",
    },
  ],
};

const softwareAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": "https://mongondowpedia.com/#app",
  "name": "MongondowPedia — Bogani AI Chat",
  "url": "https://mongondowpedia.com",
  "applicationCategory": "EducationApplication",
  "operatingSystem": "Web Browser",
  "browserRequirements": "Requires JavaScript. Recommended: Chrome, Edge, Safari.",
  "description": "Aplikasi web ensiklopedia interaktif dengan asisten AI Bogani AI, kamus bahasa Mongondow, aksara digital, dan basis pengetahuan budaya Bolaang Mongondow.",
  "provider": { "@id": "https://mongondowpedia.com/#organization" },
  "isBasedOn": { "@id": "https://indonesianvisas.com/#myai-os" },
  "featureList": [
    "Chat AI Bogani (Bahasa Indonesia & Inggris)",
    "Voice Mode — percakapan suara real-time",
    "Kamus Bahasa Mongondow (terverifikasi)",
    "Ensiklopedia pengetahuan Bolaang Mongondow",
    "Sistem aksara Mongondow interaktif",
    "Artikel & dokumentasi budaya",
    "Sistem verifikasi komunitas",
    "Dashboard pengguna & verifikator",
  ],
  "screenshot": "https://mongondowpedia.com/og-image.png",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "IDR",
    "description": "Akses gratis untuk semua konten ensiklopedia dan 7 pertanyaan AI per hari untuk tamu.",
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "1",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "PT Indonesian Visas Agency",
      "item": "https://indonesianvisas.com",
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "MyAI OS",
      "item": "https://indonesianvisas.com",
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "MongondowPedia",
      "item": "https://mongondowpedia.com",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Apa itu MongondowPedia?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "MongondowPedia adalah ensiklopedia digital dan portal informasi terpadu tentang Bolaang Mongondow Raya (BMR), mencakup sejarah, bahasa, aksara, adat-istiadat, dan budaya suku Mongondow di Sulawesi Utara, Indonesia. Didukung oleh asisten AI Bogani AI (Abo') melalui MyAI OS.",
      },
    },
    {
      "@type": "Question",
      "name": "Apa itu Bogani AI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bogani AI (Abo') adalah asisten kecerdasan buatan khusus yang dirancang untuk membantu pengguna memahami kebudayaan, bahasa, dan sejarah Bolaang Mongondow. Bogani AI berjalan di atas platform MyAI OS milik PT Indonesian Visas Agency.",
      },
    },
    {
      "@type": "Question",
      "name": "Apa itu bahasa Mongondow?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bahasa Mongondow adalah bahasa daerah yang digunakan oleh suku Mongondow di Bolaang Mongondow Raya, Sulawesi Utara. Bahasa ini termasuk rumpun bahasa Austronesia dan memiliki aksara tersendiri yang disebut aksara Mongondow.",
      },
    },
    {
      "@type": "Question",
      "name": "Apa itu MyAI OS?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "MyAI OS adalah platform AI gateway milik PT Indonesian Visas Agency yang menyediakan akses ke berbagai model AI termasuk GPT, Claude, Gemini, DeepSeek, dan Grok untuk berbagai produk digital termasuk MongondowPedia.",
      },
    },
    {
      "@type": "Question",
      "name": "Apakah MongondowPedia gratis?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ya, MongondowPedia dapat diakses secara gratis. Tamu mendapatkan 7 pertanyaan AI per hari, dan pengguna terdaftar mendapatkan 35 pertanyaan AI per hari. Seluruh konten ensiklopedia, kamus, dan aksara dapat diakses tanpa batas.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Favicons — semua ukuran */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon-48x48.png" type="image/png" sizes="48x48" />
        <link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96" />
        <link rel="icon" href="/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="icon" href="/icon-512x512.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />

        {/* PWA Manifest */}
        <meta name="theme-color" content="#0A0E1A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MongondowPedia" />
        <meta name="application-name" content="MongondowPedia" />
        <meta name="msapplication-TileImage" content="/icon-192x192.png" />
        <meta name="msapplication-TileColor" content="#0A0E1A" />

        {/* Service Worker Registration — offline caching & asset caching */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      console.log('[SW] MongondowPedia SW registered:', reg.scope);
                    })
                    .catch(function(err) {
                      console.warn('[SW] SW registration failed:', err);
                    });
                });
              }
            `,
          }}
        />

        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(parentOrganizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(myaiOsJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <GlobalClickFeedback />
        {children}
      </body>
    </html>
  );
}
