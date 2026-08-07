import { listKnowledgeCategories, listKnowledgeArticles } from "@/lib/ginza-db";
import { isSupabaseReady } from "@/lib/supabase";
import KnowledgeExplorerClient, {
  KnowledgeCategoryItem,
  KnowledgeArticleItem
} from "@/components/knowledge/KnowledgeExplorerClient";

export const metadata = {
  title: "Knowledge Base MongondowPedia — Ensiklopedia Bolaang Mongondow",
  description: "Pusat pengetahuan sejarah, adat budaya, bahasa, dan seni Bolaang Mongondow — disusun komunitas & diverifikasi.",
};

export default async function KnowledgePage() {
  let categories: KnowledgeCategoryItem[] = [];
  let articles: KnowledgeArticleItem[] = [];
  let dbReady = false;

  if (isSupabaseReady) {
    try {
      const [cats, arts] = await Promise.all([
        listKnowledgeCategories(),
        listKnowledgeArticles({ status: "published" }),
      ]);
      categories = cats
        .filter((c) => c.is_active)
        .map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name,
          visit_count: c.visit_count ?? 0,
          description: c.description ?? null,
        }));

      const catNameById = new Map(categories.map((c) => [c.id, c.name]));
      const catSlugById = new Map(categories.map((c) => [c.id, c.slug]));

      articles = arts.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.summary || (a.content ? a.content.substring(0, 140) + "..." : ""),
        category_id: a.category_id,
        category_slug: catSlugById.get(a.category_id) || "sejarah",
        category_name: catNameById.get(a.category_id) || "Pengetahuan",
        visit_count: a.view_count || 0,
        created_at: a.created_at || new Date().toISOString(),
        author_name: a.created_by || "Tim Verifikator",
      }));

      dbReady = true;
    } catch {
      dbReady = false;
    }
  }

  // Fallback Data jika Database belum terhubung
  if (!dbReady || categories.length === 0) {
    categories = [
      { id: "cat-sejarah", slug: "sejarah", name: "Sejarah", visit_count: 850, description: "Arsip sejarah masuknya peradaban, suku, dan peristiwa penting Bolaang Mongondow." },
      { id: "cat-adat", slug: "adat-budaya", name: "Adat & Budaya", visit_count: 640, description: "Tatanan adat istiadat, ritual kebudayaan, norma sosial, dan filosofi kehidupan suku Mongondow." },
      { id: "cat-bahasa", slug: "bahasa-sastra", name: "Bahasa & Sastra", visit_count: 920, description: "Dokumentasi kosa kata, ungkapan sastra kuno, peribahasa, dan tuturan khas Bolaang Mongondow." },
      { id: "cat-kerajaan", slug: "kerajaan-bolaang-mongondow", name: "Kerajaan Bolaang Mongondow", visit_count: 530, description: "Naskah silsilah raja-raja, Loloda Mokoagow, stamboom istana, dan peninggalan era kerajaan." },
      { id: "cat-aksara", slug: "aksara-naskah", name: "Aksara & Naskah", visit_count: 780, description: "Kumpulan 88 suku kata Aksara Mongondow, manuskrip kuno, dan panduan transliterasi digital." },
      { id: "cat-pidato", slug: "pidato-bahasa-mongondow", name: "Pidato Bahasa Mongondow", visit_count: 450, description: "Teks sambutan adat, pidato resmi BMR, dan retorika tuturan lisan penutur asli." },
      { id: "cat-edukasi", slug: "edukasi", name: "Edukasi", visit_count: 310, description: "Materi pembelajaran bahasa daerah untuk sekolah, mahasiswa, dan masyarakat umum." },
    ];

    articles = [
      {
        id: "art-1",
        slug: "sejarah-raja-loloda-mokoagow",
        title: "Sejarah Ringkas Silsilah Raja Loloda Mokoagow & Kejayaan Bolaang Mongondow",
        excerpt: "Kisah kepemimpinan Raja Loloda Mokoagow dalam menyatukan wilayah Bolaang Mongondow Raya serta diplomasi dengan kerajaan tetangga.",
        category_id: "cat-kerajaan",
        category_slug: "kerajaan-bolaang-mongondow",
        category_name: "Kerajaan Bolaang Mongondow",
        visit_count: 520,
        created_at: new Date().toISOString(),
        author_name: "Dewan Verifikator Adat",
      },
      {
        id: "art-2",
        slug: "filosofi-ksatria-bogani",
        title: "Filosofi Ksatria Bogani & Makna Ungkapan Adat 'Palu'an kon Komintan'",
        excerpt: "Pencerminan nilai kepemimpinan ksatria Bogani dalam menjaga integritas, keberanian, dan kerukunan masyarakat Mongondow.",
        category_id: "cat-adat",
        category_slug: "adat-budaya",
        category_name: "Adat & Budaya",
        visit_count: 430,
        created_at: new Date().toISOString(),
        author_name: "Tim Peneliti Budaya BMR",
      },
      {
        id: "art-3",
        slug: "panduan-membaca-aksara-mongondow",
        title: "Panduan Lengkap Membaca Diakritik Vokal & Pamudpod Aksara Mongondow",
        excerpt: "Aturan penulisan 88 suku kata tradisional Bolaang Mongondow serta penerapan tanda silang pamudpod untuk konsonan mati.",
        category_id: "cat-aksara",
        category_slug: "aksara-naskah",
        category_name: "Aksara & Naskah",
        visit_count: 610,
        created_at: new Date().toISOString(),
        author_name: "Tim Aksara Digital",
      },
    ];

    dbReady = true;
  }

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": "https://mongondowpedia.com/knowledge#collection",
    "url": "https://mongondowpedia.com/knowledge",
    "name": "Knowledge Base MongondowPedia — Ensiklopedia Bolaang Mongondow",
    "description": "Pusat pengetahuan sejarah, adat budaya, bahasa, dan seni Bolaang Mongondow — disusun komunitas & diverifikasi.",
    "isPartOf": { "@id": "https://mongondowpedia.com/#website" },
    "inLanguage": "id-ID",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <KnowledgeExplorerClient
        categories={categories}
        articles={articles}
        dbReady={dbReady}
      />
    </>
  );
}
