'use client';

import { useState, useEffect } from "react";
import {
  Settings,
  X,
  Globe,
  Sun,
  Moon,
  Monitor,
  Volume2,
  VolumeX,
  Sliders,
  Shield,
  Trash2,
  Download,
  Info,
  User,
  Check,
  Sparkles,
  Bot,
  MessageSquare,
  FileText,
  Key,
  Database,
  ExternalLink,
  Cpu,
  Lock,
  Layers,
  Heart,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Smartphone,
  Brain,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Language, UserMemoryItem } from "@/lib/types";
import ContactModal from "@/components/ContactModal";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLangChange: (newLang: Language) => void;
  user: { name: string; email: string; role: string } | null;
  onClearChats?: () => void;
}

type TabType = 'general' | 'model' | 'personalization' | 'memory' | 'account' | 'about';

export default function SettingsModal({
  isOpen,
  onClose,
  lang,
  onLangChange,
  user,
  onClearChats
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [contactOpen, setContactOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');
  const [autoPlayVoice, setAutoPlayVoice] = useState<boolean>(false);
  const [voiceVoice, setVoiceVoice] = useState<string>('abogani');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [showAksaraSubtitles, setShowAksaraSubtitles] = useState<boolean>(true);
  const [deepSearchMode, setDeepSearchMode] = useState<boolean>(true);
  const [saveHistory, setSaveHistory] = useState<boolean>(true);
  const [customUserBio, setCustomUserBio] = useState<string>("");
  const [customTone, setCustomTone] = useState<string>("totabuan");
  const [confirmClear, setConfirmClear] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [memoryItems, setMemoryItems] = useState<UserMemoryItem[]>([]);
  const [memoryLoading, setMemoryLoading] = useState<boolean>(false);
  const [newMemoryText, setNewMemoryText] = useState<string>("");
  const [memoryLoaded, setMemoryLoaded] = useState<boolean>(false);

  // Load preferences from localStorage on open
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAutoVoice = localStorage.getItem("setting_auto_voice");
      if (savedAutoVoice !== null) setAutoPlayVoice(savedAutoVoice === "true");

      const savedAksaraSub = localStorage.getItem("setting_aksara_subtitles");
      if (savedAksaraSub !== null) setShowAksaraSubtitles(savedAksaraSub === "true");

      const savedDeepSearch = localStorage.getItem("setting_deep_search");
      if (savedDeepSearch !== null) setDeepSearchMode(savedDeepSearch === "true");

      const savedBio = localStorage.getItem("setting_custom_bio");
      if (savedBio) setCustomUserBio(savedBio);

      const savedTone = localStorage.getItem("setting_custom_tone");
      if (savedTone) setCustomTone(savedTone);

      const savedVoice = localStorage.getItem("setting_voice_type");
      if (savedVoice) setVoiceVoice(savedVoice);

      const savedRate = localStorage.getItem("setting_speech_rate");
      if (savedRate) setSpeechRate(parseFloat(savedRate));
    }
  }, [isOpen]);

  // Muat daftar memori sekali saat tab Memori pertama kali dibuka (bukan
  // tiap render) -- ringan tapi tetap tidak perlu fetch berulang kalau user
  // cuma gonta-ganti tab lain lalu balik lagi.
  useEffect(() => {
    if (isOpen && activeTab === 'memory' && user && !memoryLoaded) {
      setMemoryLoading(true);
      fetch("/api/public/memory")
        .then((res) => res.json())
        .then((data) => setMemoryItems(data.memory || []))
        .catch(() => setMemoryItems([]))
        .finally(() => {
          setMemoryLoading(false);
          setMemoryLoaded(true);
        });
    }
  }, [isOpen, activeTab, user, memoryLoaded]);

  const handleDeleteMemory = async (id: string) => {
    setMemoryItems((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/public/memory?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Failed deleting memory item:", e);
    }
  };

  const handleAddMemory = async () => {
    const content = newMemoryText.trim();
    if (!content) return;
    setNewMemoryText("");
    try {
      const res = await fetch("/api/public/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.id) {
        setMemoryItems((prev) => [{ id: data.id, content, category: 'general', created_at: new Date().toISOString() }, ...prev]);
      }
    } catch (e) {
      console.warn("Failed adding memory item:", e);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("setting_auto_voice", String(autoPlayVoice));
      localStorage.setItem("setting_aksara_subtitles", String(showAksaraSubtitles));
      localStorage.setItem("setting_deep_search", String(deepSearchMode));
      localStorage.setItem("setting_custom_bio", customUserBio);
      localStorage.setItem("setting_custom_tone", customTone);
      localStorage.setItem("setting_voice_type", voiceVoice);
      localStorage.setItem("setting_speech_rate", String(speechRate));
    }

    setSaveSuccessMsg(lang === 'id' ? "Pengaturan berhasil disimpan!" : "Settings saved successfully!");
    setTimeout(() => {
      setSaveSuccessMsg(null);
      onClose();
    }, 600);
  };

  const handleExportData = () => {
    if (typeof window === "undefined") return;
    try {
      const chatSessions = localStorage.getItem("home_chat_sessions");
      const exportObject = {
        app: "MongondowPedia (Ginza Project)",
        version: "2.5.0-pro",
        exportedAt: new Date().toISOString(),
        user: user ? user.email : "Guest",
        sessions: chatSessions ? JSON.parse(chatSessions) : []
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `mongondowpedia-export-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert("Gagal mengekspor data percakapan.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-[#121318] border border-[#242735] rounded-3xl w-full max-w-3xl h-[85vh] max-h-[640px] flex flex-col md:flex-row text-white shadow-2xl overflow-hidden relative">
        
        {/* Mobile Header / Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#202330] text-gray-400 hover:text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Sidebar Navigation Tabs */}
        <div className="w-full md:w-64 bg-[#0D0E13] border-b md:border-b-0 md:border-r border-[#202330] p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white tracking-tight">Pengaturan</h3>
                <p className="text-[10px] text-gray-400 font-mono">MongondowPedia</p>
              </div>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'general'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#181A24]'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>{lang === 'id' ? 'Umum' : 'General'}</span>
              </button>

              <button
                onClick={() => setActiveTab('model')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'model'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#181A24]'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>{lang === 'id' ? 'Model & Suara' : 'Model & Voice'}</span>
              </button>

              <button
                onClick={() => setActiveTab('personalization')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'personalization'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#181A24]'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>{lang === 'id' ? 'Personalisasi & Aksara' : 'Personalization'}</span>
              </button>

              <button
                onClick={() => setActiveTab('memory')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'memory'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#181A24]'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>{lang === 'id' ? 'Memori Bogani AI' : 'Bogani AI Memory'}</span>
              </button>

              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'account'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#181A24]'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>{lang === 'id' ? 'Akun & Keamanan' : 'Account & Security'}</span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'about'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-400 shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-[#181A24]'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>{lang === 'id' ? 'Tentang Platform' : 'About Platform'}</span>
              </button>
            </nav>
          </div>

          {/* User Account Info Bottom Badge */}
          <div className="pt-3 border-t border-[#202330] mt-4">
            {user ? (
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#14161F] border border-[#232635]">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30 shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-[#14161F] border border-[#232635] text-center space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Akses Tamu (Guest)</span>
                <p className="text-[10px] text-gray-400">Login untuk akses penuh</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Main Settings Panel Content */}
        <div className="flex-1 flex flex-col justify-between p-6 overflow-y-auto space-y-6">
          
          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: UMUM (GENERAL) */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="border-b border-[#202330] pb-3">
                <h4 className="font-bold text-base text-white">Pengaturan Umum</h4>
                <p className="text-xs text-gray-400">Pengaturan bahasa antarmuka, tema visual, dan preferensi riwayat.</p>
              </div>

              {/* Language Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Bahasa Antarmuka (Interface Language)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onLangChange('id')}
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                      lang === 'id'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-[#171922] border-[#252836] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">🇮🇩</span>
                      <span>Bahasa Indonesia</span>
                    </span>
                    {lang === 'id' && <Check className="w-4 h-4 text-blue-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onLangChange('en')}
                    className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                      lang === 'en'
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-[#171922] border-[#252836] text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">🇺🇸</span>
                      <span>English</span>
                    </span>
                    {lang === 'en' && <Check className="w-4 h-4 text-blue-400" />}
                  </button>
                </div>
              </div>

              {/* Theme Preference */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5 text-purple-400" />
                  <span>Tema Tampilan Visual</span>
                </label>
                <div className="p-3.5 rounded-2xl bg-[#171922] border border-[#252836] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <Moon className="w-4 h-4 text-purple-400" />
                    <span>Mode Gelap Premium (Standar MongondowPedia)</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    Aktif
                  </span>
                </div>
              </div>

              {/* Save History Toggle */}
              <div className="p-4 rounded-2xl bg-[#171922] border border-[#252836] flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white">Simpan Riwayat Sesi Obrolan</h5>
                  <p className="text-[11px] text-gray-400">Menyimpan daftar percakapan sebelumnya di penyimpanan lokal browser Anda.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSaveHistory(!saveHistory)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${saveHistory ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${saveHistory ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: MODEL & SUARA (MODEL & VOICE) */}
          {activeTab === 'model' && (
            <div className="space-y-6">
              <div className="border-b border-[#202330] pb-3">
                <h4 className="font-bold text-base text-white">Model AI & Suara Percakapan</h4>
                <p className="text-xs text-gray-400">Pengaturan kecerdasan buatan Bogani AI dan respons fonetik suara.</p>
              </div>

              {/* AI Model Specification */}
              <div className="p-4 rounded-2xl bg-[#171922] border border-[#252836] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-white">Model Utama AI: Bogani AI (RAG Engine)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    Gemini 1.5 Pro High-Precision
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Model AI ini dilatih khusus dengan korpus bahasa Mongondow, manuskrip silsilah raja-raja, dan sistem verifikasi dewan pakar BMR.
                </p>
              </div>

              {/* Deep Search RAG Toggle */}
              <div className="p-4 rounded-2xl bg-[#171922] border border-[#252836] flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mode Riset Pengetahuan Mendalam (Deep RAG)</span>
                  </h5>
                  <p className="text-[11px] text-gray-400">Pencarian silang dokumen sejarah BMR dan entri kamus sebelum merespons.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDeepSearchMode(!deepSearchMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${deepSearchMode ? 'bg-amber-600' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${deepSearchMode ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Voice Options */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Karakter Suara AI (Voice Accent)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVoiceVoice('abogani')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      voiceVoice === 'abogani'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-[#171922] border-[#252836] text-gray-400'
                    }`}
                  >
                    <span>Abo&apos; Native BMR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceVoice('female')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      voiceVoice === 'female'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-[#171922] border-[#252836] text-gray-400'
                    }`}
                  >
                    <span>Wanita (Feminin)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceVoice('male')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      voiceVoice === 'male'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-[#171922] border-[#252836] text-gray-400'
                    }`}
                  >
                    <span>Pria (Maskulin)</span>
                  </button>
                </div>
              </div>

              {/* Speech Rate & Auto Play Voice */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#171922] border border-[#252836] flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">Otomatis Membaca Respons Teks</h5>
                    <p className="text-[11px] text-gray-400">AI otomatis membacakan ucapan suara setiap kali menjawab pesan.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoPlayVoice(!autoPlayVoice)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${autoPlayVoice ? 'bg-blue-600' : 'bg-gray-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${autoPlayVoice ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERSONALISASI & AKSARA (PERSONALIZATION) */}
          {activeTab === 'personalization' && (
            <div className="space-y-6">
              <div className="border-b border-[#202330] pb-3">
                <h4 className="font-bold text-base text-white">Personalisasi & Aksara Mongondow</h4>
                <p className="text-xs text-gray-400">Atur gaya bahasa Bogani AI dan alih aksara otomatis.</p>
              </div>

              {/* Aksara Subtitles Toggle */}
              <div className="p-4 rounded-2xl bg-[#171922] border border-[#252836] flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Alih Aksara Totabuan Otomatis</span>
                  </h5>
                  <p className="text-[11px] text-gray-400">Menampilkan teks Aksara Mongondow asli di bawah istilah kosa kata.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAksaraSubtitles(!showAksaraSubtitles)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${showAksaraSubtitles ? 'bg-emerald-600' : 'bg-gray-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${showAksaraSubtitles ? 'right-1' : 'left-1'}`} />
                </button>
              </div>

              {/* Tone Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Gaya Berkomunikasi Bogani AI
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomTone('totabuan')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      customTone === 'totabuan'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-[#171922] border-[#252836] text-gray-400'
                    }`}
                  >
                    <p className="font-bold">Totabuan Adat</p>
                    <p className="text-[10px] text-gray-400 font-normal">Menggunakan frasa sopan adat & Bahasa Mongondow baku.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomTone('formal')}
                    className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      customTone === 'formal'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-[#171922] border-[#252836] text-gray-400'
                    }`}
                  >
                    <p className="font-bold">Formal Akademis</p>
                    <p className="text-[10px] text-gray-400 font-normal">Gaya bahasa lugas ilmiah berbasis penelitian rujukan.</p>
                  </button>
                </div>
              </div>

              {/* User Bio Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Instruksi Kustom Untuk AI (Custom User Context)
                </label>
                <textarea
                  rows={3}
                  value={customUserBio}
                  onChange={(e) => setCustomUserBio(e.target.value)}
                  placeholder="Contoh: Saya adalah guru sejarah dari Kotamobagu yang ingin belajar tata bahasa Totabuan..."
                  className="w-full p-3 bg-[#171922] border border-[#252836] rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB: MEMORI BOGANI AI */}
          {activeTab === 'memory' && (
            <div className="space-y-6">
              <div className="border-b border-[#202330] pb-3">
                <h4 className="font-bold text-base text-white">{lang === 'id' ? 'Memori Bogani AI' : 'Bogani AI Memory'}</h4>
                <p className="text-xs text-gray-400">
                  {lang === 'id'
                    ? 'Fakta ringkas yang Bogani AI ingat tentang Anda lintas-sesi (mis. nama panggilan, preferensi). Anda bisa hapus kapan saja.'
                    : 'Short facts Bogani AI remembers about you across sessions. You can delete anytime.'}
                </p>
              </div>

              {!user ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  {lang === 'id' ? 'Login diperlukan agar Bogani AI bisa mengingat Anda lintas-sesi.' : 'Login required for Bogani AI to remember you across sessions.'}
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newMemoryText}
                      onChange={(e) => setNewMemoryText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddMemory(); }}
                      placeholder={lang === 'id' ? 'Tambah memori manual, mis: "Aku suka kopi pahit"...' : 'Add memory manually...'}
                      className="flex-1 p-3 bg-[#171922] border border-[#252836] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddMemory}
                      className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shrink-0"
                    >
                      {lang === 'id' ? 'Tambah' : 'Add'}
                    </button>
                  </div>

                  {memoryLoading ? (
                    <div className="p-6 flex items-center justify-center text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                  ) : memoryItems.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-[#171922] border border-[#252836] text-center text-xs text-gray-500">
                      {lang === 'id' ? 'Belum ada memori tersimpan. Akan terisi otomatis seiring Anda mengobrol dengan Bogani AI.' : 'No memory saved yet. Fills in automatically as you chat with Bogani AI.'}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {memoryItems.map((m) => (
                        <div key={m.id} className="p-3 rounded-xl bg-[#171922] border border-[#252836] flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-200 break-words">{m.content}</p>
                            <span className="text-[9px] font-mono text-gray-500 uppercase">{m.category}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteMemory(m.id)}
                            className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg shrink-0"
                            title={lang === 'id' ? 'Hapus' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 4: AKUN & KEAMANAN (ACCOUNT & SECURITY) */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="border-b border-[#202330] pb-3">
                <h4 className="font-bold text-base text-white">Akun, Privasi & Keamanan Data</h4>
                <p className="text-xs text-gray-400">Kelola riwayat percakapan, ekspor data, dan informasi otentikasi.</p>
              </div>

              {/* User Status Card */}
              <div className="p-4 rounded-2xl bg-[#171922] border border-[#252836] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Status Sesi Pengguna:</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    user ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {user ? `Terhubung: ${user.email}` : "Akses Tamu Gratis"}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {user
                    ? "Akun Anda terhubung dengan Google Cloud OAuth2 terverifikasi."
                    : "Anda berada dalam mode tamu dengan kuota harian terbatas. Silakan login untuk membuka kuota penuh."}
                </p>
              </div>

              {/* Export Data & Clear History Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="p-3.5 rounded-2xl bg-[#171922] hover:bg-[#202330] border border-[#252836] text-gray-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>Ekspor Riwayat (JSON)</span>
                </button>

                {onClearChats && (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Hapus Semua Percakapan</span>
                  </button>
                )}
              </div>

              {confirmClear && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 space-y-3">
                  <p className="text-xs font-bold text-white">Apakah Anda yakin ingin menghapus seluruh riwayat percakapan?</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onClearChats) onClearChats();
                        setConfirmClear(false);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500"
                    >
                      Ya, Hapus Sekarang
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="py-1.5 px-3 rounded-xl bg-gray-800 text-gray-300 text-xs font-semibold hover:bg-gray-700"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* Legal Quick Links */}
              <div className="pt-2 border-t border-[#202330] flex items-center gap-4 text-xs font-semibold text-gray-400">
                <Link href="/privacy" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
                <span>•</span>
                <Link href="/terms" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
                <span>•</span>
                <Link href="/info" className="hover:text-white transition-colors">Direktori Info</Link>
              </div>
            </div>
          )}

          {/* TAB 5: TENTANG PLATFORM (ABOUT) */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="border-b border-[#202330] pb-3">
                <h4 className="font-bold text-base text-white">Tentang MongondowPedia</h4>
                <p className="text-xs text-gray-400">Spesifikasi sistem kecerdasan buatan & hak cipta platform.</p>
              </div>

              <div className="p-5 rounded-2xl bg-[#171922] border border-[#252836] space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold font-mono text-sm">
                    MP
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">MongondowPedia</h5>
                    <p className="text-[10px] font-mono text-gray-400">Versi 2.5.0-pro (Ginza Project)</p>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  Portal Ensiklopedia & Pengetahuan Bolaang Mongondow Raya berbasis RAG Kecerdasan Buatan <strong>Bogani Ai "Abo"</strong>by MyAI OS (myai.nexus) dan diampu oleh tim inisiasi <strong>Yayasan Bolaang Mongondow Raya</strong>.
                </p>

                <div className="pt-2 border-t border-[#252836] flex flex-wrap gap-2 text-[11px] font-mono text-gray-400">
                  <span className="px-2 py-0.5 rounded bg-[#10121A] border border-[#202332]">Next.js 16 App Router</span>
                  <span className="px-2 py-0.5 rounded bg-[#10121A] border border-[#202332]">Supabase pgvector</span>
                  <span className="px-2 py-0.5 rounded bg-[#10121A] border border-[#202332]">MyAI OS</span>
                  <span className="px-2 py-0.5 rounded bg-[#10121A] border border-[#202332]">Google OAuth Auth2</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#171922] border border-[#252836] flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">Hubungi Pengembang Resmi:</p>
                  <p className="text-gray-400 font-mono text-[11px]">developer@mongondowpedia.com</p>
                </div>
                <button
                  type="button"
                  onClick={() => setContactOpen(true)}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Kirim Pesan</span>
                </button>
              </div>

              {/* CTA Download App (Android) */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h6 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>Download Aplikasi HP (Android)</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">APK</span>
                    </h6>
                    <p className="text-[11px] text-gray-400 mt-0.5">Akses cepat Bogani AI & Pengetahuan Mongondow langsung dari smartphone Android Anda.</p>
                  </div>
                </div>

                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shrink-0 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                  title="Link Download Aplikasi Mobile Android (Segera Hadir)"
                >
                  <Download className="w-4 h-4" />
                  <span>Download App</span>
                </a>
              </div>
            </div>
          )}

          {/* Bottom Control Buttons */}
          <div className="pt-4 border-t border-[#202330] flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-mono">
              MongondowPedia Inc. • All Rights Reserved
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl bg-[#181A24] hover:bg-[#202330] border border-[#2B2F40] text-gray-300 text-xs font-semibold transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Contact Form Modal Popup */}
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        defaultEmail={user?.email || ""}
        defaultName={user?.name || ""}
      />
    </div>
  );
}
