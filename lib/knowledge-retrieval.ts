import fs from "fs";
import path from "path";

/**
 * Retrieval sederhana (keyword scoring, tanpa embedding/vector DB) di atas
 * folder knowledge/ — supaya Bogani AI bisa menjawab soal Sejarah, Adat,
 * Bahasa, dan Aksara Bolaang Mongondow berdasarkan dokumen sungguhan yang
 * sudah dikumpulkan/di-OCR pengguna, bukan hanya pengetahuan umum model.
 *
 * Sumber yang di-index:
 *  - knowledge/*.md               (dokumen sintesis per topik)
 *  - knowledge/arsip_download/*.md (arsip sumber mentah hasil OCR/ekstraksi)
 */

interface KnowledgeChunk {
  source: string;
  text: string;
}

let cachedChunks: KnowledgeChunk[] | null = null;

function addFileChunks(filePath: string, label: string, chunks: KnowledgeChunk[]) {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const paragraphs = content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 40);

    for (const p of paragraphs) {
      chunks.push({ source: label, text: p });
    }
  } catch (err) {
    console.warn(`[knowledge-retrieval] Gagal membaca ${filePath}:`, err);
  }
}

function loadKnowledgeChunks(forceRefresh = false): KnowledgeChunk[] {
  if (cachedChunks && !forceRefresh) return cachedChunks;

  const rootDir = process.cwd();
  const knowledgeDir = path.join(rootDir, "knowledge");
  const chunks: KnowledgeChunk[] = [];

  if (fs.existsSync(knowledgeDir)) {
    const topFiles = fs
      .readdirSync(knowledgeDir)
      .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md");
    for (const f of topFiles) {
      addFileChunks(path.join(knowledgeDir, f), `knowledge/${f}`, chunks);
    }

    const arsipDir = path.join(knowledgeDir, "arsip_download");
    if (fs.existsSync(arsipDir)) {
      const arsipFiles = fs.readdirSync(arsipDir).filter((f) => f.endsWith(".md"));
      for (const f of arsipFiles) {
        addFileChunks(path.join(arsipDir, f), `knowledge/arsip_download/${f}`, chunks);
      }
    }
  }

  cachedChunks = chunks;
  return chunks;
}

const STOPWORDS = new Set([
  "yang", "dan", "atau", "dari", "untuk", "dengan", "pada", "dalam", "ini", "itu",
  "adalah", "juga", "tidak", "akan", "bisa", "saya", "anda", "kamu", "kami", "kita",
  "apa", "apa saja", "bagaimana", "siapa", "kenapa", "mengapa", "kapan", "dimana",
  "the", "and", "for", "are", "with", "that", "this", "was", "were", "what", "how",
  "who", "why", "when", "where", "tentang", "soal",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t));
}

export interface KnowledgeContextResult {
  text: string;
  /** Path file sumber (dedup, urut skor) yg kutipannya benar2 kepakai di `text` -- lihat components/homepage/BoganiThinkingIndicator.tsx utk bagaimana ini ditampilkan ke user. */
  sources: string[];
}

/**
 * Cari kutipan paling relevan dari Knowledge Base untuk sebuah query, lalu
 * kembalikan sebagai blok teks siap-sisip ke prompt AI (dengan atribusi
 * sumber file) SEKALIGUS daftar path file sumbernya secara terpisah --
 * `text` kosong kalau tidak ada yang relevan.
 */
export function getKnowledgeContext(query: string, maxChars = 5000, topK = 6): KnowledgeContextResult {
  const chunks = loadKnowledgeChunks();
  if (chunks.length === 0) return { text: "", sources: [] };

  const queryTokens = Array.from(new Set(tokenize(query)));
  if (queryTokens.length === 0) return { text: "", sources: [] };

  const scored: (KnowledgeChunk & { score: number })[] = [];
  for (const c of chunks) {
    const lower = c.text.toLowerCase();
    let score = 0;
    for (const t of queryTokens) {
      if (lower.includes(t)) score += 1;
    }
    if (score > 0) scored.push({ ...c, score });
  }

  if (scored.length === 0) return { text: "", sources: [] };
  scored.sort((a, b) => b.score - a.score);

  const top = scored.slice(0, topK);
  let result = `\n\n--- KONTEKS KNOWLEDGE BASE MONGONDOWPEDIA (${top.length} kutipan relevan, urut skor kecocokan) ---`;
  let used = 0;
  const usedSources: string[] = [];

  for (const t of top) {
    const snippet = t.text.length > 900 ? t.text.slice(0, 900) + "…" : t.text;
    const block = `\n[Sumber: ${t.source}]\n${snippet}\n`;
    if (used + block.length > maxChars) break;
    result += block;
    used += block.length;
    if (!usedSources.includes(t.source)) usedSources.push(t.source);
  }

  result += `\n--- AKHIR KONTEKS KNOWLEDGE BASE ---`;
  return { text: result, sources: usedSources };
}

/** Dipakai kalau perlu memaksa reload (mis. setelah menambah file knowledge baru saat dev). */
export function refreshKnowledgeIndex(): void {
  loadKnowledgeChunks(true);
}
