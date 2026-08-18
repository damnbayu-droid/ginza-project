/**
 * Helper klien bersama utk upload gambar konten (body Artikel & Knowledge,
 * plus cover image kedua-duanya) -- dipakai oleh app/u/tulis-artikel/client.tsx
 * & components/dashboard/panels/DatabaseKnowledgePanel.tsx. Konversi WebP &
 * upload ke Supabase Storage terjadi di server (app/api/upload-image/route.ts);
 * di sini cuma baca file jadi data URL & validasi ukuran cepat di klien
 * (validasi ASLI tetap di server, ini cuma feedback cepat).
 */
export const MAX_CONTENT_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export async function uploadContentImage(file: File, scope: "articles" | "knowledge" | "avatars"): Promise<string> {
  if (file.size > MAX_CONTENT_IMAGE_BYTES) {
    throw new Error("Ukuran gambar maksimal 2MB");
  }

  const imageBase64 = await readFileAsDataUrl(file);
  const res = await fetch("/api/upload-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, scope }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Gagal mengunggah gambar");
  }
  return data.url as string;
}

/** Sisipkan teks di posisi kursor textarea (bukan selalu di akhir). */
export function insertAtCursor(textarea: HTMLTextAreaElement | null, current: string, insertText: string): { text: string; cursorPos: number } {
  if (!textarea) {
    const text = current + insertText;
    return { text, cursorPos: text.length };
  }
  const start = textarea.selectionStart ?? current.length;
  const end = textarea.selectionEnd ?? current.length;
  const text = current.slice(0, start) + insertText + current.slice(end);
  return { text, cursorPos: start + insertText.length };
}
