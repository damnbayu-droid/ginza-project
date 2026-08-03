'use client';

import { useState } from "react";
import { LogOut, Code, ChevronLeft, ChevronRight } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/i18n";
import { useRouter } from "next/navigation";

interface SidebarProps {
  lang: Language;
  theme: 'dark' | 'light';
  adminEmail: string;
}

export default function Sidebar({ lang, theme, adminEmail }: SidebarProps) {
  const t = translations[lang] as any;
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  return (
    <aside className={`flex flex-col h-screen border-r border-bento-border shrink-0 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-64'
    } ${theme === 'dark' ? 'bg-[#0F1012]' : 'bg-[#F9FAFB]'}`}>

      {/* Brand Header */}
      <div className={`p-4 border-b border-bento-border flex items-center justify-between`}>
        <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
          <div className="p-2 rounded-lg bg-bento-accent-muted text-bento-accent shrink-0">
            <Code className="h-5 w-5" id="brand-logo-icon" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-base tracking-tight truncate" id="sidebar-app-title">MongondowPedia</h1>
              <p className="text-[10px] font-medium tracking-widest uppercase opacity-60 text-bento-text-secondary">Bogani AI • Ginza Project</p>
            </div>
          )}
        </div>
      </div>

      {/* No modules yet — admin dashboard is intentionally empty */}
      <div className="flex-1" />

      {/* Footer: Admin info + Logout */}
      <div className={`p-3 border-t border-bento-border flex flex-col gap-2`}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-bento-accent to-bento-success flex items-center justify-center text-white font-semibold text-xs shrink-0 select-none">
              {adminEmail ? adminEmail.substring(0, 2).toUpperCase() : "AD"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate leading-none mb-1 text-bento-text-primary">Founder / Owner</p>
              <p className="text-[10px] text-bento-text-secondary truncate opacity-80">{adminEmail}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          id="logout-btn"
          title={collapsed ? "Logout" : undefined}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all duration-150`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t.logout}</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          id="sidebar-collapse-btn"
          className="w-full flex items-center justify-center py-2 rounded-xl text-bento-text-secondary hover:text-bento-text-primary hover:bg-bento-surface-lighter transition-all duration-150"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
