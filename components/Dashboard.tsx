'use client';

import { useState, useEffect } from "react";
import { Language } from "@/lib/types";
import { LayoutDashboard } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

interface DashboardProps {
  adminEmail: string;
}

export default function Dashboard({ adminEmail }: DashboardProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<Language>('id');

  // Restore theme/lang from localStorage
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

  return (
    <div className="flex h-screen overflow-hidden bg-bento-bg text-bento-text-primary" id="console-layout">
      <Sidebar lang={lang} theme={theme} adminEmail={adminEmail} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />

        <main className="flex-1 overflow-y-auto p-8 focus:outline-none">
          <div className="max-w-6xl mx-auto pb-12 h-full flex items-center justify-center">
            <div className="text-center space-y-3 max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-bento-accent-muted text-bento-accent flex items-center justify-center mx-auto">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <p className="font-semibold text-bento-text-primary">
                {lang === 'id' ? "Belum ada modul admin" : "No admin modules yet"}
              </p>
              <p className="text-sm text-bento-text-secondary">
                {lang === 'id'
                  ? "Dashboard ini sengaja dikosongkan — modul khusus MongondowPedia akan dibangun di sini."
                  : "This dashboard is intentionally empty — MongondowPedia-specific modules will be built here."}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
