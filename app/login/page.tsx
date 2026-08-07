import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import LoginScreen from "@/components/LoginScreen";

export default async function LoginPage() {
  // If already logged in, go to dashboard
  const session = await getServerSession();
  if (session) redirect("/dashboard");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://mongondowpedia.com/#organization",
    "name": "MongondowPedia",
    "legalName": "MongondowPedia (Ginza Project)",
    "url": "https://mongondowpedia.com",
    "description": "MongondowPedia adalah platform ensiklopedia dan portal informasi terpadu seputar bahasa, aksara, dan pengetahuan Mongondow, didukung oleh asisten AI Bogani AI.",
    "knowsAbout": [
      "Bahasa Mongondow",
      "Aksara Mongondow",
      "Ensiklopedia Budaya Mongondow"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-[#0A0B0E] flex items-center justify-center text-gray-400 text-sm">Memuat halaman masuk...</div>}>
        <LoginScreen />
      </Suspense>
    </>
  );
}
