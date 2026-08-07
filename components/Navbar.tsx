'use client';

import Link from "next/link";
import { Sun, Moon, Home } from "lucide-react";
import { Language } from "@/lib/types";

interface NavbarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
}

export default function Navbar({ lang, setLang, theme, setTheme }: NavbarProps) {
  return (
    <header className="h-16 border-b border-bento-border px-8 flex items-center justify-between shrink-0 transition-colors duration-300 bg-bento-bg text-bento-text-primary">
      {/* Current View Title & Home Link */}
      <div className="flex items-center gap-4">
        <h2 className="font-semibold text-lg tracking-tight" id="navbar-view-title">Admin Dashboard</h2>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-bento-border bg-bento-surface text-bento-text-primary hover:text-blue-400 hover:border-blue-500/40 text-xs font-semibold transition-all shadow-sm"
          title="Kembali ke Beranda MongondowPedia"
        >
          <Home className="w-3.5 h-3.5 text-blue-400" />
          <span>Beranda</span>
        </Link>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg border border-bento-border bg-bento-surface-lighter">
          <button
            onClick={() => setLang('id')}
            id="lang-btn-id"
            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
              lang === 'id'
                ? 'bg-bento-accent text-white shadow-xs'
                : 'text-bento-text-secondary hover:text-bento-text-primary'
            }`}
          >
            ID
          </button>
          <button
            onClick={() => setLang('en')}
            id="lang-btn-en"
            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
              lang === 'en'
                ? 'bg-bento-accent text-white shadow-xs'
                : 'text-bento-text-secondary hover:text-bento-text-primary'
            }`}
          >
            EN
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          id="theme-toggle-btn"
          className="p-2 rounded-xl border border-bento-border bg-bento-surface text-bento-accent hover:bg-bento-surface-lighter transition-all duration-150"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
