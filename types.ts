export enum IntelligenceMode {
  SUMMARY = 'SUMMARY',
  EXPLANATION = 'EXPLANATION',
  DETAILED = 'DETAILED',
  POPULAR = 'POPULAR',
  HALLUCIN = 'HALLUCIN'
}

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
