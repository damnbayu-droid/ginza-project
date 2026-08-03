'use client';

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export function PanelHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold text-bento-text-primary">{title}</h1>
      {subtitle && <p className="text-sm text-bento-text-secondary mt-1">{subtitle}</p>}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-bento-border bg-bento-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-bento-text-secondary">{label}</p>
      <p className="text-2xl font-bold mt-1 text-bento-text-primary">{value}</p>
      {hint && <p className="text-[11px] text-bento-text-secondary mt-1 opacity-70">{hint}</p>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-bento-border bg-bento-surface p-4 ${className}`}>{children}</div>;
}

export function LoadingState({ label = "Memuat..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-bento-text-secondary py-8 justify-center">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 text-red-400 text-sm px-4 py-3">
      {message}
    </div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warning" | "danger" }) {
  const toneClasses: Record<string, string> = {
    default: "bg-bento-surface-lighter text-bento-text-secondary",
    success: "bg-green-500/10 text-green-400",
    warning: "bg-amber-500/10 text-amber-400",
    danger: "bg-red-500/10 text-red-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

export function Button({ children, onClick, variant = "default", disabled, className = "" }: {
  children: ReactNode; onClick?: () => void; variant?: "default" | "primary" | "danger"; disabled?: boolean; className?: string;
}) {
  const variantClasses: Record<string, string> = {
    default: "border border-bento-border text-bento-text-primary hover:bg-bento-surface-lighter",
    primary: "bg-bento-accent text-white hover:opacity-90",
    danger: "border border-red-500/30 text-red-400 hover:bg-red-500/10",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
