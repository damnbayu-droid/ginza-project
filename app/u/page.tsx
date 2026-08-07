import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/supabase-auth-server";
import UserDashboard from "@/components/user-dashboard/UserDashboard";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/akun/masuk");

  return <UserDashboard profile={profile} />;
}
