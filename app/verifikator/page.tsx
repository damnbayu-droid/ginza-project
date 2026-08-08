import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/supabase-auth-server";
import VerificatorDashboard from "@/components/verificator-dashboard/VerificatorDashboard";

export const dynamic = "force-dynamic";

export default async function VerificatorDashboardPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/akun/masuk");

  // PROTEKSI KETAT ROLE: Hanya Verifikator, Admin, Owner, atau Developer yang boleh mengakses Verifikator Dashboard
  const roleStr = String(profile.role);
  const isAllowed = roleStr === "verificator" || roleStr === "admin" || roleStr === "owner" || roleStr === "developer";
  if (!isAllowed) {
    redirect("/u");
  }

  return <VerificatorDashboard profile={profile} />;
}
