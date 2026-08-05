/**
 * Export hasil transliterasi Aksara Mongondow ke berbagai format file: PNG,
 * JPG, PDF, DOCX.
 *
 * Ada DUA jalur render terpisah:
 * 1. renderAksaraToCanvas() -- render teks lewat font asli AksaraMongondow.ttf
 *    (dipakai internal, TIDAK lagi dipasang ke tombol export publik sejak
 *    box "Preview Font" murni jadi pratinjau font, bukan sumber export).
 * 2. renderAksaraGlyphsToCanvas() -- compose gambar SVG per-suku-kata asli
 *    (persis yang tampil di box "Hasil Naskah Aksara (Vector SVG)"), dipakai
 *    oleh exportGlyphsAsPng/Jpg/Pdf/Docx -- INI yang dipasang ke tombol
 *    "Export sbg" di UI, supaya file yg diunduh sesuai dgn box yg diberi
 *    label export tsb.
 *
 * Strategi tetap sama: render SEKALI ke <canvas> beresolusi tinggi, lalu
 * semua format lain (PDF, DOCX) memakai bitmap PNG dari canvas itu sbg
 * sumber gambar -- hasilnya dijamin identik dgn yg terlihat di layar.
 */

import type { WordTransliteration } from "@/lib/aksara-transliterate";

const FONT_FAMILY = "AksaraMongondow";
const GLYPH_BASE = "/aksara-svg/";

async function ensureFontLoaded(pixelSize: number): Promise<void> {
  if (typeof document === "undefined") return;
  try {
    await document.fonts.load(`${pixelSize}px "${FONT_FAMILY}"`);
    await document.fonts.ready;
  } catch {
    // gagal-aman: kalau FontFace API bermasalah, canvas tetap mencoba
    // pakai font ini (browser modern biasanya sudah cukup cepat memuatnya).
  }
}

export interface RenderOptions {
  /** ukuran font dasar dalam px (di skala device-pixel-ratio internal) */
  fontSize?: number;
  /** warna latar (default krem senada tampilan aksara di app) */
  background?: string;
  /** warna tinta huruf */
  ink?: string;
  /** lebar maksimum area teks sebelum wrap ke baris baru, dalam px */
  maxWidth?: number;
  /** padding di sekeliling teks, dalam px */
  padding?: number;
}

const DEFAULTS: Required<RenderOptions> = {
  fontSize: 72,
  background: "#f5f0e6",
  ink: "#1c1712",
  maxWidth: 1000,
  padding: 48,
};

/**
 * Pecah teks jadi baris-baris yang muat dalam maxWidth, mengukur pakai
 * context canvas yang sudah diset font-nya.
 */
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const attempt = current ? `${current} ${w}` : w;
    if (ctx.measureText(attempt).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = attempt;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

/**
 * Render teks ke <canvas> memakai font Aksara Mongondow asli (ligature
 * OpenType aktif lewat default browser utk fitur "liga"/"clig"; "calt"
 * sebagian besar browser turut mengaktifkannya secara default utk canvas).
 */
export async function renderAksaraToCanvas(
  text: string,
  options: RenderOptions = {}
): Promise<HTMLCanvasElement> {
  const opts = { ...DEFAULTS, ...options };
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 3) : 2;

  await ensureFontLoaded(opts.fontSize);

  // Canvas sementara hanya utk mengukur baris.
  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d")!;
  measureCtx.font = `${opts.fontSize}px "${FONT_FAMILY}"`;
  const lines = wrapLines(measureCtx, text || " ", opts.maxWidth);

  const lineHeight = opts.fontSize * 1.5;
  const contentWidth = Math.min(
    opts.maxWidth,
    Math.max(...lines.map((l) => measureCtx.measureText(l).width), 200)
  );
  const width = contentWidth + opts.padding * 2;
  const height = lines.length * lineHeight + opts.padding * 2;

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * dpr);
  canvas.height = Math.ceil(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = opts.background;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = opts.ink;
  ctx.font = `${opts.fontSize}px "${FONT_FAMILY}"`;
  ctx.textBaseline = "top";

  lines.forEach((line, i) => {
    ctx.fillText(line, opts.padding, opts.padding + i * lineHeight);
  });

  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Gagal membuat blob dari canvas"))),
      type,
      quality
    );
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function safeFilename(text: string): string {
  const slug = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return slug || "aksara-mongondow";
}

