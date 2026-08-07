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
  Database,
  Type,
  ScrollText,
  PenTool,
  Gamepad2,
  FileText,
  Folder,
  FolderPlus,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

import SettingsModal from "@/components/SettingsModal";
import { HomeChatSession, Language, ChatFolder } from "@/lib/types";
import MyAILogo from "./MyAILogo";

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
  folders?: ChatFolder[];
  onMoveToFolder?: (sessionId: string, folderId: string | null) => void;
  onCreateFolder?: (name: string) => void;
  onRenameFolder?: (folderId: string, name: string) => void;
  onDeleteFolder?: (folderId: string) => void;
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
  guestCount,
  folders = [],
  onMoveToFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState("");
  const [moveMenuForSession, setMoveMenuForSession] = useState<string | null>(null);

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Obrolan yg belum masuk folder mana pun -- ini yg dikelompokkan per
  // tanggal (Hari Ini/7 Hari Terakhir/Lebih Lama) spt sebelumnya. Obrolan
  // yg sudah punya folder_id ditampilkan di bawah section Folder-nya sendiri.
  const unfiledSessions = filteredSessions.filter(s => !s.folder_id);

  const submitNewFolder = () => {
    const name = newFolderName.trim();
    if (name && onCreateFolder) onCreateFolder(name);
    setNewFolderName("");
    setIsAddingFolder(false);
  };

  const submitRenameFolder = (folderId: string) => {
    const name = editingFolderName.trim();
    if (name && onRenameFolder) onRenameFolder(folderId, name);
    setEditingFolderId(null);
    setEditingFolderName("");
  };

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

  const grouped = groupSessionsByDate(unfiledSessions);

  const handleLogout = async () => {
    try {
      const { getSupabaseBrowserClient } = await import("@/lib/supabase-browser-auth");
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("[ChatSidebar] Supabase signout notice:", e);
    }
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
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
        {/* Top Header */}
        <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#262626]">
          <div className="flex items-center gap-2.5 pl-1.5">
            <h1 className="font-semibold text-sm tracking-tight text-white">
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

          <Link
            href="/artikel"
            onClick={onCloseMobile}
            className="w-full py-2 px-3 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 font-medium text-xs flex items-center justify-between transition-all duration-200"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>{lang === 'id' ? 'Artikel Pengguna' : 'User Articles'}</span>
            </div>
            <span className="text-[9px] font-semibold bg-purple-500 text-white px-1.5 py-0.5 rounded-full">Baru</span>
          </Link>

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

          {/* Navigation Items: Transliterasi & Aksara */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/aksara-mongondow?tab=sandbox"
              onClick={onCloseMobile}
              className="py-2 px-2.5 rounded-xl bg-[#212121] hover:bg-[#2b2b2b] text-gray-300 hover:text-white border border-[#333] text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Type className="w-4 h-4 text-violet-400 shrink-0" />
              <span className="truncate">Transliterasi</span>
            </Link>

            <Link
              href="/aksara-mongondow"
              onClick={onCloseMobile}
              className="py-2 px-2.5 rounded-xl bg-[#212121] hover:bg-[#2b2b2b] text-gray-300 hover:text-white border border-[#333] text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <ScrollText className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate">Aksara</span>
            </Link>
          </div>

          {/* Navigation Items: Latihan & Game */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/aksara-mongondow?tab=tracing"
              onClick={onCloseMobile}
              className="py-2 px-2.5 rounded-xl bg-[#212121] hover:bg-[#2b2b2b] text-gray-300 hover:text-white border border-[#333] text-xs font-semibold flex items-center gap-2 transition-all group"
              title="Buka Studio Latihan Menulis Aksara Mongondow"
            >
              <PenTool className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">Latihan</span>
            </Link>

            <Link
              href="/game"
              onClick={onCloseMobile}
              className="py-2 px-2.5 rounded-xl bg-[#212121] hover:bg-[#2b2b2b] text-gray-300 hover:text-white border border-[#333] text-xs font-semibold flex items-center gap-2 transition-all group"
              title="Buka Arena Game & Kuis MongondowPedia"
            >
              <Gamepad2 className="w-4 h-4 text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">Game</span>
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

        {/* Folder / Project Sections (hanya utk user login -- disimpan di Supabase) */}
        {user && (
          <div className="px-3 pb-1">
            <div className="flex items-center justify-between px-0 pb-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {lang === 'id' ? 'Folder' : 'Folders'}
              </p>
              <button
                onClick={() => setIsAddingFolder(true)}
                className="p-1 text-gray-500 hover:text-white rounded transition-colors"
                title={lang === 'id' ? 'Buat Folder Baru' : 'New Folder'}
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {isAddingFolder && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <input
                  autoFocus
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitNewFolder();
                    if (e.key === "Escape") { setIsAddingFolder(false); setNewFolderName(""); }
                  }}
                  placeholder={lang === 'id' ? 'Nama folder...' : 'Folder name...'}
                  className="flex-1 bg-[#212121] text-xs text-white placeholder-gray-500 px-2 py-1.5 rounded-lg border border-blue-500/50 focus:outline-none"
                />
                <button onClick={submitNewFolder} className="p-1.5 text-emerald-400 hover:bg-[#212121] rounded-lg">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setIsAddingFolder(false); setNewFolderName(""); }} className="p-1.5 text-gray-500 hover:bg-[#212121] rounded-lg">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {folders.length > 0 && (
              <div className="space-y-1">
                {folders.map(folder => renderFolderGroup(folder))}
              </div>
            )}
          </div>
        )}

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

        {/* Ecosystem & Bottom Navigation */}
        <div className="p-2 border-t border-[#262626] space-y-1 bg-[#171717]">
          <Link
            href="/ecosystem"
            className="w-full p-2.5 rounded-xl text-xs font-semibold text-blue-400 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 flex items-center justify-between transition-all group shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-blue-400 group-hover:scale-105 transition-transform" />
              <span>Ecosystem</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500 text-white font-bold">7 Modul</span>
          </Link>

          {user && (
            <Link
              href="/dashboard"
              className="w-full p-2.5 rounded-xl text-xs font-medium text-gray-300 hover:bg-[#212121] flex items-center gap-2.5 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-gray-400" />
              <span>Dashboard</span>
            </Link>
          )}

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
                    <UserX className="w-3 h-3" /> Mode Gratis (Penggunaan Terbatas)
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
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        lang={lang}
        onLangChange={setLang}
        user={user}
        onClearChats={() => {
          if (sessions.length > 0) {
            sessions.forEach(s => onDeleteSession(s.id));
          }
        }}
      />
    </>
  );

  function renderFolderGroup(folder: ChatFolder) {
    const folderSessions = filteredSessions.filter(s => s.folder_id === folder.id);
    const isCollapsed = collapsedFolders[folder.id];
    const isEditing = editingFolderId === folder.id;

    return (
      <div key={folder.id} className="space-y-0.5">
        <div className="group flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#212121] transition-colors">
          <button
            onClick={() => setCollapsedFolders(prev => ({ ...prev, [folder.id]: !prev[folder.id] }))}
            className="flex items-center gap-1.5 min-w-0 flex-1 text-left"
          >
            {isCollapsed ? <ChevronRight className="w-3 h-3 text-gray-500 shrink-0" /> : <ChevronDown className="w-3 h-3 text-gray-500 shrink-0" />}
            <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {isEditing ? (
              <input
                autoFocus
                type="text"
                value={editingFolderName}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setEditingFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitRenameFolder(folder.id);
                  if (e.key === "Escape") setEditingFolderId(null);
                }}
                onBlur={() => submitRenameFolder(folder.id)}
                className="flex-1 bg-[#171717] text-xs text-white px-1.5 py-0.5 rounded border border-blue-500/50 focus:outline-none"
              />
            ) : (
              <span className="truncate text-xs font-medium text-gray-200">{folder.name}</span>
            )}
            <span className="text-[9px] text-gray-600 font-mono shrink-0">{folderSessions.length}</span>
          </button>

          {!isEditing && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity shrink-0">
              <button
                onClick={() => { setEditingFolderId(folder.id); setEditingFolderName(folder.name); }}
                className="p-1 text-gray-500 hover:text-white rounded"
                title={lang === 'id' ? 'Ganti Nama' : 'Rename'}
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={() => { if (onDeleteFolder) onDeleteFolder(folder.id); }}
                className="p-1 text-gray-500 hover:text-rose-400 rounded"
                title={lang === 'id' ? 'Hapus Folder' : 'Delete Folder'}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="pl-4 space-y-0.5">
            {folderSessions.length === 0 ? (
              <p className="px-3 py-1 text-[10px] text-gray-600 italic">{lang === 'id' ? 'Belum ada obrolan' : 'No chats yet'}</p>
            ) : (
              folderSessions.map(session => renderSessionItem(session))
            )}
          </div>
        )}
      </div>
    );
  }

  function renderSessionItem(session: HomeChatSession) {
    const isActive = session.id === activeSessionId;
    const showMoveMenu = moveMenuForSession === session.id;
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

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity shrink-0 relative">
          {user && onMoveToFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMoveMenuForSession(showMoveMenu ? null : session.id);
              }}
              className="p-1 hover:text-blue-400 text-gray-500 rounded"
              title={lang === 'id' ? 'Pindah ke Folder' : 'Move to Folder'}
            >
              <Folder className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSession(session.id);
            }}
            className="p-1 hover:text-rose-400 text-gray-500 rounded"
            title="Hapus Obrolan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {showMoveMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 w-44 bg-[#212121] border border-[#333] rounded-xl shadow-xl z-30 py-1 max-h-48 overflow-y-auto"
            >
              <button
                onClick={() => { onMoveToFolder?.(session.id, null); setMoveMenuForSession(null); }}
                className="w-full text-left px-3 py-1.5 text-[11px] text-gray-300 hover:bg-[#2b2b2b] hover:text-white flex items-center gap-1.5"
              >
                <X className="w-3 h-3" /> {lang === 'id' ? 'Tanpa Folder' : 'No Folder'}
              </button>
              {folders.map(f => (
                <button
                  key={f.id}
                  onClick={() => { onMoveToFolder?.(session.id, f.id); setMoveMenuForSession(null); }}
                  className="w-full text-left px-3 py-1.5 text-[11px] text-gray-300 hover:bg-[#2b2b2b] hover:text-white flex items-center gap-1.5"
                >
                  <Folder className="w-3 h-3 text-amber-400 shrink-0" /> <span className="truncate">{f.name}</span>
                </button>
              ))}
              {folders.length === 0 && (
                <p className="px-3 py-1.5 text-[10px] text-gray-600 italic">{lang === 'id' ? 'Belum ada folder' : 'No folders yet'}</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
