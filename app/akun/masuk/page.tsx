import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import LoginScreen from "@/components/LoginScreen";

export default async function MasukPage() {
  // Jika sudah login, alihkan ke dashboard sesuai role
  const session = await getServerSession();
  if (session) {
    const role = session.role;
    if (role === "admin" || role === "owner" || role === "developer") {
      redirect("/dashboard");
    } else if (role === "verificator") {
      redirect("/verifikator");
    } else {
      redirect("/u");
    }
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0B0E] flex items-center justify-center text-gray-400 text-sm">Memuat halaman masuk...</div>}>
      <LoginScreen />
    </Suspense>
  );
}
