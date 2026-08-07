import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import WriteArticleClient from "./client";

export const metadata = {
  title: "Tulis Artikel Baru — MongondowPedia",
  description: "Tulis dan terbitkan artikel pengetahuan, sejarah, atau opini Bolaang Mongondow langsung ke MongondowPedia.",
};

export default async function TulisArtikelPage() {
  const session = await getServerSession();

  // Jika belum login, redirect ke /login dengan return URL next=/u/tulis-artikel
  if (!session) {
    redirect("/login?next=/u/tulis-artikel");
  }

  return <WriteArticleClient userEmail={session.email} userRole={session.role} />;
}
