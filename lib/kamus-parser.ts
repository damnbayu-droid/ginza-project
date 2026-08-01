import fs from "fs";
import path from "path";

export interface KamusEntry {
  word: string;
  firstLetter: string;
  sourceFile: string;
}

export interface SiderWordCard {
  word: string;
  phonetic: string;
  origin: string;
  meaning: string;
  example: string;
  aksara: string;
  quote: string;
  emoji: string;
  tag?: string;
}

export interface KamusStats {
  totalWords: number;
  totalFiles: number;
  filesList: string[];
  alphabetCounts: Record<string, number>;
}

let cachedEntries: KamusEntry[] | null = null;
let cachedStats: KamusStats | null = null;

function getKamusDirectories(): string[] {
  const rootDir = process.cwd();
  return [
    path.join(rootDir, "kamus"),
    path.join(rootDir, "data", "kamus"),
  ].filter(dir => fs.existsSync(dir));
}

/**
 * Scan all .md files in kamus directories and parse vocabulary words
 */
export function getIndexedKamusEntries(forceRefresh = false): KamusEntry[] {
  if (cachedEntries && !forceRefresh) {
    return cachedEntries;
  }

  const entriesMap = new Map<string, KamusEntry>();
  const dirs = getKamusDirectories();

  for (const dir of dirs) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".md") && !f.toLowerCase().includes("readme"));
    
    for (const fileName of files) {
      const filePath = path.join(dir, fileName);
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        
        // Extract raw words/tokens
        const rawTokens = content
          .replace(/```[\s\S]*?```/g, "") // remove code blocks
          .replace(/#+/g, " ") // remove headers
          .replace(/['’]/g, "'") // normalize apostrophe
          .split(/[\s,\n\r\t]+/);

        for (let token of rawTokens) {
          let cleaned = token.replace(/^[^\w\u00C0-\u024F'’ḷḷááííúúóó]+|[^\w\u00C0-\u024F'’ḷḷááííúúóó]+$/g, "").trim();
          
          if (cleaned.length >= 2 && !/^\d+$/.test(cleaned)) {
            const wordKey = cleaned.toLowerCase();
            if (!entriesMap.has(wordKey)) {
              let firstChar = cleaned[0].toUpperCase();
              if (!/[A-Z]/.test(firstChar)) {
                firstChar = "#";
              }
              entriesMap.set(wordKey, {
                word: cleaned,
                firstLetter: firstChar,
                sourceFile: fileName,
              });
            }
          }
        }
      } catch (err) {
        console.warn(`[kamus-parser] Failed reading file ${fileName}:`, err);
      }
    }
  }

  const result = Array.from(entriesMap.values()).sort((a, b) => 
    a.word.localeCompare(b.word, "id", { sensitivity: "base" })
  );

  cachedEntries = result;
  return result;
}

/**
 * Curated Sider-style Featured Word Cards for Kamus Mongondow
 */
