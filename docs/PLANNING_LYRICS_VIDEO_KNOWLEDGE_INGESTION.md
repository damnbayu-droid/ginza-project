# 📜 RENCANA (PLANNING): Ingest Pengetahuan dari Lirik Lagu, Dokumen & Video

## Sumber Pengetahuan Baru untuk Bogani AI dari Lagu-Lagu & Video Berbahasa Mongondow

---

## 📌 1. Latar Belakang

Boss Bayu ingin memperkaya korpus pengetahuan Bogani AI dengan data terbaru soal Bahasa Mongondow yang bersumber dari lagu-lagu (lirik) dan video, supaya AI lebih mudah belajar kosakata, ungkapan, dan konteks budaya yang belum ada di Kamus/Knowledge Base saat ini.

Riset (2026-08-18) menemukan: pipeline "AI Farming Knowledge" (chat log → AI triase harian → review admin → RAG, dibangun sesi sebelumnya) sudah punya jalur masuk data mentah yang generik dan **sudah berfungsi**, tapi belum pernah dipakai untuk kasus ini:

- `lib/data-center.ts#saveToDataCenter()` — terima teks mentah/dokumen/file, otomatis convert gambar ke WebP, insert ke `gw_data_center`.
- `POST /api/data-center` (`app/api/data-center/route.ts`) — endpoint admin (owner-only) yang sudah menerima `{ raw_text, file, fileMimeType, tags, language, document_type }` dengan `source_type: "manual_document"`.
- **Belum ada UI admin sama sekali** yang memanggil endpoint ini — cuma bisa dipakai lewat API mentah/curl sekarang.

Setelah masuk `gw_data_center`, alur selanjutnya SUDAH ADA dan teruji: AI triase (cron harian) → `knowledge_candidates` → panel admin `KnowledgeCandidatesPanel.tsx` (review manual) → masuk Knowledge Base publik dengan label "belum terverifikasi" sampai disetujui.

---

## 🎯 2. Tujuan

Bangun **satu form admin sederhana** ("Tambah Pengetahuan dari Lirik/Dokumen") yang jadi pintu masuk manusia (admin/Boss Bayu) untuk menyalin lirik lagu, transkrip, atau teks lain ke dalam pipeline AI Farming Knowledge yang sudah ada — tanpa membangun infrastruktur baru, cukup menyambungkan UI ke endpoint `POST /api/data-center` yang sudah berfungsi.

## 🧩 3. Cakupan (Scope) — Fase 1 (yang akan dibangun duluan)

1. **Form input** di dashboard admin (panel baru atau sub-tab di panel yang relevan, mis. dalam "Celah Pengetahuan (AI)"):
   - Judul/sumber (mis. nama lagu, penyanyi/pencipta, link YouTube opsional)
   - Textarea lirik/teks mentah
   - Tag opsional (mis. "lagu", "adat", "sejarah")
   - Bahasa (default `id`/Mongondow)
2. **Submit** → `POST /api/data-center` dgn `source_type: "manual_document"`, `document_type: "lyrics"` (tag baru, cek dulu constraint kolom `document_type` di `gw_data_center` — sepertinya kolom bebas/text, bukan enum, perlu diverifikasi saat implementasi).
3. **Tautkan ke antrian triase** — pastikan cron `extract-knowledge` (sudah ada, `app/api/cron/extract-knowledge/route.ts`) memproses baris baru ini sama seperti `chat_memory_fact`.
4. **Verifikasi end-to-end**: submit contoh lirik → cek muncul di `gw_data_center` → cek AI triase memprosesnya jadi `knowledge_candidates` → cek muncul di panel review admin.

## 🚀 4. Opsi Lanjutan: Belajar Langsung dari LINK (Fase 2+, BELUM dikerjakan, didiskusikan dulu sebelum mulai)

Boss Bayu menanyakan (2026-08-18): bisakah Bogani AI "belajar" langsung dari link yang dikirim (YouTube, TikTok, Instagram, atau file mp3/rekaman suara)? **Bisa, tapi tingkat keandalannya beda-beda per sumber** — semua jalur di bawah ini pada akhirnya mengubah sumbernya jadi TEKS lalu masuk ke pipeline Fase 1 yang sama (`gw_data_center` → triase AI → **review admin WAJIB**, bukan opsional).

