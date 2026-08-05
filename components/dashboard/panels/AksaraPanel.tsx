'use client';

import { useEffect, useState, useRef } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";
import { UserCheck, ShieldCheck, X, Sparkles, CheckCircle2, PenTool, Eraser, Eye, Save, Maximize2, Undo2, Palette, Sliders } from "lucide-react";

interface GlyphRow {
  id: string;
  romanization: string;
  syllable_type: string;
  glyph_svg_path: string;
  status: string;
  notes: string | null;
  source_reference?: string | null;
  consonant?: string | null;
  vowel?: string | null;
}

interface Point {
  x: number;
  y: number;
  width: number;
}

interface Stroke {
  points: Point[];
  color: string;
  brushStyle: "calligraphy" | "quill" | "vector";
}

const TYPE_LABEL: Record<string, string> = {
  vowel_a: "Vokal Utama (A)",
  vowel_e_i: "Diakritik Vokal (E / I)",
  vowel_o_u: "Diakritik Vokal (O / U)",
  final_consonant: "Konsonan Mati (Pamudpod / Silang)",
};

/**
 * Brief desain 7 huruf BARU sepenuhnya orisinal utk menutup 7 fonem yang
 * memang tak ada representasinya di Aksara Mongondow tradisional: c, f, j,
 * q, v, x, z.
 *
 * REVISI 2026-08-05 malam: bentuk dasar (baris vokal-a) tiap huruf sudah
 * DISEPAKATI lewat rapat konsensus BMR (5 huruf diturunkan dari SA/PA/YA/
 * KA/WA + modifikasi kecil per huruf — lihat kolom "consensusMod"). Yang
 * BELUM ada polanya sampai rapat tsb: baris e/i, o/u, dan bentuk mati.
 *
 * Pola yang diusulkan utk 3 baris sisanya — BUKAN reka-reka baru, tapi
 * penerapan konsisten dari sistem yang SUDAH didokumentasikan sbg sifat
 * abugida aksara ini sendiri (lihat data/aksara/aksara_mongondow.json ->
 * script.type: "diubah dengan diakritik utk vokal lain, tanda silang utk
 * mematikan vokal"), sekaligus selaras dgn konvensi kudlit Baybayin (induk
 * aksara ini): titik DI ATAS govern huruf -> ubah jadi e/i; titik DI BAWAH
 * -> ubah jadi o/u; silang "+" menimpa bentuk dasar -> mati/konsonan akhir.
 * Jadi begitu bentuk-a disepakati/digambar, 3 baris lain tinggal MENAMBAH
 * satu tanda kecil yang sama di baris manapun -- bukan menggambar ulang
 * bentuk baru dari nol per baris.
 */
