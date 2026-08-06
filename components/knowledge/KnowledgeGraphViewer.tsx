'use client';

import { useState, useMemo } from "react";
import {
  Network,
  GitBranch,
  BookOpen,
  Layers,
  Search,
  Sparkles,
  ChevronRight,
  X,
  ShieldCheck,
  Crown,
  Share2,
  ArrowRight,
  Info,
  Database,
} from "lucide-react";

export interface GraphNode {
  id: string;
  title: string;
  category: string;
  type: string;
  subtitle: string;
  description: string;
  connections: { label: string; targetId: string }[];
  citation: string;
}

export type GraphMode = "silsilah" | "etimologi" | "adat";

const SILSILAH_NODES: GraphNode[] = [
  {
    id: "N01",
    title: "Gumalangit & Tendeduata",
    subtitle: "Leluhur Utama (Komasaan)",
    category: "Leluhur",
    type: "Pasangan Asal",
    description: "Pasangan leluhur legendaris Suku Mongondow yang pertama bermukim di Gunung Komasaan (wilayah Bintauna) sekitar abad ke-8/9.",
    connections: [
      { label: "Menurunkan generasi keturunan ke", targetId: "P01" },
      { label: "Bermukim bersama leluhur", targetId: "N02" },
    ],
    citation: "Arsip 05 Mengenal Bolaang Mongondow & Sejarah Bolaang Mongondow",
  },
  {
    id: "N02",
    title: "Tumotoibokol & Tumotoibokat",
    subtitle: "Leluhur Penyebar Pedalaman",
    category: "Leluhur",
    type: "Pasangan Asal",
    description: "Leluhur penyebar keturunan ke pesisir dan pedalaman (Tudu in Passi, Lolayan, Bumbungon, Buntalo, Mahag, Siniow).",
    connections: [
      { label: "Menyebar keturunan ke", targetId: "N03" },
    ],
    citation: "Arsip 04 Kisah Raja-Raja Bolaang Mongondow",
  },
  {
    id: "N03",
    title: "Era Bogani (Abad 8 — 14)",
    subtitle: "Tatanan Kepemimpinan Demokrasi Tradisional",
    category: "Masa Bogani",
    type: "Sistem Kepemimpinan",
    description: "Masa pimpinan Bogani: pria/wanita terkuat, berani, dan bijaksana yang dipilih warga. Didampingi para Tonawat (ahli perbintangan & pengobatan).",
    connections: [
      { label: "Bertransisi menuju era Punu' (Raja)", targetId: "P01" },
    ],
    citation: "Arsip 03 Adat Istiadat Bolaang Mongondow",
  },
  {
    id: "P01",
    title: "Punu' Mokodoludut (1400 – 1460)",
    subtitle: "Tompunu'on I (Raja Pertama)",
    category: "Era Punu'",
    type: "Punu' (Raja)",
    description: "Raja pertama yang diakui dalam tradisi tutur. Berkuasa ±1400-1460, memiliki 5 anak: Gologgom, Ginupit, Pondadat, Ginsapondo, dan Yayungbangkai.",
    connections: [
      { label: "Diwariskan ke putranya", targetId: "P02" },
    ],
    citation: "Arsip 04 Kisah Raja-Raja Bolaang Mongondow",
  },
  {
    id: "P02",
    title: "Punu' Yayungbangkai (1460 – 1480)",
    subtitle: "Tompunu'on II",
    category: "Era Punu'",
    type: "Punu' (Raja)",
    description: "Putra Punu' Mokodoludut yang melanjutkan pemerintahan kerajaan di abad ke-15.",
    connections: [
      { label: "Diteruskan oleh putranya", targetId: "P03" },
    ],
    citation: "Arsip 04 Kisah Raja-Raja Bolaang Mongondow",
  },
  {
    id: "P03",
    title: "Punu' Damopolii (1480 – 1510)",
    subtitle: "Tompunu'on III",
    category: "Era Punu'",
    type: "Punu' (Raja)",
    description: "Putra Punu' Yayungbangkai yang memerintah pada kurun waktu 1480–1510.",
    connections: [
      { label: "Diteruskan oleh", targetId: "P07" },
    ],
    citation: "Arsip 04 Kisah Raja-Raja Bolaang Mongondow",
  },
  {
    id: "P07",
    title: "Punu' Tadohe / Sadohe (1600 – 1650)",
    subtitle: "Pemersatu Pesisir & Pedalaman",
    category: "Era Punu'",
    type: "Punu' (Raja)",
    description: "Raja yang berhasil menyatukan masyarakat pesisir (Bolaang) dan pedalaman (Mongondow) menjadi entitas terpadu Bolaang Mongondow.",
    connections: [
      { label: "Bapak dari", targetId: "P08" },
    ],
    citation: "Arsip 05 Mengenal Bolaang Mongondow",
  },
  {
    id: "P08",
    title: "Punu' Loloda Mokoagow (1650 – 1694)",
    subtitle: "Datu Binangkang",
    category: "Era Kedatuan",
    type: "Datu / Raja",
    description: "Raja pertama yang memakai gelar Raja resmi. Mengokohkan kedaulatan dan penciptaan Aksara Mongondow (Loloda Mokoagow).",
    connections: [
      { label: "Membuka Dinasti Manoppo lewat putranya", targetId: "M01" },
    ],
    citation: "Knowledge Aksara Bolaang Mongondow",
  },
  {
    id: "M01",
    title: "Raja Jacobus Manoppo (1695 – 1730)",
    subtitle: "Raja Ke-10",
    category: "Dinasti Manoppo",
    type: "Raja",
    description: "Putra Punu' Loloda Mokoagow. Memimpin perundingan penentuan perbatasan resmi Minahasa & Bolaang Mongondow (20 Mei 1695).",
    connections: [
      { label: "Diteruskan saudaranya", targetId: "M03" },
    ],
    citation: "Arsip 04 Kisah Raja-Raja Bolaang Mongondow",
  },
  {
    id: "M03",
    title: "Raja Salomon Manoppo (1735 – 1764)",
    subtitle: "Raja Pejuang",
    category: "Dinasti Manoppo",
    type: "Raja",
    description: "Putra Jacobus Manoppo. Sempat diasingkan Kompeni ke Ternate lalu Tanjung Harapan (Afrika Selatan), namun dipulangkan 1754 atas desakan dewan adat.",
    connections: [
      { label: "Ayah dari", targetId: "M04" },
      { label: "Ayah dari", targetId: "M07" },
    ],
    citation: "Arsip 04 Kisah Raja-Raja Bolaang Mongondow",
  },
  {
    id: "M04",
    title: "Raja Eugenius Manoppo (1767 – 1770)",
    subtitle: "Raja Kotobangon & Bolaang",
    category: "Dinasti Manoppo",
    type: "Raja",
    description: "Putra Salomon Manoppo. Memindahkan pusat istana dari Kotobangon ke Bolaang atas desakan Kompeni.",
    connections: [
      { label: "Ayah dari", targetId: "M08" },
    ],
    citation: "Arsip 04 Kisah Raja-Raja Bolaang Mongondow",
  },
  {
    id: "M07",
    title: "Raja Manuel Manoppo (1779 – 1819)",
    subtitle: "Pemerintahan 40 Tahun",
    category: "Dinasti Manoppo",
    type: "Raja",
    description: "Memerintah selama ±40 tahun dan menandatangani perjanjian diplomatik dengan Inggris pada 20 Juli 1811.",
    connections: [
      { label: "Diteruskan oleh saudaranya", targetId: "M08" },
    ],
    citation: "Arsip 04 Kisah Raja-Raja Bolaang Mongondow",
  },
  {
    id: "M08",
    title: "Raja Cornelis Manoppo (1823 – 1829)",
    subtitle: "Era Masuknya Islam Resmi",
    category: "Dinasti Manoppo",
    type: "Raja",
    description: "Naik tahta pada usia 50 tahun (7 Oktober 1823). Pada masanya Islam menjadi agama istana lewat hubungan dengan Gorontalo.",
    connections: [
      { label: "Ayah dari", targetId: "M15" },
    ],
    citation: "Arsip 03 Adat Istiadat Bolaang Mongondow",
  },
  {
    id: "M15",
    title: "Raja Datu Cornelis Manoppo (1901 – 1928)",
    subtitle: "Bapak Pembangunan Modern D.C. Manoppo",
    category: "Dinasti Manoppo",
    type: "Raja Pembangunan",
    description: "Membangun kota Kotamobagu modern (1911), jalan berhadap-hadapan dengan pengukur tongkat, jembatan, pasar, sekolah, dan rumah sakit.",
    connections: [],
    citation: "Arsip 04 Kisah Raja-Raja Bolaang Mongondow",
  },
];

