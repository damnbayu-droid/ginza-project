import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listProfiles, setUserBanStatus, setUserRole, writeAuditLog, getTokenUsageByUser } from "@/lib/ginza-db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const search = req.nextUrl.searchParams.get("search") ?? undefined;
  const userId = req.nextUrl.searchParams.get("userId");

  try {
    if (userId) {
      const usage = await getTokenUsageByUser(userId, 100);
      return NextResponse.json({ tokenUsage: usage });
    }
    const profiles = await listProfiles({ search });
    return NextResponse.json({ profiles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();
  const { userId, action, reason, role } = body as {
    userId: string; action: "ban" | "unban" | "set_role"; reason?: string; role?: "user" | "verificator" | "admin";
  };
  if (!userId || !action) return NextResponse.json({ error: "userId & action wajib diisi" }, { status: 400 });

  try {
    if (action === "ban") {
      await setUserBanStatus(userId, true, reason);
      await writeAuditLog({ actorRole: "admin", action: "user_banned", targetTable: "profiles", targetId: userId, afterData: { reason } });
    } else if (action === "unban") {
      await setUserBanStatus(userId, false);
      await writeAuditLog({ actorRole: "admin", action: "user_unbanned", targetTable: "profiles", targetId: userId });
    } else if (action === "set_role" && role) {
      await setUserRole(userId, role);
      await writeAuditLog({ actorRole: "admin", action: `user_role_set_${role}`, targetTable: "profiles", targetId: userId });
    } else {
      return NextResponse.json({ error: "action tidak dikenal" }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
