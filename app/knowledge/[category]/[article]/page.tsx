import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { logMetricEvent } from "@/lib/ginza-db";
import MarkdownRenderer from "@/components/knowledge/MarkdownRenderer";
import ContributeCTA from "@/components/knowledge/ContributeCTA";

interface Props { params: Promise<{ category: string; article: string }> }

export async function generateMetadata({ params }: Props) {
  const { category: categorySlug, article: slug } = await params;
  if (!supabaseAdmin) return { title: "MongondowPedia" };
  const { data } = await supabaseAdmin
    .from("knowledge_articles")
    .select("title, meta_description, summary, content")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return { title: "Artikel Pengetahuan — MongondowPedia" };

  const title = `${data.title} — MongondowPedia`;
  const description = data.meta_description ?? data.summary ?? "Ensiklopedia Digital & Knowledge Base Budaya, Aksara, dan Sejarah Bolaang Mongondow.";
  const url = `${SITE_URL}/knowledge/${categorySlug}/${slug}`;

  // Ekstrak keyword otomatis dari judul dan topik utama
  const keywords = [
    "Bolaang Mongondow",
    "MongondowPedia",
    "Kotabunan",
    "Boltim",
    "Sejarah Mongondow",
    "Adat Mongondow",
    "Aksara Mongondow",
    ...data.title.split(" ").filter((w: string) => w.length > 3),
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "MongondowPedia",
      locale: "id_ID",
      type: "article",
      images: [
        {
          url: `${SITE_URL}/icon.png`,
          width: 1200,
          height: 630,
          alt: data.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/icon.png`],
    },
  };
}

const STATIC_ARTICLES: Record<string, { title: string; summary: string; content: string }> = {
  "peran-pkk-kon-pembangunan": {
    title: 'PIDATO BAHASA MONGONDOW "PERAN PKK KON PEMBANGUNAN"',
    summary: "Pidato resmi Bahasa Mongondow mengenai peranan perempuan, keluarga, serta pelestarian bahasa dan budaya daerah dalam Program Keluarga Berencana dan Pembangunan Daerah Totabuan.",
    content: `# PIDATO BAHASA MONGONDOW "PERAN PKK KON PEMBANGUNAN"

**ASSALAMMUALAIKUM WR, WB**

TABE’ TAKIN SALAM KON KOLANO IN TOTABUAN TIMUR TAKIN APANG PALUT MAKO IN NANAKAN TOTABUAN.

DE’EMAN KUMALUKU ANDE KUMALAKUANG BO’ SINIM PANDOY KON AIAI BO GUYAGUYANG, TONGA AMBE OYU’ON PA KOTANGOYAN.

AKA DEGA MO’TA’AW YO MO SALAMAT PA.

SALAMAT KON JUMBARA.

A PINOMIA KON LIPU IN KETUA TIM PENGGERAK PKK NA’A KITA KOMINTAN BO NOYO DUNGKUL PA, YO UMPAKA INUKATAN IN TORABIKA BO KUKIS MOKA DIA’ MOKOLAWANG KON PIA IN GINA BO BAHASA.

MANGALENYA AMBE JUMBARA NA’A IN OAIDAN BI INATON TUMPPALA BOBAY.

YO INGGAY KITA KOMINTAN MOPOTOBATU IN PIKIRAN MOLINTAK KON LIPU TATABUAN NATON.

BO TOTOK MOPENTING AU IN BOBAHASAAN. BAHASA MOLUKO MOALUS.

BO TANA’A MAY NA’A IN BOBAY MONGONDOW MONGO PANDOY BIDON, KINTA NO PNS, APARAT DESA, SANGADI, CAMAT, SEDANG BUPATI YO OYU’ON DON AU.

JADI, AKA TONGA KON BALOY YO INGGAI AU BO TUMAKIN KON KEGIATAN IN PAMARENTAH KON BONU LIPU’, TA SINANGOYAN PKK, BA OYU’ON BARAGUNA NYA KITA NO BALI’ IBU RUMAH TANGGA, TERUTAMA PROGRAM KELUARGA BERENCANA.

BO’ INDONGOGAY PA SALAMATKU NA’A.

SALAMAT KON KELUARGA BERENCANA HARAP IN GINA KO GADI CUKUP IN DE’EWA, DIKAPA DUMAYAN KON GUYANGA TA NO’ IUNA KO GADI KON MO PULU OYUON IN KAPINNYA, NA’A KI MAMA AMPUNG SALALU BIDON MOPO RA’A –RA’A IN GINA BO MONGGUAR IN TOTUKA BO MINAYA’ NO KIPIRIKISA AU.. YO DE’EMAN BI PANYAKI MAAH SIN KA’ANTA BO SI DIA. TABE TAKIN SALAMAT.

MOTOTABIAN-MOTOTANOBAN BO MOTO TOMPIAAN. SYUKUR MOANTO.

**WASSALAMMUALAIKUM WR, WB.**

---

## Terjemahan Bahasa Indonesia

**PIDATO BAHASA MONGONDOW**  
*"Peran PKK dalam Pembangunan"*

Assalamu'alaikum Warahmatullahi Wabarakatuh.

Salam hormat kepada para pemimpin di Totabuan Timur, serta kepada seluruh masyarakat Totabuan yang saya hormati.

Pertama-tama marilah kita panjatkan puji dan syukur ke hadirat Allah SWT, karena atas rahmat dan karunia-Nya kita masih diberi kesehatan dan kesempatan untuk berkumpul di tempat ini.

Saya juga menyampaikan salam hormat kepada seluruh peserta yang hadir.

Pada kesempatan yang berbahagia ini, saya mengucapkan terima kasih kepada Ketua Tim Penggerak PKK yang telah memberikan kesempatan kepada saya untuk menyampaikan beberapa hal mengenai pentingnya peranan perempuan, keluarga, serta bahasa dan budaya daerah.

Pertemuan seperti ini merupakan kesempatan yang sangat baik bagi kaum perempuan.

Marilah kita bersama-sama menyatukan pikiran demi kemajuan daerah Totabuan yang kita cintai.

Yang tidak kalah penting adalah menjaga bahasa daerah. Bahasa merupakan identitas dan warisan yang harus dipelihara dengan baik.

Saat ini perempuan Mongondow telah banyak yang memiliki pendidikan tinggi; ada yang menjadi pegawai negeri, aparat desa, sangadi (kepala desa), camat, bahkan ada yang telah menjadi bupati.

Karena itu, kaum ibu tidak hanya berperan di dalam rumah tangga, tetapi juga harus ikut berpartisipasi dalam kegiatan pemerintahan dan pembangunan daerah melalui organisasi PKK.

PKK mempunyai manfaat yang sangat besar bagi para ibu rumah tangga, terutama dalam mendukung Program Keluarga Berencana.

Saya juga mengucapkan terima kasih kepada Program Keluarga Berencana.

Harapan saya, setiap keluarga mempunyai jumlah anak yang sesuai dengan kemampuan sehingga kehidupan keluarga menjadi lebih sejahtera. Dengan demikian para ibu dapat lebih baik dalam mendidik, membesarkan, dan menjaga kesehatan anak-anaknya sehingga mereka tumbuh sehat dan terhindar dari berbagai penyakit.

Demikian yang dapat saya sampaikan.

Terima kasih atas perhatian Bapak, Ibu, dan Saudara sekalian.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`
  },
  "peran-masyarakat-kon-pombanganan-lipu": {
    title: 'PIDATO BAHASA MONGONDOW "PERAN MASYARAKAT KON POMBANGUNAN LIPU"',
    summary: "Pidato adat dan wacana kebangsaan Bahasa Mongondow mengenai peranan penting partisipasi gotong royong seluruh warga masyarakat serta pelestarian bahasa daerah dalam pembangunan daerah Totabuan.",
    content: `# PIDATO BAHASA MONGONDOW "PERAN MASYARAKAT KON POMBANGUNAN LIPU"

**ASSALAMMUALAIKUM WR. WB.**

TABE' TAKIN SALAM KON KOLANO, TUA-TUA ADAT, TOKOH AGAMA, TOKOH MASYARAKAT, BO GINA-GINA LIPU IN SAYA HORMATI.

De'eman kita komintan mangalen kon Allah Subhanahu Wa Ta'ala, sabap no biyaya bo rahmat-Nya kita masih dipotonga kon kasadiaan, kesehatan bo kasempetan mopotobatu kon rapat lipu na'a.

Salamatku bo moponio' kon samua warga lipu, sabap bo kasadiaan bo semangatnya tumakin kon rapat na'a demi pombangun lipu naton.

Lipu yang maju inda' monsia bo pamarenta saja, tapi sabap bo gotong royong, moposad bo mopotobatu in samua warga.

Tongka na'a, kita komintan moposad in pikiran, moposad in tenaga, bo moposad in tanggung jawab kon pombangun lipu naton.

Bo pamarenta lipu, kami inda' mungkin mogogama sorangan.

Kami butuh dukungan, saran, kritik bo partisipasi in samua masyarakat.

Sabap lipu na'a milik naton komintan.

Tongka in program pamarenta, baik pembangunan jalan, kebersihan lipu, pendidikan, kesehatan, keamanan, pertanian, UMKM, bo pelayanan masyarakat, kita komintan wajib mopotobatu supaya hasilnya mopia bo bermanfaat kon anak bo cucu naton.

Tongka au bo bahasa Mongondow.

Bahasa naton jangan sampai hilang.

Sabap bahasa adalah jati diri, budaya bo warisan in totabuan.

Tongka kita komintan mongajar kon gina-gina naton supaya tetap mopake bahasa Mongondow kon baloy, kon sekolah bo kon masyarakat.

Yo au, saya mengajak kon samua warga supaya tetap menjaga persatuan.

Beda pendapat inda' berarti jadi musuh.

Beda pikiran adalah kekuatan supaya lipu semakin maju.

Sabap tujuan naton hanya satu.

Mopobangun lipu yang aman, maju, sejahtera bo bermartabat.

Tongka akhir kata, saya mengucapkan banyak salamat kon samua warga yang selalu mendukung program pemerintah lipu.

Mudah-mudahan Allah Subhanahu Wa Ta'ala selalu memberkati usaha naton komintan bo menjadikan lipu naton semakin maju dari tahun ke tahun.

MOTOTABIAN. MOTOTANOBAN. BO MOTOTOMPIAAN.

SYUKUR MOANTO.

**WASSALAMMUALAIKUM WR. WB.**

---

> **Catatan Penggunaan Gaya Bahasa**  
> *Pidato ini disajikan menggunakan gaya pidato Mongondow resmi (gaya tutur adat Sangadi / Kepala Desa), dengan penataan struktur wacana lisan yang rapi dan mudah dipahami oleh penutur Mongondow masa kini.*`
  }
};

function stripLeadingH1Title(content: string): string {
  return content.replace(/^\s*#\s+[^\n]+\n+/, "");
}

const SITE_URL = "https://mongondowpedia.com";

export default async function KnowledgeArticlePage({ params }: Props) {
  const { category: categorySlug, article: articleSlug } = await params;

  let article: { id?: string; title: string; summary?: string | null; content: string; view_count?: number; created_at?: string; updated_at?: string } | null = null;
  let categoryName: string | null = null;

  if (supabaseAdmin) {
    const { data } = await supabaseAdmin.from("knowledge_articles").select("*").eq("slug", articleSlug).eq("status", "published").maybeSingle();
    if (data) {
      article = data;
      await supabaseAdmin.from("knowledge_articles").update({ view_count: (data.view_count ?? 0) + 1 }).eq("id", data.id);
      await logMetricEvent({ type: "knowledge_view", targetId: data.id, targetText: data.title });
      const { data: cat } = await supabaseAdmin.from("knowledge_categories").select("name").eq("id", data.category_id).maybeSingle();
      categoryName = cat?.name ?? null;
    }
  }

  if (!article && STATIC_ARTICLES[articleSlug]) {
    article = STATIC_ARTICLES[articleSlug];
  }

  if (!article) return notFound();

  const cleanBodyContent = stripLeadingH1Title(article.content);
  const articleUrl = `${SITE_URL}/knowledge/${categorySlug}/${articleSlug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${articleUrl}#article`,
    "mainEntityOfPage": { "@type": "WebPage", "@id": articleUrl },
    "headline": article.title,
    "description": article.summary ?? undefined,
    "articleSection": categoryName ?? categorySlug,
    "inLanguage": "id-ID",
    "datePublished": article.created_at ?? undefined,
    "dateModified": article.updated_at ?? article.created_at ?? undefined,
    "author": { "@id": `${SITE_URL}/#organization` },
    "publisher": { "@id": `${SITE_URL}/#organization` },
    "isPartOf": { "@id": `${SITE_URL}/#website` },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Knowledge Base", "item": `${SITE_URL}/knowledge` },
      { "@type": "ListItem", "position": 2, "name": categoryName ?? categorySlug, "item": `${SITE_URL}/knowledge/${categorySlug}` },
      { "@type": "ListItem", "position": 3, "name": article.title, "item": articleUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-4 sm:p-6 md:p-12 font-sans overflow-x-hidden max-w-full">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="max-w-3xl mx-auto w-full space-y-6 sm:space-y-8 overflow-hidden">
        <Link href={`/knowledge/${categorySlug}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171821] hover:bg-[#222433] text-gray-300 hover:text-white border border-[#2b2d3e] text-xs font-semibold transition-all">
          <ArrowLeft className="w-4 h-4" /> <span>Kembali ke Kategori</span>
        </Link>

        <article className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-snug">{article.title}</h1>
            {(article as any).verification_status === "verified" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ✓ Terverifikasi Resmi Tim Pakar
              </span>
            )}
          </div>
          {article.summary && <p className="text-sm md:text-base text-gray-400 leading-relaxed italic border-l-2 border-blue-500/50 pl-3">{article.summary}</p>}

          {(article as any).verificator_notes && (
            <div className="p-4 rounded-2xl bg-purple-900/20 border border-purple-500/30 text-xs md:text-sm space-y-1.5 my-4">
              <div className="font-bold text-purple-300 flex items-center gap-2">
                <span>💬 Catatan Koreksi & Pengayaan Pakar Verifikator</span>
              </div>
              <p className="text-purple-200 leading-relaxed">{(article as any).verificator_notes}</p>
            </div>
          )}

          <div className="pt-6 border-t border-[#212330]">
            <MarkdownRenderer content={cleanBodyContent} />
          </div>
        </article>

        <ContributeCTA type="knowledge" />
      </div>
    </div>
  );
}
