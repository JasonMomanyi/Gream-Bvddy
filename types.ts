
export enum IntelligenceMode {
  SUMMARY = 'SUMMARY',
  EXPLANATION = 'EXPLANATION',
  DETAILED = 'DETAILED',
  POPULAR = 'POPULAR',
  HALLUCIN = 'HALLUCIN',
  SCRAPE_PLANNER = 'SCRAPE_PLANNER',
  HACKER = 'HACKER'
}

export type AIPersona = 
  | 'default'
  | 'professional'
  | 'student'
  | 'teacher'
  | 'kid'
  | 'fun'
  | 'hacker'
  | 'pirate'
  | 'shakespeare'
  | 'gangster'
  | 'robot';

export type AIProvider = 'google' | 'puter';

export interface ModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  isFree?: boolean;
}

// Available Models based on Puter.js + Gemini
export const AVAILABLE_MODELS: ModelConfig[] = [
  // Google
  { id: 'gemini-1.5-flash', name: 'Base AI', provider: 'google', description: 'Standard Engine (Gemini 1.5 Flash)', isFree: true },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro', provider: 'google', description: 'Advanced reasoning (High Quota Usage)', isFree: true },
  
  // Claude (via Puter)
  { id: 'claude-sonnet-4-5', name: 'Claude Sonnet 4.5', provider: 'puter', description: 'Balanced intelligence & speed (Anthropic)', isFree: true },
  { id: 'claude-opus-4-5', name: 'Claude Opus 4.5', provider: 'puter', description: 'Maximum reasoning power (Anthropic)', isFree: true },
  
  // OpenAI (via Puter)
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'puter', description: 'Versatile flagship model (OpenAI)', isFree: true },
  { id: 'gpt-5-nano', name: 'GPT-5 Nano', provider: 'puter', description: 'Experimental fast model', isFree: true },
  
  // DeepSeek (via Puter)
  { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek v3.2', provider: 'puter', description: 'Strong open-source logic', isFree: true },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'puter', description: 'Reasoning optimized', isFree: true },

  // Grok (via Puter)
  { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1', provider: 'puter', description: 'Witty, real-time knowledge (xAI)', isFree: true },
];

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  mode?: IntelligenceMode;
  persona?: AIPersona;
  sources?: GroundingSource[];
  isTrainedResponse?: boolean;
  modelUsed?: string;
}

export interface TrainedCommand {
  id: string;
  trigger: string;
  response: string;
  description?: string;
  createdAt: number;
}

export interface UserPreferences {
  apiKey: string;
}

export type ProcessingState = 'idle' | 'searching' | 'thinking' | 'streaming' | 'complete' | 'error';