'use client';

import { useState } from "react";
import Link from "next/link";
import {
  Gamepad2,
  HelpCircle,
  PenTool,
  ArrowLeft,
  Sparkles,
  Trophy,
  Flame,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Zap,
  Star,
  ChevronRight,
  Brain
} from "lucide-react";

type Level = "easy" | "challenge" | "hard";

interface Question {
  id: string;
  question: string;
  subtext?: string;
  svgPath?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface GamePack {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  iconColor: string;
  questions: Record<Level, Question[]>;
}

// ── Bank Soal 3 Paket Cerdas Cermat (Real SVG Vektor & Authentic Database References) ────
const GAME_PACKS: GamePack[] = [
  {
    id: 1,
    title: "Paket 1: Dasar Aksara & Budaya",
    subtitle: "Mengenal Aksara, Kata Pendek & Ungkapan Adat Utama",
    badge: "Paket Utama",
    description: "Latihan 10 simbol konsonan Aksara Mongondow (SVG Vektor), 10 kata pendek populer, dan 10 falsafah ungkapan adat.",
    iconColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    questions: {
      easy: [
        {
          id: "p1_e1",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          subtext: "Perhatikan bentuk goresan Aksara Mongondow di atas",
          svgPath: "/aksara-svg/row1_ka.svg",
          options: ["Ka", "Ga", "Nga", "Ta"],
          correctIndex: 0,
          explanation: "Gambar SVG vektor di atas adalah bentuk resmi Aksara Mongondow untuk konsonan 'Ka'."
        },
        {
          id: "p1_e2",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          svgPath: "/aksara-svg/row1_ga.svg",
          options: ["Ga", "Ka", "Da", "Na"],
          correctIndex: 0,
          explanation: "Gambar SVG di atas melambangkan konsonan 'Ga' dalam ejaan Aksara Mongondow."
        },
        {
          id: "p1_e3",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          svgPath: "/aksara-svg/row1_nga.svg",
          options: ["Nga", "Ma", "Ba", "Pa"],
          correctIndex: 0,
          explanation: "Simbol di atas melambangkan konsonan nasal velar 'Nga'."
        },
        {
          id: "p1_e4",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          svgPath: "/aksara-svg/row1_ta.svg",
          options: ["Ta", "Da", "Sa", "Ya"],
          correctIndex: 0,
          explanation: "Simbol di atas melambangkan konsonan 'Ta'."
        },
        {
          id: "p1_e5",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          svgPath: "/aksara-svg/row1_da.svg",
          options: ["Da", "Ta", "Na", "Ra"],
          correctIndex: 0,
          explanation: "Simbol di atas melambangkan konsonan 'Da'."
        },
        {
          id: "p1_e6",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          svgPath: "/aksara-svg/row1_na.svg",
          options: ["Na", "Ma", "Nga", "La"],
          correctIndex: 0,
          explanation: "Simbol di atas melambangkan konsonan nasal 'Na'."
        },
        {
          id: "p1_e7",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          svgPath: "/aksara-svg/row1_pa.svg",
          options: ["Pa", "Ba", "Wa", "Ha"],
          correctIndex: 0,
          explanation: "Simbol di atas melambangkan konsonan bilabial 'Pa'."
        },
        {
          id: "p1_e8",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          svgPath: "/aksara-svg/row1_ba.svg",
          options: ["Ba", "Pa", "Ma", "Ga"],
          correctIndex: 0,
          explanation: "Simbol di atas melambangkan konsonan 'Ba'."
        },
        {
          id: "p1_e9",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          svgPath: "/aksara-svg/row1_ma.svg",
          options: ["Ma", "Na", "Nga", "Ya"],
          correctIndex: 0,
          explanation: "Simbol di atas melambangkan konsonan nasal 'Ma'."
        },
        {
          id: "p1_e10",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          svgPath: "/aksara-svg/row1_ya.svg",
          options: ["Ya", "Ra", "La", "Wa"],
          correctIndex: 0,
          explanation: "Simbol di atas melambangkan semivokal 'Ya'."
        }
      ],
      challenge: [
        {
          id: "p1_c1",
          question: "Apa arti dari kata Bahasa Mongondow 'Nyon'?",
          options: ["Saya / Aku", "Kamu / Engkau", "Mereka", "Kita"],
          correctIndex: 0,
          explanation: "'Nyon' atau 'Nion' berarti 'Saya' atau 'Aku' dalam tutur Bahasa Mongondow."
        },
        {
          id: "p1_c2",
          question: "Apa arti dari kata Bahasa Mongondow 'Boluya'?",
          options: ["Teman / Sahabat", "Musuh", "Keluarga", "Tetangga"],
          correctIndex: 0,
          explanation: "'Boluya' berarti sahabat akrab atau teman dekat."
        },
        {
          id: "p1_c3",
          question: "Apa arti dari kata 'Komintan'?",
          options: ["Semuanya / Seluruhnya", "Sebagian", "Sedikit", "Kosong"],
          correctIndex: 0,
          explanation: "'Komintan' berarti seluruh warga atau semua hal secara kolektif."
        },
        {
          id: "p1_c4",
          question: "Apa arti dari kata 'Toko'?",
          options: ["Rumah / Kediaman", "Pasar", "Jalan", "Kebun"],
          correctIndex: 0,
          explanation: "'Toko' atau 'Baloi' merujuk pada rumah atau tempat tinggal."
        },
        {
          id: "p1_c5",
          question: "Apa arti kata 'Boin'?",
          options: ["Hari ini", "Kemarin", "Besok", "Lusa"],
          correctIndex: 0,
          explanation: "'Boin' merujuk pada waktu hari ini."
        },
        {
          id: "p1_c6",
          question: "Apa arti kata 'Kiat'?",
          options: ["Kuat / Tangguh", "Lemah", "Kecil", "Ringan"],
          correctIndex: 0,
          explanation: "'Kiat' berarti memiliki kekuatan fisik atau mental yang tangguh."
        },
        {
          id: "p1_c7",
          question: "Apa arti kata 'Tano'?",
          options: ["Tanah / Negeri", "Laut", "Langit", "Batu"],
          correctIndex: 0,
          explanation: "'Tano' berarti tanah air, bumi, atau wilayah negeri."
        },
        {
          id: "p1_c8",
          question: "Apa arti kata 'Sapa'?",
          options: ["Siapa / Apa", "Bagaimana", "Kapan", "Di mana"],
          correctIndex: 0,
          explanation: "'Sapa' adalah kata tanya yang berarti siapa atau apa."
        },
        {
          id: "p1_c9",
          question: "Apa arti angka 'Tolu'?",
          options: ["Tiga", "Satu", "Dua", "Empat"],
          correctIndex: 0,
          explanation: "'Tolu' berarti bilangan tiga (3) dalam Bahasa Mongondow."
        },
        {
          id: "p1_c10",
          question: "Apa arti kata 'Dapot'?",
          options: ["Sampai / Tiba", "Pergi", "Hilang", "Kembali"],
          correctIndex: 0,
          explanation: "'Dapot' berarti telah sampai atau tiba di tujuan."
        }
      ],
      hard: [
        {
          id: "p1_h1",
          question: "Apa makna ungkapan adat 'Palu'an kon komintan'?",
          options: [
            "Menjaga kebersamaan dan musyawarah mufakat untuk semua",
            "Mencari keuntungan pribadi dalam berdagang",
            "Berlomba-lomba memenangkan pertandingan",
            "Menghukum pihak yang melanggar norma"
          ],
          correctIndex: 0,
          explanation: "'Palu'an kon komintan' adalah prinsip musyawarah adat untuk mencapai mufakat bagi kesejahteraan bersama."
        },
        {
          id: "p1_h2",
          question: "Apa arti ungkapan 'Kopompia mo kon lipu'?",
          options: [
            "Memperbaiki dan memajukan kampung halaman",
            "Meninggalkan kampung untuk pergi merantau",
            "Membuat pagar sekeliling rumah",
            "Menyelenggarakan pesta adat tahunan"
          ],
          correctIndex: 0,
          explanation: "'Kopompia mo kon lipu' berarti seruan moral untuk senantiasa membangun dan menata kebaikan negeri."
        },
        {
          id: "p1_h3",
          question: "Apa arti ungkapan 'Batuu im mogogon'?",
          options: [
            "Persatuan yang kokoh seperti batu teguh",
            "Sungai yang mengalir deras",
            "Pohon besar yang rindang",
            "Gunung yang sangat tinggi"
          ],
          correctIndex: 0,
          explanation: "'Batuu im mogogon' melambangkan ikatan persaudaraan yang kokoh tak tergoyahkan."
        },
        {
          id: "p1_h4",
          question: "Apa arti ungkapan 'Oyu'on kon guba'?",
          options: [
            "Ada dalam ingatan dan penghormatan leluhur",
            "Tersimpan di dalam peti emas",
            "Tertulis dalam buku sejarah lama",
            "Terbang bersama angin malam"
          ],
          correctIndex: 0,
          explanation: "'Oyu'on kon guba' berarti warisan nilai yang selalu diingat dan dihormati anak cucu."
        },
        {
          id: "p1_h5",
          question: "Apa arti ungkapan 'Moyotaman kon totabuan'?",
          options: [
            "Saling mengasihi di daerah tempat tinggal",
            "Membagi hasil panen ke pasar",
            "Berjalan bersama ke hutan",
            "Menjaga benteng pertahanan"
          ],
          correctIndex: 0,
          explanation: "'Moyotaman kon totabuan' berarti memelihara kasih sayang dan kepedulian di bumi Totabuan."
        },
        {
          id: "p1_h6",
          question: "Apa arti ungkapan 'Moposad kon lipu'?",
          options: [
            "Gotong royong membangun desa secara bersama-sama",
            "Mengadakan perlombaan olahraga daerah",
            "Menjual hasil kebun ke luar daerah",
            "Mencatat silsilah keluarga besar"
          ],
          correctIndex: 0,
          explanation: "'Moposad' adalah budaya gotong royong khas Bolaang Mongondow."
        },
        {
          id: "p1_h7",
          question: "Apa makna 'Tolu oyongon kon adat'?",
          options: [
            "Tiga pilar utama dalam pemangku adat Mongondow",
            "Tiga jenis pakaian adat pengantin",
            "Tiga musim tanam padi di sawah",
            "Tiga jenis tarian tradisional"
          ],
          correctIndex: 0,
          explanation: "'Tolu oyongon' merujuk pada tiga tatanan tungku kepemimpinan adat."
        },
        {
          id: "p1_h8",
          question: "Apa arti ungkapan 'Nion kon komintan oyongon'?",
          options: [
            "Kita semua adalah satu keluarga besar yang menyatu",
            "Setiap orang memiliki rumah masing-masing",
            "Berbeda suku namun satu Bahasa",
            "Tugas yang harus diselesaikan bersama"
          ],
          correctIndex: 0,
          explanation: "Menjelaskan bahwa masyarakat Mongondow adalah ikatan kekeluargaan yang utuh."
        },
        {
          id: "p1_h9",
          question: "Apa arti 'Sapa mogotutui kon lipu'?",
          options: [
            "Siapa yang merawat dan menjaga kelestarian negeri",
            "Siapa yang menanam pohon di hutan",
            "Siapa yang memimpin barisan tari",
            "Siapa yang menjadi juru bicara"
          ],
          correctIndex: 0,
          explanation: "Pertanyaan filosofis tentang kewajiban generasi muda merawat negeri tempat lahir."
        },
        {
          id: "p1_h10",
          question: "Apa makna ungkapan 'Bogani kon totabuan'?",
          options: [
            "Ksatria pemberani pembela tanah air Bolaang Mongondow",
            "Raja yang bertakhta di istana",
            "Pedagang kaya dari pesisir pantai",
            "Petani yang rajin bekerja"
          ],
          correctIndex: 0,
          explanation: "'Bogani' adalah gelar ksatria patriotik penjaga wilayah Totabuan."
        }
      ]
    }
  },

  {
    id: 2,
    title: "Paket 2: Alam, Keseharian & Tradisi",
    subtitle: "Mengenal Diakritik Aksara, Kosakata Alam & Falsafah Hidup",
    badge: "Paket Eksplorasi",
    description: "Latihan aksara konsonan lanjutan & vokal (SVG Vektor), 10 kosa kata alam & keseharian, serta 10 ungkapan keakraban tradisi.",
    iconColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    questions: {
      easy: [
        {
          id: "p2_e1",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          svgPath: "/aksara-svg/row1_ra.svg",
          options: ["Ra", "La", "Wa", "Sa"],
          correctIndex: 0,
          explanation: "Gambar SVG di atas melambangkan konsonan 'Ra'."
        },
        {
          id: "p2_e2",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          svgPath: "/aksara-svg/row1_la.svg",
          options: ["La", "Ra", "Wa", "Ha"],
          correctIndex: 0,
          explanation: "Gambar SVG di atas melambangkan konsonan 'La'."
        },
        {
          id: "p2_e3",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          svgPath: "/aksara-svg/row1_wa.svg",
          options: ["Wa", "Ya", "Ra", "Sa"],
          correctIndex: 0,
          explanation: "Gambar SVG di atas melambangkan konsonan 'Wa'."
        },
        {
          id: "p2_e4",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          svgPath: "/aksara-svg/row1_sa.svg",
          options: ["Sa", "Ha", "Ta", "Da"],
          correctIndex: 0,
          explanation: "Gambar SVG di atas melambangkan konsonan 'Sa'."
        },
        {
          id: "p2_e5",
          question: "Simbol Aksara Mongondow berikut melambangkan konsonan...",
          svgPath: "/aksara-svg/row1_ha.svg",
          options: ["Ha", "Sa", "Wa", "La"],
          correctIndex: 0,
          explanation: "Gambar SVG di atas melambangkan konsonan 'Ha'."
        },
        {
          id: "p2_e6",
          question: "Simbol suku kata Aksara Mongondow berikut dibaca...",
          svgPath: "/aksara-svg/row2_ke_ki.svg",
          options: ["Ki / Ke", "Ku / Ko", "Ka", "K-mati"],
          correctIndex: 0,
          explanation: "Diakritik atas pada huruf Ka di atas mengubah bunyi vokal menjadi 'Ki' atau 'Ke'."
        },
        {
          id: "p2_e7",
          question: "Simbol suku kata Aksara Mongondow berikut dibaca...",
          svgPath: "/aksara-svg/row2_be_bi.svg",
          options: ["Bi / Be", "Bu / Bo", "Ba", "B-mati"],
          correctIndex: 0,
          explanation: "Huruf Ba dengan diakritik atas dibaca 'Bi' atau 'Be'."
        },
        {
          id: "p2_e8",
          question: "Simbol suku kata Aksara Mongondow berikut dibaca...",
          svgPath: "/aksara-svg/row3_ko_ku.svg",
          options: ["Ku / Ko", "Ki / Ke", "Ka", "K-mati"],
          correctIndex: 0,
          explanation: "Diakritik bawah pada huruf Ka di atas mengubah bunyi vokal menjadi 'Ku' atau 'Ko'."
        },
        {
          id: "p2_e9",
          question: "Simbol suku kata Aksara Mongondow berikut dibaca...",
          svgPath: "/aksara-svg/row3_bo_bu.svg",
          options: ["Bu / Bo", "Bi / Be", "Ba", "B-mati"],
          correctIndex: 0,
          explanation: "Huruf Ba dengan diakritik bawah dibaca 'Bu' atau 'Bo'."
        },
        {
          id: "p2_e10",
          question: "Simbol konsonan mati (Pamudpod) berikut dibaca...",
          svgPath: "/aksara-svg/row4_final_k.svg",
          options: ["K (Konsonan Mati)", "Ka", "Ki", "Ku"],
          correctIndex: 0,
          explanation: "Tanda Pamudpod (silang) mematikan bunyi vokal sehingga dibaca konsonan akhir mati 'K'."
        }
      ],
      challenge: [
        {
          id: "p2_c1",
          question: "Apa arti kata 'Tubig'?",
          options: ["Air", "Api", "Udara", "Batu"],
          correctIndex: 0,
          explanation: "'Tubig' merujuk pada air bersih atau air minum."
        },
        {
          id: "p2_c2",
          question: "Apa arti kata 'Towu'?",
          options: ["Tebu / Manisan", "Kelapa", "Padi", "Jagung"],
          correctIndex: 0,
          explanation: "'Towu' adalah tanaman tebu manis."
        },
        {
          id: "p2_c3",
          question: "Apa arti kata 'Salang'?",
          options: ["Jalan / Lintas", "Jembatan", "Perahu", "Roda"],
          correctIndex: 0,
          explanation: "'Salang' merujuk pada jalan rintisan atau lintasan perjalanan."
        },
        {
          id: "p2_c4",
          question: "Apa arti kata 'Utan'?",
          options: ["Sayur / Tumbuhan", "Daging", "Ikan", "Nasi"],
          correctIndex: 0,
          explanation: "'Utan' merujuk pada sayur-sayuran hijau."
        },
        {
          id: "p2_c5",
          question: "Apa arti kata 'Golu'?",
          options: ["Hutan / Rimba", "Sawah", "Lautan", "Danau"],
          correctIndex: 0,
          explanation: "'Golu' adalah kawasan hutan belantara."
        },
        {
          id: "p2_c6",
          question: "Apa arti kata 'Poyon'?",
          options: ["Tujuan / Tempat tuju", "Awal", "Tengah", "Pinggir"],
          correctIndex: 0,
          explanation: "'Poyon' berarti sasaran atau lokasi yang dituju."
        },
        {
          id: "p2_c7",
          question: "Apa arti kata 'Ikaw'?",
          options: ["Kamu / Engkau", "Saya", "Mereka", "Dia"],
          correctIndex: 0,
          explanation: "'Ikaw' berarti kamu atau engkau."
        },
        {
          id: "p2_c8",
          question: "Apa arti kata 'Kiwit'?",
          options: ["Kecil / Sedikit", "Besar / Banyak", "Tinggi", "Panjang"],
          correctIndex: 0,
          explanation: "'Kiwit' berarti ukuran kecil atau jumlah yang terbatas."
        },
        {
          id: "p2_c9",
          question: "Apa arti kata 'Bolu'?",
          options: ["Pohon Bambu", "Pohon Kelapa", "Pohon Pisang", "Pohon Mangga"],
          correctIndex: 0,
          explanation: "'Bolu' berarti pohon bambu."
        },
        {
          id: "p2_c10",
          question: "Apa arti kata 'Sina'?",
          options: ["Terang / Cahaya", "Gelap", "Malam", "Awan"],
          correctIndex: 0,
          explanation: "'Sina' berarti pancaran cahaya terang."
        }
      ],
      hard: [
        {
          id: "p2_h1",
          question: "Apa makna ungkapan 'Mopo'ogot kon lipu'?",
          options: [
            "Memperkuat dan mengokohkan persatuan daerah",
            "Membangun benteng dari batu kali",
            "Menanam batas wilayah desa",
            "Mengumpulkan iuran warga desa"
          ],
          correctIndex: 0,
          explanation: "'Mopo'ogot kon lipu' adalah ajakan untuk mempererat persatuan masyarakat."
        },
        {
          id: "p2_h2",
          question: "Apa arti ungkapan 'Sinar kon komintan'?",
          options: [
            "Memberi penerangan dan manfaat ilmu untuk semua orang",
            "Menyalakan obor di lapangan desa",
            "Menjemur pakaian di bawah terik matahari",
            "Membakar sampah di kebun"
          ],
          correctIndex: 0,
          explanation: "Kiasan tentang menyebarkan ilmu pengetahuan yang berguna bagi khalayak."
        },
        {
          id: "p2_h3",
          question: "Apa arti ungkapan 'Mogogoyon kon adat'?",
          options: [
            "Menjunjung tinggi norma dan aturan kehormatan adat",
            "Menyanyikan lagu daerah bersama",
            "Menari tarian tradisional di panggung",
            "Mengenakan baju adat setiap hari"
          ],
          correctIndex: 0,
          explanation: "Prinsip hidup patuh pada keluhuran tatanan adat Mongondow."
        },
        {
          id: "p2_h4",
          question: "Apa arti ungkapan 'Mopoyo'on kon totabuan'?",
          options: [
            "Menjaga ketenteraman dan ketenangan wilayah tempat tinggal",
            "Membersihkan pekarangan rumah",
            "Menanam bunga di sepanjang jalan",
            "Membangun pos ronda malam"
          ],
          correctIndex: 0,
          explanation: "Ajakan untuk selalu menjaga kedamaian di tanah Totabuan."
        },
        {
          id: "p2_h5",
          question: "Apa arti 'Tano im Bolaang Mongondow'?",
          options: [
            "Tanah leluhur dan pusaka Bolaang Mongondow",
            "Buku atlas wilayah perbatasan",
            "Nama bukit di Kotamobagu",
            "Sungai terpanjang di Sulawesi"
          ],
          correctIndex: 0,
          explanation: "Sebutan kehormatan bagi seluruh wilayah bumi Bolaang Mongondow."
        },
        {
          id: "p2_h6",
          question: "Apa arti ungkapan 'Utan kon gubang'?",
          options: [
            "Kekayaan alam hutan yang menopang kehidupan bersama",
            "Kebun sayur di samping rumah",
            "Pasar buah tradisional",
            "Hutan tempat berburu hewan"
          ],
          correctIndex: 0,
          explanation: "Mengingatkan pentingnya menjaga kelestarian alam hutan demi keberlangsungan anak cucu."
        },
        {
          id: "p2_h7",
          question: "Apa makna ungkapan 'Moyomaman kon tu'u'?",
          options: [
            "Bekerja tekun dan sungguh-sungguh dengan kejujuran",
            "Bermain-main tanpa tujuan jelas",
            "Berbicara manis di depan umum",
            "Tidur nyenyak di sore hari"
          ],
          correctIndex: 0,
          explanation: "'Moyomaman kon tu'u' menekankan etos kerja keras dan ketulusan niat."
        },
        {
          id: "p2_h8",
          question: "Apa arti 'Boin kiat kon dapot'?",
          options: [
            "Hari ini harus berjuang lebih kuat sampai cita-cita tercapai",
            "Perjalanan jauh yang melelahkan",
            "Waktu istirahat setelah bekerja",
            "Matahari terbit dari timur"
          ],
          correctIndex: 0,
          explanation: "Motivasi pantang menyerah sebelum mencapai keberhasilan."
        },
        {
          id: "p2_h9",
          question: "Apa arti ungkapan 'Komintan mogotutui'?",
          options: [
            "Semua elemen masyarakat saling menjaga dan merawat kerukunan",
            "Semua orang berkumpul di balai desa",
            "Perayaan hari lahir kampung",
            "Gotong royong memanen padi"
          ],
          correctIndex: 0,
          explanation: "Seruan untuk bersama-sama merawat kerukunan dan persaudaraan."
        },
        {
          id: "p2_h10",
          question: "Apa arti ungkapan 'Bogani kon adat'?",
          options: [
            "Sosok ksatria yang teguh membela kelestarian adat budaya",
            "Prajurit pengawal istana raja",
            "Tetua yang membaca doa adat",
            "Pemuda yang pandai bersilat"
          ],
          correctIndex: 0,
          explanation: "Penghormatan bagi tokoh pembela nilai-nilai luhur adat Mongondow."
        }
      ]
    }
  },

  {
    id: 3,
    title: "Paket 3: Falsafah, Silsilah & Sastra",
    subtitle: "Membaca Suku Kata Kompleks, Istilah Sastra & Falsafah Bogani",
    badge: "Paket Master",
    description: "Kuis baca gabungan aksara (SVG Vektor), 10 kata istilah sastra & tutur adat, serta 10 falsafah luhur para Bogani.",
    iconColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    questions: {
      easy: [
        {
          id: "p3_e1",
          question: "Simbol Aksara Mongondow berikut dibaca...",
          svgPath: "/aksara-svg/row2_ke_ki.svg",
          options: ["Ki / Ke", "Ku / Ko", "Ka", "K-mati"],
          correctIndex: 0,
          explanation: "Aksara Ka dengan diakritik atas dibaca 'Ki' atau 'Ke'."
        },
        {
          id: "p3_e2",
          question: "Simbol Aksara Mongondow berikut dibaca...",
          svgPath: "/aksara-svg/row3_bo_bu.svg",
          options: ["Bu / Bo", "Bi / Be", "Ba", "B-mati"],
          correctIndex: 0,
          explanation: "Aksara Ba dengan diakritik bawah dibaca 'Bu' atau 'Bo'."
        },
        {
          id: "p3_e3",
          question: "Simbol Aksara Mongondow berikut dibaca...",
          svgPath: "/aksara-svg/row2_de_di.svg",
          options: ["De / Di", "Do / Du", "Da", "D-mati"],
          correctIndex: 0,
          explanation: "Aksara Da dengan diakritik atas dibaca 'De' atau 'Di'."
        },
        {
          id: "p3_e4",
          question: "Simbol Aksara Mongondow berikut dibaca...",
          svgPath: "/aksara-svg/row3_po_pu.svg",
          options: ["Po / Pu", "Pe / Pi", "Pa", "P-mati"],
          correctIndex: 0,
          explanation: "Aksara Pa dengan diakritik bawah dibaca 'Po' atau 'Pu'."
        },
        {
          id: "p3_e5",
          question: "Simbol Aksara Mongondow berikut dibaca...",
          svgPath: "/aksara-svg/row4_final_n.svg",
          options: ["N (Konsonan Mati)", "Na", "Ni", "Nu"],
          correctIndex: 0,
          explanation: "Aksara Na dengan tanda Pamudpod dibaca konsonan mati akhir 'N'."
        },
        {
          id: "p3_e6",
          question: "Simbol Aksara Mongondow berikut dibaca...",
          svgPath: "/aksara-svg/row4_final_k.svg",
          options: ["K (Konsonan Mati)", "Ka", "Ki", "Ku"],
          correctIndex: 0,
          explanation: "Dibaca bunyi mati 'K'."
        },
        {
          id: "p3_e7",
          question: "Simbol Aksara Mongondow berikut dibaca...",
          svgPath: "/aksara-svg/row2_me_mi.svg",
          options: ["Mi / Me", "Mu / Mo", "Ma", "M-mati"],
          correctIndex: 0,
          explanation: "Ma dengan diakritik atas dibaca 'Mi' atau 'Me'."
        },
        {
          id: "p3_e8",
          question: "Simbol Aksara Mongondow berikut dibaca...",
          svgPath: "/aksara-svg/row3_yo_yu.svg",
          options: ["Yu / Yo", "Yi / Ye", "Ya", "Y-mati"],
          correctIndex: 0,
          explanation: "Ya dengan diakritik bawah dibaca 'Yu' atau 'Yo'."
        },
        {
          id: "p3_e9",
          question: "Simbol Aksara Mongondow berikut dibaca...",
          svgPath: "/aksara-svg/row3_ro_ru.svg",
          options: ["Ro / Ru", "Re / Ri", "Ra", "R-mati"],
          correctIndex: 0,
          explanation: "Ra dengan diakritik bawah dibaca 'Ro' atau 'Ru'."
        },
        {
          id: "p3_e10",
          question: "Simbol Aksara Mongondow berikut dibaca...",
          svgPath: "/aksara-svg/row2_se_si.svg",
          options: ["Se / Si", "So / Su", "Sa", "S-mati"],
          correctIndex: 0,
          explanation: "Sa dengan diakritik atas dibaca 'Se' atau 'Si'."
        }
      ],
      challenge: [
        {
          id: "p3_c1",
          question: "Apa arti kata sastra Mongondow 'Itum'?",
          options: [
            "Doa / Mantram tuturan adat luhur",
            "Kisah sejarah kuno",
            "Tarian perang",
            "Pakaian kebesaran"
          ],
          correctIndex: 0,
          explanation: "'Itum' atau 'Itum-Itum' adalah doa ucapan syukur dan permohonan keselamatan adat."
        },
        {
          id: "p3_c2",
          question: "Apa arti kata 'Singgai'?",
          options: ["Hari / Sinar fajar matahari", "Bulan", "Bintang", "Awan"],
          correctIndex: 0,
          explanation: "'Singgai' merujuk pada hari atau terbitnya pancaran fajar."
        },
        {
          id: "p3_c3",
          question: "Apa arti kata 'Ginza'?",
          options: ["Cerdas / Bijaksana / Pandai", "Kuat", "Tinggi", "Besar"],
          correctIndex: 0,
          explanation: "'Ginza' melambangkan kearifan, kecerdasan intelek dan nurani."
        },
        {
          id: "p3_c4",
          question: "Apa arti kata 'Bogani'?",
          options: [
            "Ksatria / Pemimpin patriotik pembela rakyat",
            "Raja raja kuno",
            "Dukun desa",
            "Prajurit asing"
          ],
          correctIndex: 0,
          explanation: "'Bogani' adalah sebutan gelar ksatria patriotik masyarakat Bolaang Mongondow."
        },
        {
          id: "p3_c5",
          question: "Apa arti kata 'Palu'?",
          options: ["Musyawarah / Tatanan hukum adat", "Alat tukul batu", "Senjata pedang", "Pintu rumah"],
          correctIndex: 0,
          explanation: "'Palu' atau 'Palu'an' merujuk pada musyawarah penegakan keadilan adat."
        },
        {
          id: "p3_c6",
          question: "Apa arti kata 'Mogot'?",
          options: ["Kuat / Tangguh / Hebat", "Lemah", "Tua", "Lambat"],
          correctIndex: 0,
          explanation: "'Mogot' berarti memiliki daya kehebatan dan ketangguhan."
        },
        {
          id: "p3_c7",
          question: "Apa arti kata 'Koling'?",
          options: ["Jernih / Murni / Tanpa cela", "Keruh", "Kotor", "Gelap"],
          correctIndex: 0,
          explanation: "'Koling' menggambarkan kejernihan hati dan pikiran."
        },
        {
          id: "p3_c8",
          question: "Apa arti kata 'Tonat'?",
          options: ["Waspada / Siaga / Cermat", "Lalai", "Lupa", "Tidur"],
          correctIndex: 0,
          explanation: "'Tonat' berarti kesiaptsiagaan dan kewaspadaan."
        },
        {
          id: "p3_c9",
          question: "Apa arti kata 'Sinar'?",
          options: ["Obor / Cahaya petunjuk", "Gelap gulita", "Bayangan", "Asap"],
          correctIndex: 0,
          explanation: "'Sinar' berarti penerangan yang membimbing jalan."
        },
        {
          id: "p3_c10",
          question: "Apa arti kata 'Mopos'?",
          options: ["Setia / Tulus / Jujur", "Khianat", "Ragu-ragu", "Pura-pura"],
          correctIndex: 0,
          explanation: "'Mopos' berarti kesetiaan dan ketulusan ikhlas."
        }
      ],
      hard: [
        {
          id: "p3_h1",
          question: "Apa filosofi utama 'Bogani mogotutui kon lipu'?",
          options: [
            "Pemimpin ksatria wajib merawat dan melindungi keselamatan seluruh rakyat negeri",
            "Seorang pemuda harus berlayar mencari daerah baru",
            "Membangun benteng tinggi di atas puncak gunung",
            "Mengumpulkan pajaknya dari hasil perkebunan"
          ],
          correctIndex: 0,
          explanation: "Landasan kepemimpinan luhur Bogani yang mengutamakan perlindungan rakyat."
        },
        {
          id: "p3_h2",
          question: "Apa arti ungkapan 'Itum-itum kon totabuan'?",
          options: [
            "Doa-doa leluhur penjaga keselamatan bumi Totabuan",
            "Nyanyian hiburan pesta malam",
            "Cerita mitos anak-anak",
            "Silsilah keluarga bangsawan"
          ],
          correctIndex: 0,
          explanation: "Kumpulan tutur doa suci keselamatan daerah Bolaang Mongondow."
        },
        {
          id: "p3_h3",
          question: "Apa makna 'Mopoyo'on kon komintan'?",
          options: [
            "Menciptakan kondisi yang aman, damai, dan tenteram bagi semua warga",
            "Membagi-bagikan tanah perkebunan",
            "Menyelenggarakan lomba ketangkasan",
            "Menyelesaikan perselisihan dengan perang"
          ],
          correctIndex: 0,
          explanation: "Tujuan tertinggi dari hukum dan adat Mongondow: kedamaian bagi semua."
        },
        {
          id: "p3_h4",
          question: "Apa arti 'Ginza kon Palu'an'?",
          options: [
            "Kebijaksanaan dan ketelitian intelek dalam membuat keputusan musyawarah adat",
            "Keberanian bertarung di medan perang",
            "Kekayaan harta benda milik keluarga",
            "Keindahan tarian tradisional di panggung"
          ],
          correctIndex: 0,
          explanation: "Menggambarkan keputusan adat yang dibuat dengan kearifan intelek dan keadilan."
        },
        {
          id: "p3_h5",
          question: "Apa kiasan dari 'Singgai mopoyon kon tano'?",
          options: [
            "Pancaran kebaikan dan harapan baru yang menyinari seluruh tanah air",
            "Terik matahari di musim kemarau",
            "Bencana alam di pesisir pantai",
            "Perjalanan malam hari tanpa lampu"
          ],
          correctIndex: 0,
          explanation: "Simbol optimisme dan zaman keemasan yang menaungi tanah tempat tinggal."
        },
        {
          id: "p3_h6",
          question: "Apa arti 'Koling kon ate'?",
          options: [
            "Memiliki ketulusan hati yang murni tanpa iktikad buruk",
            "Pikiran yang penuh dengan keraguan",
            "Perasaan sedih dan duka cita",
            "Keberanian yang meluap-luap"
          ],
          correctIndex: 0,
          explanation: "Syarat utama seorang Verifikator dan Pemimpin: kejujuran dan kemurnian hati."
        },
        {
          id: "p3_h7",
          question: "Apa arti ungkapan 'Tonat kon sapa-sapa'?",
          options: [
            "Senantiasa waspada dan bijak menghadapi segala rintangan",
            "Selalu mencurigai orang lain",
            "Takut melangkah ke masa depan",
            "Menunggu bantuan pihak luar"
          ],
          correctIndex: 0,
          explanation: "Sikap kewaspadaan tinggi yang diimbangi pertimbangan matang."
        },
        {
          id: "p3_h8",
          question: "Apa arti 'Moyomaman kon poyon'?",
          options: [
            "Berjuang bersama dengan gigih sampai tujuan cita-cita berhasil dicapai",
            "Berjalan santai tanpa beban pikiran",
            "Menyerah di tengah perjalanan",
            "Menunggu nasib baik datang sendiri"
          ],
          correctIndex: 0,
          explanation: "Falsafah perjuangan kolektif pantang pantang menyerah sebelum sukses."
        },
        {
          id: "p3_h9",
          question: "Apa arti 'Tolu oyongon kon Bogani'?",
          options: [
            "Tiga watak utama ksatria Mongondow: Berani (Kiat), Jujur (Mopos), dan Adil (Palu)",
            "Tiga macam senjata tradisional Bogani",
            "Tiga benteng pertahanan kerajaan",
            "Tiga nama pahlawan masa lalu"
          ],
          correctIndex: 0,
          explanation: "Tiga pilar karakter utama ksatria patriotik Bolaang Mongondow."
        },
        {
          id: "p3_h10",
          question: "Apa makna 'Mongondowpedia kon komintan'?",
          options: [
            "Ensiklopedia pengetahuan dan kebudayaan bersama milik seluruh rakyat Bolaang Mongondow",
            "Buku perpustakaan sekolah daerah",
            "Kamus saku bahasa daerah",
            "Situs web berita lokal"
          ],
          correctIndex: 0,
          explanation: "Visi utama Ginza Project / MongondowPedia sebagai khazanah pengetahuan budaya abadi."
        }
      ]
    }
  }
];

export default function GamePage() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "results">("menu");
  const [selectedPackId, setSelectedPackId] = useState<number>(1);
  const [selectedLevel, setSelectedLevel] = useState<Level>("easy");

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const activePack = GAME_PACKS.find((p) => p.id === selectedPackId) || GAME_PACKS[0];
  const activeQuestions = activePack.questions[selectedLevel];
  const currentQ = activeQuestions[currentIdx];

