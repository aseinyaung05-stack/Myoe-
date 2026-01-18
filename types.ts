
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface VoiceNote {
  id: string;
  userId: string;
  title: string;
  originalText: string;
  refinedText: string;
  summary: string;
  category: string;
  keywords: string[];
  timestamp: number;
  audioDuration: number;
}

export interface Report {
  id: string;
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  noteCount: number;
  topTopics: string[];
  insights: string;
  recommendations: string;
  timestamp: number;
}

export enum AppScreen {
  LOGIN = 'LOGIN',
  RECORD = 'RECORD',
  NOTES = 'NOTES',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS'
}
