import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pusat Informasi & Direktori Tools — MongondowPedia",
  description:
    "Direktori lengkap alat (Tools), basis pengetahuan (Knowledge Base), MyAI OS, Ginza Project, serta standar verifikasi data kebudayaan Bolaang Mongondow di MongondowPedia.",
};

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
