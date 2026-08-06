import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Proposal Pengembangan Ginza Project & Inisiasi Yayasan Bolaang Mongondow Raya — MongondowPedia",
  description:
    "Proposal resmi permohonan dukungan dana pengembangan, pendirian Yayasan Bolaang Mongondow Raya, operasional verifikator, infrastruktur AI, dan tools pendidikan Muatan Lokal bagi 5 Pemda Kabupaten/Kota & Masyarakat.",
};

export default function ProposalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
