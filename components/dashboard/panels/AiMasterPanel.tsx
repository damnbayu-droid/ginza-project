'use client';

import { useEffect, useState, useRef } from "react";
import { PanelHeader, Card, LoadingState, Badge, Button } from "@/components/dashboard/ui";
import { Bot, Send, Sparkles, Plus, Trash2, CheckCircle2, XCircle, Sliders, MessageSquare, RefreshCw, Zap, ShieldAlert, Edit2, Check, X } from "lucide-react";

interface AdminRule {
  id: string;
  instruction: string;
  category: "Gaya Bahasa" | "Pengetahuan Adat" | "Format Output" | "Batasan & Keamanan";
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

export default function AiMasterPanel() {
  const [health, setHealth] = useState<any>(null);

  // Playground Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Namu-namu! Saya Bogani AI. Silakan uji coba gaya bahasa dan aturan instruksi saya langsung dari Admin Panel ini.",
      provider: "Auto (Gateway)",
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Admin Rules State
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

  // Rule Form State
  const [newInstruction, setNewInstruction] = useState("");
  const [newCategory, setNewCategory] = useState<AdminRule["category"]>("Gaya Bahasa");

  // Inline Rule Edit State
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editInstructionText, setEditInstructionText] = useState("");
  const [editCategory, setEditCategory] = useState<AdminRule["category"]>("Gaya Bahasa");

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  // Save rules to localStorage whenever updated
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bogani_ai_admin_rules", JSON.stringify(rules));
    }
  }, [rules]);

  // Auto-scroll playground chat to bottom
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

    // Combine active admin rules into prompt context
    const activeRulesText = rules
      .filter((r) => r.isActive)
      .map((r, idx) => `${idx + 1}. [${r.category}] ${r.instruction}`)
      .join("\n");

    const promptWithRules = activeRulesText
      ? `[ATURAN KHUSUS ADMIN MASTER BOGANI AI]:\n${activeRulesText}\n\n[PERTANYAAN PENGGUNA]:\n${userText}`
      : userText;

    try {
      const res = await fetch("/api/homepage/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          prompt: promptWithRules,
          stream: false,
          history: newMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
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

  const handleCancelEditRule = () => {
    setEditingRuleId(null);
  };

  const handleToggleRule = (id: string) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleDeleteRule = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus instruksi ini?")) {
      setRules(rules.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <PanelHeader
        title="AI Master Studio (Bogani AI Control Center)"
        subtitle="Uji coba percakapan langsung dengan Bogani AI dan kelola Aturan/Instruksi (Rules) respon AI terpusat."
      />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 1. PLAYGROUND INTERAKTIF BOGANI AI (LIVE CHAT FOR ADMIN) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
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
                  content: "Percakapan dibersihkan. Silakan uji coba instruksi baru Anda.",
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
                  <span className="bg-bento-surface-lighter px-1.5 py-0.5 rounded border border-bento-border text-bento-accent font-semibold">
                    [{m.provider}]
                  </span>
                )}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex items-center gap-2 text-xs text-bento-text-secondary animate-pulse">
              <Bot className="w-4 h-4 text-bento-accent animate-spin" />
              <span>Bogani AI sedang berpikir &amp; menyusun jawaban...</span>
            </div>
          )}
        </div>

        {/* Input Bar & Prompt Tester Shortcuts */}
        <div className="p-4 border-t border-bento-border bg-bento-surface space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-bento-text-secondary font-medium">Uji Cepat:</span>
            {[
              "Jelaskan asal usul Bolaang Mongondow",
              "Apa arti kata niondon dalam adat?",
              "Bagaimana tata cara menyapa tokoh adat?",
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

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 2. STATUS SYSTEM & PROVIDER GATEWAY */}
      {/* ════════════════════════════════════════════════════════════════════ */}
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
                  {health.myai_os_gateway?.provider || "Multi-AI Fallback (GPT/Claude/DeepSeek)"}
                </span>
              </div>
            </div>
          )}
        </Card>

        <Card className="shadow-2xs">
          <p className="text-sm font-bold text-bento-text-primary mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Identitas &amp; Sumber Pengetahuan</span>
          </p>
          <div className="space-y-1.5 text-xs text-bento-text-secondary">
            <p>
              Nama AI: <strong className="text-bento-text-primary">{health?.ai_name ?? "Bogani AI"}</strong>
            </p>
            <p>
              Website: <strong className="text-bento-text-primary">{health?.website ?? "MongondowPedia"}</strong>
            </p>
            <p>
              Aturan Instruksi Menjawab: <strong className="text-bento-accent">{rules.filter((r) => r.isActive).length} Rule Aktif</strong>
            </p>
            <p className="pt-1 text-[11px] leading-relaxed">
              Semua aturan instruksi admin di bawah ini otomatis diinjeksikan ke System Prompt Bogani AI pada setiap interaksi pengguna.
            </p>
          </div>
        </Card>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 3. ATURAN & INSTRUKSI CARA MENJAWAB ADMIN (RULES MANAGER) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-bento-border pb-3">
          <div>
            <h3 className="text-base font-bold text-bento-text-primary flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-bento-accent" />
              <span>Instruksi &amp; Aturan Menjawab Admin (Rules Manager)</span>
            </h3>
            <p className="text-xs text-bento-text-secondary mt-0.5">
              Daftar perintah khusus yang mengarahkan cara Bogani AI merespons pengguna.
            </p>
          </div>
        </div>

        {/* Form Tambah Rule Baru */}
        <Card className="!p-4 bg-bento-surface border border-bento-border shadow-xs">
          <form onSubmit={handleAddRule} className="space-y-3">
            <p className="text-xs font-bold text-bento-text-primary flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-bento-accent" />
              <span>Tambah Instruksi / Rule Baru</span>
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
          {rules.length === 0 ? (
            <Card className="text-center py-8">
              <ShieldAlert className="w-8 h-8 text-bento-text-secondary mx-auto opacity-40 mb-2" />
              <p className="text-xs text-bento-text-secondary">
                Belum ada instruksi khusus yang ditambahkan. Tambahkan instruksi baru di atas.
              </p>
            </Card>
          ) : (
            rules.map((rule) => (
              <Card
                key={rule.id}
                className={`!p-4 border transition-all ${
                  rule.isActive
                    ? "border-bento-border bg-bento-surface shadow-2xs"
                    : "border-bento-border/50 bg-bento-surface-lighter/40 opacity-60"
                }`}
              >
                {editingRuleId === rule.id ? (
                  /* INLINE RULE EDITOR FORM */
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-bento-accent flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" /> Edit Instruksi Rule
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleSaveEditRule(rule.id)}
                          variant="primary"
                          className="!py-1 !px-2.5 text-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Simpan</span>
                        </Button>
                        <Button
                          onClick={handleCancelEditRule}
                          variant="default"
                          className="!py-1 !px-2.5 text-xs flex items-center gap-1"
                        >
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
                  /* NORMAL RULE CARD DISPLAY */
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
                      <button
                        onClick={() => handleStartEditRule(rule)}
                        className="p-1.5 rounded-lg border border-bento-border text-bento-text-secondary hover:text-bento-accent hover:bg-bento-surface-lighter transition-colors"
                        title="Edit instruksi rule ini"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                          rule.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-bento-surface-lighter text-bento-text-secondary border-bento-border hover:text-bento-text-primary"
                        }`}
                        title={rule.isActive ? "Klik untuk menonaktifkan" : "Klik untuk mengaktifkan"}
                      >
                        {rule.isActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Hapus instruksi ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
