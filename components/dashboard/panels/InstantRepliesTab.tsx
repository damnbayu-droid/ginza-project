'use client';

import { useEffect, useState } from "react";
import { Card, LoadingState, Badge, Button } from "@/components/dashboard/ui";
import { Zap, Plus, Trash2, CheckCircle2, XCircle, Edit2, Check, X, MessageCircle } from "lucide-react";

interface InstantReply {
  id: string;
  label: string;
  trigger_keywords: string[];
  reply_variants: string[];
  is_active: boolean;
  sort_order: number;
}

function csvToList(s: string): string[] {
  return s.split("\n").map((x) => x.trim()).filter(Boolean);
}
function listToCsv(list: string[]): string {
  return (list || []).join("\n");
}

export default function InstantRepliesTab() {
  const [replies, setReplies] = useState<InstantReply[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editTriggers, setEditTriggers] = useState("");
  const [editVariants, setEditVariants] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newTriggers, setNewTriggers] = useState("");
  const [newVariants, setNewVariants] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setError(null);
    try {
      const res = await fetch("/api/admin/instant-replies");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReplies(data.replies);
    } catch (err: any) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trigger_keywords = csvToList(newTriggers);
    const reply_variants = csvToList(newVariants);
    if (!newLabel.trim() || trigger_keywords.length === 0 || reply_variants.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/instant-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim(), trigger_keywords, reply_variants, is_active: true, sort_order: (replies?.length ?? 0) + 1 }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNewLabel("");
      setNewTriggers("");
      setNewVariants("");
      setShowAddForm(false);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(r: InstantReply) {
    setEditingId(r.id);
    setEditLabel(r.label);
    setEditTriggers(listToCsv(r.trigger_keywords));
    setEditVariants(listToCsv(r.reply_variants));
  }

  async function saveEdit(r: InstantReply) {
    const trigger_keywords = csvToList(editTriggers);
    const reply_variants = csvToList(editVariants);
    if (!editLabel.trim() || trigger_keywords.length === 0 || reply_variants.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/instant-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, label: editLabel.trim(), trigger_keywords, reply_variants, is_active: r.is_active, sort_order: r.sort_order }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEditingId(null);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(r: InstantReply) {
    try {
      const res = await fetch("/api/admin/instant-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: r.id, label: r.label, trigger_keywords: r.trigger_keywords, reply_variants: r.reply_variants, is_active: !r.is_active, sort_order: r.sort_order }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus kategori sapaan ini? Sapaan yang cocok tidak akan lagi dibalas instan.")) return;
    try {
      const res = await fetch(`/api/admin/instant-replies?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!replies) return <LoadingState label="Memuat daftar balasan instan..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-bento-border pb-3 gap-3">
        <div>
          <h3 className="text-base font-bold text-bento-text-primary flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Balasan Instan (Sapaan Tanpa Panggil AI)</span>
          </h3>
          <p className="text-xs text-bento-text-secondary mt-0.5 max-w-2xl">
            Sapaan pendek (hai/halo/assalamualaikum/selamat pagi, dst) dijawab langsung dari daftar ini
            tanpa menunggu Gateway AI (~15-20 detik) dan tidak memakai jatah kuota. Hanya berlaku untuk
            pesan pendek (maks. 5 kata) yang benar-benar sapaan, bukan pertanyaan nyata.
          </p>
        </div>
        <Button onClick={() => setShowAddForm((v) => !v)} variant="primary" className="!py-1.5 text-xs flex items-center gap-1 shrink-0">
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Kategori Sapaan</span>
        </Button>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">{error}</div>
      )}

      {showAddForm && (
        <Card className="!p-4 bg-bento-surface border border-bento-border shadow-xs">
          <form onSubmit={handleAdd} className="space-y-3">
            <p className="text-xs font-bold text-bento-text-primary flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-bento-accent" />
              <span>Kategori Sapaan Baru</span>
            </p>
            <div>
              <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Nama Kategori</label>
              <input
                required
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Contoh: Sapaan Bahasa Inggris"
                className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Kata Pemicu (1 per baris)</label>
                <textarea
                  required
                  rows={4}
                  value={newTriggers}
                  onChange={(e) => setNewTriggers(e.target.value)}
                  placeholder={"good morning\nmorning"}
                  className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Varian Jawaban (1 per baris, minimal 5 disarankan)</label>
                <textarea
                  required
                  rows={4}
                  value={newVariants}
                  onChange={(e) => setNewVariants(e.target.value)}
                  placeholder={"Good morning, Utat! ..."}
                  className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="default" onClick={() => setShowAddForm(false)} className="!py-1.5 text-xs">
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={saving} className="!py-1.5 text-xs flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Simpan</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {replies.map((r) => (
          <Card
            key={r.id}
            className={`!p-4 border transition-all ${
              r.is_active ? "border-bento-border bg-bento-surface shadow-2xs" : "border-bento-border/50 bg-bento-surface-lighter/40 opacity-60"
            }`}
          >
            {editingId === r.id ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-bento-accent flex items-center gap-1">
                    <Edit2 className="w-3.5 h-3.5" /> Edit Kategori Sapaan
                  </span>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => saveEdit(r)} variant="primary" disabled={saving} className="!py-1 !px-2.5 text-xs flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Simpan</span>
                    </Button>
                    <Button onClick={() => setEditingId(null)} variant="default" className="!py-1 !px-2.5 text-xs flex items-center gap-1">
                      <X className="w-3.5 h-3.5" />
                      <span>Batal</span>
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Nama Kategori</label>
                  <input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-bento-accent bg-bento-bg text-sm font-medium outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Kata Pemicu (1 per baris)</label>
                    <textarea
                      rows={5}
                      value={editTriggers}
                      onChange={(e) => setEditTriggers(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Varian Jawaban (1 per baris)</label>
                    <textarea
                      rows={5}
                      value={editVariants}
                      onChange={(e) => setEditVariants(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-bento-text-primary">{r.label}</h4>
                      <Badge tone={r.is_active ? "success" : "default"}>{r.is_active ? "Aktif" : "Nonaktif"}</Badge>
                      <span className="text-[10px] font-mono bg-bento-surface-lighter text-bento-text-secondary px-2 py-0.5 rounded border border-bento-border">
                        {r.reply_variants.length} varian jawaban
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {r.trigger_keywords.map((k) => (
                        <span key={k} className="text-[10px] font-mono bg-bento-accent/10 text-bento-accent px-2 py-0.5 rounded border border-bento-accent/20">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => startEdit(r)} className="p-1.5 rounded-lg border border-bento-border text-bento-text-secondary hover:text-bento-accent hover:bg-bento-surface-lighter transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(r)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                        r.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-bento-surface-lighter text-bento-text-secondary border-bento-border hover:text-bento-text-primary"
                      }`}
                    >
                      {r.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{r.is_active ? "Aktif" : "Nonaktif"}</span>
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1 pt-1 border-t border-bento-border/50">
                  {r.reply_variants.map((v, i) => (
                    <p key={i} className="text-xs text-bento-text-secondary flex gap-1.5">
                      <MessageCircle className="w-3 h-3 mt-0.5 shrink-0 text-bento-text-secondary/60" />
                      <span>{v}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
