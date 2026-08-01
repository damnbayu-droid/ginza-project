'use client';

import { useState } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  Search,
  Globe,
  Check,
  X,
  Volume2,
  LayoutDashboard,
  Layers,
  Edit2,
  Clock,
  LogIn,
  LogOut,
  UserCheck,
  UserX,
  ShieldCheck,
  BookOpen,
  Database
} from "lucide-react";
import Link from "next/link";
import { HomeChatSession, Language } from "@/lib/types";

interface ChatSidebarProps {
  sessions: HomeChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  onOpenVoiceOverlay: () => void;
  user: { name: string; email: string; role: string } | null;
  guestCount: number;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  onCloseMobile,
  lang,
  setLang,
  onOpenVoiceOverlay,
  user,
  guestCount
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sessions by date (Today, Past 7 Days, Older)
  const groupSessionsByDate = (sessionList: HomeChatSession[]) => {
    const today: HomeChatSession[] = [];
    const past7Days: HomeChatSession[] = [];
    const older: HomeChatSession[] = [];

    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const sevenDaysMs = 7 * oneDayMs;

    sessionList.forEach(session => {
      const sessionDate = new Date(session.updated_at || session.created_at);
      const diff = now.getTime() - sessionDate.getTime();

      if (diff < oneDayMs) {
        today.push(session);
      } else if (diff < sevenDaysMs) {
        past7Days.push(session);
      } else {
        older.push(session);
      }
    });

    return { today, past7Days, older };
  };

