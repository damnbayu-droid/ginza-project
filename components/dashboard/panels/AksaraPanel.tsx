'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";

interface GlyphRow {
  id: string;
  romanization: string;
  syllable_type: string;
  glyph_svg_path: string;
  status: string;
  notes: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  vowel_a: "Vokal A",
  vowel_e_i: "Vokal E / I",
  vowel_o_u: "Vokal O / U",
  final_consonant: "Konsonan Mati",
};

export default function AksaraPanel() {
  const [glyphs, setGlyphs] = useState<GlyphRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [verificatorsFor, setVerificatorsFor] = useState<{ glyph: GlyphRow; list: any[] } | null>(null);

  function load() {
    setError(null);
    fetch(`/api/admin/aksara${filter ? `?status=${filter}` : ""}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setGlyphs(d.glyphs); })
      .catch(e => setError(String(e)));
  }

  useEffect(() => { load(); }, [filter]);

  async function verify(g: GlyphRow) {
    await fetch("/api/admin/aksara", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ glyphId: g.id, status: "verified" }),
    });
    load();
  }

  async function showVerificators(g: GlyphRow) {
    const res = await fetch(`/api/admin/aksara?glyphId=${g.id}`);
    const d = await res.json();
    setVerificatorsFor({ glyph: g, list: d.verificators ?? [] });
  }

  if (error) return <ErrorState message={error} />;
  if (!glyphs) return <LoadingState />;

  const grouped = glyphs.reduce<Record<string, GlyphRow[]>>((acc, g) => {
    (acc[g.syllable_type] ??= []).push(g);
    return acc;
  }, {});

  return (
    <div>
      <PanelHeader
        title="Database Huruf / Abjad Mongondow"
        subtitle="Fase 1: glyph vektor SVG (bukan screenshot) — kelola & verifikasi tiap suku kata aksara."
      />

      <div className="flex gap-2 mb-4">
        {["", "verified", "pending_review", "draft", "archived"].map(s => (
          <Button key={s || "all"} variant={filter === s ? "primary" : "default"} onClick={() => setFilter(s)}>
            {s === "" ? "Semua" : s}
          </Button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 && (
        <Card>
          <p className="text-sm text-bento-text-secondary">
            Belum ada data. Jalankan <code className="px-1 rounded bg-bento-surface-lighter">npx tsx scripts/import-aksara-to-db.ts</code> setelah migration
            <code className="mx-1 px-1 rounded bg-bento-surface-lighter">20260804_aksara_glyphs.sql</code> dijalankan.
          </p>
        </Card>
      )}

      {Object.entries(grouped).map(([type, rows]) => (
        <div key={type} className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-bento-text-secondary mb-2">
            {TYPE_LABEL[type] ?? type} ({rows.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {rows.map(g => (
              <Card key={g.id} className="flex flex-col items-center gap-2">
                <div className="w-12 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.glyph_svg_path} alt={g.romanization} className="w-10 h-14 object-contain" />
                </div>
                <p className="text-xs font-semibold">{g.romanization}</p>
                <Badge tone={g.status === "verified" ? "success" : g.status === "archived" ? "danger" : "warning"}>{g.status}</Badge>
                <div className="flex flex-col gap-1 w-full">
                  <Button className="w-full" onClick={() => showVerificators(g)}>Verifikator</Button>
                  {g.status !== "verified" && <Button className="w-full" variant="primary" onClick={() => verify(g)}>Verifikasi</Button>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {verificatorsFor && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold">Verifikator untuk &quot;{verificatorsFor.glyph.romanization}&quot;</p>
            <Button onClick={() => setVerificatorsFor(null)}>Tutup</Button>
          </div>
          {verificatorsFor.list.length === 0 ? (
            <p className="text-xs text-bento-text-secondary">Belum ada verifikator spesifik (mungkin diverifikasi langsung oleh admin).</p>
          ) : (
            <ul className="text-xs space-y-1">
              {verificatorsFor.list.map((v: any, i: number) => (
                <li key={i}>{v.profiles?.display_name ?? v.verificator_id} — {new Date(v.verified_at).toLocaleDateString("id-ID")}</li>
              ))}
            </ul>
          )}
        </Card>
      )}

      <p className="text-xs text-bento-text-secondary mt-6 opacity-70">
        Fase 2 (belum dibangun): kompilasi glyph-glyph ini jadi font web asli (mapping ke Unicode Private Use Area) supaya
        teks aksara bisa diketik &amp; di-copy seperti huruf biasa — perlu sesi terpisah karena butuh proses font-engineering
        yang beda skillnya dari sekadar vektor SVG.
      </p>
    </div>
  );
}
