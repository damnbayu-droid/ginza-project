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
}