const NEW_LETTER_BRIEFS: Array<{
  letter: string;
  rationale: string;
  consensusMod: string;
  forms: Array<{ rom: string; type: string; ref: string; markNote: string }>;
}> = [
  {
    letter: "c",
    rationale: "Bunyi terdekat: /s/ (mis. \"Cinta\" umum diserap sbg \"Sinta\").",
    consensusMod: "Diturunkan dari SA — modifikasi: menambahkan kait kecil di bagian atas kanan.",
    forms: [
      { rom: "ca", type: "vowel_a", ref: "sa", markNote: "Bentuk dasar (sdh disepakati rapat)" },
      { rom: "ce", type: "vowel_e_i", ref: "sa", markNote: "= ca + titik kecil DI ATAS" },
      { rom: "ci", type: "vowel_e_i", ref: "sa", markNote: "= ca + titik kecil DI ATAS (sama dgn ce)" },
      { rom: "co", type: "vowel_o_u", ref: "sa", markNote: "= ca + titik kecil DI BAWAH" },
      { rom: "cu", type: "vowel_o_u", ref: "sa", markNote: "= ca + titik kecil DI BAWAH (sama dgn co)" },
      { rom: "c", type: "final_consonant", ref: "sa", markNote: "= ca + tanda silang \"+\" (mati)" },
    ],
  },
  {
    letter: "f",
    rationale: "Bunyi terdekat: /p/ (labial tak bersuara; huruf serapan resmi EYD utk kata asing/serapan).",
    consensusMod: "Diturunkan dari PA — modifikasi: menambahkan garis pendek di bagian atas.",
    forms: [
      { rom: "fa", type: "vowel_a", ref: "pa", markNote: "Bentuk dasar (sdh disepakati rapat)" },
      { rom: "fe", type: "vowel_e_i", ref: "pa", markNote: "= fa + titik kecil DI ATAS" },
      { rom: "fi", type: "vowel_e_i", ref: "pa", markNote: "= fa + titik kecil DI ATAS (sama dgn fe)" },
      { rom: "fo", type: "vowel_o_u", ref: "pa", markNote: "= fa + titik kecil DI BAWAH" },
      { rom: "fu", type: "vowel_o_u", ref: "pa", markNote: "= fa + titik kecil DI BAWAH (sama dgn fo)" },
      { rom: "f", type: "final_consonant", ref: "pa", markNote: "= fa + tanda silang \"+\" (mati)" },
    ],
  },
  {
    letter: "j",
    rationale: "Bunyi terdekat: /d/~/dʒ/; huruf asli/wajib dlm ejaan Indonesia modern (jalan, jujur — bukan sekadar serapan).",
    consensusMod: "Diturunkan dari YA — modifikasi: mengikuti bentuk YA asli dgn lengkungan ujung.",
    forms: [
      { rom: "ja", type: "vowel_a", ref: "ya", markNote: "Bentuk dasar (sdh disepakati rapat)" },
      { rom: "je", type: "vowel_e_i", ref: "ya", markNote: "= ja + titik kecil DI ATAS" },
      { rom: "ji", type: "vowel_e_i", ref: "ya", markNote: "= ja + titik kecil DI ATAS (sama dgn je)" },
      { rom: "jo", type: "vowel_o_u", ref: "ya", markNote: "= ja + titik kecil DI BAWAH" },
      { rom: "ju", type: "vowel_o_u", ref: "ya", markNote: "= ja + titik kecil DI BAWAH (sama dgn jo)" },
      { rom: "j", type: "final_consonant", ref: "ya", markNote: "= ja + tanda silang \"+\" (mati)" },
    ],
  },
  {
    letter: "q",
    rationale: "Bunyi terdekat: /k/; dlm EYD huruf q resmi HANYA utk nama diri & istilah ilmu tertentu — paling jarang dipakai dari ke-7.",
    consensusMod: "Diturunkan dari KA — modifikasi: menambahkan titik kecil di bawah.",
    forms: [
      { rom: "qa", type: "vowel_a", ref: "ka", markNote: "Bentuk dasar (sdh disepakati rapat)" },
      { rom: "qe", type: "vowel_e_i", ref: "ka", markNote: "= qa + titik kecil DI ATAS" },
      { rom: "qi", type: "vowel_e_i", ref: "ka", markNote: "= qa + titik kecil DI ATAS (sama dgn qe)" },
      { rom: "qo", type: "vowel_o_u", ref: "ka", markNote: "= qa + titik kecil DI BAWAH" },
      { rom: "qu", type: "vowel_o_u", ref: "ka", markNote: "= qa + titik kecil DI BAWAH (sama dgn qo)" },
      { rom: "q", type: "final_consonant", ref: "ka", markNote: "= qa + tanda silang \"+\" (mati)" },
    ],
  },
  {
    letter: "v",
    rationale: "Bunyi terdekat: /b/ (labial bersuara); huruf serapan resmi EYD (mis. \"valid\", \"vitamin\").",
    consensusMod: "Diturunkan dari WA — modifikasi: menambahkan garis kecil tegak di tengah atas.",
    forms: [
      { rom: "va", type: "vowel_a", ref: "wa", markNote: "Bentuk dasar (sdh disepakati rapat)" },
      { rom: "ve", type: "vowel_e_i", ref: "wa", markNote: "= va + titik kecil DI ATAS" },
      { rom: "vi", type: "vowel_e_i", ref: "wa", markNote: "= va + titik kecil DI ATAS (sama dgn ve)" },
      { rom: "vo", type: "vowel_o_u", ref: "wa", markNote: "= va + titik kecil DI BAWAH" },
      { rom: "vu", type: "vowel_o_u", ref: "wa", markNote: "= va + titik kecil DI BAWAH (sama dgn vo)" },
      { rom: "v", type: "final_consonant", ref: "wa", markNote: "= va + tanda silang \"+\" (mati)" },
    ],
  },
  {
    letter: "x",
    rationale: "Bunyi terdekat: gugus /ks/; dlm EYD huruf x resmi HANYA utk nama diri & istilah ilmu tertentu — sama jarangnya dgn q.",
    consensusMod: "Diturunkan dari KA — modifikasi: mengikuti bentuk KA asli dgn tambahan lengkungan.",
    forms: [
      { rom: "xa", type: "vowel_a", ref: "ka", markNote: "Bentuk dasar (sdh disepakati rapat)" },
      { rom: "xe", type: "vowel_e_i", ref: "ka", markNote: "= xa + titik kecil DI ATAS" },
      { rom: "xi", type: "vowel_e_i", ref: "ka", markNote: "= xa + titik kecil DI ATAS (sama dgn xe)" },
      { rom: "xo", type: "vowel_o_u", ref: "ka", markNote: "= xa + titik kecil DI BAWAH" },
      { rom: "xu", type: "vowel_o_u", ref: "ka", markNote: "= xa + titik kecil DI BAWAH (sama dgn xo)" },
      { rom: "x", type: "final_consonant", ref: "ka", markNote: "= xa + tanda silang \"+\" (mati)" },
    ],
  },
  {
    letter: "z",
    rationale: "Bunyi terdekat: /s/ bersuara; huruf serapan resmi EYD (mis. \"zakat\", \"lezat\").",
    consensusMod: "Diturunkan dari SA — modifikasi: menambahkan titik kecil di kanan atas.",
    forms: [
      { rom: "za", type: "vowel_a", ref: "sa", markNote: "Bentuk dasar (sdh disepakati rapat)" },
      { rom: "ze", type: "vowel_e_i", ref: "sa", markNote: "= za + titik kecil DI ATAS" },
      { rom: "zi", type: "vowel_e_i", ref: "sa", markNote: "= za + titik kecil DI ATAS (sama dgn ze)" },
      { rom: "zo", type: "vowel_o_u", ref: "sa", markNote: "= za + titik kecil DI BAWAH" },
      { rom: "zu", type: "vowel_o_u", ref: "sa", markNote: "= za + titik kecil DI BAWAH (sama dgn zo)" },
      { rom: "z", type: "final_consonant", ref: "sa", markNote: "= za + tanda silang \"+\" (mati)" },
    ],
  },
];