| Opsi | Kapan dipakai | Kebutuhan teknis | Keandalan |
|---|---|---|---|
| **A. Caption/transkrip YouTube** | Video punya caption resmi/otomatis | Ambil teks caption → masuk Fase 1 sbg teks biasa. Paling murah, tanpa AI transkripsi sama sekali. | **Tinggi** kalau captionnya manual (ditulis manusia yg paham liriknya) |
| **B. Upload file MP3/rekaman langsung** | Lagu/audio tanpa caption | Google Cloud Speech-to-Text (sudah terintegrasi, dipakai Voice Mode STT) — terima file audio, transkrip otomatis | **Sedang** — lihat catatan di bawah |
| **C. Link TikTok/Instagram** | Konten cuma ada di platform tsb | Perlu library pihak-ketiga utk download (TikTok/Instagram tak punya API resmi utk ini) → ekstrak audio (ffmpeg) → lanjut ke Opsi B | **Rendah/rapuh** — library sering rusak tiap platform ubah struktur situs, & area abu-abu soal ToS platform. **Bukan prioritas pertama.** |
| **D. Gemini video understanding** | Lirik/teks cuma tampil visual di layar (bukan di audio), atau perlu paham konteks visual video | Panggilan API Gemini baru dgn input video — **kerja lintas-repo**, Gateway (myai-os-console) sudah pakai Gemini sbg provider tapi belum ada endpoint video | Tinggi kalau berhasil, tapi paling mahal & paling belakangan |

**⚠️ Catatan penting soal Opsi B & C — akurasi transkripsi Bahasa Mongondow:**
Google Speech-to-Text **tidak punya model Bahasa Mongondow** — dia cuma mengenali Bahasa Indonesia umum (id-ID). Ini masalah yang SAMA dengan yang sudah kita tangani di `lib/mongondow-voice.ts` untuk arah sebaliknya (teks→suara/TTS tak paham fonem Mongondow) — di sini arahnya kebalik (suara→teks) tapi akar masalahnya identik. Artinya: transkrip otomatis dari lagu berbahasa Mongondow akan banyak salah dengar/typo pada kata-kata Mongondow-nya, dan **wajib dikoreksi manusia** sebelum disetujui masuk Knowledge Base. Untungnya langkah review admin di Fase 1 memang sudah ada utk ini — bukan infrastruktur baru, cuma makin krusial perannya di jalur ini.

**Rekomendasi urutan pengerjaan Fase 2 (kalau/ketika dilanjutkan):** A → B → D, dan lewati C kecuali benar-benar tidak ada alternatif (kontennya cuma ada di TikTok/Instagram).

**Catatan:** Opsi D butuh koordinasi dengan sesi Gateway (myai-os-console) karena semua routing provider AI ada di sana, bukan di repo Ginza ini.

## ✅ 5. Definition of Done (Fase 1) — SELESAI 2026-08-19

- [x] Verifikasi kolom `document_type` di `gw_data_center` — free text, tidak ada CHECK constraint, tidak perlu migrasi
- [x] Form admin baru ("Tambah Pengetahuan dari Lirik/Dokumen") terhubung ke `POST /api/data-center`, ditaruh di panel "Celah Pengetahuan (AI)" (`KnowledgeCandidatesPanel.tsx`)
- [x] Rate limit (`RATE_LIMITS.MANUAL_KNOWLEDGE`, 15/10menit) & validasi input (wajib isi, maks 20.000 karakter) ditambahkan ke `POST /api/data-center`
- [x] **Perbedaan penting dari rencana awal**: baris manual TIDAK lewat cron `extract-knowledge` sama sekali (cron itu cuma proses `chat_memory_fact`, memang didesain menyaring noise obrolan) — sebagai gantinya baris manual langsung diberi `manual_review_required=true` saat insert, dan `lib/ginza-db.ts#listDataCenterCandidates()` diperluas dari `.eq("source_type","chat_memory_fact")` jadi `.in("source_type", ["chat_memory_fact","manual_document"])` supaya kedua sumber tampil di panel review yang sama. Ini lebih tepat karena submission manual sudah sengaja dikurasi admin, tidak perlu disaring AI dulu.
- [x] Verifikasi end-to-end (curl, data uji sudah dihapus): submit → muncul di `gw_data_center` dgn `manual_review_required=true` → langsung muncul di `GET /api/admin/knowledge-candidates?status=pending` → approve via PATCH → `review_status` jadi `approved`
- [x] Tidak ada perubahan pada pipeline chat log (`chat_memory_fact`) yang sudah berjalan — dikonfirmasi baris lama tetap tampil normal setelah perubahan filter
