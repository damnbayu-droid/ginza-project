'use client';

import { useState, useEffect } from "react";
import { Language, HomeChatSession, HomeChatMessage, ChatFolder } from "@/lib/types";
import ChatSidebar from "./ChatSidebar";
import MyAIChat from "./MyAIChat";
import VoiceModeOverlay from "./VoiceModeOverlay";

/**
 * ID sesi lokal yang belum pernah dibalas Supabase selalu diawali "session_"
 * (lihat createNewChat) -- UUID asli dari Postgres tidak pernah berbentuk
 * begitu, jadi ini heuristik aman & murah utk tahu "sudah tersimpan di
 * server atau belum" tanpa perlu field boolean terpisah di tiap tempat.
 */
function isPersistedId(id: string): boolean {
  return !id.startsWith("session_");
}

export default function HomeApp() {
  const [lang, setLang] = useState<Language>('id');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false);

  const [chatSessions, setChatSessions] = useState<HomeChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [folders, setFolders] = useState<ChatFolder[]>([]);

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [guestQuestionCount, setGuestQuestionCount] = useState<number>(0);
  // Sumber kebenaran BENAR utk batas pemakaian AI adalah server (lihat
  // lib/ai-usage-quota.ts) -- guestQuestionCount di atas cuma indikator
  // tampilan lokal (localStorage), gampang "disiasati" & tidak tahu kalau
  // jatah sudah kepakai lewat fitur lain (mis. AI-define Kamus, sebab
  // pool-nya SAMA). quotaBlock diisi hanya dari respons 403 asli server, dan
  // dibersihkan lagi begitu ada respons sukses (lihat handleSendMessage) --
  // SENGAJA tidak dipakai sbg short-circuit utk skip fetch berikutnya (bug
  // lama: sekali ke-set, macet selamanya di tab itu meski kuota sudah reset
  // 24 jam di server -- Voice Mode jadi kelihatan "cuma jawab 1x lalu diam").
  const [quotaBlock, setQuotaBlock] = useState<{ message: string; requiresAuth: boolean } | null>(null);

  useEffect(() => {
    // Fetch auth status
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(async (data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          // User login: riwayat obrolan yg BENAR sumbernya Supabase (lintas
          // perangkat), bukan localStorage browser ini saja -- lihat
          // app/api/public/conversations & lib/ginza-db.ts.
          await loadServerSessions();
        } else {
          setUser(null);
          loadLocalSessions();
        }
      })
      .catch(() => {
        setUser(null);
        loadLocalSessions();
      });

    const savedLang = localStorage.getItem("myai_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }

    const savedGuestCount = localStorage.getItem("myai_guest_count");
    if (savedGuestCount) {
      setGuestQuestionCount(parseInt(savedGuestCount, 10) || 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadLocalSessions() {
    try {
      const savedSessions = localStorage.getItem("myai_chat_sessions");
      if (savedSessions) {
        const parsed: HomeChatSession[] = JSON.parse(savedSessions);
        setChatSessions(parsed);
        if (parsed.length > 0) {
          setActiveSessionId(parsed[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to parse saved chat sessions", e);
    }
  }

  async function loadServerSessions() {
    try {
      const [convRes, folderRes] = await Promise.all([
        fetch("/api/public/conversations"),
        fetch("/api/public/folders"),
      ]);
      const convData = await convRes.json().catch(() => ({ conversations: [] }));
      const folderData = await folderRes.json().catch(() => ({ folders: [] }));

      setFolders(folderData.folders || []);

      const sessions: HomeChatSession[] = (convData.conversations || []).map((row: any) => ({
        id: row.id,
        title: row.title || "Obrolan Tanpa Judul",
        created_at: row.created_at,
        updated_at: row.updated_at,
        folder_id: row.folder_id ?? null,
        // Pesan tersimpan di DB tidak menyertakan `id` per-pesan (cuma
        // role/content/timestamp) -- disintesis di sini, cuma dipakai sbg
        // React key & penanda balasan AI yg sedang di-stream, tidak
        // memengaruhi isi percakapan.
        messages: (row.messages || []).map((m: any, idx: number) => ({
          id: `${row.id}_msg_${idx}`,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp || row.updated_at,
        })) as HomeChatMessage[],
      }));

      setChatSessions(sessions);
      if (sessions.length > 0) setActiveSessionId(sessions[0].id);
    } catch (e) {
      console.error("Failed to load server chat sessions", e);
    }
  }

  // Guest (belum login): tetap simpan ke localStorage spt sebelumnya, biar
  // tidak kehilangan obrolan waktu refresh walau belum daftar akun.
  useEffect(() => {
    if (user) return; // user login sumbernya Supabase, bukan localStorage
    if (chatSessions.length > 0) {
      localStorage.setItem("myai_chat_sessions", JSON.stringify(chatSessions));
    } else {
      localStorage.removeItem("myai_chat_sessions");
    }
  }, [chatSessions, user]);

  useEffect(() => {
    localStorage.setItem("myai_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("myai_guest_count", guestQuestionCount.toString());
  }, [guestQuestionCount]);

  const createNewChat = () => {
    // Sengaja TIDAK langsung bikin baris di Supabase di sini -- kalau user
    // klik "Obrolan Baru" berkali-kali tanpa pernah kirim pesan, itu bakal
    // numpuk baris kosong percuma. Baris asli baru dibuat saat pesan
    // PERTAMA benar-benar dikirim (lihat handleSendMessage).
    const newSession: HomeChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: lang === 'id' ? 'Obrolan Baru' : 'New Chat',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [],
      folder_id: null,
    };

    setChatSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  };

  const handleDeleteSession = (sessionId: string) => {
    setChatSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });

    if (user && isPersistedId(sessionId)) {
      fetch(`/api/public/conversations?id=${encodeURIComponent(sessionId)}`, { method: "DELETE" }).catch((e) =>
        console.warn("Failed deleting conversation on server:", e)
      );
    }
  };

  const handleMoveToFolder = (sessionId: string, folderId: string | null) => {
    setChatSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, folder_id: folderId } : s)));
    if (user && isPersistedId(sessionId)) {
      fetch("/api/public/conversations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sessionId, folderId }),
      }).catch((e) => console.warn("Failed moving conversation to folder:", e));
    }
  };

  const handleCreateFolder = async (name: string) => {
    if (!user) return;
    try {
      const res = await fetch("/api/public/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.folder) setFolders(prev => [...prev, data.folder]);
    } catch (e) {
      console.warn("Failed creating folder:", e);
    }
  };

  const handleRenameFolder = async (folderId: string, name: string) => {
    setFolders(prev => prev.map(f => (f.id === folderId ? { ...f, name } : f)));
    if (!user) return;
    try {
      await fetch("/api/public/folders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: folderId, name }),
      });
    } catch (e) {
      console.warn("Failed renaming folder:", e);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    setFolders(prev => prev.filter(f => f.id !== folderId));
    // Obrolan di dalamnya jangan hilang di UI -- cukup lepas folder_id-nya
    // (server juga otomatis begitu lewat "on delete set null").
    setChatSessions(prev => prev.map(s => (s.folder_id === folderId ? { ...s, folder_id: null } : s)));
    if (!user) return;
    try {
      await fetch(`/api/public/folders?id=${encodeURIComponent(folderId)}`, { method: "DELETE" });
    } catch (e) {
      console.warn("Failed deleting folder:", e);
    }
  };

  const handleSendMessage = async (text: string, isVoiceInput: boolean = false, fileData?: string): Promise<string> => {
    let currentId = activeSessionId;
    let targetSession = chatSessions.find(s => s.id === currentId);

    if (!currentId || !targetSession) {
      currentId = createNewChat();
      targetSession = chatSessions.find(s => s.id === currentId);
    }

    const userMsg: HomeChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text + (fileData ? " [File Lampiran]" : ""),
      timestamp: new Date().toISOString(),
      isVoiceInput
    };

    const existingMessages = targetSession?.messages || [];
    const newTitle = existingMessages.length === 0 ? text.slice(0, 32) + (text.length > 32 ? "..." : "") : (targetSession?.title || "Obrolan Baru");

    const aiMsgId = `msg_ai_${Date.now()}`;
    const aiMsgPlaceholder: HomeChatMessage = {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };

    setChatSessions(prev =>
      prev.map(s => {
        if (s.id === currentId) {
          return {
            ...s,
            title: newTitle,
            updated_at: new Date().toISOString(),
            messages: [...s.messages, userMsg, aiMsgPlaceholder]
          };
        }
        return s;
      })
    );

    // User login & sesi ini belum pernah tersimpan di Supabase (masih id
    // lokal "session_...") -> buat barisnya SEKARANG, dapat UUID asli, lalu
    // pindahkan semua state ke id itu SEBELUM memanggil /api/homepage/chat,
    // supaya penyimpanan giliran (server-side, fire-and-forget) meng-UPDATE
    // baris yg sama, bukan bikin baris baru tiap giliran chat (bug lama).
    let conversationIdForApi: string | null = null;
    if (user) {
      if (isPersistedId(currentId)) {
        conversationIdForApi = currentId;
      } else {
        try {
          const createRes = await fetch("/api/public/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle, messages: [...existingMessages, userMsg] }),
          });
          const createData = await createRes.json();
          if (createData.id) {
            const localTempId = currentId;
            conversationIdForApi = createData.id;
            setChatSessions(prev =>
              prev.map(s => (s.id === localTempId ? { ...s, id: createData.id } : s))
            );
            setActiveSessionId(createData.id);
            currentId = createData.id;
          }
        } catch (e) {
          console.warn("Failed persisting new conversation to server:", e);
        }
      }
    }

    // If guest, increment question count
    if (!user) {
      setGuestQuestionCount(prev => prev + 1);
    }

    setIsAiResponding(true);
    let accumulatedText = "";

    try {
      const response = await fetch("/api/homepage/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          history: existingMessages,
          lang,
          stream: true,
          isVoiceMode: isVoiceInput,
          isVoiceInput: isVoiceInput,
          file: fileData || undefined,
          conversationId: conversationIdForApi,
        })
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        if (response.status === 403 && errBody.quotaExceeded) {
          const quotaMsg: string = errBody.error || "Batas pemakaian AI tercapai.";
          setQuotaBlock({ message: quotaMsg, requiresAuth: !!errBody.requiresAuth });
          setChatSessions(prev =>
            prev.map(s => {
              if (s.id === currentId) {
                return { ...s, messages: s.messages.map(m => (m.id === aiMsgId ? { ...m, content: quotaMsg } : m)) };
              }
              return s;
            })
          );
          return quotaMsg;
        }
        throw new Error(errBody.error || "Gagal menerima balasan dari Bogani AI");
      }

      // Server baru saja mengizinkan giliran ini (bukan 403) -- kalau ada
      // quotaBlock lama yg nyangkut (mis. dari kemarin, sebelum kuota 24 jam
      // reset), bersihkan sekarang. Server selalu jadi sumber kebenaran,
      // bukan flag client yg bisa basi.
      if (quotaBlock) setQuotaBlock(null);

      const providerUsedHeader = response.headers.get("x-provider-used") || "gemini";

      if (response.body && (response.headers.get("content-type")?.includes("text/event-stream") || response.headers.get("content-type")?.includes("text/plain"))) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          setChatSessions(prev =>
            prev.map(s => {
              if (s.id === currentId) {
                return {
                  ...s,
                  updated_at: new Date().toISOString(),
                  messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: accumulatedText, providerUsed: providerUsedHeader } : m)
                };
              }
              return s;
            })
          );
        }
      } else {
        const data = await response.json();
        accumulatedText = data.text || "Maaf, Bogani AI tidak menghasilkan respon.";

        setChatSessions(prev =>
          prev.map(s => {
            if (s.id === currentId) {
              return {
                ...s,
                updated_at: new Date().toISOString(),
                messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: accumulatedText, providerUsed: providerUsedHeader } : m)
              };
            }
            return s;
          })
        );
      }
    } catch (err: any) {
      console.error("Error calling chat API:", err);
      const errorMsgText = `⚠️ Terjadi kesalahan: ${err.message || "Gagal menghubungi Bogani AI Gateway"}`;
      accumulatedText = errorMsgText;

      setChatSessions(prev =>
        prev.map(s => {
          if (s.id === currentId) {
            return {
              ...s,
              messages: s.messages.map(m => m.id === aiMsgId ? { ...m, content: errorMsgText } : m)
            };
          }
          return s;
        })
      );
    } finally {
      setIsAiResponding(false);
    }

    return accumulatedText;
  };

  const handleRegenerate = async (): Promise<void> => {
    const currentSession = chatSessions.find(s => s.id === activeSessionId);
    if (!currentSession || currentSession.messages.length < 2) return;

    const userMessages = currentSession.messages.filter(m => m.role === 'user');
    const lastUserMessage = userMessages[userMessages.length - 1];

    if (lastUserMessage) {
      await handleSendMessage(lastUserMessage.content, lastUserMessage.isVoiceInput);
    }
  };

  const activeSession = chatSessions.find(s => s.id === activeSessionId) || null;

  return (
    <div className="flex bg-[#171717] overflow-hidden font-sans w-full" style={{ height: '100dvh' }}>
      <ChatSidebar
        sessions={chatSessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={createNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        lang={lang}
        setLang={setLang}
        onOpenVoiceOverlay={() => setIsVoiceOverlayOpen(true)}
        user={user}
        guestCount={guestQuestionCount}
        folders={folders}
        onMoveToFolder={handleMoveToFolder}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      <MyAIChat
        currentSession={activeSession}
        onSendMessage={handleSendMessage}
        onRegenerate={handleRegenerate}
        onOpenVoiceOverlay={() => setIsVoiceOverlayOpen(true)}
        onToggleSidebarMobile={() => setIsMobileSidebarOpen(true)}
        lang={lang}
        isLoading={isAiResponding}
        user={user}
        guestCount={guestQuestionCount}
        quotaBlock={quotaBlock}
      />

      <VoiceModeOverlay
        isOpen={isVoiceOverlayOpen}
        onClose={() => setIsVoiceOverlayOpen(false)}
        onSendVoiceMessage={async (text) => {
          const aiReply = await handleSendMessage(text, true);
          return aiReply;
        }}
        lang={lang}
      />
    </div>
  );
}