const ETIMOLOGI_NODES: GraphNode[] = [
  {
    id: "E01",
    title: "Bolaang (Golaang / Balangon)",
    subtitle: "Akar Etimologi Pesisir",
    category: "Nama Wilayah",
    type: "Etimologi Utama",
    description: "Berasal dari 'golaang' (terang/terbuka oleh sinar matahari di rimba) & 'bolango' (lautan), merujuk pada pusat kedatuan di tepi laut.",
    connections: [
      { label: "Membentuk gabungan nama", targetId: "E02" },
    ],
    citation: "Arsip 05 Mengenal Bolaang Mongondow",
  },
  {
    id: "E02",
    title: "Mongondow (Momondow)",
    subtitle: "Akar Etimologi Pedalaman",
    category: "Nama Wilayah & Suku",
    type: "Etimologi Utama",
    description: "Berasal dari 'momondow' (berseru nyaring tanda kemenangan/kegembiraan). Merujuk pada wilayah pedalaman Rata Mongondow.",
    connections: [
      { label: "Menjadi istilah identitas", targetId: "E03" },
    ],
    citation: "Arsip 05 Mengenal Bolaang Mongondow",
  },
  {
    id: "E03",
    title: "Totabuan (Tabu)",
    subtitle: "Tanah Kelahiran",
    category: "Identitas Geografis",
    type: "Konsep Wilayah",
    description: "Berasal dari kata dasar 'tabu' (tempat berkumpul, bertemu, atau tanah kelahiran). Menjadi nama rumpun seluruh BMR.",
    connections: [
      { label: "Dijiwai oleh falsafah", targetId: "E04" },
    ],
    citation: "Arsip 03 Adat Istiadat Bolaang Mongondow",
  },
  {
    id: "E04",
    title: "Bogani",
    subtitle: "Pemimpin & Pahlawan",
    category: "Kosakata Adat",
    type: "Gelar Kuno",
    description: "Istilah kuno untuk sosok pemimpin patriotik yang kuat, berani, bijaksana, dan melindungi keselamatan warga.",
    connections: [],
    citation: "Arsip 03 Adat Istiadat Bolaang Mongondow",
  },
  {
    id: "MP01",
    title: "Imbuhan Mo-",
    subtitle: "Prefiks Aktivitas Aktif",
    category: "Morfologi",
    type: "Sistem Imbuhan",
    description: "Imbuhan pembentuk kata kerja aktif: Mo-angoi (datang), Mo-baca (membaca), Mo-inggu' (mandi), Mo-gama' (mengambil).",
    connections: [
      { label: "Varian intensif resiprokal", targetId: "MP03" },
    ],
    citation: "Arsip 09 Morfologi dan Sintaksis Bahasa Bolmong",
  },
  {
    id: "MP02",
    title: "Imbuhan Moko-",
    subtitle: "Prefiks Kausalita & Hasil",
    category: "Morfologi",
    type: "Sistem Imbuhan",
    description: "Menyatakan hasil atau kemampuan: Moko-ondok (menakutkan), Moko-tanob (merindukan), Moko-bongol (berisik).",
    connections: [],
    citation: "Arsip 09 Morfologi dan Sintaksis Bahasa Bolmong",
  },
  {
    id: "MP03",
    title: "Imbuhan Moto-",
    subtitle: "Prefiks Saling / Resiprokal",
    category: "Morfologi",
    type: "Sistem Imbuhan",
    description: "Menyatakan hubungan kebersamaan dan timbal balik: Moto-tompiaan, Moto-tabian, Moto-tanoban.",
    connections: [],
    citation: "Arsip 09 Morfologi dan Sintaksis Bahasa Bolmong",
  },
];

