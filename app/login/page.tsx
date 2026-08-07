import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import LoginScreen from "@/components/LoginScreen";

export default async function LoginPage() {
  // If already logged in, go to dashboard
  const session = await getServerSession();
  if (session) redirect("/dashboard");

  // JSON-LD Organization sudah dipindah ke app/layout.tsx (sitewide).
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0B0E] flex items-center justify-center text-gray-400 text-sm">Memuat halaman masuk...</div>}>
      <LoginScreen />
    </Suspense>
  );
}
