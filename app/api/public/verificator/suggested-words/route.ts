import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase";
import { getKamusStats, searchKamusEntries } from "@/lib/kamus-parser";

/**
 * Menyarankan kata/frasa dari Kamus yang BELUM punya sampel suara sama sekali
 * — supaya verifikator langsung tahu apa yang perlu direkam, bukan menebak
 * sendiri. Sesuai arahan Boss Bayu: "cari 1 frasa, mereka melafalkan itu, kita
 * rekam" — tapi frasanya diarahkan sistem, bukan dicari manual tiap kali.
 */
export async function GET(req: NextRequest) {
  const { error } = await requireProfile(["verificator", "admin"]);
  if (error) return error;

  const count = Math.min(parseInt(req.nextUrl.searchParams.get("count") || "8", 10) || 8, 20);

  const recorded = new Set<string>();
  if (supabaseAdmin) {
    const { data } = await supabaseAdmin.from("voice_training_samples").select("word_or_phrase");
    (data ?? []).forEach((r: any) => recorded.add(String(r.word_or_phrase).trim().toLowerCase()));
  }

  const stats = getKamusStats();
  const total = stats.totalWords || 0;
  if (total === 0) return NextResponse.json({ words: [] });

  const suggestions: string[] = [];
  const seen = new Set<string>();
  const pageSize = 40;
  const maxPages = Math.max(1, Math.ceil(total / pageSize));
  let attempts = 0;

  while (suggestions.length < count && attempts < 6) {
    attempts++;
    const randomPage = 1 + Math.floor(Math.random() * maxPages);
    const { items } = searchKamusEntries({ page: randomPage, limit: pageSize });
    for (const entry of items) {
      const key = entry.word.trim().toLowerCase();
      if (recorded.has(key) || seen.has(key)) continue;
      seen.add(key);
      suggestions.push(entry.word);
      if (suggestions.length >= count) break;
    }
  }

  return NextResponse.json({ words: suggestions });
}
