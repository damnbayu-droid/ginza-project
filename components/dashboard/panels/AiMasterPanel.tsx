'use client';

import { useEffect, useState, useRef } from "react";
import { PanelHeader, Card, LoadingState, Badge, Button } from "@/components/dashboard/ui";
import { Bot, Send, Sparkles, Plus, Trash2, CheckCircle2, XCircle, Sliders, MessageSquare, RefreshCw, Zap, ShieldAlert, Edit2, Check, X, Brain, ShieldCheck, Users, ThumbsUp, AlertCircle } from "lucide-react";

interface AdminRule {
  id: string;
  instruction: string;
  category: "Gaya Bahasa" | "Pengetahuan Adat" | "Format Output" | "Batasan & Keamanan";
  isActive: boolean;
  createdAt: string;
}

interface AiMemoryItem {
  id: string;
  topic: string;
  category: "Bahasa & Sapaan Mongondow" | "Fakta Adat & Sejarah" | "Koreksi Pengguna" | "Aturan Komunikasi";
  content: string;
  source: string;
  sourceType: "admin" | "community";
  verificationsCount: number;
  status: "approved" | "pending_verification" | "rejected";
  isActive: boolean;
  createdAt: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  provider?: string;
}

const DEFAULT_ADMIN_RULES: AdminRule[] = [
  {
    id: "rule-1",
    instruction: "Selalu gunakan sapaan hangat adat Mongondow (seperti 'Namu-namu' atau 'Ndok') saat menyapa pengguna.",
    category: "Gaya Bahasa",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rule-2",
    instruction: "Prioritaskan referensi adat dan kosa kata Kamus MongondowPedia daripada asumsi umum.",
    category: "Pengetahuan Adat",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "rule-3",
    instruction: "Jawab secara lugas dan terstruktur dengan bahasa Indonesia yang santun.",
    category: "Format Output",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_AI_MEMORIES: AiMemoryItem[] = [
  {
    id: "mem-1",
    topic: "Arti & Penggunaan Kata 'Tabe''",
    category: "Bahasa & Sapaan Mongondow",
    content: "Kata 'Tabe'' artinya Permisi atau Maaf dalam konteks formal. Gunakan hanya saat meminta permisi atau di awal obrolan formal, dan JANGAN pernah diulang-ulang di setiap awal balasan.",
    source: "Koreksi Langsung Founder / Admin Dashboard",
    sourceType: "admin",
    verificationsCount: 2,
    status: "approved",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mem-2",
    topic: "Arti & Penggunaan Kata 'Dega Niondon' / 'Niondon'",
    category: "Bahasa & Sapaan Mongondow",
    content: "Kata 'Dega Niondon' (singkatan: 'Niondon') artinya 'Selamat Datang' (Welcome). Merupakan kata sambutan awal perjumpaan, BUKAN kata yang diulang-ulang di tengah balasan obrolan.",
    source: "Koreksi Langsung Founder / Admin Dashboard",
    sourceType: "admin",
    verificationsCount: 2,
    status: "approved",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mem-3",
    topic: "Reasoning & Pemahaman Konteks Berkelanjutan",
    category: "Aturan Komunikasi",
    content: "Ingat seluruh poin yang sudah disampaikan pengguna sebelumnya dalam satu sesi percakapan. Jangan mengulang kesalahan yang sudah dikoreksi oleh pengguna.",
    source: "Standard Reasoning Bogani AI",
    sourceType: "admin",
    verificationsCount: 2,
    status: "approved",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mem-4",
    topic: "Asal-Usul Rumpun Bahasa Mongondow (Austronesia Kuno)",
    category: "Fakta Adat & Sejarah",
    content: "Bahasa Mongondow di Kotabunan, Boltim, Kotamobagu, Bolsel, Bolmut, dan Bolmong adalah bagian langsung dari Rumpun Bahasa Austronesia Kuno (berkerabat dengan Filipina Selatan dan Bugis), BUKAN bangsa Melayu atau turunan bahasa Melayu.",
    source: "Sejarah Linguistik & Founder MongondowPedia",
    sourceType: "admin",
    verificationsCount: 2,
    status: "approved",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mem-5",
    topic: "Kosa Kata 'Lantaka' (Meriam Bambu Tradisional)",
    category: "Fakta Adat & Sejarah",
    content: "Lantaka adalah sebutan khas meriam bambu tradisional yang dibunyikan pada perayaan adat pesta rakyat di Totabuan.",
    source: "Pengguna Homepage (Abo' Chat)",
    sourceType: "community",
    verificationsCount: 1,
    status: "pending_verification",
    isActive: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "mem-6",
    topic: "Ungkapan 'Monompagal' (Melindungi & Menjaga)",
    category: "Bahasa & Sapaan Mongondow",
    content: "Kata 'Monompagal' berarti menjaga, mengayomi, atau melindungi masyarakat dengan kesungguhan dan keberanian hati.",
    source: "Kontribusi Komunitas Verifikator",
    sourceType: "community",
    verificationsCount: 2,
    status: "approved",
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export default function AiMasterPanel() {
  const [activeTab, setActiveTab] = useState<"playground" | "memory">("playground");
  const [memorySubTab, setMemorySubTab] = useState<"admin" | "community">("admin");
  const [health, setHealth] = useState<any>(null);

  // Playground Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Namu-namu! Saya Bogani AI. Saya sekarang sudah dilengkapi dengan Memori Jangka Panjang & Aturan Reasoning terpusat. Ada yang bisa saya bantu hari ini?",
      provider: "Auto (Gateway)",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Admin Rules State (Restricted to Admin Only)
  const [rules, setRules] = useState<AdminRule[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bogani_ai_admin_rules");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_ADMIN_RULES;
  });

  // Long-Term Memory State
  const [memories, setMemories] = useState<AiMemoryItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bogani_ai_longterm_memories");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_AI_MEMORIES;
  });

  // Rule Form State
  const [newInstruction, setNewInstruction] = useState("");
  const [newCategory, setNewCategory] = useState<AdminRule["category"]>("Gaya Bahasa");

  // Inline Rule Edit State
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editInstructionText, setEditInstructionText] = useState("");
  const [editCategory, setEditCategory] = useState<AdminRule["category"]>("Gaya Bahasa");

  // Memory Form & Edit State
  const [newMemTopic, setNewMemTopic] = useState("");
  const [newMemCategory, setNewMemCategory] = useState<AiMemoryItem["category"]>("Bahasa & Sapaan Mongondow");
  const [newMemContent, setNewMemContent] = useState("");
  const [editingMemId, setEditingMemId] = useState<string | null>(null);
  const [editMemTopic, setEditMemTopic] = useState("");
  const [editMemContent, setEditMemContent] = useState("");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bogani_ai_admin_rules", JSON.stringify(rules));
    }
  }, [rules]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bogani_ai_longterm_memories", JSON.stringify(memories));
    }
  }, [memories]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isSending) return;

    const userText = inputPrompt.trim();
    setInputPrompt("");

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setIsSending(true);

    // Combine Active Rules & APPROVED Long-Term Memories Only
    const activeRulesText = rules
      .filter((r) => r.isActive)
      .map((r, idx) => `${idx + 1}. [${r.category}] ${r.instruction}`)
      .join("\n");

    const approvedMemoriesText = memories
      .filter((m) => m.isActive && m.status === "approved")
      .map((m, idx) => `- [${m.topic}] (${m.category}): ${m.content}`)
      .join("\n");

    const promptWithMemoryAndRules = `--- MEMORI TERIVERIFIKASI BOGANI AI ---\n${approvedMemoriesText || "Belum ada memori khusus."}\n\n--- ATURAN INSTRUKSI ADMIN ---\n${activeRulesText || "Tidak ada aturan khusus."}\n\n[PERTANYAAN PENGGUNA]:\n${userText}`;

    try {
      const res = await fetch("/api/homepage/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          prompt: promptWithMemoryAndRules,
          stream: false,
          history: newMessages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const contentType = res.headers.get("content-type") || "";
      let replyText = "";
      let providerUsed = res.headers.get("x-provider-used") || "Auto Gateway";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        replyText = data.text;
        if (data.provider_used) providerUsed = data.provider_used;
      } else {
        replyText = await res.text();
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: replyText || "Terima kasih atas pertanyaannya.",
          provider: providerUsed,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error koneksi: ${err.message}`,
          provider: "Error",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  // Rule Handlers (Admin Only)
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstruction.trim()) return;

    const newRuleObj: AdminRule = {
      id: `rule-${Date.now()}`,
      instruction: newInstruction.trim(),
      category: newCategory,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setRules([newRuleObj, ...rules]);
    setNewInstruction("");
  };

  const handleStartEditRule = (rule: AdminRule) => {
    setEditingRuleId(rule.id);
    setEditInstructionText(rule.instruction);
    setEditCategory(rule.category);
  };

  const handleSaveEditRule = (id: string) => {
    if (!editInstructionText.trim()) return;
    setRules(
      rules.map((r) =>
        r.id === id
          ? { ...r, instruction: editInstructionText.trim(), category: editCategory }
          : r
      )
    );
    setEditingRuleId(null);
  };

  const handleToggleRule = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
  };

  const handleDeleteRule = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus instruksi ini?")) {
      setRules(rules.filter((r) => r.id !== id));
    }
  };

  // Memory Handlers & Quorum Verification
  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemTopic.trim() || !newMemContent.trim()) return;

    const newMemObj: AiMemoryItem = {
      id: `mem-${Date.now()}`,
      topic: newMemTopic.trim(),
      category: newMemCategory,
      content: newMemContent.trim(),
      source: memorySubTab === "admin" ? "Di-input Langsung oleh Admin" : "Peluang Pengetahuan Komunitas",
      sourceType: memorySubTab,
      verificationsCount: memorySubTab === "admin" ? 2 : 0,
      status: memorySubTab === "admin" ? "approved" : "pending_verification",
      isActive: memorySubTab === "admin",
      createdAt: new Date().toISOString(),
    };

    setMemories([newMemObj, ...memories]);
    setNewMemTopic("");
    setNewMemContent("");
  };

  // Quorum Verification Action (+1 Verification by Verificator)
  const handleVerifyMemoryCandidate = (id: string) => {
    setMemories(
      memories.map((m) => {
        if (m.id !== id) return m;
        const newCount = m.verificationsCount + 1;
        const isApproved = newCount >= 2;
        return {
          ...m,
          verificationsCount: newCount,
          status: isApproved ? "approved" : "pending_verification",
          isActive: isApproved,
        };
      })
    );
  };

  // Admin Direct Override Approval
  const handleAdminApproveMemory = (id: string) => {
    setMemories(
      memories.map((m) =>
        m.id === id
          ? { ...m, verificationsCount: Math.max(m.verificationsCount, 2), status: "approved", isActive: true }
          : m
      )
    );
  };

  const handleStartEditMemory = (m: AiMemoryItem) => {
    setEditingMemId(m.id);
    setEditMemTopic(m.topic);
    setEditMemContent(m.content);
  };

  const handleSaveEditMemory = (id: string) => {
    if (!editMemTopic.trim() || !editMemContent.trim()) return;
    setMemories(
      memories.map((m) =>
        m.id === id ? { ...m, topic: editMemTopic.trim(), content: editMemContent.trim() } : m
      )
    );
    setEditingMemId(null);
  };

  const handleToggleMemory = (id: string) => {
    setMemories(memories.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m)));
  };

  const handleDeleteMemory = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus memori ini?")) {
      setMemories(memories.filter((m) => m.id !== id));
    }
  };

  // Filtered Memories by Sub-Tab
  const adminMemories = memories.filter((m) => m.sourceType === "admin");
  const communityMemories = memories.filter((m) => m.sourceType === "community");

  return (
    <div className="space-y-6">
      <PanelHeader
        title="AI Master Studio &amp; Memori Terverifikasi Bogani AI"
        subtitle="Kelola memori jangka panjang AI terpisah (Admin vs Komunitas Quorum 2-Verifikasi) dan aturan nalar (rules)."
      />

      {/* Main Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-bento-border pb-2">
        <button
          onClick={() => setActiveTab("playground")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "playground"
              ? "bg-bento-accent text-white shadow-md"
              : "bg-bento-surface text-bento-text-secondary hover:text-bento-text-primary border border-bento-border"
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Playground Chat &amp; Rules Admin</span>
        </button>

        <button
          onClick={() => setActiveTab("memory")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "memory"
              ? "bg-bento-accent text-white shadow-md"
              : "bg-bento-surface text-bento-text-secondary hover:text-bento-text-primary border border-bento-border"
          }`}
        >
          <Brain className="w-4 h-4 text-purple-300" />
          <span>Memori AI ({memories.filter((m) => m.isActive && m.status === "approved").length} Approved &amp; Aktif)</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: PLAYGROUND CHAT & RULES MANAGER */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "playground" && (
        <div className="space-y-6">
          {/* PLAYGROUND INTERAKTIF BOGANI AI */}
          <Card className="!p-0 border border-bento-border overflow-hidden shadow-md">
            <div className="px-5 py-3.5 border-b border-bento-border bg-bento-surface-lighter flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-bento-accent/20 border border-bento-accent/30 flex items-center justify-center text-bento-accent">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-bento-text-primary flex items-center gap-2">
                    <span>Playground Interaktif Bogani AI</span>
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                      <Zap className="w-3 h-3 fill-emerald-400" />
                      Live Real-Time
                    </span>
                  </h3>
                  <p className="text-[11px] text-bento-text-secondary">
                    Uji coba balasan Bogani AI langsung dari dalam Admin Panel.
                  </p>
                </div>
              </div>

              <Button
                onClick={() =>
                  setMessages([
                    {
                      role: "assistant",
                      content: "Percakapan dibersihkan. Silakan uji coba memori & instruksi baru Anda.",
                      provider: "System",
                    },
                  ])
                }
                variant="default"
                className="!py-1 !px-2.5 text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Obrolan</span>
              </Button>
            </div>

            {/* Chat Messages Box */}
            <div ref={chatScrollRef} className="p-5 h-80 overflow-y-auto space-y-4 bg-bento-bg/50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                      m.role === "user"
                        ? "bg-bento-accent text-white rounded-br-none"
                        : "bg-bento-surface border border-bento-border text-bento-text-primary rounded-bl-none"
                    }`}
                  >
                    {m.content}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-bento-text-secondary font-mono">
                    <span>{m.role === "user" ? "Admin" : "Bogani AI"}</span>
                    {m.provider && (
                      <span className="bg-bento-surface-lighter px-1.5 py-0.5 rounded border border-bento-border text-bento-accent font-semibold uppercase">
                        [{m.provider}]
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-xs text-bento-text-secondary animate-pulse">
                  <Bot className="w-4 h-4 text-bento-accent animate-spin" />
                  <span>Bogani AI sedang berpikir dengan Reasoning...</span>
                </div>
              )}
            </div>

            {/* Input Bar & Prompt Shortcuts */}
            <div className="p-4 border-t border-bento-border bg-bento-surface space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-bento-text-secondary font-medium">Uji Cepat:</span>
                {[
                  "apa arti kata tabe?",
                  "apa arti kata dega niondon?",
                  "Jelaskan silsilah Kerajaan Bolaang Mongondow",
                ].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setInputPrompt(p);
                    }}
                    className="text-[11px] bg-bento-surface-lighter hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary px-2.5 py-1 rounded-lg border border-bento-border transition-colors truncate max-w-[240px]"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Tulis pesan atau pertanyaan uji coba ke Bogani AI..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent transition-colors"
                />
                <Button type="submit" variant="primary" disabled={isSending} className="flex items-center gap-1.5 px-4 shadow-sm">
                  <Send className="w-4 h-4" />
                  <span>Kirim</span>
                </Button>
              </form>
            </div>
          </Card>

          {/* STATUS SYSTEM GATEWAY & IDENTITAS */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="shadow-2xs">
              <p className="text-sm font-bold text-bento-text-primary mb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-bento-accent" />
                <span>Status System Gateway</span>
              </p>
              {!health ? (
                <LoadingState label="Memeriksa status AI..." />
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-bento-border/50">
                    <span className="text-bento-text-secondary">Database Supabase</span>
                    <Badge tone={health.supabase?.ready ? "success" : "danger"}>
                      {health.supabase?.ready ? "Terhubung (Ready)" : "Terputus"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-bento-border/50">
                    <span className="text-bento-text-secondary">MyAI OS AI Gateway</span>
                    <Badge tone={health.myai_os_gateway?.ready ? "success" : "danger"}>
                      {health.myai_os_gateway?.ready ? "Online (Terpusat)" : "Offline"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-bento-text-secondary">Model Primary Aktif</span>
                    <span className="font-semibold text-bento-accent uppercase">
                      {health.myai_os_gateway?.provider || "Multi-AI Fallback"}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            <Card className="shadow-2xs">
              <p className="text-sm font-bold text-bento-text-primary mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Identitas &amp; Hak Akses Rules</span>
              </p>
              <div className="space-y-1.5 text-xs text-bento-text-secondary">
                <p>
                  Nama AI: <strong className="text-bento-text-primary">{health?.ai_name ?? "Bogani AI"}</strong>
                </p>
                <p>
                  Aturan Menjawab Admin: <strong className="text-bento-accent">{rules.filter((r) => r.isActive).length} Rule Aktif (Khusus Admin)</strong>
                </p>
                <p>
                  Hak Akses Rules: <strong className="text-emerald-400">Restricted (Hanya Admin yang bisa merubah/menambah)</strong>
                </p>
              </div>
            </Card>
          </div>

          {/* RULES MANAGER (ADMIN ONLY) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-bento-border pb-3">
              <div>
                <h3 className="text-base font-bold text-bento-text-primary flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-bento-accent" />
                  <span>Instruksi &amp; Aturan Menjawab Admin (Rules Manager)</span>
                </h3>
                <p className="text-xs text-bento-text-secondary mt-0.5">
                  Daftar perintah khusus yang mengarahkan cara Bogani AI merespons pengguna (Khusus dikelola oleh Admin).
                </p>
              </div>
            </div>

            {/* Form Tambah Rule Baru */}
            <Card className="!p-4 bg-bento-surface border border-bento-border shadow-xs">
              <form onSubmit={handleAddRule} className="space-y-3">
                <p className="text-xs font-bold text-bento-text-primary flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-bento-accent" />
                  <span>Tambah Instruksi / Rule Baru (Admin Only)</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-3">
                    <input
                      required
                      value={newInstruction}
                      onChange={(e) => setNewInstruction(e.target.value)}
                      placeholder="Contoh: Selalu batasi jawaban maksimal 3 paragraf dan gunakan kata 'Namu-namu'..."
                      className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                    />
                  </div>

                  <div>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent font-medium"
                    >
                      <option value="Gaya Bahasa">Gaya Bahasa</option>
                      <option value="Pengetahuan Adat">Pengetahuan Adat</option>
                      <option value="Format Output">Format Output</option>
                      <option value="Batasan & Keamanan">Batasan &amp; Keamanan</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" variant="primary" className="!py-1.5 text-xs flex items-center gap-1 shadow-sm">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Simpan Instruksi Rule</span>
                  </Button>
                </div>
              </form>
            </Card>

            {/* List of Active Admin Rules */}
            <div className="space-y-3">
              {rules.map((rule) => (
                <Card
                  key={rule.id}
                  className={`!p-4 border transition-all ${
                    rule.isActive
                      ? "border-bento-border bg-bento-surface shadow-2xs"
                      : "border-bento-border/50 bg-bento-surface-lighter/40 opacity-60"
                  }`}
                >
                  {editingRuleId === rule.id ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-bento-accent flex items-center gap-1">
                          <Edit2 className="w-3.5 h-3.5" /> Edit Instruksi Rule
                        </span>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => handleSaveEditRule(rule.id)} variant="primary" className="!py-1 !px-2.5 text-xs flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Simpan</span>
                          </Button>
                          <Button onClick={() => setEditingRuleId(null)} variant="default" className="!py-1 !px-2.5 text-xs flex items-center gap-1">
                            <X className="w-3.5 h-3.5" />
                            <span>Batal</span>
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-3">
                          <input
                            required
                            value={editInstructionText}
                            onChange={(e) => setEditInstructionText(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl border border-bento-accent bg-bento-bg text-sm font-medium outline-none"
                          />
                        </div>
                        <div>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value as any)}
                            className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none font-medium"
                          >
                            <option value="Gaya Bahasa">Gaya Bahasa</option>
                            <option value="Pengetahuan Adat">Pengetahuan Adat</option>
                            <option value="Format Output">Format Output</option>
                            <option value="Batasan & Keamanan">Batasan &amp; Keamanan</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-bento-surface-lighter px-2.5 py-0.5 rounded border border-bento-border text-bento-accent">
                            {rule.category}
                          </span>
                          <Badge tone={rule.isActive ? "success" : "default"}>
                            {rule.isActive ? "Aktif Diinjeksikan" : "Nonaktif"}
                          </Badge>
                        </div>

                        <p className="text-sm font-medium text-bento-text-primary leading-relaxed pt-1">
                          &quot;{rule.instruction}&quot;
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleStartEditRule(rule)} className="p-1.5 rounded-lg border border-bento-border text-bento-text-secondary hover:text-bento-accent hover:bg-bento-surface-lighter transition-colors" title="Edit instruksi rule ini">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleToggleRule(rule.id)} className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${rule.isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20" : "bg-bento-surface-lighter text-bento-text-secondary border-bento-border hover:text-bento-text-primary"}`}>
                          {rule.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          <span>{rule.isActive ? "Aktif" : "Nonaktif"}</span>
                        </button>
                        <button onClick={() => handleDeleteRule(rule.id)} className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors" title="Hapus instruksi ini">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: MEMORI JANGKA PANJANG AI (ADMIN VS COMMUNITY QUORUM) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "memory" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-bento-border pb-3 gap-3">
            <div>
              <h3 className="text-base font-bold text-bento-text-primary flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>Pusat Memori Teriverifikasi Bogani AI (Long-Term Storage)</span>
              </h3>
              <p className="text-xs text-bento-text-secondary mt-0.5">
                Memori dipisahkan antara Input Resmi Admin dan Peluang Pengetahuan Komunitas (Membutuhkan Min. 2 Verifikator).
              </p>
            </div>

            {/* Sub-Nav Memory Source Type */}
            <div className="flex items-center gap-1 bg-bento-surface p-1 rounded-xl border border-bento-border">
              <button
                onClick={() => setMemorySubTab("admin")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  memorySubTab === "admin"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-bento-text-secondary hover:text-bento-text-primary"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Memori Admin ({adminMemories.length})</span>
              </button>

              <button
                onClick={() => setMemorySubTab("community")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  memorySubTab === "community"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-bento-text-secondary hover:text-bento-text-primary"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Memori Komunitas / Chat ({communityMemories.length})</span>
              </button>
            </div>
          </div>

          {/* Form Tambah Memori Baru */}
          <Card className="!p-5 bg-bento-surface border border-bento-border shadow-md">
            <form onSubmit={handleAddMemory} className="space-y-4">
              <p className="text-xs font-bold text-bento-text-primary flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-purple-400" />
                <span>+ Tambah Memori / Koreksi Pengetahuan Baru ({memorySubTab === "admin" ? "Memori Resmi Admin" : "Peluang Pengetahuan Komunitas"})</span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                    Topik / Subjek Memori *
                  </label>
                  <input
                    required
                    value={newMemTopic}
                    onChange={(e) => setNewMemTopic(e.target.value)}
                    placeholder="Contoh: Perbedaan Kata Tabe' dan Dega Niondon..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                    Kategori Memori
                  </label>
                  <select
                    value={newMemCategory}
                    onChange={(e) => setNewMemCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent font-medium"
                  >
                    <option value="Bahasa & Sapaan Mongondow">Bahasa &amp; Sapaan Mongondow</option>
                    <option value="Fakta Adat & Sejarah">Fakta Adat &amp; Sejarah</option>
                    <option value="Koreksi Pengguna">Koreksi Pengguna</option>
                    <option value="Aturan Komunikasi">Aturan Komunikasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                  Isi Memori / Fakta Yang Dipelajari AI *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newMemContent}
                  onChange={(e) => setNewMemContent(e.target.value)}
                  placeholder="Jelaskan fakta atau koreksi bahasa secara lengkap agar Bogani AI memahaminya dalam jangka panjang..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-bento-border bg-bento-bg text-sm leading-relaxed outline-none focus:border-bento-accent"
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" variant="primary" className="!py-2 text-xs flex items-center gap-1.5 shadow-sm bg-purple-600 hover:bg-purple-700">
                  <Brain className="w-4 h-4" />
                  <span>Simpan ke Memori Jangka Panjang AI</span>
                </Button>
              </div>
            </form>
          </Card>

          {/* List of Memories (Filtered by Sub-Tab: Admin vs Community) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-bento-text-secondary">
              <span>
                Menampilkan {memorySubTab === "admin" ? adminMemories.length : communityMemories.length} item memori ({memorySubTab === "admin" ? "Resmi Admin" : "Komunitas / Chat"})
              </span>
              {memorySubTab === "community" && (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Diaktifkan ke AI setelah Minimal 2 Verifikator atau Persetujuan Admin
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {(memorySubTab === "admin" ? adminMemories : communityMemories).map((mem) => (
                <Card
                  key={mem.id}
                  className={`!p-5 border transition-all ${
                    mem.isActive && mem.status === "approved"
                      ? "border-purple-500/30 bg-bento-surface shadow-sm"
                      : "border-amber-500/30 bg-amber-500/5 shadow-2xs"
                  }`}
                >
                  {editingMemId === mem.id ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-400 flex items-center gap-1">
                          <Edit2 className="w-3.5 h-3.5" /> Edit Memori Jangka Panjang
                        </span>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => handleSaveEditMemory(mem.id)} variant="primary" className="!py-1 !px-2.5 text-xs flex items-center gap-1 bg-purple-600">
                            <Check className="w-3.5 h-3.5" />
                            <span>Simpan</span>
                          </Button>
                          <Button onClick={() => setEditingMemId(null)} variant="default" className="!py-1 !px-2.5 text-xs">
                            Batal
                          </Button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Topik Memori</label>
                        <input
                          value={editMemTopic}
                          onChange={(e) => setEditMemTopic(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm font-semibold outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Isi Memori</label>
                        <textarea
                          rows={3}
                          value={editMemContent}
                          onChange={(e) => setEditMemContent(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none leading-relaxed"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4 border-b border-bento-border/50 pb-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 px-2.5 py-0.5 rounded border border-purple-500/20">
                              {mem.category}
                            </span>
                            
                            <Badge tone={mem.status === "approved" ? "success" : "warning"}>
                              {mem.status === "approved" ? "Verified & Aktif di AI" : `Pending Verification (${mem.verificationsCount}/2)`}
                            </Badge>

                            <span className="text-[10px] font-mono bg-bento-surface-lighter text-bento-text-secondary px-2 py-0.5 rounded border border-bento-border">
                              {mem.sourceType === "admin" ? "🛡️ Input Admin" : `👥 Users/Chat (${mem.verificationsCount}/2 Verifikasi)`}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-bento-text-primary">{mem.topic}</h4>
                        </div>

                        {/* Action Buttons for Memory Verification & Admin Controls */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {/* Community Quorum Action Button: +1 Verification */}
                          {mem.sourceType === "community" && mem.status !== "approved" && (
                            <button
                              onClick={() => handleVerifyMemoryCandidate(mem.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                              title="Tambah 1 verifikasi dari verifikator adat"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>+1 Verifikasi ({mem.verificationsCount}/2)</span>
                            </button>
                          )}

                          {/* Admin Override Direct Approval */}
                          {mem.status !== "approved" && (
                            <button
                              onClick={() => handleAdminApproveMemory(mem.id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-all flex items-center gap-1 shadow-xs"
                              title="Setujui langsung oleh Admin"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Approve (Admin)</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleStartEditMemory(mem)}
                            className="p-1.5 rounded-lg border border-bento-border text-bento-text-secondary hover:text-purple-400 hover:bg-bento-surface-lighter transition-colors"
                            title="Edit memori ini"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleMemory(mem.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                              mem.isActive
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-bento-surface-lighter text-bento-text-secondary border-bento-border hover:text-bento-text-primary"
                            }`}
                            title={mem.isActive ? "Nonaktifkan memori ini" : "Aktifkan memori ini"}
                          >
                            {mem.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span>{mem.isActive ? "Aktif" : "Nonaktif"}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteMemory(mem.id)}
                            className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Hapus memori ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-bento-text-primary leading-relaxed bg-bento-surface-lighter/50 p-3 rounded-xl border border-bento-border/60">
                        {mem.content}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-bento-text-secondary font-mono pt-1">
                        <span>Sumber: {mem.source}</span>
                        <span>Ditambahkan: {new Date(mem.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