export async function exportAsPng(text: string, options?: RenderOptions) {
  const canvas = await renderAksaraToCanvas(text, options);
  const blob = await canvasToBlob(canvas, "image/png");
  downloadBlob(blob, `${safeFilename(text)}.png`);
}

export async function exportAsJpg(text: string, options?: RenderOptions) {
  // JPG tidak mendukung transparansi -- pastikan latar solid (sudah default krem).
  const canvas = await renderAksaraToCanvas(text, options);
  const blob = await canvasToBlob(canvas, "image/jpeg", 0.95);
  downloadBlob(blob, `${safeFilename(text)}.jpg`);
}

export async function exportAsPdf(text: string, options?: RenderOptions) {
  const { jsPDF } = await import("jspdf");
  const canvas = await renderAksaraToCanvas(text, options);
  const imgData = canvas.toDataURL("image/png");

  // Konversi px -> mm (asumsi 96 DPI) supaya ukuran halaman PDF proporsional
  // dgn ukuran gambar, dgn sedikit margin.
  const pxToMm = (px: number) => (px / 96) * 25.4;
  const cssWidth = parseFloat(canvas.style.width);
  const cssHeight = parseFloat(canvas.style.height);
  const marginMm = 10;
  const imgWidthMm = pxToMm(cssWidth);
  const imgHeightMm = pxToMm(cssHeight);

  const doc = new jsPDF({
    orientation: imgWidthMm > imgHeightMm ? "landscape" : "portrait",
    unit: "mm",
    format: [imgWidthMm + marginMm * 2, imgHeightMm + marginMm * 2],
  });
  doc.addImage(imgData, "PNG", marginMm, marginMm, imgWidthMm, imgHeightMm);
  doc.save(`${safeFilename(text)}.pdf`);
}

export async function exportAsDocx(text: string, options?: RenderOptions) {
  const { Document, Packer, Paragraph, ImageRun, AlignmentType } = await import("docx");
  const canvas = await renderAksaraToCanvas(text, options);
  const blob = await canvasToBlob(canvas, "image/png");
  const arrayBuffer = await blob.arrayBuffer();

  const cssWidth = parseFloat(canvas.style.width);
  const cssHeight = parseFloat(canvas.style.height);
  // docx pakai satuan px langsung utk transformation width/height gambar.
  const maxDocWidth = 600; // supaya muat di lebar halaman A4 standar
  const scale = Math.min(1, maxDocWidth / cssWidth);

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                type: "png",
                data: arrayBuffer,
                transformation: {
                  width: Math.round(cssWidth * scale),
                  height: Math.round(cssHeight * scale),
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Teks asli: ${text}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Dihasilkan otomatis oleh MongondowPedia -- Aksara Mongondow (font asli, bukan gambar tempel).",
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  const blobDocx = await Packer.toBlob(doc);
  downloadBlob(blobDocx, `${safeFilename(text)}.docx`);
}

// ─────────────────────────────────────────────────────────────────────────
// Export "Hasil Naskah Aksara (Vector SVG)" -- compose gambar glyph SVG asli
// per suku kata (bukan render font), sesuai tampilan box hasil transliterasi.
// ─────────────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Gagal memuat glyph: ${src}`));
    img.src = src;
  });
}

export interface GlyphExportOptions {
  maxWidth?: number;
  padding?: number;
  background?: string;
  cardBackground?: string;
  ink?: string;
}

const GLYPH_DEFAULTS: Required<GlyphExportOptions> = {
  maxWidth: 1100,
  padding: 36,
  background: "#0c0d14",
  cardBackground: "#f5f0e6",
  ink: "#2d2419",
};

/**
 * Susun ulang deretan kata hasil transliterasi jadi satu <canvas> yg berisi
 * gambar glyph SVG asli per suku kata (persis spt box "Hasil Naskah Aksara"
 * di UI): kartu krem per suku kata + label romanisasi, dikelompokkan per
 * kata, kata yg gagal dipetakan ditampilkan sbg kotak amber dgn teks asli.
 * Baris otomatis wrap kalau melebihi maxWidth.
 */
