import React from 'react';
import Link from 'next/link';
import { 
  Cpu, 
  Globe, 
  Sparkles, 
  ExternalLink, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Radio, 
  FileText, 
  Car, 
  Compass, 
  CheckCircle2, 
  Clock,
  Server
} from 'lucide-react';

export const metadata = {
  title: 'MyAI OS Ecosystem — Connected Consoles & AI Intelligence Hub',
  description: 'Ekosistem konsol terpadu MyAI OS: Console MyAI OS, Console Languages, dan Console MyIndo.app.',
};

export default function EcosystemPage() {
  const ecosystemItems = [
    {
      id: 'console-myai-os',
      title: 'Console MyAI OS',
      badge: 'Live Production',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      subtitle: 'Core AI Gateway & Routing Infrastructure',
      url: 'https://console.myai.nexus',
      domain: 'console.myai.nexus',
      isReady: true,
      icon: Cpu,
      accentGradient: 'from-blue-600 via-indigo-600 to-cyan-500',
      borderHover: 'hover:border-blue-500/50',
      glowColor: 'group-hover:shadow-blue-500/10',
      description:
        'Hub pusat manajemen API Gateway terpadu, intelligent AI job routing, monitoring kuota & token real-time, manajemen kunci provider AI Tier 1 & Tier 2 (GPT, Claude, Gemini, Deepseek, Grok, GLM), serta audit log & enkripsi keamanan terpusat.',
      highlights: [
        'Multi-provider Automatic Failover (Tier 1 & Tier 2)',
        'Real-time Token Analytics & Cost Monitoring',
        'AES-256 Key Encryption & Isolated RLS Schema',
        'Single API Key Authentication for Ecosystem Apps'
      ],
      targetModels: ['GPT-4o', 'Claude 3.5', 'Gemini 1.5 Pro', 'Deepseek V3', 'Grok 2', 'GLM-4']
    },
    {
      id: 'console-languages',
      title: 'Console Languages',
      badge: 'Prepare • In Development',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      subtitle: 'Multi-Language NLP & Neural Voice Synthesis Engine',
      url: 'https://languages.myai.nexus',
      domain: 'languages.myai.nexus',
      isReady: false,
      icon: Globe,
      accentGradient: 'from-purple-600 via-pink-600 to-rose-500',
      borderHover: 'hover:border-purple-500/50',
      glowColor: 'group-hover:shadow-purple-500/10',
      description:
        'Modul pemrosesan dan konsol lokalisasi multi-bahasa terpadu, pemodelan bahasa alami (NLP), pemroses penerjemahan kontekstual real-time, serta sintesis suara (Neural Voice Synthesis) khusus untuk memperluas kapabilitas komunikasi ekosistem MyAI OS.',
      highlights: [
        'Real-time Contextual Nuance Translation',
        'Neural Voice Synthesizer & Speech Recognition',
        'Multilingual Cross-Domain Knowledge Distillation',
        'Localized Accent & Cultural Dialect Tuning'
      ],
      targetModels: ['Voice Engine v1', 'Multilingual Whisper', 'Local NLP Embeddings']
    },
    {
      id: 'console-myindo-app',
      title: 'Console MyIndo.app',
      formerName: 'Dahulu MyBusiness / NyBusiness',
      badge: 'Unified Intelligence • Live',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      subtitle: 'Consolidated Intelligence Hub for Indonesia Services',
      url: 'https://myindo.app',
      domain: 'myindo.app',
      isReady: true,
      icon: Sparkles,
      accentGradient: 'from-emerald-600 via-teal-600 to-blue-600',
      borderHover: 'hover:border-cyan-500/50',
      glowColor: 'group-hover:shadow-cyan-500/10',
      description:
        'Konsol & Asisten AI Terpadu (MyAI di MyIndo.app) yang menyatukan seluruh kecerdasan dan basis pengetahuan dari 3 platform utama layanan di Indonesia menjadi satu pintu terintegrasi:',
      subServices: [
        {
          name: 'indonesianvisas.com',
          desc: 'Layanan Layanan Imigrasi, Legalitas Dokumen & Pengurusan Visa Resmi Indonesia',
          icon: FileText,
          color: 'text-rose-400'
        },
        {
          name: 'tropictech.rent',
          desc: 'Sewa Properti, Kendaraan & Peralatan Teknis Khusus Tropis',
          icon: Car,
          color: 'text-amber-400'
        },
        {
          name: 'balihelp.id',
          desc: 'Bantuan Asistensi Lokal, Concierge, & Panduan Komunitas Bali',
          icon: Compass,
          color: 'text-emerald-400'
        }
      ],
      highlights: [
        'AI Immigration & Legal Document Verification Engine',
        'Smart Rental Booking & Vehicle Fleet Management Concierge',
        '24/7 Real-time Bali Local Assistance AI Agent',
        'Single Sign-On (SSO) & Unified Payment Integration'
      ],
      targetModels: ['MyAI Specialist Agents', 'Sub-domain RAG Indexing']
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-[#ececec] selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-1/3 left-[-200px] w-[500px] h-[500px] bg-purple-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-emerald-600/10 blur-[150px] rounded-full" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 border-b border-[#21232d] bg-[#0d0e12]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-[#161822] hover:bg-[#212433] text-gray-400 hover:text-white border border-[#2b2e40] transition-colors flex items-center gap-2 text-xs font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Chat</span>
            </Link>

            <div className="h-4 w-[1px] bg-[#292c3d]" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">
                MyAI OS <span className="text-blue-400 font-normal">Ecosystem</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all duration-200 flex items-center gap-2"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Gateway Console</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>Satu Pintu Ekosistem Kecerdasan Terintegrasi</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            MyAI OS <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Ecosystem Consoles</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            Menghubungkan seluruh infrastruktur API Gateway, pemrosesan bahasa alami, serta layanan AI cerdas terpadu di Indonesia di bawah naungan domain <code className="text-blue-400 font-mono bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-800/40">myai.nexus</code>.
          </p>
        </div>

        {/* Global Key Architecture Info Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141622] via-[#191c2b] to-[#141622] border border-[#2b2f45] shadow-xl relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-500" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0 mt-1 md:mt-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Unified API Key Management (1 Arah)
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
                  Seluruh API Key dari <strong>Tier 1 (GPT, Claude)</strong> dan <strong>Tier 2 (Deepseek, GLM, Grok, Gemini)</strong> dikelola dan diamankan secara terpusat melalui <code className="text-blue-400 font-mono">console.myai.nexus</code>. Semua aplikasi ekosistem terhubung menggunakan kunci gateway terarah dengan enkripsi AES-256.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#212538] text-gray-300 border border-[#333852]">
                AES-256 Encrypted
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Tier 1 & Tier 2 Ready
              </span>
            </div>
          </div>
        </div>

        {/* Consoles Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {ecosystemItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`group relative flex flex-col bg-[#12141e] border border-[#232738] rounded-2xl p-6 transition-all duration-300 ${item.borderHover} ${item.glowColor} shadow-xl hover:shadow-2xl hover:-translate-y-1`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-tr ${item.accentGradient} text-white shadow-lg shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                {/* Card Title & Subtitle */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">{item.title}</h2>
                    {item.formerName && (
                      <span className="text-[10px] text-gray-400 font-normal">({item.formerName})</span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-blue-400 font-mono">{item.subtitle}</p>
                  <p className="text-[11px] text-gray-500 font-mono">{item.domain}</p>
                </div>

                {/* Card Description */}
                <p className="text-xs text-gray-300 leading-relaxed mb-6">
                  {item.description}
                </p>

                {/* Sub Services list if present */}
                {item.subServices && (
                  <div className="mb-6 space-y-2 bg-[#0c0d14] p-3.5 rounded-xl border border-[#1e2130]">
                    <p className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                      <Radio className="w-3 h-3 text-cyan-400" />
                      Konsolidasi 3 Platform Utama:
                    </p>
                    <div className="space-y-2">
                      {item.subServices.map((sub) => {
                        const SubIcon = sub.icon;
                        return (
                          <div key={sub.name} className="flex items-start gap-2 text-xs">
                            <SubIcon className={`w-4 h-4 shrink-0 mt-0.5 ${sub.color}`} />
                            <div>
                              <span className={`font-semibold ${sub.color}`}>{sub.name}</span>
                              <p className="text-[11px] text-gray-400 leading-tight">{sub.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Highlights Checklist */}
                <div className="space-y-2 mb-8 mt-auto pt-4 border-t border-[#1e2130]">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Fitur & Keunggulan Utama:</p>
                  <ul className="space-y-1.5">
                    {item.highlights.map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Supported AI Models tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {item.targetModels.map((m) => (
                    <span key={m} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1b1e2c] text-gray-400 border border-[#2b3047]">
                      {m}
                    </span>
                  ))}
                </div>

                {/* Redirect Button / Action */}
                {item.isReady ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${item.accentGradient} hover:opacity-90 text-white font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 group-hover:shadow-blue-500/20`}
                  >
                    <span>Buka {item.title}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl bg-[#1a1c29] border border-[#2d3147] text-amber-400/80 font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                  >
                    <Clock className="w-4 h-4 animate-spin-slow text-amber-400" />
                    <span>Dalam Persiapan (Prepare Mode)</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Professional Footer Statement */}
        <div className="pt-8 border-t border-[#1e2130] text-center text-xs text-gray-500 space-y-2">
          <p>© 2026 MyAI OS Ecosystem • <code className="text-gray-400">myai.nexus</code>. All Rights Reserved.</p>
          <p>Terhubung langsung dengan AI Gateway Tier 1 (GPT, Claude) & Tier 2 (Deepseek, GLM, Grok, Gemini).</p>
        </div>
      </main>
    </div>
  );
}
