// Isi halaman /kawasan-cagar-budaya-panang.
// PAGE_HTML adalah HTML biasa (bukan JSX) dan PAGE_CSS adalah CSS biasa yang
// seluruh selektornya diawali .kcbp. Sunting langsung teks di bawah ini.
// Jangan memakai backtick, backslash, atau tanda dolar-kurung-kurawal di dalamnya.
// Sumber data: knowledge/Cagar_Budaya_Panang_Kotabunan_Knowledge.md

export const PAGE_CSS: string = `
@import url('https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400;0,500;0,700;0,800;1,400;1,500&family=Alegreya+Sans:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
.kcbp{--paper:#ECEFE8; --surface:#F7F8F4; --ink:#14201D; --muted:#55625D; --line:#C6CDC3;
  --gold:#7A5C06; --gold-fill:#C79A1E; --arsip:#2A3E7C; --tutur:#1B6446; --wait:#7A4A1F;
  --shade:rgba(20,32,29,.10);
  --display:"Alegreya", "Iowan Old Style", Georgia, serif;
  --body:"Alegreya", "Iowan Old Style", Georgia, serif;
  --ui:"Alegreya Sans", "Segoe UI", system-ui, sans-serif;
  --mono:"IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;}
@media (prefers-color-scheme: dark){
.kcbp{--paper:#0F1614; --surface:#172120; --ink:#E7EBE4; --muted:#9BA8A2; --line:#2B3834;
    --gold:#E0BB57; --gold-fill:#C79A1E; --arsip:#A3B4F2; --tutur:#86D3AC; --wait:#E0A877;
    --shade:rgba(0,0,0,.45); color-scheme:dark;}
}
html[data-theme="dark"] .kcbp{--paper:#0F1614; --surface:#172120; --ink:#E7EBE4; --muted:#9BA8A2; --line:#2B3834;
  --gold:#E0BB57; --gold-fill:#C79A1E; --arsip:#A3B4F2; --tutur:#86D3AC; --wait:#E0A877;
  --shade:rgba(0,0,0,.45); color-scheme:dark;}
.kcbp, .kcbp *{box-sizing:border-box}
.kcbp{background:var(--paper); color:var(--ink); font-family:var(--body); font-size:1.1875rem; line-height:1.6; margin:0}
.kcbp .wrap{max-width:70rem; margin-inline:auto; padding-inline:clamp(16px,4vw,40px)}
.kcbp p{margin:0}
.kcbp a{color:var(--arsip)}
.kcbp :focus-visible{outline:3px solid var(--gold-fill); outline-offset:3px}
.kcbp h1, .kcbp h2, .kcbp h3{font-family:var(--display); text-wrap:balance; margin:0; line-height:1.12}
.kcbp h1{font-size:clamp(2.2rem,6vw,4.1rem); font-weight:800; letter-spacing:-.012em}
.kcbp h2{font-size:clamp(1.7rem,3.6vw,2.5rem); font-weight:700}
.kcbp h3{font-size:1.3rem; font-weight:700}
.kcbp .eyebrow{font-family:var(--ui); font-size:.84rem; font-weight:700; letter-spacing:.11em; text-transform:uppercase; color:var(--gold)}
.kcbp .lede{font-size:clamp(1.2rem,2.1vw,1.42rem); line-height:1.5; max-width:44rem}
.kcbp .prose{max-width:43rem; display:grid; gap:.9rem}
.kcbp .note{font-family:var(--ui); font-size:.95rem; color:var(--muted); max-width:46rem; line-height:1.5}
.kcbp .ref{font-family:var(--mono); font-size:.8rem; color:var(--muted); letter-spacing:-.01em}
.kcbp .toc{position:sticky; top:env(safe-area-inset-top,0px); z-index:5; background:var(--paper); border-bottom:1px solid var(--line)}
.kcbp .toc ul{list-style:none; margin:0; padding:.55rem 0; display:flex; gap:.35rem 1.15rem; flex-wrap:wrap; font-family:var(--ui); font-size:.95rem}
.kcbp .toc a{color:var(--ink); text-decoration:none; font-weight:500; padding:.15rem 0; border-bottom:2px solid transparent}
.kcbp .toc a:hover{border-bottom-color:var(--gold-fill)}
@media (max-width:720px){
.kcbp .toc ul{flex-wrap:nowrap; overflow-x:auto; white-space:nowrap; scrollbar-width:none}
.kcbp .toc ul::-webkit-scrollbar{display:none}
}
.kcbp .hero{padding-block:clamp(2rem,5vw,3.6rem) 0; display:grid; gap:1.3rem}
.kcbp .hero figure{margin:.6rem 0 0}
.kcbp figure{margin:0}
.kcbp figcaption{font-family:var(--ui); font-size:.92rem; color:var(--muted); line-height:1.45; padding-top:.55rem; max-width:52rem}
.kcbp .zoom{display:block; width:100%; padding:0; border:1px solid var(--line); background:var(--surface); cursor:zoom-in; border-radius:3px; overflow:hidden}
.kcbp .zoom img{display:block; width:100%; height:auto}
.kcbp .facts{display:grid; grid-template-columns:repeat(auto-fit,minmax(13.5rem,1fr)); gap:1.2rem 2rem; border-top:1px solid var(--line); padding-top:1.3rem; margin-top:1.4rem}
.kcbp .facts div{display:grid; gap:.15rem; align-content:start}
.kcbp .facts b{font-family:var(--display); font-size:2rem; font-weight:800; line-height:1.05; font-variant-numeric:tabular-nums}
.kcbp .facts span{font-family:var(--ui); font-size:.98rem; color:var(--muted); line-height:1.4}
.kcbp section{padding-block:clamp(2.6rem,6vw,4.4rem) 0}
.kcbp .head{display:grid; gap:.7rem; margin-bottom:1.7rem}
.kcbp .chips{display:flex; gap:.35rem; flex-wrap:wrap}
.kcbp .chip{font-family:var(--ui); font-size:.76rem; font-weight:700; letter-spacing:.07em; text-transform:uppercase; padding:.12rem .5rem; border-radius:2px; border:1px solid currentColor; white-space:nowrap}
.kcbp .chip.tutur{color:var(--tutur); background:color-mix(in srgb, var(--tutur) 10%, transparent)}
.kcbp .chip.jejak{color:var(--gold); background:color-mix(in srgb, var(--gold-fill) 14%, transparent)}
.kcbp .chip.arsip{color:var(--arsip); background:color-mix(in srgb, var(--arsip) 10%, transparent)}
.kcbp .chip.wait{color:var(--wait); border-style:dashed}
.kcbp .legend{display:flex; flex-wrap:wrap; gap:.5rem 1.4rem; font-family:var(--ui); font-size:.95rem; color:var(--muted)}
.kcbp .legend span{display:inline-flex; gap:.45rem; align-items:center}
.kcbp .places{display:grid; grid-template-columns:repeat(auto-fit,minmax(17.5rem,1fr)); gap:0 2.4rem; border-top:1px solid var(--line)}
.kcbp .place{padding:1.05rem 0 1.15rem; border-bottom:1px solid var(--line); display:grid; gap:.4rem; align-content:start; min-width:0}
.kcbp .place p{font-size:1.06rem; line-height:1.5}
.kcbp .place .aka{font-family:var(--ui); font-size:.9rem; color:var(--muted)}
.kcbp .split{display:grid; grid-template-columns:minmax(0,1.15fr) minmax(0,1fr); gap:2.2rem; align-items:start; margin-top:2.2rem}
@media (max-width:860px){
.kcbp .split{grid-template-columns:1fr}
}
.kcbp .chain{border-top:2px solid var(--ink)}
.kcbp .chain-head, .kcbp .chain-row{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:0 1.6rem}
.kcbp .chain-head{font-family:var(--ui); font-weight:700; font-size:.86rem; letter-spacing:.09em; text-transform:uppercase; padding:.6rem 0; border-bottom:1px solid var(--line)}
.kcbp .chain-head .t{color:var(--tutur)}
.kcbp .chain-head .j{color:var(--gold)}
.kcbp .chain-head .a{color:var(--arsip)}
.kcbp .chain-item{border-bottom:1px solid var(--line); padding:1.1rem 0 1.25rem}
.kcbp .chain-item h3{margin-bottom:.6rem}
.kcbp .chain-row > div{min-width:0; font-size:1.04rem; line-height:1.5}
.kcbp .chain-row .chips{margin-top:.5rem}
.kcbp .chain-row .lab{margin-bottom:.25rem}
.kcbp .chain-row .lab{display:none}
.kcbp .chain-row .j{border-left:3px solid var(--gold-fill); padding-left:.8rem}
@media (max-width:760px){
.kcbp .chain-head{display:none}
.kcbp .chain-row{grid-template-columns:1fr; gap:.9rem}
.kcbp .chain-row .lab{display:block; font-family:var(--ui); font-weight:700; font-size:.78rem; letter-spacing:.09em; text-transform:uppercase}
.kcbp .chain-row .t .lab{color:var(--tutur)}
.kcbp .chain-row .j .lab{color:var(--gold)}
.kcbp .chain-row .a .lab{color:var(--arsip)}
}
.kcbp .pairs{display:grid; gap:0; border-top:1px solid var(--line)}
.kcbp .pair{display:grid; grid-template-columns:minmax(0,15rem) 1.6rem minmax(0,1fr); gap:.2rem .9rem; align-items:baseline; padding:.75rem 0; border-bottom:1px solid var(--line)}
.kcbp .pair .say{font-family:var(--display); font-weight:700; font-size:1.22rem; color:var(--tutur)}
.kcbp .pair .eq{font-family:var(--ui); color:var(--muted); text-align:center}
.kcbp .pair .rec{font-size:1.04rem; line-height:1.45}
.kcbp .pair .rec i{color:var(--arsip); font-style:italic; font-weight:500}
@media (max-width:640px){
.kcbp .pair{grid-template-columns:1fr}
.kcbp .pair .eq{display:none}
}
.kcbp .tl{list-style:none; margin:0; padding:0}
.kcbp .tl li{display:grid; grid-template-columns:7.2rem minmax(0,1fr); gap:0 1.3rem}
.kcbp .tl .yr{font-family:var(--display); font-weight:800; font-size:1.28rem; text-align:right; padding-top:.72rem; font-variant-numeric:tabular-nums; line-height:1.2}
.kcbp .tl .ev{border-left:2px solid var(--line); padding:.8rem 0 .95rem 1.3rem; position:relative; max-width:44rem; font-size:1.06rem; line-height:1.5}
.kcbp .tl .ev .chips{margin-bottom:.3rem}
.kcbp .tl .ev::before{content:""; position:absolute; left:-7px; top:1.22rem; width:12px; height:12px; border-radius:50%; background:var(--paper); border:3px solid var(--muted)}
.kcbp .tl li.arsip .ev::before{border-color:var(--arsip)}
.kcbp .tl li.tutur .ev::before{border-color:var(--tutur)}
.kcbp .tl li.key .ev::before{border-color:var(--gold-fill); background:var(--gold-fill)}
@media (max-width:560px){
.kcbp .tl li{grid-template-columns:1fr}
.kcbp .tl .yr{text-align:left; padding:.7rem 0 0 1.4rem; border-left:2px solid var(--line)}
.kcbp .tl .ev{padding-top:.2rem}
.kcbp .tl .ev::before{top:-.75rem}
}
.kcbp .feature{display:grid; grid-template-columns:minmax(0,1.25fr) minmax(0,1fr); gap:1.4rem 2.4rem; align-items:start; padding-block:1.4rem; border-top:1px solid var(--line)}
@media (max-width:860px){
.kcbp .feature{grid-template-columns:1fr}
}
.kcbp blockquote{margin:0; display:grid; gap:.6rem}
.kcbp blockquote .nl{font-style:italic; font-size:1.12rem; line-height:1.5; border-left:3px solid var(--arsip); padding-left:.9rem}
.kcbp blockquote .id{font-size:1.06rem; line-height:1.5}
.kcbp .gallery{display:grid; grid-template-columns:repeat(auto-fill,minmax(15.5rem,1fr)); gap:1.6rem 1.4rem; margin-top:1.6rem}
.kcbp .gallery .zoom img{aspect-ratio:4/3; object-fit:cover; object-position:top}
.kcbp .gallery figcaption b{color:var(--ink); font-weight:700}
.kcbp .values{display:grid; grid-template-columns:repeat(auto-fit,minmax(18rem,1fr)); gap:1.8rem 2.4rem}
.kcbp .values article{display:grid; gap:.5rem; align-content:start; border-top:3px solid var(--gold-fill); padding-top:.8rem}
.kcbp .values p{font-size:1.06rem; line-height:1.5}
.kcbp .words{display:flex; flex-wrap:wrap; gap:.5rem .6rem; margin-top:.4rem}
.kcbp .words span{font-family:var(--ui); font-size:.98rem; border:1px solid var(--line); background:var(--surface); padding:.2rem .6rem; border-radius:2px}
.kcbp .words b{font-style:italic; font-family:var(--body); font-weight:700; color:var(--tutur)}
.kcbp .tablewrap{overflow-x:auto; border-top:2px solid var(--ink)}
.kcbp table{border-collapse:collapse; width:100%; min-width:38rem; font-size:1.02rem; line-height:1.45}
.kcbp th, .kcbp td{text-align:left; vertical-align:top; padding:.75rem .9rem .8rem 0; border-bottom:1px solid var(--line)}
.kcbp th{font-family:var(--ui); font-size:.82rem; letter-spacing:.09em; text-transform:uppercase; color:var(--muted)}
.kcbp td.ps{font-family:var(--mono); font-size:.86rem; white-space:nowrap; color:var(--muted)}
.kcbp .st{font-family:var(--ui); font-weight:700; font-size:.9rem; white-space:nowrap}
.kcbp .st.ok{color:var(--tutur)}
.kcbp .st.todo{color:var(--wait)}
.kcbp .asks{counter-reset:ask; list-style:none; margin:0; padding:0; display:grid; gap:0; border-top:2px solid var(--ink)}
.kcbp .asks li{counter-increment:ask; display:grid; grid-template-columns:3.4rem minmax(0,1fr); gap:0 1rem; padding:1.05rem 0 1.15rem; border-bottom:1px solid var(--line)}
.kcbp .asks li::before{content:counter(ask); font-family:var(--display); font-weight:800; font-size:2.2rem; line-height:1; color:var(--gold)}
.kcbp .asks div{display:grid; gap:.3rem; max-width:44rem}
.kcbp .asks b{font-family:var(--display); font-size:1.28rem; line-height:1.25}
.kcbp .todo-list{margin:0; padding-left:1.2rem; display:grid; gap:.55rem; max-width:44rem}
.kcbp .sources{margin:0; padding-left:1.2rem; display:grid; gap:.5rem; font-size:1.02rem; line-height:1.45; max-width:52rem}
.kcbp .cols{display:grid; grid-template-columns:repeat(auto-fit,minmax(19rem,1fr)); gap:2rem 3rem}
.kcbp footer{margin-top:clamp(3rem,7vw,5rem); border-top:1px solid var(--line); padding-block:1.4rem 2.4rem}
.kcbp dialog{border:0; padding:0; background:var(--surface); color:var(--ink); max-width:min(96vw,1500px); max-height:94vh; border-radius:4px; box-shadow:0 20px 60px var(--shade)}
.kcbp dialog::backdrop{background:rgba(8,12,11,.78)}
.kcbp dialog .box{display:grid; grid-template-rows:minmax(0,1fr) auto; max-height:94vh}
.kcbp dialog .pic{overflow:auto; min-height:0}
.kcbp dialog img{display:block; max-width:none; width:auto; max-height:none}
.kcbp dialog img.fit{max-width:100%; max-height:calc(94vh - 4rem); height:auto; margin-inline:auto}
.kcbp dialog .bar{display:flex; gap:1rem; align-items:center; justify-content:space-between; padding:.6rem .9rem; border-top:1px solid var(--line); font-family:var(--ui); font-size:.92rem; color:var(--muted)}
.kcbp dialog button{font-family:var(--ui); font-weight:700; font-size:.95rem; color:var(--ink); background:var(--paper); border:1px solid var(--line); border-radius:3px; padding:.35rem .8rem; cursor:pointer}

/* Penyesuaian untuk MongondowPedia: seluruh gaya dibatasi pada .kcbp agar tidak
   bertabrakan dengan globals.css / Tailwind. */
.kcbp{min-height:100vh; padding-top:2.9rem; text-align:left}
.kcbp .toc{position:fixed; top:0; left:0; right:0; z-index:50}
.kcbp .toc ul{flex-wrap:nowrap; overflow-x:auto; white-space:nowrap; scrollbar-width:none}
.kcbp .toc ul::-webkit-scrollbar{display:none}
.kcbp .toc a.home{font-weight:700; color:var(--gold)}
.kcbp section{scroll-margin-top:3.4rem}
.kcbp .todo-list, .kcbp .sources{list-style:disc}
.kcbp dialog{margin:auto}
.kcbp b{font-weight:700}
.kcbp i{font-style:italic}
.kcbp .sources a{color:var(--arsip); text-decoration:underline}
`;

