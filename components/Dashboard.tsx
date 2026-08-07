'use client';

import { useState, useEffect } from "react";
import { Language } from "@/lib/types";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import OverviewPanel from "@/components/dashboard/panels/OverviewPanel";
import MessagesPanel from "@/components/dashboard/panels/MessagesPanel";
import UserManagementPanel from "@/components/dashboard/panels/UserManagementPanel";
import VerificatorManagementPanel from "@/components/dashboard/panels/VerificatorManagementPanel";
import DatabaseKamusPanel from "@/components/dashboard/panels/DatabaseKamusPanel";
import DatabaseKnowledgePanel from "@/components/dashboard/panels/DatabaseKnowledgePanel";
import AksaraPanel from "@/components/dashboard/panels/AksaraPanel";
import KontribusiPanel from "@/components/dashboard/panels/KontribusiPanel";
import MetricsPanel from "@/components/dashboard/panels/MetricsPanel";
import AiMasterPanel from "@/components/dashboard/panels/AiMasterPanel";
import LogsPanel from "@/components/dashboard/panels/LogsPanel";

export type AdminPanelKey =
  | "overview" | "messages" | "users" | "verificators" | "kamus" | "knowledge"
  | "aksara" | "contributions" | "metrics" | "ai-master" | "logs";

interface DashboardProps {
  adminEmail: string;
}

export default function Dashboard({ adminEmail }: DashboardProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<Language>('id');
  const [activePanel, setActivePanel] = useState<AdminPanelKey>('overview');

  useEffect(() => {
    const savedTheme = localStorage.getItem("myai_theme") as 'dark' | 'light';
    if (savedTheme) setTheme(savedTheme);
    const savedLang = localStorage.getItem("myai_lang") as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.backgroundColor = "#0A0B0D";
    } else {
      root.classList.remove('dark');
      root.style.backgroundColor = "#FAFAFA";
    }
    localStorage.setItem("myai_theme", theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem("myai_lang", lang); }, [lang]);

  function renderPanel() {
    switch (activePanel) {
      case "overview": return <OverviewPanel onNavigate={setActivePanel} />;
      case "messages": return <MessagesPanel />;
      case "users": return <UserManagementPanel />;
      case "verificators": return <VerificatorManagementPanel />;
      case "kamus": return <DatabaseKamusPanel />;
      case "knowledge": return <DatabaseKnowledgePanel />;
      case "aksara": return <AksaraPanel />;
      case "contributions": return <KontribusiPanel />;
      case "metrics": return <MetricsPanel />;
      case "ai-master": return <AiMasterPanel />;
      case "logs": return <LogsPanel />;
      default: return null;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bento-bg text-bento-text-primary" id="console-layout">
      <Sidebar lang={lang} theme={theme} adminEmail={adminEmail} activePanel={activePanel} onSelectPanel={setActivePanel} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />

        <main className="flex-1 overflow-y-auto p-6 md:p-8 focus:outline-none">
          <div className="max-w-6xl mx-auto pb-12">
            {renderPanel()}
          </div>
        </main>
      </div>
    </div>
  );
}
