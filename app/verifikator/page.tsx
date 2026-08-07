import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/supabase-auth-server";
import VerificatorDashboard from "@/components/verificator-dashboard/VerificatorDashboard";

export const dynamic = "force-dynamic";

export default async function VerificatorDashboardPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/akun/masuk");

  return <VerificatorDashboard profile={profile} />;
}
