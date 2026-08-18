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

## 🚀 4. Opsi Lanjutan (Fase 2+, BELUM dikerjakan, didiskusikan dulu sebelum mulai)

Kalau Fase 1 (teks manual) sudah jalan tapi ternyata kebutuhannya memang video-native (bukan sekadar teks lirik), ada 3 jalur tambahan, urut dari paling murah ke paling kompleks:

| Opsi | Kapan dipakai | Kebutuhan teknis | Kompleksitas |
|---|---|---|---|
| **A. Tarik caption/transkrip YouTube** | Video punya caption resmi/otomatis | Ambil teks caption → masukkan ke Fase 1 sbg teks biasa | Rendah |
| **B. Google Cloud Speech-to-Text** | Lagu/audio tanpa caption sama sekali | Sudah terintegrasi (dipakai Voice Mode STT) — tinggal terima file audio & transkrip | Sedang |
| **C. Gemini video understanding** | Perlu AI "menonton" video (lirik cuma tampil di layar, atau perlu paham konteks visual) | Panggilan API Gemini baru dgn input video — **kerja lintas-repo**, Gateway (myai-os-console) sudah pakai Gemini sbg salah satu provider tapi belum ada endpoint video | Tinggi |

**Catatan:** Opsi C butuh koordinasi dengan sesi Gateway (myai-os-console) karena semua routing provider AI ada di sana, bukan di repo Ginza ini.

## ✅ 5. Definition of Done (Fase 1)

- [ ] Migrasi/verifikasi kolom `document_type` di `gw_data_center` mendukung nilai bebas (bukan enum terbatas)
- [ ] Form admin baru terhubung ke `POST /api/data-center`
- [ ] Rate limit & validasi input (panjang teks maks, dll) ditambahkan ke endpoint kalau belum ada
- [ ] Verifikasi end-to-end: submit → `gw_data_center` → triase AI → `knowledge_candidates` → panel review
- [ ] Tidak ada perubahan pada pipeline chat log (`chat_memory_fact`) yang sudah berjalan
