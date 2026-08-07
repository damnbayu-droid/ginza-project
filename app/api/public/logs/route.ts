import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { profile, error } = await requireProfile();
  if (error) return error;
  if (!supabaseAdmin) return NextResponse.json({ logs: [] });

  try {
    // Ambil log dari tabel audit_logs & gw_audit_logs untuk user ini
    const { data: auditLogs } = await supabaseAdmin
      .from("audit_logs")
      .select("*")
      .or(`actor_id.eq.${profile!.id},actor_id.eq.${profile!.email}`)
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: gwLogs } = await supabaseAdmin
      .from("gw_audit_logs")
      .select("*")
      .eq("actor_email", profile!.email ?? "")
      .order("created_at", { ascending: false })
      .limit(50);

    const rawLogs = [...(auditLogs ?? []), ...(gwLogs ?? [])];
    
    // Sort gabungan berdasarkan tanggal terbaru
    rawLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Petakan ke deskripsi ramah manusia (Human-Readable)
    const formattedLogs = rawLogs.slice(0, 50).map((log: any) => {
      const action = log.action || "activity";
      let title = "Aktivitas Pengguna";
      let details = log.detail ? (typeof log.detail === 'object' ? JSON.stringify(log.detail) : log.detail) : "";

      if (action.includes("login_success")) {
        title = "🔑 Berhasil Masuk Portal";
        details = `Aktivitas login berhasil dari IP ${log.ip_address || "Lokal"}`;
      } else if (action.includes("profile_updated")) {
        title = "🖼️ Memperbarui Profil";
        details = "Informasi profil dan bio berhasil diperbarui";
      } else if (action.includes("contribution") || action.includes("kamus_new") || action.includes("knowledge_new")) {
        title = "📝 Mengajukan Usulan Baru";
        details = `Mengajukan kontribusi kata/artikel pengetahuan ke sistem verifikasi`;
      } else if (action.includes("verificator_vote") || action.includes("vote")) {
        title = "🛡️ Memberikan Suara Verifikasi";
        details = "Melakukan peninjauan & voting usulan kata dari kontributor";
      } else if (action.includes("password")) {
        title = "🔒 Mengubah Kata Sandi";
        details = "Pembaruan kata sandi akun berhasil";
      } else if (action.includes("voice")) {
        title = "🎙️ Merekam Sampel Suara";
        details = "Menambahkan rekaman pengucapan Bahasa Mongondow";
      }

      return {
        id: log.id || Math.random().toString(),
        action: action,
        title: title,
        description: details,
        created_at: log.created_at,
        ip_address: log.ip_address || null,
        target_table: log.target_table || null,
      };
    });

    return NextResponse.json({ logs: formattedLogs });
  } catch (err: any) {
    console.warn("[api/public/logs] Error fetching user logs:", err);
    return NextResponse.json({ logs: [] });
  }
}
