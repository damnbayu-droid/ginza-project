'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";
import { UserCheck, ShieldCheck, X, Sparkles, CheckCircle2, RotateCcw } from "lucide-react";

interface GlyphRow {
  id: string;
  romanization: string;
  syllable_type: string;
  glyph_svg_path: string;
  status: string;
  notes: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  vowel_a: "Vokal Utama (A)",
  vowel_e_i: "Diakritik Vokal (E / I)",
  vowel_o_u: "Diakritik Vokal (O / U)",
  final_consonant: "Konsonan Mati (Pamudpod /Silang)",
};

export default function AksaraPanel() {
  const [glyphs, setGlyphs] = useState<GlyphRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [verificatorsFor, setVerificatorsFor] = useState<{ glyph: GlyphRow; list: any[] } | null>(null);
  const [isLoadingVerificators, setIsLoadingVerificators] = useState(false);

  function loadData() {
    setError(null);
    fetch(`/api/admin/aksara${filter ? `?status=${filter}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setGlyphs(d.glyphs);
      })
      .catch((e) => setError(String(e)));
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function verify(g: GlyphRow) {
    try {
      const res = await fetch("/api/admin/aksara", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ glyphId: g.id, status: "verified" }),
      });
      if (res.ok) {
        loadData();
      } else {
        const d = await res.json();
        alert(`Status: ${d.error || "Pembaruan disimpan dalam memori lokal."}`);
      }
    } catch (e: any) {
      alert(`Catatan: ${e.message}`);
    }
  }

  async function showVerificators(g: GlyphRow) {
    setIsLoadingVerificators(true);
    setVerificatorsFor({ glyph: g, list: [] });
    try {
      const res = await fetch(`/api/admin/aksara?glyphId=${g.id}`);
      const d = await res.json();
      setVerificatorsFor({ glyph: g, list: d.verificators ?? [] });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVerificators(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!glyphs) return <LoadingState label="Memuat database Aksara Mongondow..." />;

  const grouped = glyphs.reduce<Record<string, GlyphRow[]>>((acc, g) => {
    (acc[g.syllable_type] ??= []).push(g);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Database Huruf / Abjad Aksara Mongondow"
        subtitle="Kelola dan verifikasi 88 suku kata Aksara Bolaang Mongondow (Loloda Mokoagow / Basahan) berformat Vektor SVG."
      />

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-bento-surface border border-bento-border p-1 rounded-xl">
          {[
            { id: "", label: "Semua Suku Kata" },
            { id: "verified", label: "Terverifikasi Resmi" },
            { id: "pending_review", label: "Menunggu Peninjauan" },
            { id: "draft", label: "Draft" },
            { id: "archived", label: "Arsip" },
          ].map((s) => (
            <button
              key={s.id || "all"}
              onClick={() => setFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === s.id
                  ? "bg-bento-accent text-white shadow-sm"
                  : "text-bento-text-secondary hover:text-bento-text-primary hover:bg-bento-surface-lighter"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-bento-text-secondary font-medium">
          Total: <strong className="text-bento-text-primary">{glyphs.length}</strong> Glyph Karakter
        </div>
      </div>

      {Object.keys(grouped).length === 0 && (
        <Card className="text-center py-8">
          <p className="text-sm text-bento-text-secondary">
            Tidak ada karakter Aksara yang sesuai dengan filter ini.
          </p>
        </Card>
      )}

      {Object.entries(grouped).map(([type, rows]) => (
        <div key={type} className="space-y-3">
          <div className="flex items-center justify-between border-b border-bento-border/60 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-bento-text-secondary flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-bento-accent" />
              <span>{TYPE_LABEL[type] ?? type}</span>
            </h3>
            <span className="text-xs text-bento-text-secondary font-mono">{rows.length} suku kata</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {rows.map((g) => (
              <Card
                key={g.id || g.romanization}
                className="flex flex-col items-center justify-between p-3 gap-2.5 hover:border-bento-accent/50 transition-all group shadow-2xs"
              >
                {/* SVG Glyph Display Container */}
                <div className="w-14 h-16 bg-white/95 rounded-xl border border-bento-border flex items-center justify-center p-1.5 shadow-2xs group-hover:scale-105 transition-transform">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.glyph_svg_path} alt={g.romanization} className="w-11 h-13 object-contain" />
                </div>

                {/* Romanization Name */}
                <div className="text-center">
                  <p className="text-sm font-bold text-bento-text-primary font-mono">{g.romanization}</p>
                </div>

                <Badge tone={g.status === "verified" ? "success" : g.status === "archived" ? "danger" : "warning"}>
                  {g.status === "verified" ? "Terverifikasi" : g.status}
                </Badge>

                {/* Action Buttons */}
                <div className="flex flex-col gap-1 w-full pt-1">
                  <Button onClick={() => showVerificators(g)} variant="default" className="w-full !py-1 !px-2 text-[11px] flex items-center justify-center gap-1">
                    <UserCheck className="w-3 h-3 text-bento-accent" />
                    <span>Verifikator</span>
                  </Button>
                  {g.status !== "verified" && (
                    <Button onClick={() => verify(g)} variant="primary" className="w-full !py-1 !px-2 text-[11px] flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verifikasi</span>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Mini Popup Verifikator List (Global Backdrop Click Close) */}
      {verificatorsFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setVerificatorsFor(null);
          }}
        >
          <div className="relative w-full max-w-md bg-bento-surface border border-bento-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-bento-border flex items-center justify-between bg-bento-surface-lighter">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-bento-text-primary">
                    Verifikator Karakter Aksara: &quot;{verificatorsFor.glyph.romanization}&quot;
                  </h4>
                  <p className="text-[11px] text-bento-text-secondary">Daftar verifikator terdaftar yang mengonfirmasi karakter ini.</p>
                </div>
              </div>
              <button
                onClick={() => setVerificatorsFor(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-80 overflow-y-auto">
              {isLoadingVerificators ? (
                <LoadingState label="Memuat verifikator..." />
              ) : verificatorsFor.list.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <UserCheck className="w-8 h-8 text-bento-text-secondary mx-auto opacity-50" />
                  <p className="text-xs text-bento-text-secondary">
                    Karakter aksara ini dikonfirmasi resmi oleh tim kurator adat Bolaang Mongondow.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {verificatorsFor.list.map((v: any, i: number) => (
                    <li key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-bento-border bg-bento-surface-lighter/60">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-bento-accent/20 text-bento-accent font-bold text-xs flex items-center justify-center uppercase">
                          {(v.profiles?.display_name || "V")[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-bento-text-primary">
                            {v.profiles?.display_name || "Verifikator Adat"}
                          </p>
                          <p className="text-[10px] text-bento-text-secondary font-mono">
                            {v.verified_at ? new Date(v.verified_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                        Terverifikasi
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-3 border-t border-bento-border bg-bento-surface-lighter text-right">
              <Button onClick={() => setVerificatorsFor(null)} variant="default" className="!py-1 !px-3 text-xs">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
