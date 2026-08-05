/**
 * Export hasil transliterasi Aksara Mongondow (yang dirender pakai font asli
 * AksaraMongondow.ttf, bukan gambar SVG per-suku-kata) ke berbagai format
 * file: PNG, JPG, PDF, DOCX.
 *
 * Strategi: render SEKALI ke <canvas> beresolusi tinggi (device-pixel-ratio
 * disesuaikan biar tajam), lalu semua format lain (PDF, DOCX) memakai bitmap
 * PNG dari canvas itu sebagai sumber gambar. Ini paling andal karena hasilnya
 * dijamin identik dgn yang terlihat di layar, tidak tergantung apakah font
 * ini ter-install di aplikasi/komputer penerima file.
 */

const FONT_FAMILY = "AksaraMongondow";

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
