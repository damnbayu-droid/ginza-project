# Aksara Bolaang Mongondow

> Dokumen ini adalah basis pengetahuan untuk **Bogani AI** tentang aksara
> (sistem tulisan tradisional) Bolaang Mongondow. Disusun dari bagan aksara,
> papan tulis latihan transliterasi, dan fragmen naskah sejarah — seluruhnya
> koleksi pengguna proyek Ginza. Data terstruktur (mesin-baca) dari dokumen
> ini tersedia di `data/aksara/aksara_mongondow.json`, `aksara_syllables.csv`,
> `aksara_examples.csv`, dan tabel Supabase `mongondow_aksara_*` (lihat
> `supabase/migrations/20260802_aksara_mongondow.sql`).

## 1. Apa itu Aksara Bolaang Mongondow?

"Aksara Bolaang Mongondow" (juga disebut **Aksara Bicol Bolaang Mongondow**)
adalah sistem tulisan berjenis **abugida** — mirip aksara Baybayin/Basahan
dari Filipina (aksara Bicolano) — yang menurut riset komunitas sejarah lokal
**Historia Bolaang Mongondow Raya (HistoriaBMR)** pernah dipakai di wilayah
Kerajaan Bolaang Mongondow. Bagan referensi yang dipakai di sini berjudul
*"Loloda Mokoagow"*, disusun ulang oleh **@atmabumiangkasa** (Instagram).

### Status akademik — penting untuk disampaikan apa adanya

Klaim penggunaan historis aksara ini di Bolaang Mongondow bersumber dari:

- Temuan garis-garis aksara pada artefak logam **"Boyo-boyo"** (wadah sirih
  pinang/perhiasan) peninggalan Istana Komalig, yang setelah "diterjemahkan"
  memakai aksara Bicol dibaca sebagai *"Tampat Ing Boyo"*.
- Sebuah fragmen naskah berbahasa Spanyol yang memuat coretan aksara,
  dibaca oleh HistoriaBMR sebagai *"Loloda Mokoagow"* — nama seorang Datu
  Bolaang Mongondow abad ke-17.

Klaim ini **belum menjadi konsensus akademik arus utama**, dan menurut sumber
yang sama (HistoriaBMR), penelitian ini "sangat ditentang oleh peneliti
lainnya". Bogani AI sebaiknya menyajikan aksara ini sebagai **materi
budaya/edukasi komunitas** dengan atribusi jelas ke @atmabumiangkasa dan
HistoriaBMR — bukan sebagai fakta sejarah yang final/tidak terbantahkan.

## 2. Struktur Penulisan (cara kerja aksara ini)

Aksara ini adalah **abugida**: satu simbol dasar = satu konsonan + vokal
inheren **"a"**. Vokal lain didapat dengan mengubah/menambah tanda kecil
(diakritik) pada simbol yang sama, dan konsonan bisa "dimatikan" (tanpa
vokal) dengan tanda tambahan.

Bagan tersusun dalam **15 kolom** (satu per konsonan dasar, ditambah satu
kolom untuk vokal murni tanpa konsonan) dan **4 baris**:

1. **Baris 1 — vokal "a"**: `a, ba, ka, da, ga, ha, la, ma, na, nga, pa, sa, ta, wa, ya`
   (bentuk dasar setiap simbol).
2. **Baris 2 — vokal "e"/"i"**: satu simbol yang sama dipakai untuk kedua
   bunyi ini, dibedakan lewat tanda kecil di atas simbol (mirip *kudlit*
   pada Baybayin/Basahan) — mis. simbol yang sama untuk `be` dan `bi`.
3. **Baris 3 — vokal "o"/"u"**: sama seperti baris 2, satu simbol untuk dua
   bunyi, mis. `bo`/`bu` memakai simbol yang sama.
4. **Baris 4 — konsonan mati/akhir**: konsonan tanpa vokal, ditulis dengan
   menambahkan **tanda silang "+"** di bawah simbol dasarnya — mirip fungsi
   *krus-kudlit/pamudpod* yang diperkenalkan misionaris Spanyol pada aksara
   Filipina untuk mematikan bunyi vokal. Huruf **"h" tidak memiliki bentuk
   mati** pada bagan ini (tidak ada `h` di baris 4).

Total ada **14 konsonan** (b, k, d, g, h, l, m, n, ng, p, s, t, w, y) plus
1 kolom vokal murni. Dari situ tersusun **88 suku kata unik**: 15 (baris a)
+ 30 (baris e/i) + 30 (baris o/u) + 13 (baris mati, tanpa "a" dan "h").

### Tabel referensi cepat (romanisasi)

