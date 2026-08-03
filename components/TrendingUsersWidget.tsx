'use client';

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

interface TrendingUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  mongondow_score: number;
}

export default function TrendingUsersWidget() {
  const [users, setUsers] = useState<TrendingUser[] | null>(null);

  useEffect(() => {
    fetch("/api/public/trending").then(r => r.json()).then(d => setUsers(d.users ?? []));
  }, []);

  if (!users || users.length === 0) return null;

  return (
    <div className="rounded-2xl border border-bento-border bg-bento-surface p-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="h-4 w-4 text-amber-400" />
        <p className="text-xs font-semibold uppercase tracking-wide text-bento-text-secondary">Trending Kontributor</p>
      </div>
      <ol className="space-y-2">
        {users.map((u, i) => (
          <li key={u.id} className="flex items-center gap-2 text-sm">
            <span className="text-xs font-mono text-bento-text-secondary w-4 shrink-0">{i + 1}</span>
            {u.avatar_url ? (
              <img src={u.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover shrink-0" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-bento-accent-muted text-bento-accent flex items-center justify-center text-[10px] font-semibold shrink-0">
                {(u.display_name ?? "?").substring(0, 1).toUpperCase()}
              </div>
            )}
            <span className="truncate flex-1">{u.display_name ?? "Anonim"}</span>
            <span className="text-xs text-bento-text-secondary shrink-0">{u.mongondow_score} pts</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