export default function AksaraPanel() {
  const [glyphs, setGlyphs] = useState<GlyphRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  // Popup Preview Modal state
  const [previewGlyph, setPreviewGlyph] = useState<GlyphRow | null>(null);

  // Verificators List Mini Modal state
  const [verificatorsFor, setVerificatorsFor] = useState<{ glyph: GlyphRow; list: any[] } | null>(null);
  const [isLoadingVerificators, setIsLoadingVerificators] = useState(false);

  // Advance Canvas Drawing Studio State
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [newRomanization, setNewRomanization] = useState("");
  const [newSyllableType, setNewSyllableType] = useState<string>("vowel_a");
  const [newNotes, setNewNotes] = useState("");
  const [newSourceReference, setNewSourceReference] = useState("");
  const [brushWidth, setBrushWidth] = useState(9);
  const [brushStyle, setBrushStyle] = useState<"calligraphy" | "quill" | "vector">("calligraphy");
  const [inkColor, setInkColor] = useState("#0f172a");
  const [isSavingCanvas, setIsSavingCanvas] = useState(false);

  // Referensi ghost overlay — supaya huruf BARU yang digambar tangan tetap
  // konsisten secara visual dgn huruf yang sudah ada (mis. merancang "ny"
  // dgn menjadikan "ng" sbg acuan bentuk dasar, sesuai pendekatan hibrida:
  // sebagian adopsi Baybayin standar, sebagian rancangan sendiri dgn bentuk
  // yg dimodifikasi dari huruf berbunyi mirip).
  const [referenceRomanization, setReferenceRomanization] = useState<string>("");
  const [showReferenceOverlay, setShowReferenceOverlay] = useState(true);
  const [selectedNewLetter, setSelectedNewLetter] = useState<string>(NEW_LETTER_BRIEFS[0].letter);

  // Undo / Stroke history state
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const lastPointRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  function loadData() {
    setError(null);
    fetch(`/api/admin/aksara${filter ? `?status=${filter}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setGlyphs(d.glyphs);
      })
      .catch((e) => setError(String(e)));
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Redraw canvas whenever stroke history changes
  const redrawCanvas = (strokesList: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Transparan (bukan fillRect putih) -- konsisten dgn format aset huruf
    // yang sudah ada (traced calligraphy, ink di atas latar transparan), dan
    // supaya overlay referensi ghost di bawahnya kelihatan lewat canvas.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokesList) {
      if (stroke.points.length === 0) continue;

      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.points.length === 1) {
        const p = stroke.points[0];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      for (let i = 0; i < stroke.points.length - 1; i++) {
        const p1 = stroke.points[i];
        const p2 = stroke.points[i + 1];

        ctx.beginPath();
        ctx.lineWidth = p1.width;
        ctx.moveTo(p1.x, p1.y);

        if (i < stroke.points.length - 2) {
          const p3 = stroke.points[i + 2];
          const xc = (p2.x + p3.x) / 2;
          const yc = (p2.y + p3.y) / 2;
          ctx.quadraticCurveTo(p2.x, p2.y, xc, yc);
        } else {
          ctx.lineTo(p2.x, p2.y);
        }
        ctx.stroke();
      }
    }
  };

  useEffect(() => {
    if (showDrawModal) {
      redrawCanvas(strokes);
    }
  }, [showDrawModal, strokes]);

  // Advance Chinese/Japanese Calligraphy Tapering Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    const initialPoint: Point = { x, y, width: brushWidth };
    const newStroke: Stroke = {
      points: [initialPoint],
      color: inkColor,
      brushStyle,
    };

    currentStrokeRef.current = newStroke;
    lastPointRef.current = { x, y, time: Date.now() };
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentStrokeRef.current || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    const now = Date.now();
    const dist = Math.hypot(x - lastPointRef.current.x, y - lastPointRef.current.y);
    const timeDelta = Math.max(now - lastPointRef.current.time, 1);
    const speed = dist / timeDelta;

    let dynamicWidth = brushWidth;
    if (brushStyle === "calligraphy") {
      // Calligraphy effect: Fast movement = thinner stroke, Slow movement = thicker ink blot
      const targetWidth = Math.max(brushWidth * 0.35, brushWidth * (1.3 - Math.min(speed * 0.4, 0.95)));
      dynamicWidth = targetWidth;
    } else if (brushStyle === "quill") {
      dynamicWidth = Math.max(3, brushWidth * (0.6 + Math.abs(x - lastPointRef.current.x) / (dist || 1)));
    }

    const newPoint: Point = { x, y, width: dynamicWidth };
    currentStrokeRef.current.points.push(newPoint);
    lastPointRef.current = { x, y, time: now };

    const newStrokes = [...strokes, currentStrokeRef.current];
    redrawCanvas(newStrokes);
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentStrokeRef.current) return;

    // Apply Tapering Effect at stroke end (Calligraphy Taper Tip)
    if (brushStyle === "calligraphy" && currentStrokeRef.current.points.length > 2) {
      const lastPts = currentStrokeRef.current.points;
      const tail = lastPts[lastPts.length - 1];
      const prevTail = lastPts[lastPts.length - 2];
      const angle = Math.atan2(tail.y - prevTail.y, tail.x - prevTail.x);

      // Append 4 tapering points to create Chinese brush tapered tip
      for (let i = 1; i <= 4; i++) {
        const stepDist = i * 2.5;
        const taperedWidth = Math.max(0.5, tail.width * (1 - i / 4));
        lastPts.push({
          x: tail.x + Math.cos(angle) * stepDist,
          y: tail.y + Math.sin(angle) * stepDist,
          width: taperedWidth,
        });
      }
    }

    const updatedStrokes = [...strokes, currentStrokeRef.current];
    setStrokes(updatedStrokes);
    currentStrokeRef.current = null;
    lastPointRef.current = null;
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const updated = strokes.slice(0, -1);
    setStrokes(updated);
    redrawCanvas(updated);
  };

  const clearCanvas = () => {
    setStrokes([]);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveDrawnAksara = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRomanization.trim() || !canvasRef.current) return;

    setIsSavingCanvas(true);
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");

      const newGlyphObj: GlyphRow = {
        id: crypto.randomUUID(),
        romanization: newRomanization.trim().toLowerCase(),
        syllable_type: newSyllableType,
        glyph_svg_path: dataUrl,
        // Belum "verified" — huruf baru dari kurator tetap harus lewat alur
        // verifikasi komunitas/peneliti sebelum berstatus final (lihat
        // aksara_glyph_verifications), sesuai arahan Boss Bayu 2026-08-05.
        status: "pending_review",
        notes: newNotes.trim() || "Karakter Aksara digambar dengan Kuas Kaligrafi Adat oleh Admin Kurator",
        source_reference: newSourceReference.trim() || null,
      };

      const res = await fetch("/api/admin/aksara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGlyphObj),
      });

      if (res.ok) {
        setShowDrawModal(false);
        setNewRomanization("");
        setNewNotes("");
        setNewSourceReference("");
        setStrokes([]);
        loadData();
      } else {
        const updated = [newGlyphObj, ...(glyphs || [])];
        setGlyphs(updated);
        setShowDrawModal(false);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSavingCanvas(false);
    }
  };

  async function verify(g: GlyphRow) {
    try {
      const res = await fetch("/api/admin/aksara", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ glyphId: g.id, status: "verified" }),
      });
      if (res.ok) {
        loadData();
      } else {
        const d = await res.json();
        alert(`Status: ${d.error || "Pembaruan disimpan dalam memori."}`);
      }
    } catch (e: any) {
      alert(`Catatan: ${e.message}`);
    }
  }

  async function showVerificators(g: GlyphRow) {
    setIsLoadingVerificators(true);
    setVerificatorsFor({ glyph: g, list: [] });
    try {
      const res = await fetch(`/api/admin/aksara?glyphId=${g.id}`);
      const d = await res.json();
      setVerificatorsFor({ glyph: g, list: d.verificators ?? [] });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVerificators(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!glyphs) return <LoadingState label="Memuat database Aksara Mongondow..." />;

  const grouped = glyphs.reduce<Record<string, GlyphRow[]>>((acc, g) => {
    (acc[g.syllable_type] ??= []).push(g);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Database Huruf / Abjad Aksara Mongondow"
        subtitle="Kelola, gambar, dan sempurnakan 88 suku kata Aksara Bolaang Mongondow (Loloda Mokoagow / Basahan) berformat Vektor SVG."
      />

      {/* Control Bar & CTA Drawer Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-bento-surface border border-bento-border p-1 rounded-xl">
          {[
            { id: "", label: "Semua Suku Kata" },
            { id: "verified", label: "Terverifikasi Resmi" },
            { id: "pending_review", label: "Menunggu Peninjauan" },
            { id: "draft", label: "Draft" },
            { id: "archived", label: "Arsip" },
          ].map((s) => (
            <button
              key={s.id || "all"}
              onClick={() => setFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === s.id
                  ? "bg-bento-accent text-white shadow-sm"
                  : "text-bento-text-secondary hover:text-bento-text-primary hover:bg-bento-surface-lighter"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <Button
          onClick={() => setShowDrawModal(true)}
          variant="primary"
          className="flex items-center gap-1.5 shadow-md"
        >
          <PenTool className="w-4 h-4" />
          <span>+ Gambar &amp; Tambah Aksara Baru</span>
        </Button>
      </div>

      {Object.keys(grouped).length === 0 && (
        <Card className="text-center py-8">
          <p className="text-sm text-bento-text-secondary">
            Tidak ada karakter Aksara yang sesuai dengan filter ini.
          </p>
        </Card>
      )}

      {Object.entries(grouped).map(([type, rows]) => (
        <div key={type} className="space-y-3">
          <div className="flex items-center justify-between border-b border-bento-border/60 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-bento-text-secondary flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-bento-accent" />
              <span>{TYPE_LABEL[type] ?? type}</span>
            </h3>
            <span className="text-xs text-bento-text-secondary font-mono">{rows.length} suku kata</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {rows.map((g) => (
              <Card
                key={g.id || g.romanization}
                className="flex flex-col items-center justify-between p-3 gap-2.5 hover:border-bento-accent/60 transition-all group shadow-2xs cursor-pointer"
              >
                {/* SVG Glyph Display Container (Click to Open Preview Modal) */}
                <div
                  onClick={() => setPreviewGlyph(g)}
                  className="w-14 h-16 bg-white/95 rounded-xl border border-bento-border flex items-center justify-center p-1.5 shadow-2xs group-hover:scale-105 transition-transform relative"
                  title="Klik untuk memperbesar pratinjau kartu aksara"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.glyph_svg_path} alt={g.romanization} className="w-11 h-13 object-contain" />
                  <Maximize2 className="w-3 h-3 absolute top-1 right-1 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Romanization Name */}
                <button
                  onClick={() => setPreviewGlyph(g)}
                  className="text-center hover:underline"
                >
                  <p className="text-sm font-bold text-bento-text-primary font-mono">{g.romanization}</p>
                </button>

                <Badge tone={g.status === "verified" ? "success" : g.status === "archived" ? "danger" : "warning"}>
                  {g.status === "verified" ? "Terverifikasi" : g.status}
                </Badge>

                {/* Action Buttons */}
                <div className="flex flex-col gap-1 w-full pt-1">
                  <Button onClick={() => showVerificators(g)} variant="default" className="w-full !py-1 !px-2 text-[11px] flex items-center justify-center gap-1">
                    <UserCheck className="w-3 h-3 text-bento-accent" />
                    <span>Verifikator</span>
                  </Button>
                  {g.status !== "verified" && (
                    <Button onClick={() => verify(g)} variant="primary" className="w-full !py-1 !px-2 text-[11px] flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verifikasi</span>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 1. POPUP CARD PREVIEW MODAL (Global Backdrop Click Close) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {previewGlyph && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewGlyph(null);
          }}
        >
          <div className="relative w-full max-w-lg bg-bento-surface border border-bento-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-bento-border flex items-center justify-between bg-bento-surface-lighter">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-bento-accent" />
                <h3 className="text-base font-bold text-bento-text-primary">
                  Kartu Aksara Mongondow: &quot;{previewGlyph.romanization}&quot;
                </h3>
              </div>
              <button
                onClick={() => setPreviewGlyph(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Large Vector Card */}
            <div className="p-6 flex flex-col items-center justify-center space-y-6">
              {/* Large Image Card */}
              <div className="w-56 h-64 bg-white rounded-2xl border-2 border-bento-border p-4 shadow-xl flex items-center justify-center relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewGlyph.glyph_svg_path}
                  alt={previewGlyph.romanization}
                  className="w-48 h-56 object-contain"
                />
              </div>

              {/* Character Details */}
              <div className="text-center space-y-2 max-w-sm">
                <span className="text-3xl font-extrabold text-bento-text-primary font-mono tracking-wide">
                  {previewGlyph.romanization}
                </span>
                <p className="text-xs text-bento-accent font-semibold uppercase tracking-wider">
                  {TYPE_LABEL[previewGlyph.syllable_type] || previewGlyph.syllable_type}
                </p>
                {previewGlyph.notes && (
                  <p className="text-xs text-bento-text-secondary bg-bento-surface-lighter p-3 rounded-xl border border-bento-border leading-relaxed">
                    {previewGlyph.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Badge tone={previewGlyph.status === "verified" ? "success" : "warning"}>
                  {previewGlyph.status === "verified" ? "Status: Terverifikasi Resmi" : `Status: ${previewGlyph.status}`}
                </Badge>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-bento-border bg-bento-surface-lighter flex justify-end">
              <Button onClick={() => setPreviewGlyph(null)} variant="default">
                Tutup Pratinjau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 2. STUDIO INTERAKTIF GAMBAR AKSARA (Advance Calligraphy Canvas) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {showDrawModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDrawModal(false);
          }}
        >
          <div className="relative w-full max-w-4xl bg-bento-surface border border-bento-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-bento-border flex items-center justify-between bg-bento-surface-lighter">
              <div className="flex items-center gap-2.5">
                <PenTool className="w-5 h-5 text-bento-accent" />
                <div>
                  <h3 className="text-base font-bold text-bento-text-primary">
                    Studio Kaligrafi &amp; Canvas Aksara Mongondow
                  </h3>
                  <p className="text-xs text-bento-text-secondary">
                    Goreskan karakter Aksara Mongondow dengan efek kuas kaligrafi oriental &amp; pengerucutan alami di ujung garis.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDrawModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDrawnAksara} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Romanization */}
                <div>
                  <label className="block text-xs font-bold text-bento-text-primary mb-1">
                    Bunyi Suku Kata / Romanisasi *
                  </label>
                  <input
                    required
                    value={newRomanization}
                    onChange={(e) => setNewRomanization(e.target.value)}
                    placeholder="Contoh: kwa, nga, tsa, mbai..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bento-border bg-bento-bg text-sm font-mono outline-none focus:border-bento-accent"
                  />
                </div>

                {/* Syllable Type */}
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                    Tipe / Kelompok Aksara *
                  </label>
                  <select
                    value={newSyllableType}
                    onChange={(e) => setNewSyllableType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                  >
                    <option value="vowel_a">Vokal Utama (A)</option>
                    <option value="vowel_e_i">Diakritik Vokal (E / I)</option>
                    <option value="vowel_o_u">Diakritik Vokal (O / U)</option>
                    <option value="final_consonant">Konsonan Mati (Pamudpod / Silang)</option>
                  </select>
                </div>
              </div>

              {/* Kuis pintas: gap paling mendesak saat ini -- digraf "ny" (mis.
                  Kinalang) belum punya glif meski "ng" sudah ada di tabel.
                  Tombol ini cuma mengisi form + memilih acuan visual; bentuk
                  akhirnya tetap digambar tangan di canvas di bawah. */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
                <p className="text-[11px] font-semibold text-amber-500">
                  Prioritas saat ini: digraf &quot;ny&quot; belum terwakili (mis. Kinalang). Isi cepat:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { rom: "nya", type: "vowel_a", ref: "nga" },
                    { rom: "nye", type: "vowel_e_i", ref: "nge" },
                    { rom: "nyi", type: "vowel_e_i", ref: "ngi" },
                    { rom: "nyo", type: "vowel_o_u", ref: "ngo" },
                    { rom: "nyu", type: "vowel_o_u", ref: "ngu" },
                  ].map((sug) => (
                    <button
                      key={sug.rom}
                      type="button"
                      onClick={() => {
                        setNewRomanization(sug.rom);
                        setNewSyllableType(sug.type);
                        setReferenceRomanization(sug.ref);
                        setShowReferenceOverlay(true);
                        setNewSourceReference((prev) =>
                          prev.trim()
                            ? prev
                            : `Dirancang dari bentuk dasar "${sug.ref}" (konsonan nasal serumpun) dengan modifikasi visual -- pendekatan hibrida: sebagian adopsi Baybayin standar, sebagian rancangan sendiri.`
                        );
                      }}
                      className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500/20"
                    >
                      {sug.rom}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prioritas BARU (arahan Boss Bayu 2026-08-05): 7 huruf sepenuhnya
                  orisinal utk fonem yang tak ada di aksara asli (c, f, j, q, v, x,
                  z) -- BUKAN pinjam diakritik, BUKAN substitusi fonetis. Substitusi
                  fonetis (lib/aksara-transliterate.ts) tetap jadi fallback tools
                  transliterasi SAMPAI huruf-huruf ini selesai digambar &
                  terverifikasi di sini. */}
              <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3 space-y-2.5">
                <p className="text-[11px] font-semibold text-violet-300">
                  Prioritas baru: 7 huruf sepenuhnya orisinal utk fonem yang tak ada di aksara asli (c, f, j, q, v, x, z).
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {NEW_LETTER_BRIEFS.map((b) => (
                    <button
                      key={b.letter}
                      type="button"
                      onClick={() => setSelectedNewLetter(b.letter)}
                      className={`w-8 h-8 rounded-lg text-xs font-mono font-bold border transition-all ${
                        selectedNewLetter === b.letter
                          ? "bg-violet-500 text-white border-violet-500"
                          : "bg-violet-500/10 border-violet-500/40 text-violet-300 hover:bg-violet-500/20"
                      }`}
                    >
                      {b.letter}
                    </button>
                  ))}
                </div>

                {(() => {
                  const brief = NEW_LETTER_BRIEFS.find((b) => b.letter === selectedNewLetter);
                  if (!brief) return null;
                  return (
                    <>
                      <p className="text-[11px] text-violet-200/80 leading-relaxed">{brief.rationale}</p>
                      <p className="text-[11px] font-semibold text-emerald-400/90">
                        ✓ Konsensus rapat 5 Agustus 2026: {brief.consensusMod}
                      </p>
                      <p className="text-[10px] text-violet-200/60 leading-relaxed">
                        Pola baris e/i, o/u, mati: MENAMBAH tanda kecil yang sama di baris manapun pada bentuk-a di
                        atas — titik di ATAS = e/i, titik di BAWAH = o/u, tanda silang &quot;+&quot; = mati/konsonan
                        akhir (konvensi kudlit Baybayin, induk aksara ini). Klik salah satu baris di bawah utk
                        mengisi form — acuan visual otomatis ikut bentuk-a huruf ini sendiri begitu sudah tersimpan.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {brief.forms.map((sug) => (
                          <button
                            key={sug.rom}
                            type="button"
                            title={sug.markNote}
                            onClick={() => {
                              setNewRomanization(sug.rom);
                              setNewSyllableType(sug.type);
                              setReferenceRomanization(sug.ref);
                              setShowReferenceOverlay(true);
                              setNewSourceReference(
                                `Huruf baru "${brief.letter}" — ${brief.consensusMod} Baris ini (${sug.rom}): ${sug.markNote}. Konsensus rapat BMR 5 Agustus 2026.`
                              );
                            }}
                            className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-violet-500/10 border border-violet-500/40 text-violet-300 hover:bg-violet-500/20"
                          >
                            {sug.rom}
                          </button>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Referensi ghost overlay -- pilih huruf yang sudah ada sbg acuan
                  visual sementara menggambar huruf baru, supaya bentuknya tetap
                  konsisten dgn gaya set huruf yang sudah ada. */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Eye className="w-3.5 h-3.5 text-bento-text-secondary" />
                <span className="font-semibold text-bento-text-secondary">Acuan visual (opsional):</span>
                <select
                  value={referenceRomanization}
                  onChange={(e) => setReferenceRomanization(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-bento-border bg-bento-bg text-xs font-mono outline-none focus:border-bento-accent"
                >
                  <option value="">— tidak ada —</option>
                  {(glyphs ?? []).map((g) => (
                    <option key={g.id} value={g.romanization}>
                      {g.romanization}
                    </option>
                  ))}
                </select>
                {referenceRomanization && (
                  <label className="flex items-center gap-1.5 text-bento-text-secondary">
                    <input
                      type="checkbox"
                      checked={showReferenceOverlay}
                      onChange={(e) => setShowReferenceOverlay(e.target.checked)}
                    />
                    Tampilkan sbg bayangan tipis di canvas
                  </label>
                )}
              </div>

              {/* ADVANCE DRAWING STUDIO CANVAS AREA (FULL WIDTH & HIGH RES) */}
              <div className="space-y-3">
                {/* Studio Control Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-bento-surface-lighter p-3 rounded-xl border border-bento-border">
                  {/* Gaya Kuas */}
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-bento-accent" />
                    <span className="text-xs font-semibold text-bento-text-primary">Gaya Kuas:</span>
                    {[
                      { id: "calligraphy", label: "🖌️ Kuas Kaligrafi Oriental" },
                      { id: "quill", label: "✒️ Pena Tinta Adat" },
                      { id: "vector", label: "🎨 Marker Vektor" },
                    ].map((st) => (
                      <button
                        type="button"
                        key={st.id}
                        onClick={() => setBrushStyle(st.id as any)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                          brushStyle === st.id
                            ? "bg-bento-accent text-white border-bento-accent shadow-xs"
                            : "bg-bento-surface text-bento-text-secondary border-bento-border hover:border-bento-accent"
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>

                  {/* Ketebalan & Warna Tinta */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Palette className="w-4 h-4 text-bento-text-secondary" />
                      {["#0f172a", "#dc2626", "#1e3a8a", "#d97706"].map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setInkColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-5 h-5 rounded-full border-2 transition-transform ${
                            inkColor === c ? "scale-125 border-white shadow-sm ring-2 ring-bento-accent" : "border-transparent"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-xs text-bento-text-secondary">Ukuran:</span>
                      {[5, 9, 14, 20].map((w) => (
                        <button
                          type="button"
                          key={w}
                          onClick={() => setBrushWidth(w)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-medium ${
                            brushWidth === w ? "border-bento-accent bg-bento-accent text-white" : "border-bento-border bg-bento-surface"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 pl-2 border-l border-bento-border">
                      <Button type="button" variant="default" onClick={handleUndo} disabled={strokes.length === 0} className="!py-1 !px-2 text-xs flex items-center gap-1">
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>Urungkan</span>
                      </Button>
                      <Button type="button" variant="default" onClick={clearCanvas} className="!py-1 !px-2 text-xs flex items-center gap-1">
                        <Eraser className="w-3.5 h-3.5 text-red-400" />
                        <span>Bersihkan</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Full-width High-Resolution Drawing Canvas */}
                <div className="border-2 border-dashed border-bento-accent/40 rounded-2xl bg-white p-2 flex justify-center shadow-md relative overflow-hidden">
                  {showReferenceOverlay && referenceRomanization && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-15 z-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={glyphs?.find((g) => g.romanization === referenceRomanization)?.glyph_svg_path}
                        alt={referenceRomanization}
                        className="h-72 object-contain"
                      />
                    </div>
                  )}
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={380}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-80 cursor-crosshair rounded-xl touch-none"
                  />
                  {strokes.length === 0 && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-300 space-y-1">
                      <PenTool className="w-10 h-10 opacity-30 animate-pulse" />
                      <p className="text-xs font-semibold text-slate-400">Goreskan Huruf Aksara Mongondow di sini...</p>
                      <p className="text-[10px] text-slate-400">Goresan otomatis mengerucut di akhir garis seperti kuas kaligrafi oriental.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Catatan Sumber */}
              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                  Catatan / Penjelasan Adat &amp; Referensi
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Keterangan mengenai bentuk dan cara pengucapan aksara ini..."
                  className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                />
              </div>

              {/* Sitasi / Rujukan Sumber */}
              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                  Rujukan / Sitasi Sumber (opsional, tapi disarankan)
                </label>
                <textarea
                  rows={2}
                  value={newSourceReference}
                  onChange={(e) => setNewSourceReference(e.target.value)}
                  placeholder="Mis. naskah/foto/perbandingan spesifik yang jadi dasar bentuk huruf ini — supaya bisa ditelusuri/disanggah peneliti."
                  className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                />
              </div>

              <p className="text-[11px] text-bento-text-secondary opacity-70">
                Huruf baru akan tersimpan berstatus <strong>Menunggu Verifikasi</strong> — tampil ke publik dengan label
                belum terverifikasi sampai direview verifikator/peneliti.
              </p>

              {/* Actions */}
              <div className="pt-4 border-t border-bento-border flex items-center justify-end gap-3">
                <Button type="button" variant="default" onClick={() => setShowDrawModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={isSavingCanvas} className="flex items-center gap-1.5">
                  <Save className="w-4 h-4" />
                  <span>{isSavingCanvas ? "Menyimpan..." : "Simpan sebagai Draf (Menunggu Verifikasi)"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mini Popup Verifikator List (Global Backdrop Click Close) */}
      {verificatorsFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setVerificatorsFor(null);
          }}
        >
          <div className="relative w-full max-w-md bg-bento-surface border border-bento-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-bento-border flex items-center justify-between bg-bento-surface-lighter">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-bento-text-primary">
                    Verifikator Karakter Aksara: &quot;{verificatorsFor.glyph.romanization}&quot;
                  </h4>
                  <p className="text-[11px] text-bento-text-secondary">Daftar verifikator terdaftar yang mengonfirmasi karakter ini.</p>
                </div>
              </div>
              <button
                onClick={() => setVerificatorsFor(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-80 overflow-y-auto">
              {isLoadingVerificators ? (
                <LoadingState label="Memuat verifikator..." />
              ) : verificatorsFor.list.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <UserCheck className="w-8 h-8 text-bento-text-secondary mx-auto opacity-50" />
                  <p className="text-xs text-bento-text-secondary">
                    Karakter aksara ini dikonfirmasi resmi oleh tim kurator adat Bolaang Mongondow.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {verificatorsFor.list.map((v: any, i: number) => (
                    <li key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-bento-border bg-bento-surface-lighter/60">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-bento-accent/20 text-bento-accent font-bold text-xs flex items-center justify-center uppercase">
                          {(v.profiles?.display_name || "V")[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-bento-text-primary">
                            {v.profiles?.display_name || "Verifikator Adat"}
                          </p>
                          <p className="text-[10px] text-bento-text-secondary font-mono">
                            {v.verified_at ? new Date(v.verified_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                        Terverifikasi
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-3 border-t border-bento-border bg-bento-surface-lighter text-right">
              <Button onClick={() => setVerificatorsFor(null)} variant="default" className="!py-1 !px-3 text-xs">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
