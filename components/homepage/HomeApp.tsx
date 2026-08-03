'use client';

import { useState, useEffect } from "react";
import { Language, HomeChatSession, HomeChatMessage } from "@/lib/types";
import ChatSidebar from "./ChatSidebar";
import MyAIChat from "./MyAIChat";
import VoiceModeOverlay from "./VoiceModeOverlay";

export default function HomeApp() {
  const [lang, setLang] = useState<Language>('id');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false);

  const [chatSessions, setChatSessions] = useState<HomeChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isAiResponding, setIsAiResponding] = useState(false);

  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [guestQuestionCount, setGuestQuestionCount] = useState<number>(0);

  useEffect(() => {
    // Fetch auth status
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));

    const savedLang = localStorage.getItem("myai_lang") as Language;
    if (savedLang) {
      setLang(savedLang);
    }

    const savedGuestCount = localStorage.getItem("myai_guest_count");
    if (savedGuestCount) {
      setGuestQuestionCount(parseInt(savedGuestCount, 10) || 0);
    }

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
  }, []);

  useEffect(() => {
    if (chatSessions.length > 0) {
      localStorage.setItem("myai_chat_sessions", JSON.stringify(chatSessions));
    } else {
      localStorage.removeItem("myai_chat_sessions");
    }
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem("myai_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("myai_guest_count", guestQuestionCount.toString());
  }, [guestQuestionCount]);

  const createNewChat = () => {
    const newSession: HomeChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: lang === 'id' ? 'Obrolan Baru' : 'New Chat',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: []
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
  };

  const handleSendMessage = async (text: string, isVoiceInput: boolean = false, fileData?: string): Promise<string> => {
    // If not logged in and reached limit of 2 free questions, block
    if (!user && guestQuestionCount >= 2) {
      return "";
    }

    let currentId = activeSessionId;
    let targetSession = chatSessions.find(s => s.id === currentId);

    if (!currentId || !targetSession) {
      currentId = createNewChat();
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
          file: fileData || undefined
        })
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || "Gagal menerima balasan dari Bogani AI");
      }

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
    <div className="flex h-screen w-full bg-[#171717] overflow-hidden font-sans">
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
