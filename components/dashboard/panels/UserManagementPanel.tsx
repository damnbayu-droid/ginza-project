'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";
import { FileText, BookOpen, Database, Zap, ExternalLink, ShieldCheck, User } from "lucide-react";

interface ProfileRow {
  id: string;
  role: string;
  display_name: string | null;
  mongondow_score: number;
  is_banned: boolean;
  banned_reason: string | null;
  created_at: string;
}

export default function UserManagementPanel() {
  const [profiles, setProfiles] = useState<ProfileRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal Detail User
  const [selected, setSelected] = useState<ProfileRow | null>(null);
  const [userArticles, setUserArticles] = useState<any[] | null>(null);
  const [userKnowledge, setUserKnowledge] = useState<any[] | null>(null);
  const [userKamus, setUserKamus] = useState<any[] | null>(null);
  const [tokenUsage, setTokenUsage] = useState<any[] | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<"artikel" | "knowledge" | "kamus" | "token">("artikel");

  function load() {
    setError(null);
    fetch(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setProfiles(d.profiles);
      })
      .catch((e) => setError(String(e)));
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleBan(p: ProfileRow) {
    const reason = p.is_banned ? undefined : prompt("Alasan pembatasan (opsional):") ?? undefined;
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: p.id, action: p.is_banned ? "unban" : "ban", reason }),
    });
    load();
  }

  async function viewUserDetail(p: ProfileRow) {
    setSelected(p);
    setUserArticles(null);
    setUserKnowledge(null);
    setUserKamus(null);
    setTokenUsage(null);

    const res = await fetch(`/api/admin/users?userId=${p.id}`);
    const d = await res.json();
    setTokenUsage(d.tokenUsage ?? []);
    setUserArticles(d.articles ?? []);
    setUserKnowledge(d.knowledgeArticles ?? []);
    setUserKamus(d.kamusContributions ?? []);
  }

  if (error) return <ErrorState message={error} />;
  if (!profiles) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PanelHeader title="User Management" subtitle="Kelola user, lihat perincian kontribusi artikel, knowledge, kamus, dan batas akses." />

      <div className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Cari nama user atau ID..."
          className="flex-1 rounded-xl border border-bento-border bg-bento-surface px-4 py-2.5 text-xs outline-none focus:border-bento-accent"
        />
        <Button onClick={load}>Cari</Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-bento-surface-lighter text-bento-text-secondary uppercase">
            <tr>
              <th className="text-left px-4 py-3">Nama User</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Skor Mongondow</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Aksi Admin</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-bento-text-secondary">
                  Belum ada user terdaftar.
                </td>
              </tr>
            )}
            {profiles.map((p) => (
              <tr
                key={p.id}
                onClick={() => viewUserDetail(p)}
                className="border-t border-bento-border hover:bg-bento-surface/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-bento-text-primary flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{p.display_name ?? "(tanpa nama)"}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge>{p.role}</Badge>
                </td>
                <td className="px-4 py-3 font-mono font-bold text-amber-400">⭐ {p.mongondow_score} Pts</td>
                <td className="px-4 py-3">
                  {p.is_banned ? <Badge tone="danger">Dibatasi</Badge> : <Badge tone="success">Aktif</Badge>}
                </td>
                <td className="px-4 py-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button onClick={() => viewUserDetail(p)}>Rincian User</Button>
                  <Button variant={p.is_banned ? "default" : "danger"} onClick={() => toggleBan(p)}>
                    {p.is_banned ? "Buka Blokir" : "Batasi"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal Detail Kontribusi User */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bento-surface border border-bento-border rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-bento-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 font-bold text-sm flex items-center justify-center border border-purple-500/30">
                  {(selected.display_name ?? "U").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-bento-text-primary">{selected.display_name ?? "User Mongondow"}</h2>
                  <p className="text-xs text-bento-text-secondary">
                    Role: <span className="font-semibold text-purple-400 uppercase">{selected.role}</span> · Skor:{" "}
                    <span className="font-bold text-amber-400">⭐ {selected.mongondow_score} Pts</span>
                  </p>
                </div>
              </div>
              <Button onClick={() => setSelected(null)}>✕ Tutup</Button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 p-1.5 bg-bento-bg border border-bento-border rounded-xl">
              <button
                onClick={() => setActiveModalTab("artikel")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeModalTab === "artikel" ? "bg-purple-600 text-white shadow-md" : "text-bento-text-secondary hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Artikel ({userArticles?.length ?? 0})
              </button>
              <button
                onClick={() => setActiveModalTab("knowledge")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeModalTab === "knowledge" ? "bg-purple-600 text-white shadow-md" : "text-bento-text-secondary hover:text-white"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Knowledge ({userKnowledge?.length ?? 0})
              </button>
              <button
                onClick={() => setActiveModalTab("kamus")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeModalTab === "kamus" ? "bg-purple-600 text-white shadow-md" : "text-bento-text-secondary hover:text-white"
                }`}
              >
                <Database className="w-3.5 h-3.5" /> Kamus ({userKamus?.length ?? 0})
              </button>
              <button
                onClick={() => setActiveModalTab("token")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  activeModalTab === "token" ? "bg-purple-600 text-white shadow-md" : "text-bento-text-secondary hover:text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Token Usage
              </button>
            </div>

            {/* Modal Content Display */}
            <div className="space-y-3 min-h-48">
              {activeModalTab === "artikel" && (
                <div>
                  {!userArticles ? (
                    <LoadingState />
                  ) : userArticles.length === 0 ? (
                    <p className="text-xs text-bento-text-secondary text-center py-8">User belum pernah memposting artikel.</p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {userArticles.map((art: any) => (
                        <div key={art.id} className="p-3 bg-bento-bg border border-bento-border rounded-xl flex items-center justify-between">
                          <div className="space-y-1 min-w-0 pr-2">
                            <a
                              href={`/artikel/${art.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-bold text-bento-text-primary hover:text-purple-400 truncate flex items-center gap-1"
                            >
                              <span>{art.title}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                            <p className="text-[10px] text-bento-text-secondary">
                              📍 {art.region} · 📚 {art.category} · 👁️ {art.views_count} Views · 👍 {art.likes_count} Likes
                            </p>
                          </div>
                          <Badge tone={art.status === "published" ? "success" : art.status === "warning" ? "warning" : "danger"}>
                            {art.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeModalTab === "knowledge" && (
                <div>
                  {!userKnowledge ? (
                    <LoadingState />
                  ) : userKnowledge.length === 0 ? (
                    <p className="text-xs text-bento-text-secondary text-center py-8">User belum pernah menambahkan artikel knowledge.</p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {userKnowledge.map((knw: any) => (
                        <div key={knw.id} className="p-3 bg-bento-bg border border-bento-border rounded-xl flex items-center justify-between">
                          <span className="text-xs font-bold text-bento-text-primary truncate">{knw.title}</span>
                          <Badge tone={knw.status === "published" ? "success" : "warning"}>{knw.status}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeModalTab === "kamus" && (
                <div>
                  {!userKamus ? (
                    <LoadingState />
                  ) : userKamus.length === 0 ? (
                    <p className="text-xs text-bento-text-secondary text-center py-8">User belum pernah menyumbangkan kata kamus.</p>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {userKamus.map((kam: any) => (
                        <div key={kam.id} className="p-3 bg-bento-bg border border-bento-border rounded-xl flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-bento-text-primary">{kam.word}</span>
                            <p className="text-[10px] text-bento-text-secondary truncate max-w-md">{kam.meaning}</p>
                          </div>
                          <Badge tone={kam.status === "approved" ? "success" : kam.status === "rejected" ? "danger" : "warning"}>
                            {kam.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeModalTab === "token" && (
                <div>
                  {!tokenUsage ? (
                    <LoadingState />
                  ) : tokenUsage.length === 0 ? (
                    <p className="text-xs text-bento-text-secondary text-center py-8">Belum ada pemakaian token tercatat.</p>
                  ) : (
                    <ul className="text-xs space-y-1 max-h-72 overflow-y-auto font-mono">
                      {tokenUsage.map((t: any) => (
                        <li key={t.id} className="flex justify-between border-b border-bento-border py-1.5">
                          <span>
                            {t.provider ?? "-"} · {t.endpoint ?? "-"}
                          </span>
                          <span className="text-purple-400 font-bold">{t.tokens_used} token</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
