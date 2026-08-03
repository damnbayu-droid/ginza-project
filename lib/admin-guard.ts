import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

/**
 * Guard standar untuk semua Route Handler di app/api/admin/* — dashboard
 * admin memakai sistem login owner tunggal (lib/auth.ts), TERPISAH dari
 * Supabase Auth publik yang dipakai User/Verifikator Dashboard.
 */
export async function requireAdmin(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.role !== "owner") {
    return { session: null, error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}
