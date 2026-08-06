# Graphify Pengetahuan: Etimologi, Morfologi, & Rumpun Istilah Bahasa Mongondow

Dokumen ini berisi pemetaan relasi akar etimologi kata, pembentukan imbuhan morfologis, serta pohon kosakata kunci Bahasa Bolaang Mongondow.

---

## 1. Node Etimologi Utama Nama Wilayah & Bahasa

- **[E01] Bolaang (Golaang / Balangon)**
  - **Akar Kata**: *golaang* (menjadi terang / terbuka oleh sinar matahari di celah hutan) & *bolango/balangon* (laut / perairan).
  - **Relasi Maksud**: Merujuk pada pemukiman pesisir laut utara tempat kedudukan istana raja abad 17–19 (Bolaang Uki, Bolaang Itang, Bolaang Induk).

- **[E02] Mongondow (Momondow)**
  - **Akar Kata**: *momondow* (berseru nyaring tanda kemenangan / kegembiraan).
  - **Relasi Maksud**: Merujuk pada kelompok masyarakat pedalaman (sekitar 2 km dari Kotamobagu / Rata Mongondow).

- **[E03] Totabuan (Tabu)**
  - **Akar Kata**: *tabu* (tempat berkumpul, bertemu, atau tanah kelahiran).
  - **Kategori**: Identitas geografis & kebudayaan seluruh masyarakat Bolaang Mongondow Raya.

- **[E04] Bogani**
  - **Makna Adat**: Pahlawan, pemimpin berani, bijaksana, dan patriotik pembela masyarakat.

- **[E05] Lipu'**
  - **Makna Bahasa**: Desa, negeri, atau pemukiman warga.

- **[E06] Baloy**
  - **Makna Bahasa**: Rumah tempat tinggal (rumah panggung kayu tradisional).

- **[E07] Intau & Inaton**
  - **Makna Bahasa**: *Intau* (manusia / orang); *Inaton* (kami / kita bersama).

---

## 2. Node Morfologi Imbuhan (Prefix System Graph)

- **[M-PREF-1] Imbuhan Aktivitas (`Mo-`)**
  - **Fungsi**: Membentuk kata kerja aktif / melakukan kegiatan.
  - **Contoh Relasi**:
    - *Mo-angoi* (Datang)
    - *Mo-baca* (Membaca)
    - *Mo-inggu'* (Mandi)
    - *Mo-gama'* (Mengambil)
    - *Mo-buka'* (Membuka)

- **[M-PREF-2] Imbuhan Kemampuan & Penyebab (`Moko-`)**
  - **Fungsi**: Menyatakan hasil, akibat, atau kemampuan melakukan sesuatu.
  - **Contoh Relasi**:
    - *Moko-ondok* (Menakutkan / menyebabkan takut)
    - *Moko-tanob* (Memicu rindu / merindukan)
    - *Moko-bongol* (Berisik / menyebabkan tuli)

- **[M-PREF-3] Imbuhan Saling / Kemitraan (`Moto-`)**
  - **Fungsi**: Menyatakan hubungan timbal balik (resiprokal) dan kebersamaan.
  - **Contoh Relasi**:
    - *Moto-tompiaan* (Saling membenahi / memperlakukan dengan baik)
    - *Moto-tabian* (Saling menyayangi / mengasihi)
    - *Moto-tanoban* (Saling merindukan / memperingati)

- **[M-PREF-4] Imbuhan Instrumen / Alat (`Po-` / `Tosi-`)**
  - **Fungsi**: Menyatakan wadah, peralatan, atau sarana kegiatan.
  - **Contoh Relasi**:
    - *Po-ninsing* (Jemuran / tempat menjemur)
    - *Po-ningka'an* (Pernikahan / hajatan)
    - *Tosi-ugan* (Tempat tidur / ranjang)

---

## 3. Node Kosakata Lingkungan Alam & Kehidupan

- **[E-ALAM-1] Tubig (Air)** ──> *Lana Buta'* (Minyak Tanah) / *Lana Bango'* (Minyak Kelapa)
- **[E-ALAM-2] Bulud (Gunung)** ──> *Buta'* (Tanah) / *Bungayon* (Pasir)
- **[E-ALAM-3] Dolom (Malam)** ──> *Gobi'i* (Malam Hari) / *Sindip* (Gelap)
- **[E-ALAM-4] Singgai (Siang / Hari)** ──> *Mata Singgai* (Matahari)

---

## 4. Graph Relasi Morfologi (Network Graph)

```
                     [Akar Kata: TABI (Sayang)]
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
          [Mo-tabi (Mencintai)]     [Moto-tabian (Saling Menyayangi)]
                                               │
                                               ▼
                                  [Tri-Motto Falsafah BMR]

                     [Akar Kata: TOMPI (Bagus/Baik)]
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
          [Mo-pira (Bagus)]        [Moto-tompiaan (Saling Memperbaiki)]

                     [Akar Kata: TANOB (Rindu/Ingat)]
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
        [Moko-tanob (Merindukan)]  [Moto-tanoban (Saling Merindukan)]
```
