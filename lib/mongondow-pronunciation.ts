/**
 * Normalisasi teks Bahasa Mongondow sebelum diucapkan lewat Web Speech API
 * (SpeechSynthesisUtterance, suara sintetis "id-ID" bawaan browser).
 *
 * PENTING — ini BUKAN solusi fonetik yang sempurna. Web Speech API di browser
 * tidak mendukung SSML <phoneme>, jadi satu-satunya cara mempengaruhi bunyi
 * adalah dengan merespell teks secara tekstual (menambah tanda hubung, koma,
 * dsb.) supaya suara sintetis Indonesia mendekati pelafalan aslinya. Untuk
 * kasus yang butuh presisi penuh — terutama L glotal ("'lima") vs L biasa
 * ("lima") yang dua bunyi berbeda di Bahasa Mongondow — solusi jangka panjang
 * adalah memutar rekaman suara manusia asli dari korpus pelatihan verifikator
 * (tabel voice_training_samples), bukan mengandalkan TTS sintetis.
 *
 * Konvensi penulisan: L glotal ditulis dengan apostrof tepat sebelum huruf L
 * ("'l" / "'L"), bukan huruf L ganda ("LL") — lebih ringkas untuk teks
 * panjang. Contoh: "'lima" (L glotal) vs "lima" (L biasa).
 *
 * Fungsi ini dipakai bersama di semua tempat yang membacakan teks Mongondow:
 * app/kamus/page.tsx (tombol lafal kata), VoiceModeOverlay.tsx (mode suara
 * Bogani AI), dan MyAIChat.tsx (tombol "read aloud" pada balasan chat).
 */

// Nama diri yang sering muncul dan sudah diverifikasi respelling-nya secara
// manual (bukan hasil aturan umum) — tambahkan di sini bila menemukan nama
// lain yang konsisten diucapkan salah oleh suara id-ID.
const KNOWN_RESPELLINGS: [RegExp, string][] = [
  [/\bMongondow\b/gi, "Mong-gon-dow"],
  [/\bBolaang\b/gi, "Bo-la-ang"],
  [/\bBogani\b/gi, "Bo-ga-ni"],
];

export function toSpeakableMongondow(raw: string): string {
  let text = raw;

  // 1. L glotal — ditulis "'l" / "'L" (apostrof tepat sebelum L). Konvensi ini
  //    disepakati Boss Bayu sebagai cara penulisan yang lebih ringkas daripada
  //    L ganda ("LL"), terutama untuk teks panjang. Bunyinya mirip glottalized
  //    L dalam Bahasa Inggris (mis. "bottle") — beda dari L biasa (contoh:
  //    "'lima" vs "lima"). Diproses PALING AWAL, sebelum aturan hentian glotal
  //    umum di bawah, supaya apostrofnya tidak ikut dibaca sebagai koma biasa.
  text = text.replace(/'([lL])/g, (_, l) => `${l}-${l}`);

  // 1b. Kompatibilitas mundur — kalau ada data lama yang masih ditulis dengan
  //     L ganda literal ("LLIMA"), tetap diberi jeda yang sama.
  text = text.replace(/\b(ll|LL|Ll)(?=[aeiouAEIOU])/g, (m) => `${m[0]}-${m[1]}`);

  // 2. Hentian glotal umum ditulis dengan apostrof (mis. "o'uman", "mo'ompo").
  //    Browser biasanya menelan tanda kutip dan melafalkan dua suku kata itu
  //    menyatu tanpa jeda, padahal di Mongondow itu dua bunyi terpisah.
  //    Ganti dengan koma supaya penyintesis memberi jeda pendek yang lebih
  //    mendekati hentian glotal aslinya, daripada dihilangkan begitu saja.
  text = text.replace(/([A-Za-z])'([A-Za-z])/g, "$1, $2");

  for (const [pattern, replacement] of KNOWN_RESPELLINGS) {
    text = text.replace(pattern, replacement);
  }

  return text;
}
