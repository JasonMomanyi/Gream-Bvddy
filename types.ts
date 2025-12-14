
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
  { id: 'gemini-2.5-flash', name: 'Base AI (Gemini 2.5)', provider: 'google', description: 'Standard Engine (Fast & Free)', isFree: true },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro', provider: 'google', description: 'Advanced reasoning (High Quota Usage)', isFree: true },
  
  // Claude (via Puter)
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'puter', description: 'Balanced intelligence & speed (Anthropic)', isFree: true },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'puter', description: 'Maximum reasoning power (Anthropic)', isFree: true },
  
  // OpenAI (via Puter)
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'puter', description: 'Versatile flagship model (OpenAI)', isFree: true },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'puter', description: 'Fast & efficient', isFree: true },
  
  // DeepSeek (via Puter)
  { id: 'deepseek-chat', name: 'DeepSeek V3', provider: 'puter', description: 'Strong open-source logic', isFree: true },
  { id: 'deepseek-reasoner', name: 'DeepSeek R1', provider: 'puter', description: 'Reasoning optimized', isFree: true },

  // Grok (via Puter)
  { id: 'grok-beta', name: 'Grok Beta', provider: 'puter', description: 'Real-time knowledge (xAI)', isFree: true },
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
