/**
 * manado-vocab.ts
 * Kosakata Bahasa Manado (Melayu Manado) terkurasi, dipasangkan dengan
 * padanan Bahasa Mongondow terverifikasi (✔) kalau ada -- dipakai Bogani AI
 * untuk menyisipkan kosakata Manado/Mongondow yang OTENTIK (bukan karangan)
 * ke percakapan sehari-hari, mendampingi lib/kamus-parser.ts yang selama ini
 * hanya menangani sisi Mongondow.
 *
 * Sumber: Kamus Bogani — Indonesia / Manado / Mongondow (disusun Boss Bayu
 * dari Ray Daapala "Mengenal Bahasa Mongondow", kumpulan peribahasa Dunnebier
 * 1929, dan Kamus Bahasa Mongondow bolmong.pikiran-rakyat.com). Manado tidak
 * diberi tanda ✔/~/⬜ seperti Mongondow karena bukan bahasa berisiko punah --
 * sudah lazim dipakai luas & terdokumentasi baik, jadi dianggap aman dipakai
 * langsung.
 */

export interface ManadoPhrase {
  indonesia: string;
  manado: string;
  /** Padanan Mongondow ✔ (sudah terverifikasi) kalau ada -- null kalau belum ada data. */
  mongondow: string | null;
  category: string;
}

