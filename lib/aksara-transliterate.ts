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
  // Buang tanda baca, angka, & simbol non-huruf Latin — tidak direpresentasikan
  // sebagai glyph terpisah di bagan aksara ini.
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
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

export interface WordTransliteration {
  /** kata asli seperti diketik user (sebelum dibersihkan) */
  original: string;
  /** null jika kata ini gagal disegmentasi (mengandung huruf di luar inventori) */
  syllables: AksaraSyllable[] | null;
}

export interface TransliterationResult {
  /** true jika SEMUA kata berhasil disegmentasi penuh */
  success: boolean;
  /** true jika TIDAK ADA satu kata pun yang berhasil */
  allFailed: boolean;
  /** hasil per-kata, urutan sesuai input, termasuk kata yang gagal (syllables: null) */
  words: WordTransliteration[];
}

/**
 * Transliterasi teks (bisa multi-kata) ke deretan suku kata aksara.
 *
 * Sebelumnya: kalau SATU SAJA kata gagal disegmentasi, seluruh hasil
 * dianggap gagal total (tidak ada glyph sama sekali ditampilkan) — jadi
 * user yang menulis kalimat panjang dengan satu kata pinjaman (mis. nama
 * asing berisi huruf "f"/"z") tidak melihat hasil apa pun utk kata-kata
 * lain yang sebenarnya valid. Sekarang tiap kata dievaluasi independen:
 * kata yang berhasil tetap ditampilkan glyph-nya, kata yang gagal ditandai
 * per-kata (bukan disembunyikan atau menggagalkan semuanya).
 */
export function transliterateToAksara(text: string): TransliterationResult {
  const rawWords = text.trim().split(/\s+/).filter(Boolean);
  const words: WordTransliteration[] = rawWords.map((original) => {
    const seg = segmentWord(original);
    return { original, syllables: seg && seg.length > 0 ? seg : null };
  });

  const successCount = words.filter((w) => w.syllables !== null).length;

  return {
    success: words.length > 0 && successCount === words.length,
    allFailed: words.length > 0 && successCount === 0,
    words,
  };
}
