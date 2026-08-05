/**
 * Normalisasi teks Bahasa Mongondow sebelum diucapkan lewat Web Speech API
 * (SpeechSynthesisUtterance, suara sintetis "id-ID" bawaan browser).
 *
 * PENTING — ini BUKAN solusi fonetik yang sempurna. Web Speech API di browser
 * tidak mendukung SSML <phoneme>, jadi satu-satunya cara mempengaruhi bunyi
 * adalah dengan merespell teks secara tekstual (menambah tanda hubung, koma,
 * dsb.) supaya suara sintetis Indonesia mendekati pelafalan aslinya. Untuk
 * kasus yang butuh presisi penuh — terutama L ganda/geminate ("LLIMA") vs L
 * tunggal ("LIMA") yang dua bunyi berbeda di Bahasa Mongondow — solusi jangka
 * panjang adalah memutar rekaman suara manusia asli dari korpus pelatihan
 * verifikator (tabel voice_training_samples), bukan mengandalkan TTS sintetis.
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

  // 1. Hentian glotal ditulis dengan apostrof (mis. "o'uman", "mo'ompo").
  //    Browser biasanya menelan tanda kutip dan melafalkan dua suku kata itu
  //    menyatu tanpa jeda, padahal di Mongondow itu dua bunyi terpisah.
  //    Ganti dengan koma supaya penyintesis memberi jeda pendek yang lebih
  //    mendekati hentian glotal aslinya, daripada dihilangkan begitu saja.
  text = text.replace(/([A-Za-z])'([A-Za-z])/g, "$1, $2");

  // 2. Konsonan L ganda vs tunggal (contoh nyata dari Boss Bayu: "LLIMA" vs
  //    "LIMA" — dua kata/bunyi berbeda). Suara id-ID melafalkan huruf ganda
  //    persis sama dengan huruf tunggal, jadi perbedaan makna ikut hilang.
  //    Sisipkan tanda hubung di antara huruf L ganda supaya penyintesis
  //    memberi sedikit jeda/penekanan ekstra. Ini pendekatan tekstual approx,
  //    bukan kontrol fonem asli — baru mencakup L karena itu satu-satunya
  //    kasus yang sudah dikonfirmasi; tambahkan konsonan lain di sini kalau
  //    sudah diverifikasi lewat korpus rekaman verifikator.
  text = text.replace(/\b(ll|LL|Ll)(?=[aeiouAEIOU])/g, (m) => `${m[0]}-${m[1]}`);

  for (const [pattern, replacement] of KNOWN_RESPELLINGS) {
    text = text.replace(pattern, replacement);
  }

  return text;
}