const MANADO_PHRASES: ManadoPhrase[] = [
  // Salam & Sapaan
  { indonesia: "halo", manado: "Halo / Hoi", mongondow: null, category: "salam" },
  { indonesia: "selamat pagi", manado: "Salamat pagi", mongondow: null, category: "salam" },
  { indonesia: "apa kabar", manado: "Bagimana kabar? / Karmana?", mongondow: null, category: "salam" },
  { indonesia: "terima kasih", manado: "Makase / Makase banya", mongondow: "Sukur moanto'", category: "salam" },
  { indonesia: "saudara", manado: "Torang pe sudara", mongondow: "utat", category: "salam" },
  { indonesia: "mari bicara", manado: "Mari bacirita di sini", mongondow: "Singog pa kon na'a", category: "salam" },

  // Kata Ganti
  { indonesia: "saya", manado: "kita", mongondow: "aku'oy", category: "kata_ganti" },
  { indonesia: "kamu", manado: "ngana", mongondow: "ikow", category: "kata_ganti" },
  { indonesia: "dia", manado: "dia", mongondow: "sia", category: "kata_ganti" },
  { indonesia: "kami", manado: "torang", mongondow: "kami", category: "kata_ganti" },
  { indonesia: "kita (inklusif)", manado: "torang", mongondow: "kita", category: "kata_ganti" },
  { indonesia: "kalian", manado: "ngoni / kamorang", mongondow: "moikow", category: "kata_ganti" },
  { indonesia: "mereka", manado: "dorang", mongondow: "mosia", category: "kata_ganti" },

  // Keluarga & Orang
  { indonesia: "orang", manado: "orang", mongondow: "intaw / intau", category: "keluarga" },
  { indonesia: "laki-laki", manado: "laki-laki", mongondow: "olaki", category: "keluarga" },
  { indonesia: "perempuan", manado: "parampuang", mongondow: "bobay", category: "keluarga" },
  { indonesia: "anak", manado: "anak", mongondow: "adi'", category: "keluarga" },
  { indonesia: "orang tua", manado: "orang tua", mongondow: "guyanga / guranga", category: "keluarga" },
  { indonesia: "saudara", manado: "sudara", mongondow: "utat", category: "keluarga" },
  { indonesia: "papa", manado: "papa", mongondow: null, category: "keluarga" },
  { indonesia: "mama", manado: "mama", mongondow: null, category: "keluarga" },
  { indonesia: "kakak", manado: "kaka", mongondow: null, category: "keluarga" },
  { indonesia: "adik", manado: "ade", mongondow: null, category: "keluarga" },
  { indonesia: "kakek", manado: "opa / tete", mongondow: null, category: "keluarga" },
  { indonesia: "nenek", manado: "oma / nene", mongondow: null, category: "keluarga" },

  // Rumah & Benda
  { indonesia: "rumah", manado: "ruma", mongondow: "baloy", category: "rumah" },
  { indonesia: "kampung", manado: "kampung", mongondow: "lipu'", category: "rumah" },
  { indonesia: "kebun", manado: "kobong", mongondow: "goba'", category: "rumah" },
  { indonesia: "batu", manado: "batu", mongondow: "batu", category: "rumah" },
  { indonesia: "kayu", manado: "kayu", mongondow: "kayu", category: "rumah" },

  // Makanan & Alam
  { indonesia: "air", manado: "aer", mongondow: "tubig", category: "alam" },
  { indonesia: "makanan", manado: "makanang", mongondow: "ka'anon", category: "alam" },
  { indonesia: "jagung", manado: "milu", mongondow: "toigu", category: "alam" },
  { indonesia: "padi", manado: "padi", mongondow: "payoi", category: "alam" },
  { indonesia: "gula", manado: "gula", mongondow: "gula", category: "alam" },
  { indonesia: "angin", manado: "angin", mongondow: "tompot", category: "alam" },
  { indonesia: "bulan", manado: "bulang", mongondow: "bulan", category: "alam" },
  { indonesia: "hari", manado: "hari", mongondow: "singgay / singgai", category: "alam" },
  { indonesia: "malam", manado: "malam", mongondow: "gobii", category: "alam" },
  { indonesia: "nasi", manado: "nasi", mongondow: null, category: "alam" },
  { indonesia: "ikan", manado: "ikang", mongondow: null, category: "alam" },
  { indonesia: "sayur", manado: "sayor", mongondow: null, category: "alam" },
  { indonesia: "cabe", manado: "rica", mongondow: null, category: "alam" },
  { indonesia: "garam", manado: "garang", mongondow: null, category: "alam" },

  // Hewan
  { indonesia: "ayam", manado: "ayam", mongondow: "manuk", category: "hewan" },
  { indonesia: "kambing", manado: "kambing", mongondow: "bembe'", category: "hewan" },
  { indonesia: "babi", manado: "babi", mongondow: "boke'", category: "hewan" },
  { indonesia: "kuda", manado: "kuda", mongondow: "kabalo", category: "hewan" },
  { indonesia: "monyet", manado: "monyet / yaki", mongondow: "bolay", category: "hewan" },
  { indonesia: "anjing", manado: "anjing", mongondow: null, category: "hewan" },
  { indonesia: "kucing", manado: "kucing", mongondow: null, category: "hewan" },
  { indonesia: "burung", manado: "burung", mongondow: null, category: "hewan" },

  // Kata Kerja
  { indonesia: "makan", manado: "makang", mongondow: "monga'an (sedang/akan makan)", category: "kata_kerja" },
  { indonesia: "pergi", manado: "pigi", mongondow: "maya' / minaya' (sudah pergi)", category: "kata_kerja" },
  { indonesia: "tinggal / menetap", manado: "tinggal", mongondow: "mogutun", category: "kata_kerja" },
  { indonesia: "membeli / beli", manado: "bili", mongondow: "motalui", category: "kata_kerja" },
  { indonesia: "menjual / jual", manado: "jual", mongondow: "potalui", category: "kata_kerja" },
  { indonesia: "membantu / bantu", manado: "bantu / baku bantu", mongondow: "mongabang", category: "kata_kerja" },
  { indonesia: "mencuri", manado: "mancuri", mongondow: "takow", category: "kata_kerja" },
  { indonesia: "menanam / tanam", manado: "tanam", mongondow: "mula", category: "kata_kerja" },
  { indonesia: "berbicara", manado: "bacirita / babilang", mongondow: "singog / mosingog", category: "kata_kerja" },
  { indonesia: "mendengar / dengar", manado: "dengar", mongondow: "dongog", category: "kata_kerja" },
  { indonesia: "tahu / tau", manado: "tau", mongondow: "motaaw", category: "kata_kerja" },
  { indonesia: "ingin / suka", manado: "mo / suka", mongondow: "mo'ibog", category: "kata_kerja" },
  { indonesia: "minum", manado: "minum", mongondow: null, category: "kata_kerja" },
  { indonesia: "tidur", manado: "tidor", mongondow: null, category: "kata_kerja" },
  { indonesia: "duduk", manado: "dudu", mongondow: null, category: "kata_kerja" },
  { indonesia: "berdiri", manado: "badiri", mongondow: null, category: "kata_kerja" },
  { indonesia: "lari", manado: "balari", mongondow: null, category: "kata_kerja" },
  { indonesia: "jalan", manado: "bajalang", mongondow: null, category: "kata_kerja" },
  { indonesia: "melihat / lihat", manado: "lia", mongondow: null, category: "kata_kerja" },
  { indonesia: "mengambil / ambil", manado: "ambe", mongondow: null, category: "kata_kerja" },
  { indonesia: "memberi / kasih", manado: "kase", mongondow: null, category: "kata_kerja" },
  { indonesia: "memasak", manado: "bamasa", mongondow: null, category: "kata_kerja" },
  { indonesia: "mencuci", manado: "bacuci", mongondow: null, category: "kata_kerja" },

  // Kata Sifat
  { indonesia: "baik / bagus", manado: "bae", mongondow: "mopia", category: "kata_sifat" },
  { indonesia: "kecil", manado: "kacili", mongondow: "mointok", category: "kata_sifat" },
  { indonesia: "tinggi", manado: "tinggi", mongondow: "molantud", category: "kata_sifat" },
  { indonesia: "cepat", manado: "capat", mongondow: "motoyong", category: "kata_sifat" },
  { indonesia: "lambat", manado: "lamba", mongondow: "mo'onggot", category: "kata_sifat" },
  { indonesia: "kuat", manado: "kuat", mongondow: "moropot", category: "kata_sifat" },
  { indonesia: "tua", manado: "tua", mongondow: "guyang", category: "kata_sifat" },
  { indonesia: "sombong", manado: "sombong", mongondow: "mokaluku'", category: "kata_sifat" },
  { indonesia: "susah", manado: "susa", mongondow: "mosusa", category: "kata_sifat" },
  { indonesia: "sedikit", manado: "sadiki", mongondow: "topilik", category: "kata_sifat" },
  { indonesia: "besar", manado: "basar", mongondow: null, category: "kata_sifat" },
  { indonesia: "panas", manado: "panas", mongondow: null, category: "kata_sifat" },
  { indonesia: "dingin", manado: "dingin", mongondow: null, category: "kata_sifat" },
  { indonesia: "cantik", manado: "cantik / manis", mongondow: null, category: "kata_sifat" },
  { indonesia: "tampan / ganteng", manado: "ganteng", mongondow: null, category: "kata_sifat" },

  // Kata Tanya
  { indonesia: "siapa", manado: "sapa?", mongondow: "ki ine?", category: "kata_tanya" },
  { indonesia: "apa", manado: "apa?", mongondow: "onu?", category: "kata_tanya" },
  { indonesia: "mana / di mana", manado: "mana? / di mana?", mongondow: "onda? / kon onda?", category: "kata_tanya" },
  { indonesia: "mau ke mana", manado: "mo pi mana?", mongondow: "Maya' in onda?", category: "kata_tanya" },
  { indonesia: "bagaimana", manado: "bagimana? / karmana?", mongondow: "na'onda?", category: "kata_tanya" },
  { indonesia: "kapan", manado: "kapang?", mongondow: "to'onu?", category: "kata_tanya" },
  { indonesia: "berapa", manado: "barapa?", mongondow: "tongonu?", category: "kata_tanya" },
  { indonesia: "kenapa", manado: "kiapa?", mongondow: "nongonu?", category: "kata_tanya" },

  // Percakapan sehari-hari
  { indonesia: "saya mau makan", manado: "Kita mo makang", mongondow: "Aku'oy monga'an (perlu konfirmasi)", category: "percakapan" },
  { indonesia: "sudah makan", manado: "So makang?", mongondow: null, category: "percakapan" },
  { indonesia: "masih makan", manado: "Masi makang", mongondow: "monga'an-pa", category: "percakapan" },
  { indonesia: "sudah pergi", manado: "So pigi", mongondow: "aindon minaya'", category: "percakapan" },
  { indonesia: "tinggal sedikit", manado: "Tinggal sadiki", mongondow: "dongka' topilik", category: "percakapan" },
  { indonesia: "saya pulang dulu", manado: "Kita pulang dulu no", mongondow: null, category: "percakapan" },
  { indonesia: "tolong", manado: "Tolong", mongondow: null, category: "percakapan" },
  { indonesia: "maaf / sori", manado: "Maaf / sori", mongondow: null, category: "percakapan" },
  { indonesia: "tidak apa-apa", manado: "Nyanda apa-apa", mongondow: null, category: "percakapan" },
  { indonesia: "sampai jumpa", manado: "Sampe ketemu", mongondow: null, category: "percakapan" },
  { indonesia: "mantap / keren", manado: "Mantap / Bagimana kwa", mongondow: null, category: "percakapan" },
  { indonesia: "tidak / tidak mau", manado: "nyanda / kwa", mongondow: "dia' / jia'", category: "percakapan" },
];