export const PAGE_HTML: string = `
<nav class="toc" aria-label="Isi halaman">
  <div class="wrap">
    <ul>
      <li><a class="home" href="/">MongondowPedia</a></li>
      <li><a href="#wilayah">Wilayah</a></li>
      <li><a href="#tiga-lapis">Tiga lapis bukti</a></li>
      <li><a href="#nama">Nama yang sama</a></li>
      <li><a href="#linimasa">Linimasa</a></li>
      <li><a href="#arsip">Arsip</a></li>
      <li><a href="#nilai">Nilai penting</a></li>
      <li><a href="#kriteria">Kriteria hukum</a></li>
      <li><a href="#permohonan">Permohonan</a></li>
      <li><a href="#sumber">Sumber</a></li>
    </ul>
  </div>
</nav>

<main class="wrap">

<header class="hero">
  <p class="eyebrow">Usulan Kawasan Cagar Budaya · Kabupaten Bolaang Mongondow Timur</p>
  <h1>Kawasan Panang: lanskap emas leluhur Kotabunan</h1>
  <p class="lede">Panang, Tungou, Benteng, Tapa', Pancurang, Parabo, Perkebunan Bakan, dan Iloba–Bokaka adalah satu lanskap. Di sini leluhur Mongondow membuka kebun, menggali emas, lalu mendirikan kampung. Arsip Belanda dan VOC mencatatnya sejak abad ke-18, dan O'uman masyarakat Kotabunan menuturkan hal yang sama. Kami mengusulkan kawasan ini dikaji dan ditetapkan sebagai Kawasan Cagar Budaya.</p>
  <figure>
    <button class="zoom" type="button" data-zoom="/kawasan-cagar-budaya-panang/udara-1944.jpg" data-cap="Kota Boenan dari udara, 13 September 1944. Foto udara Sekutu, mosaik “Rata Totok to Kota Boenan”. Koleksi Monash University, no. 76613.">
      <img src="/kawasan-cagar-budaya-panang/udara-1944.jpg" width="1800" height="1082" alt="Foto udara hitam putih tahun 1944: permukiman Kota Boenan berpola petak di tepi pantai, pulau kecil di depannya, dan petak-petak kebun di pedalaman.">
    </button>
    <figcaption>Kota Boenan dari udara, 13 September 1944. Permukiman berpola petak di tepi teluk, P. Kotaboenan (P. Koemeke) di depannya, dan petak-petak kebun di pedalaman. Foto udara Sekutu; koleksi Monash University, no. 76613. Ketuk gambar untuk memperbesar.</figcaption>
  </figure>
  <div class="facts">
    <div><b>±250 tahun</b><span>sejak catatan tertulis tertua tentang emas Kotabunan, tahun 1772</span></div>
    <div><b>1903</b><span>konsesi tambang “Dooep” diterbitkan. Doup adalah nama lama Panang</span></div>
    <div><b>23 negeri</b><span>dataran Mongondow bergilir mengirim orang kepada panghulu Kotaboena (1867)</span></div>
    <div><b>8 lokasi</b><span>dalam satu kawasan yang diusulkan</span></div>
  </div>
</header>

<section id="wilayah">
  <div class="head">
    <p class="eyebrow">Wilayah yang diusulkan</p>
    <h2>Delapan lokasi, satu lanskap</h2>
    <p class="prose">Urutan ruangnya mengikuti urutan cerita: kebun dan hunian awal di perbukitan, lubang emas di Panang, pengolahan di Tapa', lalu kampung dan pelabuhan di pesisir Kotabunan.</p>
    <div class="legend" aria-label="Arti tanda sumber">
      <span><i class="chip tutur">Tutur</i> O'uman, cerita turun-temurun</span>
      <span><i class="chip jejak">Jejak</i> benda atau struktur di lapangan</span>
      <span><i class="chip arsip">Arsip</i> catatan tertulis</span>
    </div>
  </div>
  <div class="places">
    <article class="place">
      <h3>Panang</h3>
      <p class="aka">Doup · “Dagat to Botak” · Dusun 5 Desa Kotabunan</p>
      <p>Lubang dan terowongan <i>mogoguyang</i> (leluhur), sisa rel, lesung batu dari Iloba, dan makam tua. Tercatat sebagai konsesi tambang “Dooep” tahun 1903.</p>
      <div class="chips"><i class="chip tutur">Tutur</i><i class="chip jejak">Jejak</i><i class="chip arsip">Arsip</i></div>
    </article>
    <article class="place">
      <h3>Tapa'</h3>
      <p class="aka">“Men 1, Men 2, Men 3”</p>
      <p>Pusat pengolahan Maskapai Tapa'i Beken menurut tutur. Arsip menyebut “Tapai bedin” (1893) dan “Tapaibekin” (1925, 1935).</p>
      <div class="chips"><i class="chip tutur">Tutur</i><i class="chip arsip">Arsip</i></div>
    </article>
    <article class="place">
      <h3>Benteng</h3>
      <p class="aka">Wilayah tambang Panang–Benteng</p>
      <p>Tambang rakyat yang menopang ekonomi Kotabunan pada kemarau panjang 1972 dan 1982, sampai Kotabunan dijuluki “Negeri Dolar”.</p>
      <div class="chips"><i class="chip tutur">Tutur</i></div>
    </article>
    <article class="place">
      <h3>Tungou</h3>
      <p class="aka">Wilayah tambang</p>
      <p>Disebut dalam tutur sebagai jangkauan “Projeck Doup” pada kartu peta survei Belanda. Guang Patende terletak di antara Bakan dan Tungou.</p>
      <div class="chips"><i class="chip tutur">Tutur</i></div>
    </article>
    <article class="place">
      <h3>Perkebunan Bakan</h3>
      <p class="aka">Hunian awal</p>
      <p>Didiami orang dari Desa Mongondow, Motoboi Kecil, dan Pobundayan sejak awal 1800-an. Di sini terdapat kuburan-kuburan mogoguyang.</p>
      <div class="chips"><i class="chip tutur">Tutur</i><i class="chip jejak">Jejak</i></div>
    </article>
    <article class="place">
      <h3>Pancurang</h3>
      <p class="aka">Perkebunan lama</p>
      <p>Perkebunan orang Mongkonai', yang keturunannya kelak membuka kampung Tutuyan.</p>
      <div class="chips"><i class="chip tutur">Tutur</i></div>
    </article>
    <article class="place">
      <h3>Iloba – Bokaka</h3>
      <p class="aka">Permukiman pertama rombongan Aki Dontu</p>
      <p>Tanah di Bokaka dianugerahkan raja kepada Dontu Damopolii. Lesung batu yang kini berada di Panang dibawa dari Iloba.</p>
      <div class="chips"><i class="chip tutur">Tutur</i><i class="chip jejak">Jejak</i></div>
    </article>
    <article class="place">
      <h3>Parabo</h3>
      <p class="aka">Bagian dari kawasan usulan</p>
      <p>Tutur dan data lapangannya sedang dihimpun dari para tetua.</p>
      <div class="chips"><i class="chip wait">Data menyusul</i></div>
    </article>
  </div>

  <div class="split">
    <figure>
      <button class="zoom" type="button" data-zoom="/kawasan-cagar-budaya-panang/peta-1943.jpg" data-cap="Potongan peta U.S. Army Map Service, seri T541, lembar Amoerang, edisi 1943. Koleksi University of Texas at Austin.">
        <img src="/kawasan-cagar-budaya-panang/peta-1943.jpg" width="1327" height="939" alt="Potongan peta topografi 1943 yang memuat Kotaboen di pesisir, G. Lama di sebelah baratnya, G. Mintoe di barat daya, K. Togit, K. Tombolikat, dan Boejat.">
      </button>
      <figcaption>Peta Sekutu 1943 mencantumkan “Kotaboen” dengan “G. Lama” tepat di sebelah baratnya, “G. Mintoe” di barat daya, serta “K. Togit”, “K. Tombolikat”, dan “Boejat”. U.S. Army Map Service, seri T541.</figcaption>
    </figure>
    <div class="prose">
      <h3>Peta lama menunjuk arah yang sama</h3>
      <p>Pada 1867 dua zendeling menulis bahwa tambang terkaya terletak sekitar dua paal di sebelah barat Kotaboena. Peta 1943 menaruh Gunung Lama di sebelah barat Kotaboen. Konsesi “Goenoeng Lama” diterbitkan bersama konsesi “Dooep” pada 1903.</p>
      <p class="note">Peta batas kawasan dan titik koordinat tiap objek sedang disiapkan. Titik persis makam dan benda lepas akan diserahkan dalam berkas pengajuan, tidak dipajang di halaman ini.</p>
    </div>
  </div>
</section>

<section id="tiga-lapis">
  <div class="head">
    <p class="eyebrow">Inti argumen</p>
    <h2>Tutur leluhur, jejak di lapangan, dan arsip saling mengunci</h2>
    <p class="prose">Setiap cerita dalam O'uman menunjuk ke benda atau struktur yang masih ada, dan setiap benda itu punya padanan dalam catatan tertulis.</p>
  </div>
  <div class="chain">
    <div class="chain-head" aria-hidden="true">
      <div class="t">Tutur leluhur</div><div class="j">Jejak di lapangan</div><div class="a">Arsip tertulis</div>
    </div>

    <div class="chain-item">
      <h3>Lubang Mogoguyang</h3>
      <div class="chain-row">
        <div class="t"><span class="lab">Tutur leluhur</span>Leluhur Mongondow yang berkampung di Doup membuka lubang-lubang emas, disebut <i>guang</i>. Menambang menjadi pekerjaan baru di samping berkebun.</div>
        <div class="j"><span class="lab">Jejak di lapangan</span>Lubang-lubang tua di Panang, dan guang di Patende serta Sirang.<div class="chips"><i class="chip wait">Foto dan koordinat dilengkapi</i></div></div>
        <div class="a"><span class="lab">Arsip tertulis</span>1773: “de goudgravers te Kottaboena”. 1853: lubang sedalam 60 kaki dan enam rumah penggali emas. 1867: sumur tambang 15 sampai 30 depa.</div>
      </div>
    </div>

    <div class="chain-item">
      <h3>Terowongan dan jalur rel</h3>
      <div class="chain-row">
        <div class="t"><span class="lab">Tutur leluhur</span>Jalur lubang tua dilanjutkan pihak Belanda. Dinding lubang diperkuat dan rel dipasang untuk mengangkut material.</div>
        <div class="j"><span class="lab">Jejak di lapangan</span>Mulut terowongan, penguat dinding, dan sisa rel di Panang.<div class="chips"><i class="chip wait">Foto dan koordinat dilengkapi</i></div></div>
        <div class="a"><span class="lab">Arsip tertulis</span>1903: konsesi “Dooep”, 520 bouw. 1909: konsesi dilelang beserta barang bergerak dan tak bergerak di lokasi. 1925 dan 1935: Tapaibekin.</div>
      </div>
    </div>

    <div class="chain-item">
      <h3>Meja goyang</h3>
      <div class="chain-row">
        <div class="t"><span class="lab">Tutur leluhur</span>Di area pengolahan, material dipisahkan dengan meja goyang, peninggalan masa perusahaan Belanda.</div>
        <div class="j"><span class="lab">Jejak di lapangan</span>Meja goyang dan tapak area pengolahan.<div class="chips"><i class="chip wait">Foto dan koordinat dilengkapi</i></div></div>
        <div class="a"><span class="lab">Arsip tertulis</span>1935: Tapaibekin tercatat menghasilkan 0,3 kg emas dalam statistik pertambangan Hindia Belanda.</div>
      </div>
    </div>

    <div class="chain-item">
      <h3>Lesung batu</h3>
      <div class="chain-row">
        <div class="t"><span class="lab">Tutur leluhur</span>Lesung penumbuk padi dibawa dari Iloba di Bokaka ke Panang, mengikuti perpindahan kelompok Aki Dontu.</div>
        <div class="j"><span class="lab">Jejak di lapangan</span>Lesung batu di Panang, dan satu lagi di area Kantor Kecamatan Kotabunan.<div class="chips"><i class="chip wait">Foto dan koordinat dilengkapi</i></div></div>
        <div class="a"><span class="lab">Arsip tertulis</span>Lantong (1996) mencatat “lesung batu di Kotabunan” dalam daftar benda purbakala. 1867: keluarga-keluarga berkebun padi dan jagung di Kotaboena.</div>
      </div>
    </div>

    <div class="chain-item">
      <h3>Kuburan Mogoguyang</h3>
      <div class="chain-row">
        <div class="t"><span class="lab">Tutur leluhur</span>Leluhur berpindah dari Bakan ke Doup, lalu ke Kotabunan bagian barat.</div>
        <div class="j"><span class="lab">Jejak di lapangan</span>Makam-makam tua di Perkebunan Bakan, di Panang, sampai pusat permukiman Kotabunan. Sebarannya mengikuti urutan perpindahan itu.<div class="chips"><i class="chip wait">Koordinat dilengkapi</i></div></div>
        <div class="a"><span class="lab">Arsip tertulis</span>1853: Kottaboena masih “tempat tinggal sementara penambang dan pedagang”. 1867: sudah ada keluarga berkebun dan masjid. 1944: permukiman berpola petak terlihat dari udara.</div>
      </div>
    </div>
  </div>
</section>

<section id="nama">
  <div class="head">
    <p class="eyebrow">Nama yang sama</p>
    <h2>Yang diucapkan leluhur, tertulis di arsip</h2>
    <p class="prose">Nama tempat dan jabatan dalam tutur warga muncul dalam ejaan Belanda dan Melayu lama pada dokumen yang tidak pernah dibaca para penuturnya.</p>
  </div>
  <div class="pairs">
    <div class="pair"><span class="say">Doup</span><span class="eq">=</span><span class="rec"><i>Dooep</i>, konsesi tambang 1903; <i>Daoep</i>, 1923. <span class="ref">Jaarboek van het Mijnwezen 1905, hlm. 112</span></span></div>
    <div class="pair"><span class="say">Tapa'i Beken</span><span class="eq">=</span><span class="rec"><i>Tapai bedin</i>, 1893; <i>Tapaibekin</i>, 1925 dan 1935. <span class="ref">TBG 1893 · ANRI Mijnwezen 1925 · De Ingenieur 1936</span></span></div>
    <div class="pair"><span class="say">Gunung Lama</span><span class="eq">=</span><span class="rec"><i>Goenoeng Lama</i>, 1853, 1893, 1903; <i>G. Lama</i> pada peta 1943.</span></div>
    <div class="pair"><span class="say">Kayumoyondi</span><span class="eq">=</span><span class="rec"><i>kaijoe mojondoe</i>, kitab adat kerajaan. <span class="ref">TBG 1893, Fatsal 57</span></span></div>
    <div class="pair"><span class="say">Mayor Kadato</span><span class="eq">=</span><span class="rec"><i>Majoor-Cadato</i>, satu untuk tiap distrik termasuk Kotaboenan, 1906. <span class="ref">Dunnebier 1949, hlm. 263</span></span></div>
    <div class="pair"><span class="say">Kotabunan</span><span class="eq">=</span><span class="rec"><i>Kotta-Boena</i> 1781, <i>Cottaboenang</i> 1803, <i>Kotaboena</i> 1867, <i>Kotta-Boenan</i> 1900.</span></div>
    <div class="pair"><span class="say">Bogani perempuan</span><span class="eq">=</span><span class="rec">Bogani <i>Dow</i> di puncak Gunung Dajow, “distrik Kotaboenan”. Tradisi yang dicatat <span class="ref">Dunnebier 1949, hlm. 229</span></span></div>
    <div class="pair"><span class="say">Buyat dibuka orang Kopandakan</span><span class="eq">=</span><span class="rec">Kopandakan mempunyai <i>totabuan</i> di Buyat. <span class="ref">“Mengenal Bolaang Mongondow”, mengutip Notosoesanto</span></span></div>
  </div>
  <p class="note" style="margin-top:1rem">Nama “Panang” sendiri belum ditemukan dalam arsip Belanda. Yang tertulis adalah “Dooep”. Padanan Doup dengan Panang bersumber dari tutur warga.</p>
</section>

<section id="linimasa">
  <div class="head">
    <p class="eyebrow">Linimasa</p>
    <h2>Dari Bogani sampai hari ini</h2>
    <div class="legend">
      <span><i class="chip arsip">Arsip</i> tertulis pada zamannya</span>
      <span><i class="chip tutur">Tutur</i> dituturkan leluhur</span>
    </div>
  </div>
  <ol class="tl">
    <li class="tutur"><div class="yr">±1600</div><div class="ev"><div class="chips"><i class="chip tutur">Tutur, dicatat 1949</i></div>Bogani perempuan Dow berkuasa di wilayah yang kelak menjadi distrik Kotabunan. Rombongannya menemukan Tadohe' yang terdampar di muara Togid.</div></li>
    <li class="arsip"><div class="yr">1731</div><div class="ev"><div class="chips"><i class="chip arsip">Arsip</i></div>Kontrak kerajaan dengan VOC. Pasal 20: emas yang ditemukan wajib dilaporkan kepada Kompeni.</div></li>
    <li class="arsip"><div class="yr">1772–1773</div><div class="ev"><div class="chips"><i class="chip arsip">Arsip</i></div>Catatan VOC menyebut emas dari Kottaboena dan Mogondo, serta “de goudgravers te Kottaboena”, para penggali emas di Kotabunan. Dibaca dari transkripsi; naskah aslinya masih dicari.</div></li>
    <li class="arsip"><div class="yr">1781</div><div class="ev"><div class="chips"><i class="chip arsip">Arsip</i></div>G.F. Duhr menulis bahwa wilayah emas bermula di antara sisi selatan Boelang dan sisi utara “Kotta-Boena of Mogondo”.</div></li>
    <li class="arsip"><div class="yr">1803</div><div class="ev"><div class="chips"><i class="chip arsip">Arsip</i></div>Residen Dürr: tambang emas “Cottaboenang” termasuk wilayah Raja Boelang dan Mogondo.</div></li>
    <li class="tutur"><div class="yr">awal 1800-an</div><div class="ev"><div class="chips"><i class="chip tutur">Tutur</i></div>Orang dari dataran Mongondow membuka Bakan, Dayukon, Bokaka, Ongkobu', Yohang, dan Pancurang.</div></li>
    <li class="tutur"><div class="yr">abad ke-19</div><div class="ev"><div class="chips"><i class="chip tutur">Tutur</i></div>Dontu Damopolii membuat guang di Dagat to Botak untuk memenuhi mahar tujuh <i>kokasi</i> emas. Aki Bagoa dan kawan-kawan dari Bakan meneruskannya.</div></li>
    <li class="arsip"><div class="yr">1853</div><div class="ev"><div class="chips"><i class="chip arsip">Arsip</i></div>De Lange mengunjungi tambang Kottaboena: lubang 60 kaki, rumah-rumah orang Bugis, satu reaal untuk raja tiap lubang baru. Ia mencatat Goenoeng Lama dan Goenoeng Mintoe.</div></li>
    <li class="arsip"><div class="yr">1867</div><div class="ev"><div class="chips"><i class="chip arsip">Arsip</i></div>Wilken dan Schwarz: panghulu Kotaboena wajib dari keturunan raja dan dibantu 23 negeri. Tambang terkaya sekitar dua paal di barat Kotaboena.</div></li>
    <li class="arsip"><div class="yr">1893</div><div class="ev"><div class="chips"><i class="chip arsip">Arsip</i></div>Kitab adat kerajaan menyebut Goenong lama, Tapai bedin, kaijoe mojondoe, dan pantai kota boenan.</div></li>
    <li class="arsip"><div class="yr">1900</div><div class="ev"><div class="chips"><i class="chip arsip">Arsip</i></div>Kotta-Boenan tercatat sebagai satu dari tiga pelabuhan resmi kerajaan, bersama Domisil dan Bolaäng.</div></li>
    <li class="tutur"><div class="yr">1901</div><div class="ev"><div class="chips"><i class="chip tutur">Tutur</i></div>KonTAMBUNAN dibuka menjadi kampung. Orang asal Bakan dan Doup mendiami bagian barat. Kampung ditata oleh Mayor Kadato.</div></li>
    <li class="arsip key"><div class="yr">1903</div><div class="ev"><div class="chips"><i class="chip arsip">Arsip</i></div>Konsesi “Dooep” seluas 520 bouw dan “Goenoeng Lama” seluas 402 bouw diberikan kepada Mijnbouw-maatschappij “Kotaboenan” di Amsterdam, berlaku 75 tahun.</div></li>
    <li class="arsip"><div class="yr">1909</div><div class="ev"><div class="chips"><i class="chip arsip">Arsip</i></div>Perusahaan dilikuidasi. Kedua konsesi dilelang di Batavia.</div></li>
    <li class="arsip"><div class="yr">1925–1935</div><div class="ev"><div class="chips"><i class="chip arsip">Arsip</i></div>Pengukuran calon konsesi Tapaibekin. Pada 1935 Tapaibekin tercatat menghasilkan 0,3 kg emas.</div></li>
    <li class="tutur"><div class="yr">1928–1942</div><div class="ev"><div class="chips"><i class="chip tutur">Tutur</i></div>Maskapai Tapa'i Beken. Pengolahan dipusatkan di Tapa'. Berhenti ketika Jepang masuk.</div></li>
    <li class="arsip"><div class="yr">1943–1944</div><div class="ev"><div class="chips"><i class="chip arsip">Arsip</i></div>Peta dan foto udara Sekutu merekam Kotaboenan, G. Lama, dan pola permukimannya.</div></li>
    <li class="tutur"><div class="yr">1972, 1982</div><div class="ev"><div class="chips"><i class="chip tutur">Tutur</i></div>Kemarau panjang. Panang dan Benteng menopang ekonomi Kotabunan: “payah beras tapi kaya emas”.</div></li>
    <li><div class="yr">2022</div><div class="ev"><div class="chips"><i class="chip jejak">Dokumentasi foto</i></div>Masyarakat Adat Dusun 5 Panang memperingati Hari HAM Sedunia dengan teater <i>Panang Lipu' Ku</i>.</div></li>
  </ol>
</section>

<section id="arsip">
  <div class="head">
    <p class="eyebrow">Arsip</p>
    <h2>Halaman-halaman yang menyebut Kotabunan</h2>
    <p class="prose">Semua gambar di bawah adalah pindaian terbitan aslinya, dihimpun oleh Ka Dhani. Ketuk untuk membaca halaman penuh.</p>
  </div>

  <div class="feature">
    <figure>
      <button class="zoom" type="button" data-zoom="/kawasan-cagar-budaya-panang/konsesi-dooep-1905.jpg" data-cap="Jaarboek van het Mijnwezen in Nederlandsch Oost-Indië 1905, hlm. 112, baris 74 dan 75.">
        <img src="/kawasan-cagar-budaya-panang/konsesi-dooep-1905.jpg" width="1500" height="715" alt="Potongan tabel konsesi tambang: baris 74 Dooep dan baris 75 Goenoeng Lama, landschap Bolaäng Mongondou, Mijnbouw-maatschappij Kotaboenan te Amsterdam.">
      </button>
      <figcaption>Daftar konsesi tambang Hindia Belanda, 1905. Baris 74: Dooep. Baris 75: Goenoeng Lama.</figcaption>
    </figure>
    <blockquote>
      <p class="nl">“Dooep; (landschap Bolaäng Mongondou). Goud-, zilver-, zink-, lood-, koper en ijzer. Mijnbouw-maatschappij »Kotaboenan« te Amsterdam. 520. 24 Maart 1903 nº. 14; 75 jaren (19 Maart 1904 t/m 18 Maart 1979).”</p>
      <p class="id">Dooep, landschap Bolaäng Mongondou. Emas, perak, seng, timbal, tembaga, dan besi. Pemegang: Mijnbouw-maatschappij “Kotaboenan” di Amsterdam. Luas 520 bouw. Keputusan 24 Maret 1903 no. 14, berlaku 75 tahun sampai 18 Maret 1979.</p>
      <p class="ref">Jaarboek van het Mijnwezen 1905, hlm. 112</p>
    </blockquote>
  </div>

  <div class="feature">
    <figure>
      <button class="zoom" type="button" data-zoom="/kawasan-cagar-budaya-panang/lelang-1909.jpg" data-cap="De Indische Mercuur, 1909: “Mijnbouw Compagnie Kotaboenan in liquidatie”.">
        <img src="/kawasan-cagar-budaya-panang/lelang-1909.jpg" width="1500" height="630" alt="Potongan iklan surat kabar 1909 berjudul Mijnbouw Compagnie Kotaboenan in liquidatie.">
      </button>
      <figcaption>Pengumuman likuidasi dan lelang, De Indische Mercuur, 1909.</figcaption>
    </figure>
    <blockquote>
      <p class="nl">“…de mijnconcessiën Dooep en Goenoeng Lama, gelegen in het landschap Bolaang Mongondou der residentie Menado, met al hetgeen daartoe behoort, zoomede de op de terreinen der vennootschap zich bevindende roerende en onroerende goederen, voor zoover die nog aanwezig zijn.”</p>
      <p class="id">Konsesi tambang Dooep dan Goenoeng Lama di landschap Bolaang Mongondou, keresidenan Menado, beserta segala yang termasuk di dalamnya, juga barang bergerak dan tak bergerak yang berada di lahan perseroan, sejauh masih ada.</p>
      <p class="ref">De Indische Mercuur, 1909</p>
    </blockquote>
  </div>

  <div class="feature">
    <figure>
      <button class="zoom" type="button" data-zoom="/kawasan-cagar-budaya-panang/wilken-schwarz-1867-p379.jpg" data-cap="Wilken &amp; Schwarz, Mededeelingen van wege het Nederlandsche Zendelinggenootschap XI (1867), hlm. 379. Kotak merah adalah anotasi penyusun.">
        <img src="/kawasan-cagar-budaya-panang/wilken-schwarz-1867-p379.jpg" width="1030" height="1634" alt="Halaman cetak berbahasa Belanda tahun 1867 dengan subjudul Gouddelving, tentang penggalian emas di Bolaäng-Mongondou." style="aspect-ratio:16/11; object-fit:cover; object-position:0 12%">
      </button>
      <figcaption>Wilken dan Schwarz, 1867, hlm. 379: “Gouddelving”.</figcaption>
    </figure>
    <blockquote>
      <p class="nl">“De rijkste mijnen liggen echter circa 2 paal westelijk van Kotaboena… Ten einde het instorten te voorkomen worden de wanden bekleed met gespleten bamboes.”</p>
      <p class="id">Tambang terkaya terletak sekitar dua paal di sebelah barat Kotaboena. Agar tidak runtuh, dinding lubang dilapisi bambu belah.</p>
      <p class="ref">Mededeelingen NZG XI (1867), hlm. 379</p>
    </blockquote>
  </div>

  <div class="gallery">
    <figure>
      <button class="zoom" type="button" data-zoom="/kawasan-cagar-budaya-panang/duhr-1781-h167.jpg" data-cap="G.F. Duhr, Bericht aangaande de Goud-mijnen op Celebes (1781), hlm. 167.">
        <img src="/kawasan-cagar-budaya-panang/duhr-1781-h167.jpg" width="1152" height="1237" alt="Halaman cetak 1781 yang menyebut Kotta-Boena of Mogondo.">
      </button>
      <figcaption><b>1781.</b> Duhr menyebut “Kotta-Boena of Mogondo” sebagai batas wilayah emas.</figcaption>
    </figure>
    <figure>
      <button class="zoom" type="button" data-zoom="/kawasan-cagar-budaya-panang/de-lange-1853-h174.jpg" data-cap="De Lange, laporan perjalanan 1853, hlm. 174. Kotak merah adalah anotasi penyusun.">
        <img src="/kawasan-cagar-budaya-panang/de-lange-1853-h174.jpg" width="929" height="1624" alt="Halaman cetak 1853 tentang kunjungan ke tambang emas Kottaboena.">
      </button>
      <figcaption><b>1853.</b> De Lange: lubang 60 kaki dan satu reaal untuk raja tiap lubang baru.</figcaption>
    </figure>
    <figure>
      <button class="zoom" type="button" data-zoom="/kawasan-cagar-budaya-panang/wilken-schwarz-1867-p295.jpg" data-cap="Wilken &amp; Schwarz, Mededeelingen NZG XI (1867), hlm. 295.">
        <img src="/kawasan-cagar-budaya-panang/wilken-schwarz-1867-p295.jpg" width="1085" height="1779" alt="Halaman cetak 1867 tentang empat panghulu kerajaan, salah satunya mengawasi Kotaboena dan tambang emasnya.">
      </button>
      <figcaption><b>1867.</b> Panghulu Kotaboena mengawasi tambang emas dan harus berdarah raja.</figcaption>
    </figure>
    <figure>
      <button class="zoom" type="button" data-zoom="/kawasan-cagar-budaya-panang/tbg-1893-h495.jpg" data-cap="Tijdschrift voor Indische Taal-, Land- en Volkenkunde (TBG) 1893, hlm. 495: kitab adat Raja Johannis Manuel Manoppo, Fatsal 57.">
        <img src="/kawasan-cagar-budaya-panang/tbg-1893-h495.jpg" width="1500" height="1005" alt="Halaman cetak 1893 berbahasa Melayu, Fatsal 57, menyebut Goenong lama, Tapai bedin, kaijoe mojondoe, dan pantai kota boenan.">
      </button>
      <figcaption><b>1893.</b> Kitab adat kerajaan, Fatsal 57: Goenong lama, Tapai bedin, kaijoe mojondoe, pantai kota boenan.</figcaption>
    </figure>
    <figure>
      <button class="zoom" type="button" data-zoom="/kawasan-cagar-budaya-panang/pelabuhan-1900.jpg" data-cap="Daftar pelabuhan landschap Bolaäng-Mongondou, 30 September 1900. Kotak merah adalah anotasi penyusun.">
        <img src="/kawasan-cagar-budaya-panang/pelabuhan-1900.jpg" width="890" height="645" alt="Potongan daftar pelabuhan tahun 1900: 1. Domisil, 2. Bolaäng, 3. Kotta-Boenan.">
      </button>
      <figcaption><b>1900.</b> Tiga pelabuhan resmi kerajaan: Domisil, Bolaäng, Kotta-Boenan.</figcaption>
    </figure>
    <figure>
      <button class="zoom" type="button" data-zoom="/kawasan-cagar-budaya-panang/tapaibekin-1936.jpg" data-cap="De Ingenieur in Nederlandsch-Indië 1936 no. 4: produksi emas dan perak 1935.">
        <img src="/kawasan-cagar-budaya-panang/tapaibekin-1936.jpg" width="1305" height="522" alt="Tabel produksi emas dan perak 1935 yang memuat baris Tapaibekin.">
      </button>
      <figcaption><b>1935.</b> Tapaibekin dalam statistik produksi emas Hindia Belanda.</figcaption>
    </figure>
  </div>
</section>

<section id="nilai">
  <div class="head">
    <p class="eyebrow">Nilai penting</p>
    <h2>Mengapa kawasan ini berarti bagi Bolaang Mongondow</h2>
  </div>
  <div class="values">
    <article>
      <h3>Sejarah kerajaan</h3>
      <p>Emas Kotabunan diatur dalam kontrak kerajaan dengan VOC sejak 1731. Panghulu Kotaboena wajib dari keturunan raja. Adat masa Tadohe' menetapkan raja ditandu bila bepergian ke Kotabunan atau Bolaang.</p>
    </article>
    <article>
      <h3>Ilmu pengetahuan</h3>
      <p>Teknik <i>guang</i> hanya terekam lengkap dalam tutur: paritan berlapis ijuk aren, <i>kokali</i> dari batang enau, pancuran enau, pasir hitam <i>ginto'</i>, dan dulang dari akar kayu. Arsip 1853 dan 1867 mencatat sumur tambang berdinding bambu belah.</p>
    </article>
    <article>
      <h3>Pertemuan budaya</h3>
      <p>Orang Mongondow pedalaman bertemu pemukim Bugis, Bone, dan Buton di pesisir, berbarter, lalu berkeluarga. Islam awal Mongondow tercatat masuk lewat pedagang di Kotabunan, dan pada 1867 masjid hanya ada di Kotabangon, Bolaang, dan Kotabunan.</p>
    </article>
    <article>
      <h3>Persaudaraan tiga kampung</h3>
      <p>Kotabunan, Buyat, dan Tutuyan berasal dari Bakan, Ongkobu', dan Pancurang: <i>inanakan mo gutat bo tolu adi'</i>. Dunnebier mencatat asal nama Tutuyan dan Tombolikat dari ucapan Bogani Dow.</p>
    </article>
  </div>

  <div class="split">
    <figure>
      <button class="zoom" type="button" data-zoom="/kawasan-cagar-budaya-panang/warga-panang-2022.jpg" data-cap="Masyarakat Adat Dusun 5 Panang, peringatan Hari HAM Sedunia, 9–10 Desember 2022. Dokumentasi masyarakat.">
        <img src="/kawasan-cagar-budaya-panang/warga-panang-2022.jpg" width="1600" height="564" alt="Warga Dusun 5 Panang duduk di bawah tenda pada sebuah acara peringatan, 2022.">
      </button>
      <figcaption>Masyarakat Adat Dusun 5 Panang, 9–10 Desember 2022. Pada acara ini kisah Aki Dontu dan Doup dipentaskan dalam teater <i>Panang Lipu' Ku</i>.</figcaption>
    </figure>
    <div class="prose">
      <h3>O'uman yang masih dituturkan</h3>
      <p>Tutur ini bukan temuan baru. W. Dunnebier menerbitkan buku berjudul <i>O'uman i Mogoguyang</i> pada 1929. Di Kotabunan, tulisan warga tahun 2014 mencatat dua puluh penutur. Kosakatanya masih dipakai:</p>
      <div class="words">
        <span><b>mogoguyang</b> leluhur</span>
        <span><b>guang</b> lubang emas</span>
        <span><b>kokali</b> linggis enau</span>
        <span><b>ginto'</b> pasir hitam</span>
        <span><b>kokasi</b> ruas bambu wadah emas</span>
        <span><b>dulang</b> nampan akar kayu</span>
        <span><b>batu rep</b> batu bermuatan emas</span>
        <span><b>sabua'</b> pondok penambang</span>
      </div>
    </div>
  </div>
</section>

<section id="kriteria">
  <div class="head">
    <p class="eyebrow">Kriteria hukum</p>
    <h2>Diukur dengan UU No. 11 Tahun 2010</h2>
    <p class="prose">Kolom kanan menyebut apa adanya mana yang sudah didukung data dan mana yang masih menunggu perekaman lapangan atau kajian ahli.</p>
  </div>
  <div class="tablewrap">
    <table>
      <thead><tr><th>Pasal</th><th>Syarat (ringkas)</th><th>Keadaan di Kawasan Panang</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td class="ps">5 a</td><td>Berusia 50 tahun atau lebih</td><td>Tambang tercatat sejak 1772. Konsesi 1903. Produksi Tapaibekin 1935.</td><td class="st ok">Didukung arsip</td></tr>
        <tr><td class="ps">5 c</td><td>Arti khusus bagi sejarah, ilmu pengetahuan, pendidikan, agama, atau kebudayaan</td><td>Kontrak emas VOC, kedudukan panghulu, teknik guang, jalur awal Islam.</td><td class="st ok">Didukung arsip dan tutur</td></tr>
        <tr><td class="ps">5 d</td><td>Nilai budaya bagi penguatan kepribadian bangsa</td><td>O'uman, mahar tujuh kokasi, <i>tolu adi'</i>, julukan Negeri Dolar.</td><td class="st ok">Didukung tutur</td></tr>
        <tr><td class="ps">9 a</td><td>Lokasi mengandung benda, bangunan, atau struktur cagar budaya</td><td>Lubang, terowongan, rel, meja goyang, lesung batu, dan makam sudah teridentifikasi lewat tutur.</td><td class="st todo">Perlu perekaman</td></tr>
        <tr><td class="ps">9 b</td><td>Menyimpan informasi kegiatan manusia pada masa lalu</td><td>Hunian, kebun, tambang, dan pengolahan emas sejak abad ke-18.</td><td class="st ok">Didukung arsip dan tutur</td></tr>
        <tr><td class="ps">10 a</td><td>Dua situs atau lebih yang letaknya berdekatan</td><td>Panang, Tapa', Benteng, Bakan, dan Iloba–Bokaka.</td><td class="st todo">Perlu peta batas</td></tr>
        <tr><td class="ps">10 b–e</td><td>Lanskap budaya bentukan manusia, berusia paling sedikit 50 tahun, dengan pola fungsi ruang masa lalu</td><td>Kebun, lubang emas, kampung, pelabuhan. Terlihat pada peta 1943 dan foto udara 1944.</td><td class="st ok">Didukung arsip</td></tr>
        <tr><td class="ps">10 f</td><td>Lapisan tanah terbenam yang mengandung bukti kegiatan manusia</td><td>Bekas perkampungan Doup dan tapak pengolahan belum digali.</td><td class="st todo">Perlu kajian arkeologi</td></tr>
      </tbody>
    </table>
  </div>
  <p class="note" style="margin-top:1rem">Bunyi syarat di atas adalah ringkasan. Rujuk naskah resmi UU No. 11 Tahun 2010 tentang Cagar Budaya untuk bunyi lengkap tiap pasal.</p>
</section>

<section id="permohonan">
  <div class="head">
    <p class="eyebrow">Permohonan</p>
    <h2>Yang dimohonkan kepada Bupati Bolaang Mongondow Timur</h2>
  </div>
  <ol class="asks">
    <li><div><b>Menerima pendaftaran Kawasan Panang sebagai objek yang diduga cagar budaya.</b><p>Undang-undang membuka pendaftaran oleh setiap orang kepada pemerintah kabupaten.</p><span class="ref">UU 11/2010 Pasal 29</span></div></li>
    <li><div><b>Menugaskan Tim Ahli Cagar Budaya untuk mengkajinya.</b><p>Tim ahli kabupaten, atau bantuan tim ahli Provinsi Sulawesi Utara bila kabupaten belum memilikinya.</p><span class="ref">UU 11/2010 Pasal 31</span></div></li>
    <li><div><b>Mengadakan survei bersama.</b><p>Masyarakat adat Dusun 5 Panang, para tetua Kotabunan, dinas yang membidangi kebudayaan, dan balai pelestarian kebudayaan merekam lubang, terowongan, rel, lesung, dan makam.</p></div></li>
    <li><div><b>Melindungi objek selama pengkajian berlangsung.</b><p>Terutama makam mogoguyang, lesung batu, dan mulut terowongan.</p></div></li>
    <li><div><b>Menetapkan statusnya dengan Keputusan Bupati.</b><p>Penetapan dilakukan paling lama 30 hari setelah rekomendasi tim ahli diterima.</p><span class="ref">UU 11/2010 Pasal 33</span></div></li>
  </ol>

  <div class="cols" style="margin-top:2.6rem">
    <div class="prose">
      <h3>Yang masih kami lengkapi</h3>
      <ul class="todo-list">
        <li>Foto lama dan baru serta titik koordinat tiap objek.</li>
        <li>Peta batas kawasan yang mencakup kedelapan lokasi.</li>
        <li>Rekaman wawancara para tetua, termasuk tutur tentang Parabo.</li>
        <li>Status lahan tiap lokasi, termasuk bekas hak guna usaha dan wilayah izin pertambangan.</li>
        <li>Peta konsesi Dooep dan isi kontrak pertambangan 1858 dari Arsip Nasional.</li>
      </ul>
    </div>
    <div class="prose">
      <h3>Batas bukti</h3>
      <ul class="todo-list">
        <li>Catatan VOC 1772–1773 dibaca dari transkripsi, belum dari naskah aslinya.</li>
        <li>Rel dan meja goyang belum disebut dalam arsip yang sudah dibaca. Buktinya ada di lapangan.</li>
        <li>Tahun-tahun dalam tutur dapat berbeda dari arsip. Keduanya ditampilkan apa adanya.</li>
        <li>Kutipan Belanda diterjemahkan secara bebas.</li>
      </ul>
    </div>
  </div>
</section>

<section id="sumber">
  <div class="head">
    <p class="eyebrow">Sumber</p>
    <h2>Sumber utama</h2>
  </div>
  <div class="cols">
    <div>
      <h3 style="margin-bottom:.7rem">Arsip dan terbitan lama</h3>
      <ul class="sources">
        <li>G.F. Duhr, <i>Bericht aangaande de Goud-mijnen op Celebes</i>, 1781.</li>
        <li>De Lange, laporan perjalanan ke Bolaang Mongondow, 1853.</li>
        <li>N.P. Wilken dan J.A. Schwarz, <i>Mededeelingen van wege het Nederlandsche Zendelinggenootschap</i> XI, 1867.</li>
        <li><i>Tijdschrift voor Indische Taal-, Land- en Volkenkunde</i>, 1893: kitab adat Raja Johannis Manuel Manoppo.</li>
        <li><i>Overeenkomsten met inlandsche vorsten</i>: daftar pelabuhan 1900, perjanjian pelabuhan 1901.</li>
        <li><i>Jaarboek van het Mijnwezen in Nederlandsch Oost-Indië</i>, 1905.</li>
        <li><i>De Indische Mercuur</i>, 1909. <i>De Ingenieur in Nederlandsch-Indië</i>, 1936.</li>
        <li>ANRI: Corpus Diplomaticum (kontrak 1731, 1756), arsip Mijnwezen 1910, 1923, 1925.</li>
        <li>U.S. Army Map Service T541, 1943. Foto udara Sekutu 1944, koleksi Monash University.</li>
      </ul>
    </div>
    <div>
      <h3 style="margin-bottom:.7rem">Kajian dan tutur</h3>
      <ul class="sources">
        <li>W. Dunnebier, “Over de vorsten van Bolaang Mongondow”, <i>BKI</i> 105, 1949. Terjemahan R. Mokoginta.</li>
        <li>W. Dunnebier, <i>O'uman i Mogoguyang</i>, 1929.</li>
        <li>Z.A. Lantong, <i>Mengenal Bolaang Mongondow</i>, 1996.</li>
        <li>Ariel C. Lopez, <i>Conversion and Colonialism</i>, disertasi Universiteit Leiden, 2018.</li>
        <li>Bayu Damopolii dan Suradji Damopolii, “Gubuk-gubuk Tua yang Berdiri di Atas Tumpukan Emas”, 2014, dengan dua puluh narasumber.</li>
        <li>Wahyudin Damopolii-Manoppo, naskah teater <i>Panang Lipu' Ku</i>.</li>
        <li>MongondowPedia: <a href="/knowledge/sejarah/sejarah-kotabunan">Sejarah Kotabunan</a> dan <a href="/knowledge/sejarah/sejarah-bolaang-mongondow-timur-boltim-persebaran-penduduk-asal-usul-kotabunan">Sejarah Bolaang Mongondow Timur</a>.</li>
        <li>Pindaian arsip dihimpun oleh Ka Dhani.</li>
      </ul>
    </div>
  </div>
</section>

</main>

<footer>
  <div class="wrap">
    <p class="note">Bahan presentasi yang disusun dari arsip, kajian, dan O'uman masyarakat Kotabunan, Oktober 2026. Ini bukan dokumen resmi pemerintah. Status cagar budaya ditetapkan oleh Bupati setelah rekomendasi Tim Ahli Cagar Budaya.</p>
  </div>
</footer>

<dialog id="kcbp-lb" aria-label="Gambar diperbesar">
  <div class="box">
    <div class="pic"><img id="kcbp-lb-img" class="fit" alt=""></div>
    <div class="bar"><span id="kcbp-lb-cap"></span><span style="display:flex;gap:.5rem;flex-shrink:0"><button type="button" id="kcbp-lb-size">Ukuran asli</button><button type="button" id="kcbp-lb-close">Tutup</button></span></div>
  </div>
</dialog>
`;