const ADAT_NODES: GraphNode[] = [
  {
    id: "F01",
    title: "Mototompiaan",
    subtitle: "Baku-Baku Bae (Saling Memperbaiki)",
    category: "Falsafah Luhur",
    type: "Nilai Utama",
    description: "Prinsip saling membenahi, menjaga kedamaian, dan memperbaiki keadaan sosial dalam kehidupan bermasyarakat.",
    connections: [
      { label: "Berdampingan dengan", targetId: "F02" },
      { label: "Berdampingan dengan", targetId: "F03" },
    ],
    citation: "Arsip 03 Adat Istiadat Bolaang Mongondow",
  },
  {
    id: "F02",
    title: "Mototabian",
    subtitle: "Baku-Baku Sayang (Saling Mengasihi)",
    category: "Falsafah Luhur",
    type: "Nilai Utama",
    description: "Prinsip saling menyayangi, empati, dan persaudaraan tanpa membedakan kasta sosial.",
    connections: [],
    citation: "Arsip 03 Adat Istiadat Bolaang Mongondow",
  },
  {
    id: "F03",
    title: "Mototanoban",
    subtitle: "Baku-Baku Inga (Saling Merindukan)",
    category: "Falsafah Luhur",
    type: "Nilai Utama",
    description: "Prinsip saling mengingat asal-usul tanah kelahiran Totabuan dan menghormati ikatan luhur leluhur.",
    connections: [],
    citation: "Arsip 03 Adat Istiadat Bolaang Mongondow",
  },
  {
    id: "R01",
    title: "Ponika'an (Upacara Pernikahan)",
    subtitle: "Ritual 4 Tahapan Utama",
    category: "Siklus Hidup",
    type: "Ritual Adat",
    description: "Prosesi perkawinan adat: Moguman (lamaran), Mongontong (seserahan diri), Monilon (perabot rumah), & Ijab Kabul/Mobalu.",
    connections: [
      { label: "Dipimpin oleh", targetId: "S04" },
    ],
    citation: "Arsip 03 Adat Istiadat Bolaang Mongondow",
  },
  {
    id: "R02",
    title: "Dilla'sallama (Akikah Bayi)",
    subtitle: "Syukuran & Gunting Rambut",
    category: "Siklus Hidup",
    type: "Ritual Adat",
    description: "Rambut bayi yang digunting dimasukkan ke dalam kelapa muda (simbuyung) lalu digantung di depan rumah.",
    connections: [],
    citation: "Arsip 03 Adat Istiadat Bolaang Mongondow",
  },
  {
    id: "R05",
    title: "Monuntul",
    subtitle: "Tradisi Malam Lailatul Qadar",
    category: "Ritual Keagamaan",
    type: "Tradisi Adat",
    description: "Pemasangan lampu botol minyak di depan halaman rumah pada malam ke 26, 27, dan 28 Ramadhan sesuai jumlah anggota keluarga.",
    connections: [],
    citation: "Arsip 03 Adat Istiadat Bolaang Mongondow",
  },
  {
    id: "S04",
    title: "Guhanga (Pemangku Adat)",
    subtitle: "Tetua Adat Penasehat",
    category: "Stratifikasi Adat",
    type: "Struktur Masyarakat",
    description: "Para tetua adat penasehat kerajaan yang memimpin jalannya upacara adat Ponika'an, Beat, Dilla'sallama, dan Kinopatoyan.",
    connections: [],
    citation: "Arsip 03 Adat Istiadat Bolaang Mongondow",
  },
];

