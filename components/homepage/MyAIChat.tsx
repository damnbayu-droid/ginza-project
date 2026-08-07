'use client';

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Mic,
  ArrowUp,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Menu,
  ChevronDown,
  Info,
  Image as ImageIcon,
  FileText,
  X,
  Lock,
  LogIn,
  BookOpen,
  Database,
  Settings,
  Moon,
  Sun,
  ClipboardList
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import MyAILogo from "./MyAILogo";
import LoginModal from "@/components/LoginModal";
import SettingsModal from "@/components/SettingsModal";
import FeedbackModal from "@/components/FeedbackModal";
import { HomeChatMessage, HomeChatSession, Language } from "@/lib/types";
import { speakMongondow, stopSpeakingMongondow } from "@/lib/mongondow-voice";

// Identitas produk Ginza Project — pakai env var yang sama dengan lib/bogani-persona.ts
// supaya konsisten di seluruh app (bukan generic "MyAI" seperti sebelumnya).
const AI_NAME = process.env.NEXT_PUBLIC_AI_NAME || "Bogani AI";
const WEBSITE_NAME = process.env.NEXT_PUBLIC_WEBSITE_NAME || "MongondowPedia";

interface MyAIChatProps {
  currentSession: HomeChatSession | null;
  onSendMessage: (text: string, isVoiceInput?: boolean, fileData?: string) => Promise<any>;
  onRegenerate: () => Promise<void>;
  onOpenVoiceOverlay: () => void;
  onToggleSidebarMobile: () => void;
  lang: Language;
  isLoading: boolean;
  user: { name: string; email: string; role: string } | null;
  guestCount: number;
  /** Diisi server (bukan tebakan klien) lewat respons 403 quotaExceeded -- lihat lib/ai-usage-quota.ts. */
  quotaBlock: { message: string; requiresAuth: boolean } | null;
}

interface AttachedFile {
  name: string;
  size: string;
  dataUrl: string;
  isImage: boolean;
}

