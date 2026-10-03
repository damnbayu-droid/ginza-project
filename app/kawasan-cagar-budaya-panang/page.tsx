import type { Metadata } from "next";
import Lightbox from "./Lightbox";
import { PAGE_CSS, PAGE_HTML } from "./content";

const PAGE_URL = "https://mongondowpedia.com/kawasan-cagar-budaya-panang";
const PAGE_TITLE = "Kawasan Cagar Budaya Panang";
const PAGE_DESCRIPTION =
  "Usulan Kawasan Cagar Budaya Panang, Kotabunan, Bolaang Mongondow Timur: delapan lokasi, sandingan tutur leluhur, jejak di lapangan, dan arsip Belanda/VOC, linimasa, pindaian arsip, serta kriteria UU No. 11 Tahun 2010.";
const OG_IMAGE = "/kawasan-cagar-budaya-panang/udara-1944.jpg";

// Halaman statis: seluruh isi ada di ./content.ts, tidak membaca database.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: "MongondowPedia",
    locale: "id_ID",
    type: "article",
    images: [
      {
        url: OG_IMAGE,
        width: 1800,
        height: 1082,
        alt: "Kota Boenan dari udara, 13 September 1944",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function KawasanCagarBudayaPanangPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />
      <div className="kcbp" dangerouslySetInnerHTML={{ __html: PAGE_HTML }} />
      <Lightbox />
    </>
  );
}