export async function renderAksaraGlyphsToCanvas(
  words: WordTransliteration[],
  options: GlyphExportOptions = {}
): Promise<HTMLCanvasElement> {
  const opts = { ...GLYPH_DEFAULTS, ...options };
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 2;

  // Rasio kartu glyph mengikuti viewBox SVG asli (100 x 160).
  const GLYPH_W = 72;
  const GLYPH_H = 115;
  const LABEL_H = 22;
  const CARD_PAD = 10;
  const CARD_W = GLYPH_W + CARD_PAD * 2;
  const CARD_H = GLYPH_H + LABEL_H + CARD_PAD * 2 + 4;
  const SYL_GAP = 8;
  const WORD_GAP = 22;
  const ROW_GAP = 18;
  const BADGE_H = 20;

  const uniquePaths = Array.from(
    new Set(words.flatMap((w) => (w.syllables ? w.syllables.map((s) => GLYPH_BASE + s.glyph_svg) : [])))
  );
  const imageMap = new Map<string, HTMLImageElement>(
    await Promise.all(uniquePaths.map(async (p) => [p, await loadImage(p)] as const))
  );

  type LaidWord = { word: WordTransliteration; width: number; height: number };
  const laidWords: LaidWord[] = words.map((w) => {
    if (w.syllables && w.syllables.length > 0) {
      const width = w.syllables.length * CARD_W + (w.syllables.length - 1) * SYL_GAP;
      const height = CARD_H + (w.approximated ? BADGE_H + 6 : 0);
      return { word: w, width, height };
    }
    const textLen = Math.max(w.original.length, 3);
    const width = Math.max(96, textLen * 11 + 28);
    return { word: w, width, height: CARD_H };
  });

  const rows: LaidWord[][] = [];
  let currentRow: LaidWord[] = [];
  let currentRowWidth = 0;
  for (const lw of laidWords) {
    const addedWidth = currentRow.length === 0 ? lw.width : currentRowWidth + WORD_GAP + lw.width;
    if (addedWidth > opts.maxWidth && currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [lw];
      currentRowWidth = lw.width;
    } else {
      currentRow.push(lw);
      currentRowWidth = addedWidth;
    }
  }
  if (currentRow.length > 0) rows.push(currentRow);
  if (rows.length === 0) rows.push([]);

  const rowHeights = rows.map((row) => (row.length > 0 ? Math.max(...row.map((lw) => lw.height)) : CARD_H));
  const contentWidth = Math.min(
    opts.maxWidth,
    Math.max(
      ...rows.map((row) => row.reduce((sum, lw, i) => sum + lw.width + (i > 0 ? WORD_GAP : 0), 0)),
      240
    )
  );
  const contentHeight = rowHeights.reduce((sum, h) => sum + h, 0) + (rows.length - 1) * ROW_GAP;

  const width = contentWidth + opts.padding * 2;
  const height = contentHeight + opts.padding * 2;

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * dpr);
  canvas.height = Math.ceil(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  ctx.fillStyle = opts.background;
  ctx.fillRect(0, 0, width, height);

  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  let cursorY = opts.padding;
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const rowH = rowHeights[r];
    let cursorX = opts.padding;
    for (const lw of row) {
      const w = lw.word;
      const yBase = cursorY + (rowH - lw.height);

      if (w.syllables && w.syllables.length > 0) {
        let glyphY = yBase;
        if (w.approximated) {
          const badgeText = "≈ pendekatan fonetis";
          ctx.font = "600 11px sans-serif";
          const bw = ctx.measureText(badgeText).width + 16;
          ctx.fillStyle = "rgba(167,139,250,0.14)";
          ctx.strokeStyle = "rgba(167,139,250,0.45)";
          ctx.lineWidth = 1;
          roundRect(cursorX, glyphY, bw, BADGE_H, 9);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#c4b5fd";
          ctx.textBaseline = "middle";
          ctx.textAlign = "left";
          ctx.fillText(badgeText, cursorX + 8, glyphY + BADGE_H / 2 + 1);
          glyphY += BADGE_H + 6;
        }
        let sx = cursorX;
        for (const syl of w.syllables) {
          roundRect(sx, glyphY, CARD_W, CARD_H, 12);
          ctx.fillStyle = opts.cardBackground;
          ctx.fill();
          const img = imageMap.get(GLYPH_BASE + syl.glyph_svg);
          if (img) ctx.drawImage(img, sx + CARD_PAD, glyphY + CARD_PAD, GLYPH_W, GLYPH_H);
          ctx.fillStyle = opts.ink;
          ctx.font = "bold 12px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "alphabetic";
          ctx.fillText(syl.romanization, sx + CARD_W / 2, glyphY + CARD_PAD + GLYPH_H + 16);
          sx += CARD_W + SYL_GAP;
        }
      } else {
        roundRect(cursorX, yBase, lw.width, CARD_H, 12);
        ctx.fillStyle = "#241d1a";
        ctx.fill();
        ctx.strokeStyle = "rgba(180,83,9,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(w.original, cursorX + lw.width / 2, yBase + CARD_H / 2 - 4);
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "rgba(217,119,6,0.85)";
        ctx.fillText("tidak terpetakan", cursorX + lw.width / 2, yBase + CARD_H / 2 + 14);
      }
      ctx.textAlign = "left";
      cursorX += lw.width + WORD_GAP;
    }
    cursorY += rowH + ROW_GAP;
  }

  return canvas;
}