export default function MyAIChat({
  currentSession,
  onSendMessage,
  onRegenerate,
  onOpenVoiceOverlay,
  onToggleSidebarMobile,
  lang,
  isLoading,
  user,
  guestCount,
  quotaBlock
}: MyAIChatProps) {
  const [inputText, setInputText] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedModelOverride, setSelectedModelOverride] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);
  const [featureNotice, setFeatureNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sumber kebenaran gembok chat: respons 403 quotaExceeded ASLI dari server
  // (lib/ai-usage-quota.ts), bukan tebakan localStorage -- kuota kini
  // dibagi jg dgn tombol AI definisi Kamus, jadi hitungan lokal murni chat
  // saja tidak lagi akurat sbg penentu gembok.
  const isGuestLocked = !!quotaBlock;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Model Auto-Detection config
  const modelConfigs: Record<string, { name: string; badge: string; color: string; border: string; desc: string }> = {
    auto: { name: 'Auto Gateway', badge: 'Auto', color: 'text-blue-400 bg-blue-500/10', border: 'border-blue-500/30', desc: 'Routing cerdas ke model terbaik' },
    gemini: { name: 'Gemini 1.5 Pro', badge: 'Gemini', color: 'text-blue-400 bg-blue-500/10', border: 'border-blue-500/30', desc: 'Google Multimodal AI' },
    gpt: { name: 'GPT-4o', badge: 'GPT-4o', color: 'text-emerald-400 bg-emerald-500/10', border: 'border-emerald-500/30', desc: 'OpenAI High Intelligence' },
    claude: { name: 'Claude 3.5 Sonnet', badge: 'Claude 3.5', color: 'text-amber-400 bg-amber-500/10', border: 'border-amber-500/30', desc: 'Anthropic Reasoning' },
    deepseek: { name: 'Deepseek V3', badge: 'Deepseek', color: 'text-cyan-400 bg-cyan-500/10', border: 'border-cyan-500/30', desc: 'Deepseek AI Reasoning' },
    grok: { name: 'Grok 2', badge: 'Grok 2', color: 'text-purple-400 bg-purple-500/10', border: 'border-purple-500/30', desc: 'xAI Intelligence' },
    glm: { name: 'GLM-4', badge: 'GLM-4', color: 'text-rose-400 bg-rose-500/10', border: 'border-rose-500/30', desc: 'Zhipu GLM Language Model' },
  };

  const lastAssistantMsg = currentSession?.messages.filter(m => m.role === 'assistant' && m.content).slice(-1)[0];
  const detectedProviderKey = selectedModelOverride !== null
    ? selectedModelOverride
    : (lastAssistantMsg?.providerUsed?.toLowerCase() || 'auto');

  const currentModelDisplay = modelConfigs[detectedProviderKey] || modelConfigs.auto;

  // File Upload Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeatureNotice(lang === 'id' ? "Ukuran file melebihi batas 5MB." : "File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      const isImage = file.type.startsWith("image/");
      const formattedSize = (file.size / 1024).toFixed(0) + " KB";

      setAttachedFile({
        name: file.name,
        size: formattedSize,
        dataUrl,
        isImage
      });

      setShowPlusMenu(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGuestLocked) return;
    if ((!inputText.trim() && !attachedFile) || isLoading) return;

    const messageText = inputText.trim() || (attachedFile ? `Tolong analisis file lampiran "${attachedFile.name}"` : "");
    const fileDataToSubmit = attachedFile?.dataUrl;

    setInputText("");
    setAttachedFile(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    await onSendMessage(messageText, false, fileDataToSubmit);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleReadAloud = (id: string, text: string) => {
    if (typeof window === "undefined") return;

    if (speakingMessageId === id) {
      stopSpeakingMongondow();
      setSpeakingMessageId(null);
      return;
    }

    stopSpeakingMongondow();
    setSpeakingMessageId(id);

    // Coba rekaman suara asli dulu (cuma nyantol kalau balasan AI kebetulan
    // persis sama dgn satu kata/frasa yg sudah direkam verifikator -- jarang
    // tapi bisa terjadi, mis. balasan singkat berupa satu kata Kamus), baru
    // jatuh ke TTS sintetis utk balasan panjang seperti biasa.
    const strippedText = text.replace(/[*_#`~]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
    speakMongondow(strippedText, {
      lang: lang === 'id' ? 'id-ID' : 'en-US',
      onEnd: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null),
    });
  };

  const handleMicClick = () => {
    if (isGuestLocked) {
      setShowLoginModal(true);
      return;
    }
    onOpenVoiceOverlay();
  };

  const hasMessages = currentSession && currentSession.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#171717] text-[#ececec] relative overflow-hidden font-sans">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,.pdf,.docx,.csv,.txt"
        className="hidden"
      />

      {/* Header Bar */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-[#212121] bg-[#171717]/90 backdrop-blur-md z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebarMobile}
            className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-[#212121] rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Header Title & MyAI OS Badge */}
          <div className="flex items-center gap-2 px-2 py-1.5">
            <span className="font-sans font-semibold text-sm text-white/90">Bogani AI</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border font-bold text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
              MyAI OS
            </span>
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="flex items-center gap-2 bg-[#21232B] hover:bg-[#2A2D37] text-gray-300 hover:text-white border border-[#2E313D] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm group"
            title={lang === 'id' ? "Kritik, Saran & Kuisioner" : "Feedback & Survey"}
          >
            <ClipboardList className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>{lang === 'id' ? 'Feedback' : 'Feedback'}</span>
          </button>

          <Link
            href="/info"
            className="flex items-center gap-2 bg-[#21232B] hover:bg-[#2A2D37] text-gray-300 hover:text-white border border-[#2E313D] px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm group"
            title="Informasi & Direktori Tools MongondowPedia"
          >
            <Info className="w-4 h-4 text-[#5B8DEF] group-hover:scale-110 transition-transform" />
            <span>Info</span>
          </Link>
        </div>
      </header>

      {/* Notice Banner */}
      {featureNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-blue-600/90 border border-blue-400 text-white text-xs px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 max-w-md animate-fade-in">
          <Info className="w-4 h-4 text-white shrink-0" />
          <span className="flex-1">{featureNotice}</span>
          <button onClick={() => setFeatureNotice(null)} className="p-1 hover:bg-white/20 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Messages & Welcome View */}
      <div className="flex-1 overflow-y-auto flex flex-col justify-between custom-scrollbar">
        {!hasMessages ? (
          <div className="my-auto w-full max-w-2xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-center space-y-8 animate-fade-in">
            <div className="space-y-3">
              <MyAILogo size="lg" className="mb-2 mx-auto" />
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                {lang === 'id'
                  ? `Apa yang bisa ${AI_NAME} bantu hari ini?`
                  : `What can ${AI_NAME} help you with today?`}
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                {WEBSITE_NAME} • Bogani AI powered by MyAI OS
              </p>
            </div>

            {/* Input Bar inside welcome screen */}
            <div className="w-full relative">
              <form
                onSubmit={handleSubmit}
                className="w-full bg-[#212121] border border-[#2f2f2f] focus-within:border-[#444] rounded-3xl p-3 shadow-2xl transition-all duration-200"
              >
                {/* Attached File Preview Card */}
                {attachedFile && (
                  <div className="mb-2 p-2.5 bg-[#181924] border border-blue-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs text-white">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {attachedFile.isImage ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={attachedFile.dataUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-[#333]" />
                      ) : (
                        <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="truncate text-left">
                        <p className="font-semibold text-xs text-white truncate">{attachedFile.name}</p>
                        <p className="text-[10px] text-gray-400">{attachedFile.size}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="p-1 hover:bg-[#2b2b2b] text-gray-400 hover:text-white rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  {/* Perfect Match Compact CTA Add File Button */}
                  <div className="relative">
                    <button
                      type="button"
                      disabled={isGuestLocked}
                      onClick={() => setShowPlusMenu(!showPlusMenu)}
                      className="p-2.5 hover:bg-[#2f2f2f] text-gray-400 hover:text-white rounded-full transition-colors disabled:opacity-50"
                      title="Tambah Lampiran"
                    >
                      <Plus className="w-5 h-5" />
                    </button>

                    {/* Compact Icon-only Popover - Perfect Position */}
                    {showPlusMenu && (
                      <div className="absolute bottom-12 left-0 z-50 bg-[#252525] border border-[#3d3d3d] rounded-2xl p-1.5 shadow-2xl flex items-center gap-1.5 animate-scale-up">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPlusMenu(false);
                            fileInputRef.current?.click();
                          }}
                          className="px-3 py-2 rounded-xl hover:bg-[#333] flex items-center gap-1.5 text-xs text-white transition-colors"
                          title="Unggah Gambar"
                        >
                          <ImageIcon className="w-4 h-4 text-blue-400" />
                          <span className="font-medium">Gambar</span>
                        </button>

                        <div className="w-[1px] h-4 bg-[#3d3d3d]" />

                        <button
                          type="button"
                          onClick={() => {
                            setShowPlusMenu(false);
                            fileInputRef.current?.click();
                          }}
                          className="px-3 py-2 rounded-xl hover:bg-[#333] flex items-center gap-1.5 text-xs text-white transition-colors"
                          title="Unggah Dokumen"
                        >
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span className="font-medium">Dokumen</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isGuestLocked}
                    placeholder={isGuestLocked ? (quotaBlock?.message || "Batas pemakaian AI tercapai.") : (lang === 'id' ? "Tanyakan apa saja ke Bogani AI..." : "Ask anything to Bogani AI...")}
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none resize-none py-2 max-h-36 custom-scrollbar disabled:opacity-50"
                  />

                  {/* Microphone CTA Button */}
                  <button
                    type="button"
                    disabled={isGuestLocked}
                    onClick={handleMicClick}
                    className={`p-2.5 rounded-full transition-all duration-200 disabled:opacity-50 ${
                      isListening
                        ? "bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30"
                        : "hover:bg-[#2f2f2f] text-gray-400 hover:text-white"
                    }`}
                    title="Input Suara (Microphone)"
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <button
                    type="submit"
                    disabled={isGuestLocked || (!inputText.trim() && !attachedFile) || isLoading}
                    className={`p-2.5 rounded-full transition-all duration-200 ${
                      !isGuestLocked && (inputText.trim() || attachedFile) && !isLoading
                        ? "bg-white text-black hover:bg-gray-200 shadow-md"
                        : "bg-[#2f2f2f] text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Quick Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              {[
                {
                  title: "Arti kata 'Boluya' & 'Komintan'",
                  subtitle: "Terjemahkan & contoh tuturan bahasa",
                  prompt: "Tolong jelaskan arti kata 'Boluya' dan 'Komintan' serta berikan contoh penggunaannya dalam tuturan Bahasa Mongondow."
                },
                {
                  title: "Panduan membaca Aksara Mongondow",
                  subtitle: "Aturan vokal, diakritik, & pamudpod",
                  prompt: "Bagaimana aturan membaca diakritik vokal dan tanda silang (pamudpod) pada Aksara Mongondow?"
                },
                {
                  title: "Filosofi Ksatria Bogani & Adat",
                  subtitle: "Makna ungkapan 'Palu'an kon komintan'",
                  prompt: "Apa filosofi utama ksatria Bogani dan makna ungkapan adat 'Palu'an kon komintan'?"
                },
                {
                  title: "Sejarah Raja Bolaang Mongondow",
                  subtitle: "Silsilah Mokoagow & naskah kuno",
                  prompt: "Jelaskan sejarah ringkas silsilah Raja Loloda Mokoagow dan asal-usul naskah kuno Bolaang Mongondow."
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  disabled={isGuestLocked}
                  onClick={() => {
                    setInputText(item.prompt || item.title);
                    if (textareaRef.current) textareaRef.current.focus();
                  }}
                  className="p-3.5 rounded-2xl bg-[#212121] hover:bg-[#272727] border border-[#2f2f2f] text-left transition-all duration-200 hover:border-[#444] group disabled:opacity-50"
                >
                  <p className="text-xs font-medium text-white group-hover:text-blue-400 transition-colors">{item.title}</p>
                  <p className="text-[11px] text-gray-400">{item.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Chat Conversation View */
          <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
            {currentSession.messages.map((msg: HomeChatMessage) => {
              const isUser = msg.role === 'user';
              const msgProviderKey = msg.providerUsed?.toLowerCase() || 'gemini';
              const msgModelConfig = modelConfigs[msgProviderKey] || modelConfigs.gemini;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-sm ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="shrink-0 mt-1">
                      <MyAILogo size="sm" />
                    </div>
                  )}

                  <div className={`space-y-2 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
                    {!isUser && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-white">Bogani AI</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border font-semibold text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
                          MyAI OS
                        </span>
                      </div>
                    )}

                    <div
                      className={`p-4 rounded-2xl leading-relaxed text-sm ${
                        isUser
                          ? "bg-[#2f2f2f] text-white rounded-tr-none border border-[#3e3e3e]"
                          : "bg-[#212121] text-[#ececec] rounded-tl-none border border-[#2d2d2d]"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#171717] prose-pre:border prose-pre:border-[#333] prose-pre:rounded-xl text-sm">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {!isUser && (
                      <div className="flex items-center gap-2 pt-1 text-gray-400 text-xs">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="p-1.5 hover:bg-[#212121] hover:text-white rounded-lg transition-colors flex items-center gap-1"
                        >
                          {copiedMessageId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleReadAloud(msg.id, msg.content)}
                          className={`p-1.5 hover:bg-[#212121] hover:text-white rounded-lg transition-colors ${
                            speakingMessageId === msg.id ? "text-blue-400 animate-pulse" : ""
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={onRegenerate}
                          className="p-1.5 hover:bg-[#212121] hover:text-white rounded-lg transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 text-sm justify-start animate-pulse">
                <MyAILogo size="sm" />
                <div className="p-4 rounded-2xl bg-[#212121] border border-[#2d2d2d] rounded-tl-none text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-xs">{lang === 'id' ? 'Bogani AI sedang memproses secara real-time...' : 'Bogani AI is generating real-time response...'}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Guest/User Quota Locked Banner (diisi dari respons 403 asli server) */}
      {isGuestLocked && (
        <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2 z-30">
          <div className="bg-[#241a1a] border border-rose-500/50 rounded-2xl p-4 text-center space-y-3 shadow-2xl backdrop-blur-md">
            <div className="inline-flex p-2.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-1">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white">
              {quotaBlock?.requiresAuth ? "Batas Pertanyaan Gratis Tercapai" : "Batas Pemakaian AI Harian Tercapai"}
            </h3>
            <p className="text-xs text-gray-300 max-w-md mx-auto">
              {quotaBlock?.message || "Batas pemakaian AI tercapai."}
            </p>
            {quotaBlock?.requiresAuth && (
              <button
                onClick={() => setShowLoginModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk / Login Sekarang</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Floating Input Bar when messages exist */}
      {hasMessages && !isGuestLocked && (
        <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2 bg-[#171717]/90 backdrop-blur-md z-20 shrink-0">
          <form
            onSubmit={handleSubmit}
            className="w-full bg-[#212121] border border-[#2f2f2f] focus-within:border-[#444] rounded-3xl p-2.5 shadow-2xl transition-all duration-200"
          >
            {attachedFile && (
              <div className="mb-2 p-2 bg-[#181924] border border-blue-500/40 rounded-2xl flex items-center justify-between gap-3 text-xs text-white">
                <div className="flex items-center gap-2 min-w-0">
                  {attachedFile.isImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={attachedFile.dataUrl} alt="Preview" className="w-9 h-9 object-cover rounded-lg border border-[#333]" />
                  ) : (
                    <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      <FileText className="w-4 h-4" />
                    </div>
                  )}
                  <div className="truncate text-left">
                    <p className="font-semibold text-xs text-white truncate">{attachedFile.name}</p>
                    <p className="text-[10px] text-gray-400">{attachedFile.size}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 hover:bg-[#2b2b2b] text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  className="p-2 hover:bg-[#2f2f2f] text-gray-400 hover:text-white rounded-full transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>

                {showPlusMenu && (
                  <div className="absolute bottom-12 left-0 z-50 bg-[#252525] border border-[#3d3d3d] rounded-2xl p-1.5 shadow-2xl flex items-center gap-1.5 animate-scale-up">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPlusMenu(false);
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-2 rounded-xl hover:bg-[#333] flex items-center gap-1.5 text-xs text-white transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">Gambar</span>
                    </button>

                    <div className="w-[1px] h-4 bg-[#3d3d3d]" />

                    <button
                      type="button"
                      onClick={() => {
                        setShowPlusMenu(false);
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-2 rounded-xl hover:bg-[#333] flex items-center gap-1.5 text-xs text-white transition-colors"
                    >
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span className="font-medium">Dokumen</span>
                    </button>
                  </div>
                )}
              </div>

              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={lang === 'id' ? "Tanyakan apa saja ke Abo..." : "Ask anything to Abo..."}
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none resize-none py-1.5 max-h-36 custom-scrollbar"
              />

              <button
                type="button"
                onClick={handleMicClick}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isListening
                    ? "bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30"
                    : "hover:bg-[#2f2f2f] text-gray-400 hover:text-white"
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                type="submit"
                disabled={(!inputText.trim() && !attachedFile) || isLoading}
                className={`p-2 rounded-full transition-all duration-200 ${
                  (inputText.trim() || attachedFile) && !isLoading
                    ? "bg-white text-black hover:bg-gray-200 shadow-md"
                    : "bg-[#2f2f2f] text-gray-600 cursor-not-allowed"
                }`}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </form>

          <p className="text-[11px] text-gray-500 text-center mt-2 font-sans">
            (Ginza Project) MongondowPedia Inc. All rights reserved.
          </p>
        </div>
      )}

      {!hasMessages && (
        <p className="text-[11px] text-gray-500 text-center pb-4 px-4 font-sans shrink-0">
          (Ginza Project) MongondowPedia Inc. All rights reserved.
        </p>
      )}

      {/* Login Modal Popup */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

      {/* Settings Modal Popup */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        lang={lang}
        onLangChange={() => {}}
        user={user}
      />

      {/* Feedback / Kuisioner Modal Popup */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        defaultEmail={user?.email || ""}
        defaultName={user?.name || ""}
      />
    </div>
  );
}