export default function KnowledgeGraphViewer() {
  const [mode, setMode] = useState<GraphMode>("silsilah");
  const [query, setQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const currentDataset = useMemo(() => {
    if (mode === "silsilah") return SILSILAH_NODES;
    if (mode === "etimologi") return ETIMOLOGI_NODES;
    return ADAT_NODES;
  }, [mode]);

  const filteredNodes = useMemo(() => {
    if (!query.trim()) return currentDataset;
    const q = query.toLowerCase();
    return currentDataset.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.subtitle.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
    );
  }, [currentDataset, query]);

  return (
    <div className="bg-[#12141e] border border-[#232638] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#212436] pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Network className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Knowledge Graphify Explorer</span>
              <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/30">
                Live Data
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Visualisasi jejaring simpul (nodes) &amp; relasi sejarah, etimologi, serta tatanan adat Bolaang Mongondow.
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-[#171926] p-1.5 rounded-2xl border border-[#272b3d] shrink-0">
          {[
            { id: "silsilah", label: "Silsilah Raja", icon: Crown },
            { id: "etimologi", label: "Etimologi Kata", icon: GitBranch },
            { id: "adat", label: "Konsep Adat", icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setMode(tab.id as GraphMode);
                  setSelectedNode(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-gray-400 hover:text-white hover:bg-[#202334]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="flex items-center gap-3 bg-[#171926] border border-[#272b3d] rounded-2xl px-4 py-2.5">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Cari simpul ${mode === "silsilah" ? "raja/leluhur" : mode === "etimologi" ? "kata/prefiks" : "falsafah/ritual"}...`}
          className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none font-medium"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-gray-400 hover:text-white text-xs">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Graph Node Cards Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`p-5 rounded-2xl bg-[#161824] border transition-all duration-200 cursor-pointer shadow-lg space-y-3 relative group overflow-hidden ${
                isSelected
                  ? "border-blue-500 bg-[#1c1f30] ring-2 ring-blue-500/20"
                  : "border-[#25283a] hover:border-blue-500/50 hover:bg-[#1a1d2c]"
              }`}
            >
              {/* Card Header Tag */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {node.category}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">{node.type}</span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                  {node.title}
                </h3>
                <p className="text-xs text-gray-400 font-mono italic">{node.subtitle}</p>
              </div>

              <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">{node.description}</p>

              {/* Connections count */}
              <div className="pt-2 border-t border-[#232638] flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                  <span>{node.connections.length} Relasi terhubung</span>
                </span>
                <span className="text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Detail <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}

        {filteredNodes.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-gray-400 bg-[#161824] rounded-2xl border border-[#25283a]">
            Tidak ada simpul Graphify yang cocok dengan pencarian Anda.
          </div>
        )}
      </div>

      {/* Selected Node Detail Drawer Modal */}
      {selectedNode && (
        <div className="p-6 rounded-2xl bg-[#171926] border border-blue-500/40 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-start justify-between border-b border-[#25283a] pb-3">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-blue-400 tracking-wider">
                Simpul Terpilih: {selectedNode.id}
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight">{selectedNode.title}</h3>
              <p className="text-xs text-gray-400 font-mono italic">{selectedNode.subtitle}</p>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="p-1.5 rounded-xl bg-[#212434] text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-200 leading-relaxed bg-[#11131c] p-4 rounded-xl border border-[#232638]">
            {selectedNode.description}
          </p>

          {/* Relasi Terhubung */}
          {selectedNode.connections.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                <span>Relasi Terkait:</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedNode.connections.map((conn, idx) => {
                  const targetObj = currentDataset.find((n) => n.id === conn.targetId);
                  return (
                    <div
                      key={idx}
                      onClick={() => targetObj && setSelectedNode(targetObj)}
                      className="p-3 rounded-xl bg-[#12141f] border border-[#232638] hover:border-blue-500/40 text-xs transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[10px] text-gray-500 italic">{conn.label}:</p>
                        <p className="font-bold text-white">{targetObj?.title || conn.targetId}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-[#25283a] flex items-center justify-between text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>Sumber: {selectedNode.citation}</span>
            </span>
            <button
              onClick={() => setSelectedNode(null)}
              className="px-3 py-1 rounded-lg bg-[#212434] text-gray-300 hover:text-white text-xs font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