function fullSentence(words: WordTransliteration[]): string {
  return words.map((w) => w.original).join(" ");
}

export async function exportGlyphsAsPng(words: WordTransliteration[], options?: GlyphExportOptions) {
  const canvas = await renderAksaraGlyphsToCanvas(words, options);
  const blob = await canvasToBlob(canvas, "image/png");
  downloadBlob(blob, `${safeFilename(fullSentence(words))}.png`);
}

export async function exportGlyphsAsJpg(words: WordTransliteration[], options?: GlyphExportOptions) {
  const canvas = await renderAksaraGlyphsToCanvas(words, options);
  const blob = await canvasToBlob(canvas, "image/jpeg", 0.95);
  downloadBlob(blob, `${safeFilename(fullSentence(words))}.jpg`);
}

export async function exportGlyphsAsPdf(words: WordTransliteration[], options?: GlyphExportOptions) {
  const { jsPDF } = await import("jspdf");
  const canvas = await renderAksaraGlyphsToCanvas(words, options);
  const imgData = canvas.toDataURL("image/png");

  const pxToMm = (px: number) => (px / 96) * 25.4;
  const cssWidth = parseFloat(canvas.style.width);
  const cssHeight = parseFloat(canvas.style.height);
  const marginMm = 10;
  const imgWidthMm = pxToMm(cssWidth);
  const imgHeightMm = pxToMm(cssHeight);

  const doc = new jsPDF({
    orientation: imgWidthMm > imgHeightMm ? "landscape" : "portrait",
    unit: "mm",
    format: [imgWidthMm + marginMm * 2, imgHeightMm + marginMm * 2],
  });
  doc.addImage(imgData, "PNG", marginMm, marginMm, imgWidthMm, imgHeightMm);
  doc.save(`${safeFilename(fullSentence(words))}.pdf`);
}

export async function exportGlyphsAsDocx(words: WordTransliteration[], options?: GlyphExportOptions) {
  const { Document, Packer, Paragraph, ImageRun, AlignmentType } = await import("docx");
  const canvas = await renderAksaraGlyphsToCanvas(words, options);
  const blob = await canvasToBlob(canvas, "image/png");
  const arrayBuffer = await blob.arrayBuffer();

  const cssWidth = parseFloat(canvas.style.width);
  const cssHeight = parseFloat(canvas.style.height);
  const maxDocWidth = 650;
  const scale = Math.min(1, maxDocWidth / cssWidth);

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new ImageRun({
                type: "png",
                data: arrayBuffer,
                transformation: {
                  width: Math.round(cssWidth * scale),
                  height: Math.round(cssHeight * scale),
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: `Teks asli: ${fullSentence(words)}`,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "Dihasilkan otomatis oleh MongondowPedia -- Aksara Mongondow (naskah suku kata asli, bukan font).",
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  const blobDocx = await Packer.toBlob(doc);
  downloadBlob(blobDocx, `${safeFilename(fullSentence(words))}.docx`);
}
