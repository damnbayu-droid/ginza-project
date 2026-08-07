/**
 * mongondow-vocab.ts
 * Kosakata Bahasa Mongondow ✔ (terverifikasi dari sumber tertulis) untuk
 * memperkaya grounding percakapan Bogani AI -- terpisah dari
 * lib/kamus-parser.ts#getFeaturedSiderCards() (6 kartu UI publik dengan
 * quote/emoji/aksara) karena keperluannya beda: di sini murni untuk
 * disisipkan ke context chat (lib/homepage/chat/route.ts), bukan tampilan.
 *
 * Sumber: Kamus Bogani — Indonesia / Manado / Mongondow (Ray Daapala
 * "Mengenal Bahasa Mongondow", kumpulan peribahasa Dunnebier 1929, Kamus
 * Bahasa Mongondow bolmong.pikiran-rakyat.com). Hanya entri bertanda ✔ yang
 * dimasukkan -- kata bertanda ~ atau ⬜ di sumber SENGAJA tidak disertakan
 * di sini supaya Bogani AI tidak pernah pakai bentuk yang belum terverifikasi
 * dengan percaya diri.
 */

export interface MongondowWord {
  mongondow: string;
  meaning: string;
  example?: string;
  category: string;
}

export const MONGONDOW_VERIFIED_WORDS: MongondowWord[] = [
  // Salam & Sapaan
  { mongondow: "Sukur moanto'", meaning: "terima kasih", category: "salam" },
  { mongondow: "utat", meaning: "saudara (sapaan akrab)", category: "salam" },
  { mongondow: "Singog pa kon na'a", meaning: "mari bicara di sini", category: "salam" },
  { mongondow: "na'onda", meaning: "bagaimana", category: "salam" },

  // Kata Ganti
  { mongondow: "aku'oy", meaning: "saya / aku", category: "kata_ganti" },
  { mongondow: "ikow", meaning: "kamu / engkau", category: "kata_ganti" },
  { mongondow: "sia", meaning: "dia", category: "kata_ganti" },
  { mongondow: "kami", meaning: "kami (eksklusif)", category: "kata_ganti" },
  { mongondow: "kita", meaning: "kita (inklusif)", category: "kata_ganti" },
  { mongondow: "moikow", meaning: "kalian", category: "kata_ganti" },
  { mongondow: "mosia", meaning: "mereka", category: "kata_ganti" },

  // Keluarga & Orang
  { mongondow: "intaw / intau", meaning: "orang / manusia", category: "keluarga" },
  { mongondow: "olaki", meaning: "laki-laki", category: "keluarga" },
  { mongondow: "bobay", meaning: "perempuan", category: "keluarga" },
  { mongondow: "adi'", meaning: "anak", category: "keluarga" },
  { mongondow: "mongoadi'", meaning: "anak-anak", category: "keluarga" },
  { mongondow: "guyanga / guranga", meaning: "orang tua", category: "keluarga" },
  { mongondow: "mogoguyang", meaning: "leluhur", category: "keluarga" },

  // Rumah & Benda
  { mongondow: "baloy", meaning: "rumah", example: "baloy in intaw = rumah orang", category: "rumah" },
  { mongondow: "lipu'", meaning: "kampung / desa / negeri", category: "rumah" },
  { mongondow: "goba'", meaning: "kebun", category: "rumah" },
  { mongondow: "kurung", meaning: "kandang", category: "rumah" },
  { mongondow: "sosimpat", meaning: "sapu", category: "rumah" },

  // Makanan & Alam
  { mongondow: "tubig", meaning: "air", category: "alam" },
  { mongondow: "ka'anon", meaning: "makanan", category: "alam" },
  { mongondow: "toigu", meaning: "jagung", category: "alam" },
  { mongondow: "payoi", meaning: "padi", category: "alam" },
  { mongondow: "tompot", meaning: "angin", category: "alam" },
  { mongondow: "bulan", meaning: "bulan", category: "alam" },
  { mongondow: "singgay / singgai", meaning: "hari", category: "alam" },
  { mongondow: "gobii", meaning: "malam", category: "alam" },

  // Hewan
  { mongondow: "manuk", meaning: "ayam", category: "hewan" },
  { mongondow: "bembe'", meaning: "kambing", category: "hewan" },
  { mongondow: "boke'", meaning: "babi", category: "hewan" },
  { mongondow: "kabalo", meaning: "kuda", category: "hewan" },
  { mongondow: "bolay", meaning: "monyet", category: "hewan" },
  { mongondow: "toyom", meaning: "semut", category: "hewan" },

  // Kata Kerja
  { mongondow: "monga'an", meaning: "sedang/akan makan", example: "akar: ka'an", category: "kata_kerja" },
  { mongondow: "maya'", meaning: "pergi", example: "minaya' = sudah pergi", category: "kata_kerja" },
  { mongondow: "mogutun", meaning: "tinggal / menetap", example: "nogutun kon Monadow = tinggal di Manado", category: "kata_kerja" },
  { mongondow: "motalui", meaning: "membeli", category: "kata_kerja" },
  { mongondow: "potalui", meaning: "menjual", category: "kata_kerja" },
  { mongondow: "mongabang", meaning: "membantu", category: "kata_kerja" },
  { mongondow: "singog / mosingog", meaning: "berbicara", category: "kata_kerja" },
  { mongondow: "dongog", meaning: "mendengar", example: "indongogan = sedang didengar", category: "kata_kerja" },
  { mongondow: "motaaw", meaning: "tahu", example: "kota'awan = diketahui", category: "kata_kerja" },
  { mongondow: "mo'ibog", meaning: "ingin / suka", example: "koibogku = keinginanku", category: "kata_kerja" },

  // Kata Sifat
  { mongondow: "mopia", meaning: "baik", example: "varian: mopira / mopiya", category: "kata_sifat" },
  { mongondow: "mointok", meaning: "kecil", example: "varian: moyintok", category: "kata_sifat" },
  { mongondow: "molantud", meaning: "tinggi", category: "kata_sifat" },
  { mongondow: "motoyong", meaning: "cepat", category: "kata_sifat" },
  { mongondow: "mo'onggot", meaning: "lambat", category: "kata_sifat" },
  { mongondow: "moropot", meaning: "kuat / kokoh", category: "kata_sifat" },
  { mongondow: "guyang", meaning: "tua", category: "kata_sifat" },
  { mongondow: "mosusa", meaning: "susah", category: "kata_sifat" },
  { mongondow: "topilik", meaning: "sedikit", category: "kata_sifat" },

  // Kata Tanya
  { mongondow: "ki ine?", meaning: "siapa?", category: "kata_tanya" },
  { mongondow: "onu?", meaning: "apa?", category: "kata_tanya" },
  { mongondow: "onda? / kon onda?", meaning: "mana? / di mana?", category: "kata_tanya" },
  { mongondow: "Maya' in onda?", meaning: "mau ke mana?", category: "kata_tanya" },
  { mongondow: "na'onda?", meaning: "bagaimana?", category: "kata_tanya" },
  { mongondow: "to'onu?", meaning: "kapan?", category: "kata_tanya" },
  { mongondow: "tongonu?", meaning: "berapa?", category: "kata_tanya" },
  { mongondow: "mongonu?", meaning: "mau apa? / ngapain?", category: "kata_tanya" },
  { mongondow: "nongonu?", meaning: "kenapa? ada apa?", category: "kata_tanya" },
  { mongondow: "pongonu?", meaning: "untuk apa?", category: "kata_tanya" },

  // Partikel & Penghubung
  { mongondow: "-pa", meaning: "masih, dulu (enklitika)", example: "monga'an-pa = masih makan", category: "partikel" },
  { mongondow: "-don", meaning: "saja, sudah (enklitika)", example: "aindon minaya' = sudah pergi", category: "partikel" },
  { mongondow: "-doman", meaning: "juga (enklitika)", category: "partikel" },
  { mongondow: "bo", meaning: "dan / lalu", category: "partikel" },
  { mongondow: "dia' / jia'", meaning: "tidak", category: "partikel" },
  { mongondow: "na'a", meaning: "ini (dekat penutur)", category: "partikel" },
  { mongondow: "nion", meaning: "itu (dekat lawan bicara)", category: "partikel" },
  { mongondow: "tua", meaning: "itu (jauh dari keduanya)", category: "partikel" },

  // Percakapan sehari-hari
  { mongondow: "monga'an-pa", meaning: "masih makan", category: "percakapan" },
  { mongondow: "aindon minaya'", meaning: "sudah pergi", category: "percakapan" },
  { mongondow: "dongka' topilik", meaning: "tinggal sedikit", category: "percakapan" },

  // Peribahasa (nilai tinggi utk narasi otentik)
  { mongondow: "Mo'ibog i motoyong, mobali' mo'onggot", meaning: "niat ingin cepat, malah lambat terlaksana", category: "peribahasa" },
  { mongondow: "Kayu molantud motoyong motual", meaning: "pohon yang tinggi cepat terjungkal", category: "peribahasa" },
  { mongondow: "Intaw mokaluku' motoyong mobodito", meaning: "orang sombong cepat celaka", category: "peribahasa" },
  { mongondow: "Na'-don kabalo nokoluay kong kurung", meaning: "bagaikan kuda lepas dari kandang", category: "peribahasa" },

  // Istilah budaya
  { mongondow: "bogani", meaning: "pemimpin masyarakat Mongondow yang berani, bijak & jujur", category: "budaya" },
  { mongondow: "lipu' totabuan", meaning: "kampung pesisir yang didirikan komunitas Mongondow dari pedalaman", category: "budaya" },
  { mongondow: "paloko'", meaning: "rakyat (lawan dari kinalang = pemerintahan)", category: "budaya" },
  { mongondow: "momondow", meaning: "seruan tanda kemenangan — asal nama Mongondow", category: "budaya" },
  { mongondow: "bolango / balangon", meaning: "laut — asal nama Bolaang", category: "budaya" },
];

