export interface UserInput {
  question: string;
  consultationTime: string; // ISO string
  isNow: boolean;
  birthDate: string; // ISO string or empty
  birthTime: string; // HH:mm or empty
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