  function startQuiz(packId: number, level: Level) {
    setSelectedPackId(packId);
    setSelectedLevel(level);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setSelectedOption(null);
    setGameState("playing");
  }

  function handleAnswer(optIdx: number) {
    if (selectedOption !== null) return;
    setSelectedOption(optIdx);

    const isCorrect = optIdx === currentQ.correctIndex;
    const gainedPoints = isCorrect ? 10 + streak * 2 : 0;

    if (isCorrect) {
      setScore((prev) => prev + gainedPoints);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }
  }

  function handleNextQuestion() {
    if (currentIdx + 1 < activeQuestions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      setGameState("results");
    }
  }

  const percentage = Math.round((score / (activeQuestions.length * 10)) * 100);
  let starRating = 1;
  if (percentage >= 85) starRating = 3;
  else if (percentage >= 60) starRating = 2;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-10 font-sans selection:bg-purple-500 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── TOP NAVIGATION HEADER (CTA Back Context Sensitive) ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#1f2130]">
          <div className="space-y-1">
            {gameState === "menu" ? (
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#14151f] hover:bg-[#1f2130] text-gray-300 hover:text-white border border-[#262838] text-xs font-semibold transition-all mb-2 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 text-purple-400" />
                <span>Kembali ke Beranda</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setGameState("menu")}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all mb-2 shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 text-purple-400" />
                <span>Kembali ke Menu Game</span>
              </button>
            )}

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-purple-400 animate-pulse" />
              <span>Arena Game & Kuis Edukatif</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-400 max-w-xl">
              Permainan Cerdas Cermat & Kuis Latihan untuk mengasah kemampuan Aksara, Kosa Kata, dan Falsafah Bahasa Mongondow.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#14151f] p-3 rounded-2xl border border-[#262838] shadow-lg">
            <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-white">Mode Cerdas Cermat</p>
              <p className="text-emerald-400 font-semibold text-[11px]">3 Paket · 3 Level Kesulitan</p>
            </div>
          </div>
        </div>

        {/* ── STATE 1: MENU UTAMA GAME ── */}
        {gameState === "menu" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* CARD 1: Kuis Latihan Aksara */}
              <div className="bg-[#14151f] hover:bg-[#1a1c2b] border border-[#262838] hover:border-emerald-500/40 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl border text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 uppercase">
                      Latihan Aksara
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      Kuis Latihan Aksara Mongondow
                    </h2>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Latihan membaca & menebak suku kata Aksara Mongondow (Vokal, Diakritik, & Pamudpod) dengan kunci pembacaan interaktif.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#232536] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>20+ Soal Aksara</span>
                  </span>

                  <Link
                    href="/aksara-mongondow?tab=quiz"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/20"
                  >
                    <span>Buka Kuis Aksara</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* CARD 2: Studio Latihan Menulis Aksara */}
              <div className="bg-[#14151f] hover:bg-[#1a1c2b] border border-[#262838] hover:border-purple-500/40 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl border text-purple-400 bg-purple-500/10 border-purple-500/20">
                      <PenTool className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full border bg-purple-500/10 text-purple-400 border-purple-500/30 uppercase">
                      Studio Tracing
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      Studio Latihan Menulis (Tracing)
                    </h2>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Melatih keluwesan jemari menulis & menggambar goresan Aksara Mongondow pada kanvas digital interaktif berpanduan.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#232536] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kanvas Realtime</span>
                  </span>

                  <Link
                    href="/aksara-mongondow?tab=tracing"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/20"
                  >
                    <span>Buka Studio Menulis</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>

            {/* CARD BANNER UTAMA: GAME CERDAS CERMAT TEBAK KATA */}
            <div className="bg-gradient-to-r from-[#171929] via-[#1f2238] to-[#171929] border border-purple-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Brain className="w-64 h-64 text-purple-400" />
              </div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Game Baru · Cerdas Cermat</span>
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Siswa & Umum
                  </span>
                </div>

                <h2 className="text-xl md:text-3xl font-extrabold text-white">
                  Game Cerdas Cermat Tebak Kata & Aksara Mongondow
                </h2>
                <p className="text-xs md:text-sm text-gray-300 max-w-2xl leading-relaxed">
                  Uji kecerdasan bahasa Mongondow dengan 3 Paket Soal Unik: <strong>Mudah</strong> (10 Simbol Aksara Vektor SVG), <strong>Challenge</strong> (10 Kata Pendek), dan <strong>Sulit</strong> (1 Ungkapan Kalimat / Falsafah Adat).
                </p>
              </div>

              {/* Selection Pack Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 pt-2">
                {GAME_PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className="bg-[#12131c] border border-[#282a3d] hover:border-purple-500/50 rounded-2xl p-5 space-y-4 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${pack.iconColor}`}>
                        {pack.badge}
                      </span>
                      <h3 className="text-sm font-bold text-white pt-1">{pack.title}</h3>
                      <p className="text-[11px] text-gray-400 leading-relaxed">{pack.description}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-[#212333]">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Pilih Level:</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => startQuiz(pack.id, "easy")}
                          className="py-1.5 px-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all text-center"
                        >
                          🟢 Mudah
                        </button>
                        <button
                          onClick={() => startQuiz(pack.id, "challenge")}
                          className="py-1.5 px-1 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all text-center"
                        >
                          🟡 Challenge
                        </button>
                        <button
                          onClick={() => startQuiz(pack.id, "hard")}
                          className="py-1.5 px-1 rounded-lg text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-all text-center"
                        >
                          🔴 Sulit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* ── STATE 2: SCREEN BERMAIN GAME CERDAS CERMAT ── */}
        {gameState === "playing" && (
          <div className="bg-[#14151f] border border-[#262838] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative max-w-3xl mx-auto">
            {/* Top Bar: Progress & Stats */}
            <div className="flex items-center justify-between text-xs border-b border-[#232536] pb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGameState("menu")}
                  className="px-3 py-1 rounded-full font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-all flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Menu Game</span>
                </button>
                <span className="px-2.5 py-1 rounded-full font-semibold uppercase text-[10px] bg-bento-surface border border-bento-border text-gray-300">
                  Level: {selectedLevel}
                </span>
              </div>

              <div className="flex items-center gap-4 font-mono">
                <div className="flex items-center gap-1 text-amber-400">
                  <Flame className="w-4 h-4" />
                  <span className="font-bold">{streak} Combo</span>
                </div>
                <div className="flex items-center gap-1 text-purple-400 font-bold">
                  <Trophy className="w-4 h-4" />
                  <span>{score} Pts</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-gray-400 font-semibold">
                <span>Soal {currentIdx + 1} dari {activeQuestions.length}</span>
                <span>{Math.round(((currentIdx + 1) / activeQuestions.length) * 100)}% Selesai</span>
              </div>
              <div className="w-full h-2 bg-[#212333] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / activeQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card Box with SVG Vector Image Rendering */}
            <div className="bg-[#1a1c2b] border border-[#2a2c40] rounded-2xl p-6 text-center space-y-4 shadow-inner">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                {selectedLevel === "easy" ? "🟢 Tebak Huruf Aksara" : selectedLevel === "challenge" ? "🟡 Tebak Kata Pendek" : "🔴 Tebak Ungkapan Falsafah"}
              </span>

              {/* RENDER SIMBOL VEKTOR SVG DENGAN KONTRAST TINGGI & JERNIIH */}
              {currentQ.svgPath && (
                <div className="flex justify-center py-2">
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/20 shadow-2xl flex items-center justify-center backdrop-blur-md">
                    <img
                      src={currentQ.svgPath}
                      alt="Simbol Aksara Mongondow"
                      className="h-20 md:h-24 object-contain filter invert drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] hover:scale-105 transition-all"
                    />
                  </div>
                </div>
              )}

              <h2 className="text-lg md:text-2xl font-black text-white leading-relaxed tracking-wide">
                {currentQ.question}
              </h2>
              {currentQ.subtext && (
                <p className="text-xs text-gray-400 font-medium">{currentQ.subtext}</p>
              )}
            </div>

            {/* Option Buttons (A, B, C, D) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;
                let btnStyle = "bg-[#161724] border-[#292b3d] text-gray-200 hover:border-purple-500/50 hover:bg-[#1d1f30]";

                if (selectedOption !== null) {
                  if (isCorrect) {
                    btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-500/10";
                  } else if (isSelected) {
                    btnStyle = "bg-red-500/20 border-red-500 text-red-300 font-bold";
                  } else {
                    btnStyle = "bg-[#12131d] border-[#202230] text-gray-500 opacity-50 cursor-not-allowed";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={selectedOption !== null}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between text-sm ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {selectedOption !== null && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {selectedOption !== null && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Box on Answer Selection */}
            {selectedOption !== null && (
              <div className="bg-[#181928] border border-[#2b2d42] rounded-2xl p-4 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${selectedOption === currentQ.correctIndex ? "text-emerald-400" : "text-red-400"}`}>
                    {selectedOption === currentQ.correctIndex ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Jawaban Anda Benar! (+{10 + (streak - 1) * 2} Pts)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" /> Jawaban Kurang Tepat
                      </>
                    )}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {currentQ.explanation}
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2"
                  >
                    <span>{currentIdx + 1 < activeQuestions.length ? "Lanjut Soal Berikutnya" : "Lihat Hasil Akhir"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STATE 3: LAYAR HASIL AKHIR PERMAINAN ── */}
        {gameState === "results" && (
          <div className="bg-[#14151f] border border-[#262838] rounded-3xl p-6 md:p-8 space-y-6 text-center max-w-xl mx-auto shadow-2xl">
            <div className="space-y-2">
              <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-purple-500/10 border border-purple-500/30 text-purple-400 mb-2">
                <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Permainan Selesai!</h2>
              <p className="text-xs text-gray-400">
                {activePack.title} · Level: {selectedLevel.toUpperCase()}
              </p>
            </div>

            {/* Rating Stars */}
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${star <= starRating ? "text-amber-400 fill-amber-400" : "text-gray-600"}`}
                />
              ))}
            </div>

            {/* Score Box */}
            <div className="bg-[#181a29] border border-[#26293e] rounded-2xl p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] text-gray-400 font-semibold uppercase">Total Skor</p>
                <p className="text-2xl font-black text-purple-400">{score} Pts</p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-semibold uppercase">Akurasi Jawaban</p>
                <p className="text-2xl font-black text-emerald-400">{percentage}%</p>
              </div>
            </div>

            {/* Buttons Action */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => startQuiz(selectedPackId, selectedLevel)}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Main Lagi Paket Ini</span>
              </button>
              <button
                onClick={() => setGameState("menu")}
                className="flex-1 py-3 rounded-xl border border-[#292b3e] bg-[#161724] text-gray-300 hover:text-white hover:border-purple-500/40 text-xs font-semibold transition-all"
              >
                <span>Pilih Paket Lain</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
