export interface UserInput {
  question: string;
  consultationTime: string; // ISO string
  isNow: boolean;
  divinationPillars: string; // Manual Four Pillars for Divination
  birthDate: string; // ISO string or empty
  birthTime: string; // HH:mm or empty
  birthPillars: string; // Manual Four Pillars for Birth
  chartText: string; // Manual Divination Chart Text
  chartImage: string; // Manual Divination Chart Image (Base64)
  birthChartText: string; // Manual Birth Chart Text
  birthChartImage: string; // Manual Birth Chart Image (Base64)
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  input: UserInput;
  result: string;
}

export interface AnalysisResponse {
  rawText: string;
  timestamp: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}