export function getFeaturedSiderCards(): SiderWordCard[] {
  return [
    {
      word: "Bogani",
      phonetic: "/bo-ga-ni/",
      origin: "Dari kata Mongondow kuno: Pahlawan, pelindung, & pemimpin rakyat.",
      meaning: "Sosok ksatria atau patriot pemberani yang menjadi pelindung masyarakat Bolaang Mongondow.",
      example: "Bogani Mokoagow — Pemimpin bijak nan pemberani.",
      aksara: "bo-ga-ni",
      quote: "Bogani adalah keberanian untuk melindungi, kejujuran untuk memimpin, dan kearifan bagi sesama.",
      emoji: "🛡️",
      tag: "Sejarah & Nilai"
    },
    {
      word: "Totabuan",
      phonetic: "/to-ta-bu-an/",
      origin: "Dari kata dasar 'tabu' (tempat berhimpun / tanah leluhur).",
      meaning: "Tanah kelahiran, tumpah darah, dan wilayah tempat tinggal adat Mongondow.",
      example: "Lipu' nami Totabuan — Negeri tempat kami bertumpah darah.",
      aksara: "to-ta-bu-a-n",
      quote: "Totabuan adalah hangatnya rumah leluhur, kebanggaan identitas, dan ruang berbakti.",
      emoji: "⛰️",
      tag: "Geografi & Budaya"
    },
    {
      word: "Arai",
      phonetic: "/a-ra-i/",
      origin: "Kosa kata Mongondow untuk perasaan dan suasana hati.",
      meaning: "Hati, perasaan, rasa gembira, atau kondisi kedamaian batin.",
      example: "Mona'ang in arai — Membuka isi hati dengan ketulusan.",
      aksara: "a-ra-i",
      quote: "Arai yang tulus adalah cermin dari kedamaian tutur kata dan tindakan.",
      emoji: "💖",
      tag: "Rasa & Filosofi"
    },
    {
      word: "Biontu",
      phonetic: "/bi-on-tu/",
      origin: "Istilah pertemanan dan kekerabatan erat Mongondow.",
      meaning: "Sahabat sejati, kawan dekat, atau kawan seperjuangan.",
      example: "Kompag in biontu — Berjalan berdampingan bersama sahabat.",
      aksara: "bi-o-n-tu",
      quote: "Biontu sejati adalah yang berdiri kokoh di sampingmu dalam suka dan duka.",
      emoji: "🤝",
      tag: "Hubungan & Komunitas"
    },
    {
      word: "Inaton",
      phonetic: "/i-na-to-n/",
      origin: "Kata pengingat nilai kebersamaan dan warisan leluhur.",
      meaning: "Warisan, pusaka, atau kebiasaan luhur yang diturunkan antar generasi.",
      example: "Po'osain inaton — Memelihara warisan kearifan leluhur.",
      aksara: "i-na-to-n",
      quote: "Inaton mewariskan cahaya kearifan masa lalu untuk menuntun masa depan.",
      emoji: "📜",
      tag: "Pusaka & Edukasi"
    },
    {
      word: "Modayag",
      phonetic: "/mo-da-ya-g/",
      origin: "Kosa kata sifat untuk kondisi terang dan penuh harapan.",
      meaning: "Bercahaya, terang benderang, berkembang pesat, atau sukses.",
      example: "Laju modayag — Masa depan yang terang dan cerah.",
      aksara: "mo-da-ya-g",
      quote: "Modayag melambangkan harapan yang senantiasa memancar melintasi tantangan.",
      emoji: "✨",
      tag: "Doa & Harapan"
    }
  ];
}

/**
 * Get summary stats of indexed dictionary
 */
export function getKamusStats(forceRefresh = false): KamusStats {
  if (cachedStats && !forceRefresh) {
    return cachedStats;
  }

  const entries = getIndexedKamusEntries(forceRefresh);
  const dirs = getKamusDirectories();
  const fileNamesSet = new Set<string>();
  const alphabetCounts: Record<string, number> = {};

  for (const dir of dirs) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".md") && !f.toLowerCase().includes("readme"));
    files.forEach(f => fileNamesSet.add(f));
  }

  for (const entry of entries) {
    alphabetCounts[entry.firstLetter] = (alphabetCounts[entry.firstLetter] || 0) + 1;
  }

  const stats: KamusStats = {
    totalWords: entries.length,
    totalFiles: fileNamesSet.size,
    filesList: Array.from(fileNamesSet),
    alphabetCounts,
  };

  cachedStats = stats;
  return stats;
}

/**
 * Search kamus entries by query and letter
 */
export function searchKamusEntries(options: {
  query?: string;
  letter?: string;
  page?: number;
  limit?: number;
}): {
  items: KamusEntry[];
  total: number;
  page: number;
  totalPages: number;
} {
  const entries = getIndexedKamusEntries();
  const { query = "", letter = "", page = 1, limit = 60 } = options;

  let filtered = entries;

  if (letter && letter !== "ALL") {
    filtered = filtered.filter(e => e.firstLetter === letter.toUpperCase());
  }

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(e => e.word.toLowerCase().includes(q));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);

  return {
    items,
    total,
    page: currentPage,
    totalPages,
  };
}
