
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