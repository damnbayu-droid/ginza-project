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
 * Padanan fonetis PRAKTIS utk 7 huruf yang memang TIDAK punya representasi
 * di Aksara Mongondow tradisional (c, f, j, q, v, x, z) — ini bukan data
 * yang kurang, tapi memang tidak ada glyph aslinya. Dipilih berdasarkan pola
 * adaptasi kata serapan yang lazim di rumpun bahasa Nusantara/Austronesia
 * (v<->b dan f<->p sering saling gantian, j<->d, q->k, x->k+s, c->s sbg
 * bunyi terdekat yang tersedia). BUKAN aturan baku bersumber akademik —
 * murni pendekatan praktis supaya nama/kata dari luar bahasa Mongondow tetap
 * bisa "dibunyikan" dgn huruf yang sudah ada, bukan digagalkan total. Setiap
 * kata yang lewat jalur ini WAJIB ditandai "pendekatan fonetis / belum
 * terverifikasi" di UI — tidak pernah disajikan seolah ejaan otentik.
 */
const PHONETIC_FALLBACK: Record<string, string> = {
  c: "s",
  f: "p",
  j: "d",
  q: "k",
  v: "b",
  x: "ks",
  z: "s",
};

/**
 * Substitusi fonetis (lihat PHONETIC_FALLBACK) + elisi huruf "h" yang
 * berdiri sendiri tanpa vokal setelahnya. Bagan sumber
 * (data/aksara/aksara_mongondow.json -> structure_notes) secara eksplisit
 * mencatat "Huruf 'h' tidak memiliki bentuk mati pada bagan ini" — jadi "h"
 * yang terdampar di tengah/akhir kata (mis. "Wahyudin") memang tak pernah
 * bisa dipetakan sbg glyph tersendiri. Drpd menggagalkan seluruh kata,
 * huruf itu dihilangkan (mirip pelepasan bunyi "h" jadi lembut/tak
 * terdengar, umum pada banyak bahasa Nusantara) dan kata tetap ditandai
 * "pendekatan fonetis".
 */
function applyPhoneticFallback(clean: string): { text: string; changed: boolean } {
  let changed = false;
  let out = "";
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (ch === "h" && !/[aeiou]/.test(clean[i + 1] || "")) {
      changed = true;
      continue;
    }
    const sub = PHONETIC_FALLBACK[ch];
    if (sub) {
      changed = true;
      out += sub;
    } else {
      out += ch;
    }
  }
  return { text: out, changed };
}

/**
 * Greedy longest-match murni terhadap SYLLABLE_MAP, tanpa substitusi apa
 * pun. Dipakai dua kali oleh segmentWord(): sekali terhadap teks asli
 * (supaya huruf yang MEMANG sudah ada — termasuk 7 huruf baru c/f/j/q/v/x/z
 * begitu sudah digambar & masuk data sumber — selalu diprioritaskan), dan
 * sekali lagi terhadap teks hasil applyPhoneticFallback() sbg jaring
 * pengaman kalau versi asli gagal.
 */
function greedyMatch(text: string): AksaraSyllable[] | null {
  const result: AksaraSyllable[] = [];
  let i = 0;
  while (i < text.length) {
    let matched: AksaraSyllable | null = null;
    const maxLen = Math.min(MAX_TOKEN_LEN, text.length - i);
    for (let len = maxLen; len >= 1; len--) {
      const candidate = text.slice(i, i + len);
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

/**
 * Pecah satu kata (tanpa spasi) menjadi deretan suku kata aksara.
 *
 * Urutan penting: PERTAMA coba cocokkan teks ASLI apa adanya terhadap
 * SYLLABLE_MAP — supaya begitu huruf c/f/j/q/v/x/z (atau huruf baru apa pun
 * ke depannya) sudah benar-benar ada di data sumber, mesin ini otomatis
 * memakainya (bukan malah menyingkirkannya lewat substitusi fonetis lebih
 * dulu, yang akan membuat huruf barunya tak pernah terpakai). BARU kalau
 * versi asli gagal, coba lagi lewat applyPhoneticFallback() (elisi "h" +
 * substitusi huruf yang benar-benar belum ada glyph-nya) sbg jaring
 * pengaman terakhir. Mengembalikan syllables: null kalau kedua jalur gagal.
 */
function segmentWord(word: string): { syllables: AksaraSyllable[] | null; approximated: boolean } {
  // Buang tanda baca, angka, & simbol non-huruf Latin — tidak direpresentasikan
  // sebagai glyph terpisah di bagan aksara ini.
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return { syllables: [], approximated: false };

  const direct = greedyMatch(clean);
  if (direct) return { syllables: direct, approximated: false };

  const { text: substituted, changed } = applyPhoneticFallback(clean);
  if (changed) {
    const fallback = greedyMatch(substituted);
    if (fallback) return { syllables: fallback, approximated: true };
  }

  return { syllables: null, approximated: false };
}

export interface WordTransliteration {
  /** kata asli seperti diketik user (sebelum dibersihkan) */
  original: string;
  /** null jika kata ini gagal disegmentasi (mengandung huruf di luar inventori) */
  syllables: AksaraSyllable[] | null;
  /**
   * true jika hasil ini melewati substitusi fonetis (c/f/j/q/v/x/z -> huruf
   * terdekat) dan/atau elisi huruf "h" — BUKAN ejaan aksara otentik,
   * tampilkan sbg "pendekatan fonetis / belum terverifikasi" di UI.
   */
  approximated: boolean;
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
    const { syllables, approximated } = segmentWord(original);
    return {
      original,
      syllables: syllables && syllables.length > 0 ? syllables : null,
      approximated,
    };
  });

  const successCount = words.filter((w) => w.syllables !== null).length;

  return {
    success: words.length > 0 && successCount === words.length,
    allFailed: words.length > 0 && successCount === 0,
    words,
  };
}