  const grouped = groupSessionsByDate(filteredSessions);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#171717] text-[#ececec] flex flex-col border-r border-[#262626] transition-transform duration-300 ease-in-out font-sans ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Header (No logo per user request) */}
        <div className="p-3.5 flex items-center justify-between border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
              <span>MongondowPedia</span>
            </h1>
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 hover:bg-[#262626] text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-3 space-y-2">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-[#212121] hover:bg-[#2b2b2b] text-white border border-[#333333] font-medium text-xs flex items-center justify-between transition-all duration-200 group shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Plus className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>{lang === 'id' ? 'Obrolan Baru' : 'New Chat'}</span>
            </div>
            <kbd className="text-[9px] font-mono bg-[#171717] text-gray-400 px-1.5 py-0.5 rounded border border-[#333]">⌘K</kbd>
          </button>

          <button
            onClick={() => {
              onOpenVoiceOverlay();
              onCloseMobile();
            }}
            className="w-full py-2 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 font-medium text-xs flex items-center justify-between transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>{lang === 'id' ? 'Mode Suara Langsung' : 'Live Voice Mode'}</span>
            </div>
            <span className="text-[9px] font-semibold bg-blue-500 text-white px-1.5 py-0.5 rounded-full">Aktif</span>
          </button>

          {/* Navigation Items: Kamus & Knowledge */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/kamus"
              onClick={onCloseMobile}
              className="py-2 px-2.5 rounded-xl bg-[#212121] hover:bg-[#2b2b2b] text-gray-300 hover:text-white border border-[#333] text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Kamus</span>
            </Link>

            <Link
              href="/knowledge"
              onClick={onCloseMobile}
              className="py-2 px-2.5 rounded-xl bg-[#212121] hover:bg-[#2b2b2b] text-gray-300 hover:text-white border border-[#333] text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Database className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="truncate">Knowledge</span>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder={lang === 'id' ? "Cari riwayat obrolan..." : "Search chat history..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#212121] text-xs text-white placeholder-gray-500 pl-8 pr-3 py-1.5 rounded-lg border border-[#2f2f2f] focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Chat History Sections */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2 custom-scrollbar">
          {filteredSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500 space-y-1">
              <Clock className="w-5 h-5 mx-auto text-gray-600" />
              <p>{searchQuery ? (lang === 'id' ? 'Tidak ada riwayat ditemukan' : 'No history found') : (lang === 'id' ? 'Belum ada obrolan. Mulai pesan pertama Anda!' : 'No chats yet. Start your first prompt!')}</p>
            </div>
          ) : (
            <>
              {/* Today Group */}
              {grouped.today.length > 0 && (
                <div className="space-y-1">
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {lang === 'id' ? 'Hari Ini' : 'Today'}
                  </p>
                  {grouped.today.map(session => renderSessionItem(session))}
                </div>
              )}

              {/* Past 7 Days Group */}
              {grouped.past7Days.length > 0 && (
                <div className="space-y-1">
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {lang === 'id' ? '7 Hari Terakhir' : 'Past 7 Days'}
                  </p>
                  {grouped.past7Days.map(session => renderSessionItem(session))}
                </div>
              )}

              {/* Older Group */}
              {grouped.older.length > 0 && (
                <div className="space-y-1">
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    {lang === 'id' ? 'Lebih Lama' : 'Older'}
                  </p>
                  {grouped.older.map(session => renderSessionItem(session))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Ecosystem Consoles & Bottom Navigation */}
        <div className="p-2 border-t border-[#262626] space-y-1 bg-[#171717]">
          <Link
            href="/ecosystem"
            className="w-full p-2.5 rounded-xl text-xs font-semibold text-blue-400 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 flex items-center justify-between transition-all group shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-blue-400 group-hover:scale-105 transition-transform" />
              <span>{lang === 'id' ? 'Ecosystem Consoles' : 'Ecosystem Consoles'}</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500 text-white font-bold">3 Consoles</span>
          </Link>

          <Link
            href="/dashboard"
            className="w-full p-2.5 rounded-xl text-xs font-medium text-gray-300 hover:bg-[#212121] flex items-center gap-2.5 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-gray-400" />
            <span>{lang === 'id' ? 'Gateway Console' : 'Gateway Console'}</span>
          </Link>

          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-full p-2.5 rounded-xl text-xs font-medium text-gray-300 hover:bg-[#212121] flex items-center gap-2.5 transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
            <span>{lang === 'id' ? 'Pengaturan' : 'Settings'}</span>
          </button>

          {/* User Data Account Section (No logo per user request) */}
          <div className="pt-2 mt-1 border-t border-[#262626] px-2 py-2">
            {user ? (
              /* Logged In User State (Bayu Admin) */
              <div className="flex items-center justify-between bg-[#212121] p-2 rounded-xl border border-[#333]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-md">
                    B
                  </div>
                  <div className="truncate text-left">
                    <p className="text-xs font-semibold text-white flex items-center gap-1 truncate">
                      Bayu (Admin)
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    </p>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Administrator
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Guest Not Logged In State */
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
                    <UserX className="w-3 h-3" /> Mode Gratis ({guestCount}/2 Pertanyaan)
                  </span>
                  <span className="text-[9px] font-mono text-gray-500">Tamu</span>
                </div>

                <Link
                  href="/login"
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk / Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#212121] border border-[#333333] rounded-2xl w-full max-w-md p-6 text-white space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#333] pb-4">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                {lang === 'id' ? 'Pengaturan MongondowPedia' : 'MongondowPedia Settings'}
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 hover:bg-[#2f2f2f] rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                {lang === 'id' ? 'Bahasa Antarmuka' : 'Interface Language'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setLang('id')}
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                    lang === 'id' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-[#171717] border-[#333] text-gray-400'
                  }`}
                >
                  <span>🇮🇩 Bahasa Indonesia</span>
                  {lang === 'id' && <Check className="w-4 h-4 text-blue-400" />}
                </button>
                <button
                  onClick={() => setLang('en')}
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between ${
                    lang === 'en' ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-[#171717] border-[#333] text-gray-400'
                  }`}
                >
                  <span>🇺🇸 English</span>
                  {lang === 'en' && <Check className="w-4 h-4 text-blue-400" />}
                </button>
              </div>
            </div>

            <div className="bg-[#171717] p-3.5 rounded-xl border border-[#333] space-y-2">
              <p className="text-xs font-medium text-blue-400">Status System (myai.nexus):</p>
              <ul className="text-xs text-gray-300 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Text & File Vision (Tier 1 & Tier 2 Models) - Aktif
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Voice Input & Output (Microphone Enabled) - Aktif
                </li>
              </ul>
            </div>

            <button
              onClick={() => setShowSettingsModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
            >
              {lang === 'id' ? 'Simpan & Tutup' : 'Save & Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );

  function renderSessionItem(session: HomeChatSession) {
    const isActive = session.id === activeSessionId;
    return (
      <div
        key={session.id}
        onClick={() => {
          onSelectSession(session.id);
          onCloseMobile();
        }}
        className={`group relative flex items-center justify-between px-3 py-2 text-xs rounded-xl cursor-pointer transition-all duration-150 ${
          isActive
            ? "bg-[#252525] text-white font-medium border border-[#383838] shadow-sm"
            : "text-gray-300 hover:bg-[#212121] hover:text-white"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-6">
          <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-blue-400" : "text-gray-500"}`} />
          <span className="truncate">{session.title || (lang === 'id' ? 'Obrolan Tanpa Judul' : 'Untitled Chat')}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteSession(session.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-gray-500 rounded transition-opacity"
          title="Hapus Obrolan"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }
}