/**
 * Subset kecil yang selalu aman disisipkan (sapaan, ekspresi khas) --
 * konsisten dgn pola getFeaturedManadoPhrases() di lib/manado-vocab.ts.
 */
const ALWAYS_SAFE_CATEGORIES = new Set(["salam", "kata_ganti"]);

export function getFeaturedMongondowWords(): MongondowWord[] {
  return MONGONDOW_VERIFIED_WORDS.filter((w) => ALWAYS_SAFE_CATEGORIES.has(w.category)).slice(0, 8);
}

/**
 * Cari kata Mongondow ✔ yang relevan dengan pesan pengguna (match ke field
 * `meaning`, karena itu representasi Bahasa Indonesia-nya) -- pencocokan
 * substring sederhana, konsisten dgn gaya file lain di proyek ini.
 */
export function searchMongondowVerifiedWords(userPrompt: string, limit = 10): MongondowWord[] {
  const lower = userPrompt.toLowerCase();
  const tokens = lower.split(/[^a-zA-Z'-]+/).filter((t) => t.length >= 3);
  if (tokens.length === 0) return [];

  const matched: MongondowWord[] = [];
  const seen = new Set<string>();

  for (const w of MONGONDOW_VERIFIED_WORDS) {
    const meaningLower = w.meaning.toLowerCase();
    const isMatch = tokens.some((t) => meaningLower.includes(t) || t.includes(meaningLower));
    if (isMatch && !seen.has(w.mongondow)) {
      matched.push(w);
      seen.add(w.mongondow);
      if (matched.length >= limit) break;
    }
  }
  return matched;
}