| Konsonan | +a  | +e / +i   | +o / +u   | mati |
|----------|-----|-----------|-----------|------|
| —        | a   | e / i     | o / u     | —    |
| b        | ba  | be / bi   | bo / bu   | b    |
| k        | ka  | ke / ki   | ko / ku   | k    |
| d        | da  | de / di   | do / du   | d    |
| g        | ga  | ge / gi   | go / gu   | g    |
| h        | ha  | he / hi   | ho / hu   | —    |
| l        | la  | le / li   | lo / lu   | l    |
| m        | ma  | me / mi   | mo / mu   | m    |
| n        | na  | ne / ni   | no / nu   | n    |
| ng       | nga | nge / ngi | ngo / ngu | ng   |
| p        | pa  | pe / pi   | po / pu   | p    |
| s        | sa  | se / si   | so / su   | s    |
| t        | ta  | te / ti   | to / tu   | t    |
| w        | wa  | we / wi   | wo / wu   | w    |
| y        | ya  | ye / yi   | yo / yu   | y    |

Cara membaca kata: pecah kata menjadi suku kata (konsonan+vokal, atau
konsonan mati di akhir kata), lalu cocokkan tiap suku kata dengan tabel
di atas. Untuk menuliskan konsonan berurutan di tengah kata (tanpa vokal
di antaranya), suku kata sebelumnya ditulis dalam bentuk mati (baris 4).

## 3. Contoh Kata & Frasa

| Kata (Latin)              | Pecahan suku kata                          | Arti / catatan | Keyakinan |
|----------------------------|---------------------------------------------|-----------------|-----------|
| **Totabuan**               | to–ta–bu–a–n                                | Julukan/nama tradisional untuk seluruh wilayah Bolaang Mongondow ("Tanah Totabuan"). | Diperkirakan |
| **(Bo)laang Mongondow**     | (bo)–la–a–ng–mo–ngo–n–do–w                  | Diduga kuat penulisan nama "Bolaang Mongondow"; suku kata "bo" di awal kemungkinan terpotong pada foto sumber. | Belum pasti |
| **Loloda Mokoagow**         | lo–lo–da–mo–ko–a–go–w                       | Nama Datu (raja) Bolaang Mongondow abad ke-17, penguasa pertama yang memakai gelar raja; dikenal Belanda sebagai "Datu Binangkang". | Terverifikasi (sumber eksternal) |
| Mototompiyaan (?)          | mo–to–to–m–pi–ya–a–n                        | Latihan transliterasi papan tulis; arti belum terverifikasi. | Belum pasti |
| Mototabian (?)              | mo–to–ta–bi–a–n                             | Latihan transliterasi papan tulis; arti belum terverifikasi. | Belum pasti |
| Bomototanoban (?)           | bo–mo–to–ta–no–ba–n                         | Latihan transliterasi papan tulis; arti belum terverifikasi. | Belum pasti |

**Catatan penting:** untuk contoh dengan keyakinan "Belum pasti", Bogani AI
tidak boleh menyampaikan arti kata sebagai fakta pasti. Selalu sebutkan
bahwa arti/pembacaan tersebut masih perlu diverifikasi penutur asli atau
kamus rujukan Bahasa Mongondow (lihat `kamus/` dan `knowledge/Bahasa_Mongondow_Kuno_Acuan_Utama.md`).

## 4. Tokoh Sejarah Terkait

**Loloda Mokoagow** — Datu Bolaang Mongondow yang memerintah sekitar
1650-an hingga setelah 1694. Ia adalah pemimpin Bolaang Mongondow pertama
yang memakai gelar raja, juga dikenal sebagai "Datu Binangkang", "Koning
van Manado", "Koning van Bulan", dan "Koning van Amuera" dalam arsip
Belanda. Pada 1694 ia menandatangani perjanjian batas dengan Federasi
Minahasa dan VOC, sejak itu kerajaan dikenal sebagai "Kerajaan
Bola'ang-Mongondow" dalam dokumen Belanda.

## 5. Kredit & Sumber

- Bagan aksara "Loloda Mokoagow": **@atmabumiangkasa** (Instagram).
- Riset asal-usul & klaim historis: **Historia Bolaang Mongondow Raya (HistoriaBMR)**.
- Papan tulis latihan transliterasi & fragmen naskah: koleksi pengguna proyek Ginza.
- Info tokoh sejarah Loloda Mokoagow: dikonfirmasi silang dengan sumber sejarah umum tentang Kerajaan Bolaang Mongondow.

## 6. Aset & Data Terkait

- **Gambar referensi tiap suku kata** (crop asli dari bagan): folder `public/aksara/*.png` (58 file per-suku-kata + 4 file strip per baris untuk referensi utuh).
- **Data terstruktur AI-readable**: `data/aksara/aksara_mongondow.json`.
- **Database**: tabel `mongondow_aksara_syllables`, `mongondow_aksara_examples`, `mongondow_aksara_info` (migration `supabase/migrations/20260802_aksara_mongondow.sql`) — dipakai bersama oleh website dan mobile app (Play Store/App Store) lewat Supabase.
- **Komponen interaktif**: `components/AksaraMongondow.tsx` (untuk halaman web) dan `aksara_mongondow_interaktif.html` (versi mandiri, bisa dibuka di browser mana pun).
