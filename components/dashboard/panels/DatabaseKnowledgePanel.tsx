'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";

interface CategoryRow { id: string; slug: string; name: string; display_order: number; visit_count: number; is_active: boolean; }
interface ArticleRow { id: string; category_id: string; title: string; slug: string; status: string; view_count: number; }

export default function DatabaseKnowledgePanel() {
  const [categories, setCategories] = useState<CategoryRow[] | null>(null);
  const [articles, setArticles] = useState<ArticleRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");

  function load() {
    setError(null);
    fetch("/api/admin/knowledge")
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else { setCategories(d.categories); setArticles(d.articles); } })
      .catch(e => setError(String(e)));
  }

  useEffect(() => { load(); }, []);

  async function publishArticle(a: ArticleRow) {
    await fetch("/api/admin/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "article", article: { id: a.id, status: "published" } }),
    });
    load();
  }

  async function addCategory() {
    if (!newCatName.trim()) return;
    const slug = newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    await fetch("/api/admin/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "category", category: { slug, name: newCatName.trim() } }),
    });
    setNewCatName("");
    load();
  }

  if (error) return <ErrorState message={error} />;
  if (!categories || !articles) return <LoadingState />;

  const categoryName = (id: string) => categories.find(c => c.id === id)?.name ?? "-";

  return (
    <div>
      <PanelHeader title="Database Knowledge" subtitle="Kelola kategori/tab & artikel Knowledge — urut otomatis berdasarkan jumlah kunjungan." />

      <Card className="mb-6">
        <p className="text-sm font-semibold mb-3">Kategori / Tab ({categories.length})</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map(c => (
            <Badge key={c.id} tone={c.is_active ? "success" : "default"}>{c.name} · {c.visit_count} kunjungan</Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            placeholder="Nama tab/kategori baru..."
            className="flex-1 rounded-lg border border-bento-border bg-bento-surface px-3 py-2 text-sm outline-none focus:border-bento-accent"
          />
          <Button variant="primary" onClick={addCategory}>Tambah Tab</Button>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bento-surface-lighter text-bento-text-secondary text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Judul</th>
              <th className="text-left px-4 py-2">Kategori</th>
              <th className="text-left px-4 py-2">Views</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-bento-text-secondary">Belum ada artikel — jalankan scripts/import-knowledge-to-db.ts.</td></tr>
            )}
            {articles.map(a => (
              <tr key={a.id} className="border-t border-bento-border">
                <td className="px-4 py-2 font-medium max-w-xs truncate">{a.title}</td>
                <td className="px-4 py-2 text-bento-text-secondary">{categoryName(a.category_id)}</td>
                <td className="px-4 py-2">{a.view_count}</td>
                <td className="px-4 py-2">
                  <Badge tone={a.status === "published" ? "success" : a.status === "pending_review" ? "warning" : "default"}>{a.status}</Badge>
                </td>
                <td className="px-4 py-2 text-right">
                  {a.status !== "published" && <Button variant="primary" onClick={() => publishArticle(a)}>Publish</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