/**
 * Subset kecil yang selalu aman disisipkan (sapaan, ekspresi khas) --
 * dipakai sbg "starter flavor" walau kata dari pesan pengguna tidak
 * cocok dengan entri manapun di atas.
 */
const ALWAYS_SAFE_CATEGORIES = new Set(["salam", "kata_ganti"]);

export function getFeaturedManadoPhrases(): ManadoPhrase[] {
  return MANADO_PHRASES.filter((p) => ALWAYS_SAFE_CATEGORIES.has(p.category)).slice(0, 8);
}

/**
 * Cari frasa Manado yang relevan dengan kata/topik di pesan pengguna --
 * pencocokan substring sederhana (bukan embedding), konsisten dgn gaya
 * lib/kamus-parser.ts / lib/knowledge-retrieval.ts di proyek ini.
 */
export function searchManadoPhrases(userPrompt: string, limit = 8): ManadoPhrase[] {
  const lower = userPrompt.toLowerCase();
  const tokens = lower.split(/[^a-zA-Z'-]+/).filter((t) => t.length >= 3);
  if (tokens.length === 0) return [];

  const matched: ManadoPhrase[] = [];
  const seen = new Set<string>();

  for (const phrase of MANADO_PHRASES) {
    const indoLower = phrase.indonesia.toLowerCase();
    const isMatch = tokens.some((t) => indoLower.includes(t) || t.includes(indoLower));
    if (isMatch && !seen.has(phrase.indonesia)) {
      matched.push(phrase);
      seen.add(phrase.indonesia);
      if (matched.length >= limit) break;
    }
  }
  return matched;
}
