import aksaraData from "@/data/aksara/aksara_mongondow.json";

/**
 * Segmentasi suku kata Latin -> Aksara Bolaang Mongondow.
 *
 * Sumber kebenaran tunggal untuk suku kata & glyph tetap
 * `data/aksara/aksara_mongondow.json` (88 suku kata: 15 konsonan x baris
 * a/e-i/o-u + 13 bentuk konsonan mati). Fungsi di sini HANYA melakukan
 * pencocokan teks -> entri tabel tersebut (greedy longest-match), tidak
 * pernah menebak/mengarang glyph.
 */

export interface AksaraSyllable {
  id: string;
  romanization: string;
  consonant: string | null;
  vowel: string | null;
  syllable_type: "vowel_a" | "vowel_e_i" | "vowel_o_u" | "final_consonant";
  glyph_image: string;
  glyph_svg: string;
  display_order: number;
}

const DATA = aksaraData as unknown as { syllables: AksaraSyllable[] };

// Peta romanisasi -> entri suku kata (mis. "bo" -> {glyph_image: "row3_bo_bu.png", ...})
const SYLLABLE_MAP = new Map<string, AksaraSyllable>();
for (const s of DATA.syllables) {
  if (!SYLLABLE_MAP.has(s.romanization)) SYLLABLE_MAP.set(s.romanization, s);
}

const MAX_TOKEN_LEN = Math.max(...DATA.syllables.map((s) => s.romanization.length));

/**
 * Pecah satu kata (tanpa spasi) menjadi deretan suku kata aksara memakai
 * greedy longest-match terhadap SYLLABLE_MAP. Mengembalikan null jika ada
 * bagian kata yang tidak bisa dicocokkan sama sekali (mis. mengandung huruf
 * di luar inventori fonem Mongondow: c, f, j, q, v, x, z).
 */
function segmentWord(word: string): AksaraSyllable[] | null {
  // Buang tanda kutip/glottal stop & simbol non-huruf — tidak direpresentasikan
  // sebagai glyph terpisah di bagan aksara ini.
  const clean = word.toLowerCase().replace(/['’ʼ`-]/g, "");
  if (!clean) return [];

  const result: AksaraSyllable[] = [];
  let i = 0;
  while (i < clean.length) {
    let matched: AksaraSyllable | null = null;
    const maxLen = Math.min(MAX_TOKEN_LEN, clean.length - i);
    for (let len = maxLen; len >= 1; len--) {
      const candidate = clean.slice(i, i + len);
      const syl = SYLLABLE_MAP.get(candidate);
      if (syl) {
        matched = syl;
        i += len;
        break;
      }
    }
    if (!matched) return null;
    result.push(matched);
  }
  return result;
}

export interface TransliterationResult {
  /** true jika SEMUA kata berhasil disegmentasi penuh */
  success: boolean;
  /** array per-kata, tiap kata = array suku kata aksara berurutan */
  words: AksaraSyllable[][];
}

/**
 * Transliterasi teks (bisa multi-kata) ke deretan suku kata aksara.
 * Jika salah satu kata gagal disegmentasi, seluruh hasil dianggap gagal
 * (success: false) supaya UI tidak menampilkan potongan glyph yang salah/parsial.
 */
export function transliterateToAksara(text: string): TransliterationResult {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const segmented: AksaraSyllable[][] = [];

  for (const w of words) {
    const seg = segmentWord(w);
    if (!seg || seg.length === 0) {
      return { success: false, words: [] };
    }
    segmented.push(seg);
  }

  return { success: segmented.length > 0, words: segmented };
}
