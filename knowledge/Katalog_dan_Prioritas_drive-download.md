# Katalog & Rekomendasi Prioritas — Folder "drive-download-20260727..."

42 file PDF di folder ini. **3 file sudah diproses** (lihat arsip_verbatim/12-14).
**2 pasang file adalah duplikat identik** (byte-sama) — aman diabaikan salah satunya:
- `Mengenal Raja Raja Bolaang Mongondow001.pdf` = `...001(1).pdf` (57 MB)
- `masuknya agama Islam di Sulawesi Utara001.pdf` = `...001(1).pdf` (17.2 MB)

Sisanya **belum diproses** (37 file unik) karena hampir semua adalah PDF hasil
scan berukuran besar (15–80 MB, kemungkinan ratusan halaman) — OCR penuh untuk
semuanya akan memakan waktu sangat lama. Berikut rekomendasi prioritas untuk
sesi lanjutan:

## Prioritas Tinggi — spesifik Bolaang Mongondow

| File | Ukuran | Topik |
|---|---|---|
| `DATOE BINANGKANG RAJA MANADO 1644-1689 PELOPOR KEMERDEKAAN DI NUSANTARA001.pdf` | 37 MB | Tentang Datu Binangkang (= Loloda Mokoagow) — pelengkap penting untuk Sejarah_Bolaang_Mongondow.md |
| `Mengenal Bolaang Mongondow001.pdf` | 63 MB | Kemungkinan versi lebih lengkap dari `arsip_verbatim/05_mengenal_bolaang_mongondow.md` |
| `Mengenal Raja Raja Bolaang Mongondow001.pdf` | 57 MB | Pelengkap kronologi raja (bandingkan dengan `04_kisah_raja_raja...`) |
| `Kumpulan cerita rakyat Bolaang Mongondow001.pdf` | 64 MB | Sastra lisan/cerita rakyat tambahan |
| `SEJARAH DAERAH BOLMONG001.pdf` | 40 MB | Sejarah daerah |
| `Syamanisme BolaangMongondow.pdf` | 12 MB | Spiritualitas/perdukunan tradisional — pelengkap Adat_dan_Budaya |
| `De zending in Bolaa_ng Mongondow.pdf` | 2.7 MB | Sejarah misi Kristen Belanda di Bolaang Mongondow (36 hal, sebagian scan) |
| `FAKTOR-FAKTOR KEBERHASILAN PEMEKARAN.pdf` | 868 KB | Kecil, kemungkinan cepat diproses |

## Prioritas Sedang — konteks Sulawesi Utara/Gorontalo (tetangga)

`Bintang Minahasa.pdf`, `Minahasa001.pdf`, `Sedjarah MINAHASA001.pdf`,
`Wanita Minahasa.pdf`, `Sejarah Pekaran Injil di Minahasa.pdf`,
`Sejarah perlawanan terhadap imperialisme kolonialisme sulawesi utara.pdf`,
`masuknya agama Islam di Sulawesi Utara001.pdf`,
`SEJARAH PERKEMBANGAN ISLAM di Tombatu.pdf`,
`De Katholieke Missie in Noord Celebes en de Sangi eilanden, 1563-1605 (1933).pdf` (79 MB, Belanda),
`Reisen in Celebes, 1893-1896.pdf` (24 MB, Belanda),
`Sastra Lisan Sangir Talaud001.pdf` (56 MB, etnis berbeda — Sangihe-Talaud).

## Prioritas Rendah — Nusantara umum / di luar Sulawesi Utara

`A study of the Islamisation of South Sulawesi...pdf`, `ADRIAN LAPIAN - PETA PELAYARAN NUSANTARA...pdf`,
`ANALISIS KONFLIK PEREBUTAN WILAYAH DI MALUKU UTARA.pdf`, `Aceh Membangun.pdf`,
`Ariel Lopez_Disertasi di Leiden.pdf` (riset soal Filipina — relevan untuk klaim
asal-usul Aksara Bicol, lihat `Aksara_Bolaang_Mongondow.md`, tapi bukan soal Mongondow langsung),
`Buku Kerajaan Islam Nusantara abad XVII.pdf`, `Buku Sejarah_Kepulauan_Rempah_Rempah.pdf`,
`Buku-panduan-desa1.pdf` & `Modul-Pemberdayaan-Masyarakat-Desa.pdf` (modul generik, bukan sejarah),
`Laporan_Akhir_2016_1.pdf`, `Sejarah Kebangkitan Nasional Daerah Bengkulu.pdf`,
`Singapore and the Silk Road of the Sea, 1300-1800.pdf`,
`Sistem Pengetahuan dan Tradisi Bahari.pdf`, `Tesis_Kebudayaan megalitik di Sulawesi Selatan.pdf`,
`The Jesuit Makassar Documents, 1615-1682.pdf`, `The Portuguese Slave Trade to Spanish Manila 1580-1640.pdf`,
`The_World_of_the_Pasisir_1400-1942.pdf`.

## Kendala teknis yang perlu diketahui

- OCR dijalankan lokal (tesseract) memakai model bahasa **Inggris** saja —
  sandbox saya tidak bisa mengunduh model Indonesia/Belanda (domain
  GitHub/HuggingFace terblokir jaringan). Hasil OCR untuk teks Indonesia
  tercetak rapi tetap bagus (sudah teruji), tapi untuk dokumen Belanda lama
  (fraktur/ejaan lama) akurasinya akan lebih rendah.
- Kecepatan OCR lokal ±3 detik/halaman. Buku 60 MB kemungkinan berisi
  200-400+ halaman → bisa makan 15-25 menit pemrosesan per buku.
- Beri tahu saya file mana yang mau diproses dulu, saya lanjutkan bertahap.
