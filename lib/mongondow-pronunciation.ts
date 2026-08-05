/**
 * Normalisasi teks Bahasa Mongondow sebelum diucapkan lewat Web Speech API
 * (SpeechSynthesisUtterance, suara sintetis "id-ID" bawaan browser).
 *
 * PENTING — ini BUKAN solusi fonetik yang sempurna. Web Speech API di browser
 * tidak mendukung SSML <phoneme>, jadi satu-satunya cara mempengaruhi bunyi
 * adalah dengan merespell teks secara tekstual (menambah tanda hubung, koma,
 * dsb.) supaya suara sintetis Indonesia mendekati pelafalan aslinya. Untuk
 * kasus yang butuh presisi penuh — terutama L glotal ("akaḷ") vs L biasa
 * ("akal") yang dua bunyi berbeda di Bahasa Mongondow — solusi jangka panjang
 * adalah memutar rekaman suara manusia asli dari korpus pelatihan verifikator
 * (tabel voice_training_samples), bukan mengandalkan TTS sintetis.
 *
 * Konvensi penulisan L glotal di data Kamus (kamus_entries) TERNYATA
 * didominasi huruf "ḷ" (L bergaris-bawah, U+1E37) — dicek langsung ke DB:
 * 1.270 kata memakai "ḷ", sedangkan konvensi apostrof "'l"/"'L" yang tadinya
 * satu-satunya jalur yang ditangani di sini cuma dipakai 7 kata. Artinya versi
 * sebelumnya nyaris tidak pernah kena utk L glotal di kata Kamus sungguhan —
 * ini penyebab utama pelafalan "kaku"/salah yang dilaporkan. Kedua konvensi
 * ("ḷ" dan "'l") sekarang ditangani.
 *
 * Fungsi ini dipakai bersama di semua tempat yang membacakan teks Mongondow:
 * app/kamus/page.tsx (tombol lafal kata), VoiceModeOverlay.tsx (mode suara
 * Bogani AI), MyAIChat.tsx (tombol "read aloud" pada balasan chat), dan
 * components/AksaraMongondow.tsx (kartu suku kata & hasil transliterasi).
 */

// Nama diri yang sering muncul dan sudah diverifikasi respelling-nya secara
// manual (bukan hasil aturan umum) — tambahkan di sini bila menemukan nama
// lain yang konsisten diucapkan salah oleh suara id-ID.
const KNOWN_RESPELLINGS: [RegExp, string][] = [
  [/\bMongondow\b/gi, "Mong-gon-dow"],
  [/\bBolaang\b/gi, "Bo-la-ang"],
  [/\bBogani\b/gi, "Bo-ga-ni"],
  [/\bTotabuan\b/gi, "To-ta-bu-an"],
  [/\bMokodompis\b/gi, "Mo-ko-dom-pis"],
  [/\bMokoagow\b/gi, "Mo-ko-a-gow"],
  [/\bLoloda\b/gi, "Lo-lo-da"],
  [/\bBinangkang\b/gi, "Bi-nang-kang"],
  [/\bInaton\b/gi, "I-na-ton"],
  [/\bModayag\b/gi, "Mo-da-yag"],
  [/\bBiontu\b/gi, "Bi-on-tu"],
];

export function toSpeakableMongondow(raw: string): string {
  let text = raw;

  // 0. L glotal, konvensi utama: huruf "ḷ" (U+1E37, L bergaris-bawah) —
  //    ini yang dipakai 1.270 kata di data Kamus, jauh lebih umum drpd
  //    konvensi apostrof di bawah. Terkadang muncul didahului apostrof
  //    pemisah suku kata (mis. "'ḷagidon"), lebih sering berdiri sendiri di
  //    tengah/akhir kata (mis. "akaḷ", "asaḷ-usuḷ"). Diproses PALING AWAL —
  //    "ḷ" bukan huruf Latin biasa, kalau dibiarkan browser id-ID cenderung
  //    menelannya begitu saja (konsonan L hilang total dari ucapan), bukan
  //    sekadar salah bunyi. Diganti huruf L ganda + tanda hubung (sama spt
  //    trik glotal di bawah) supaya penyintesis melafalkan dgn penekanan.
  text = text.replace(/'?[ḷḶ]/g, "l-l");

  // 1. L glotal, konvensi cadangan: apostrof tepat sebelum L ("'l" / "'L") —
  //    dipakai sebagian kecil data lama/manual. Bunyinya mirip glottalized L
  //    dalam Bahasa Inggris (mis. "bottle") — beda dari L biasa. Diproses
  //    sebelum aturan hentian glotal umum di bawah, supaya apostrofnya tidak
  //    ikut dibaca sebagai koma biasa.
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
