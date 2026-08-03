import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function ContributeCTA({ type }: { type: "kamus" | "knowledge" }) {
  const copy = type === "kamus"
    ? {
        title: "Tahu kata Mongondow yang belum ada di sini?",
        desc: "Ajukan kata baru, istilah, atau ungkapan Bahasa Mongondow — akan direview verifikator sebelum masuk Kamus resmi.",
      }
    : {
        title: "Punya pengetahuan tentang Bolaang Mongondow?",
        desc: "Bagikan sejarah, cerita adat, atau seni budaya Mongondow yang Anda tahu — bantu MongondowPedia jadi lebih lengkap.",
      };

  return (
    <div className="mt-10 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
      <div>
        <h3 className="text-base md:text-lg font-bold text-white">{copy.title}</h3>
        <p className="text-xs md:text-sm text-gray-400 mt-1 max-w-md">{copy.desc}</p>
      </div>
      <Link
        href="/u"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shrink-0 transition-all shadow-lg shadow-emerald-500/20"
      >
        <PlusCircle className="w-4 h-4" />
        Tambahkan Pengetahuan
      </Link>
    </div>
  );
}
