import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Terima Kasih — MongondowPedia",
  description: "Terima kasih atas dukungan Anda untuk pelestarian budaya, bahasa, dan aksara Bolaang Mongondow Raya di MongondowPedia.",
  robots: { index: false, follow: true }, // halaman transaksional, tidak perlu diindeks mesin pencari
};

// Doku Link (dan payment link sejenisnya) bisa menyertakan info transaksi
// lewat query string di URL redirect sukses -- nama field-nya bisa beda2
// tergantung konfigurasi, jadi dicoba beberapa kemungkinan umum. Kalau tidak
// ada satu pun yg cocok, bagian referensi transaksi ini cukup disembunyikan
// (halaman tetap utuh tanpa itu) -- tidak menganggap satu nama field tertentu
// pasti ada.
const TRX_PARAM_CANDIDATES = ["invoice_number", "invoice", "trx_id", "transaction_id", "reference", "ref_id", "order_id"];

export default async function TerimaKasihPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  let trxRef: string | null = null;
  for (const key of TRX_PARAM_CANDIDATES) {
    const value = params[key];
    if (typeof value === "string" && value.trim()) {
      trxRef = value.trim();
      break;
    }
  }

  return (
    <div className="min-h-screen bg-[#07080A] text-white font-sans selection:bg-blue-500/30 flex flex-col">
      {/* Ambient Lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-rose-600/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full text-center space-y-8">
          {/* Icon Sukses */}
          <div className="mx-auto w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
            <Heart className="w-9 h-9 text-rose-400 fill-rose-400/20" />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold font-mono uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pembayaran Berhasil</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
              Sukur Moanto&apos;, Utat!
            </h1>
            <p className="text-base text-gray-300 leading-relaxed">
              Terima kasih atas donasi Anda untuk MongondowPedia.
            </p>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-[#111318] border border-[#1F222C] text-left space-y-3">
            <p className="text-sm text-gray-300 leading-relaxed">
              Dukungan Anda membantu kami menjaga hidupnya <strong className="text-white">bahasa, sejarah, adat istiadat, dan aksara Bolaang Mongondow Raya</strong> — supaya warisan budaya ini terus terjaga dan terus bisa dipelajari generasi berikutnya, lewat kamus, artikel pengetahuan, dan Bogani AI.
            </p>
            {trxRef && (
              <div className="pt-3 border-t border-[#1F222C] flex items-center justify-between gap-3">
                <span className="text-xs text-gray-500">Referensi Transaksi</span>
                <span className="font-mono text-xs text-gray-300 bg-[#161822] border border-[#232736] px-2.5 py-1 rounded-lg">
                  {trxRef}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto text-sm font-semibold px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center justify-center gap-2"
            >
              <span>Kembali ke Beranda</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Attribution */}
      <div className="relative z-10 pb-8 text-center space-y-2">
        <p className="text-xs text-gray-500 font-sans">
          (Ginza Project) MongondowPedia Inc. All rights reserved.
        </p>
        <p className="font-mono text-[10px] text-gray-600">
          Portal Kebudayaan &amp; Bahasa Bolaang Mongondow Raya
        </p>
      </div>
    </div>
  );
}
