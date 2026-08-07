export type Language = 'id' | 'en';
export type Theme = 'dark' | 'light';

export interface HomeChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isVoiceInput?: boolean;
  providerUsed?: string; // e.g. 'gemini', 'gpt', 'claude', 'deepseek', 'grok', 'glm'
}

export interface HomeChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: HomeChatMessage[];
  folder_id?: string | null;
  /** true selama sesi lokal (belum dibalas server) belum punya UUID asli dari Supabase */
  isSyncing?: boolean;
}

export interface ChatFolder {
  id: string;
  user_id: string;
  name: string;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserMemoryItem {
  id: string;
  content: string;
  category: 'general' | 'preference' | 'fact' | 'goal';
  created_at: string;
}
