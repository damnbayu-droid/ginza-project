import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/supabase-auth-server";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  // PROTEKSI KETAT ROLE: Hanya Admin / Owner / Developer yang boleh masuk ke Admin Dashboard
  const roleStr = String(profile.role);
  const isAllowed = roleStr === "admin" || roleStr === "owner" || roleStr === "developer";
  if (!isAllowed) {
    if (roleStr === "verificator") {
      redirect("/verifikator");
    } else {
      redirect("/u");
    }
  }

  return <Dashboard adminEmail={profile.email || "Admin"} />;
}
