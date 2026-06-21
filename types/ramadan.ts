export type FastingStatus = 'fasted' | 'not_fasted' | 'excused' | 'pending';

export interface RamadanDay {
  dayNumber: number;
  date: string; // ISO date string YYYY-MM-DD
  fastingStatus: FastingStatus;
  taraweehPrayed: boolean;
  dailyGoals: {
    charity: boolean;
    quranReading: boolean;
  };
  notes: string;
}

export interface RamadanTracker {
  year: number; // Hijri year, e.g. 1447
  days: RamadanDay[];
  lastUpdated: string;
}

export interface RamadanStats {
  daysFasted: number;
  totalDays: number;
  currentStreak: number;
  longestStreak: number;
  taraweehCount: number;
  charityDays: number;
  quranDays: number;
  progressPercent: number;
}

export interface RamadanDua {
  id: number;
  dayNumber: number;
  arabic: string;
  translation: string;
  transliteration: string;
  theme: string;
}
