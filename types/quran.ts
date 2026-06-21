// Quran-specific types

export interface QuranAyah {
  number: number;
  arabic: string;
  translation: string;
}

export interface SurahData {
  number: number;
  name: string;
  nameArabic: string;
  englishName: string;
  ayahCount: number;
  revelationType: 'Meccan' | 'Medinan';
  ayahs: QuranAyah[];
}

export interface LastReadPosition {
  surahNumber: number;
  ayahNumber: number;
  timestamp: string;
  surahName: string;
  surahNameArabic: string;
}

export interface ReadingHistoryEntry extends LastReadPosition {
  id: string;
}

export const MAX_READING_HISTORY = 10;

export interface QuranHighlight {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayahText: string;
  translation: string;
  color: HighlightColor;
  createdAt: string;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'orange';

export const HIGHLIGHT_COLORS: Record<HighlightColor, string> = {
  yellow: '#FEF3C7',
  green: '#D1FAE5',
  blue: '#DBEAFE',
  pink: '#FCE7F3',
  orange: '#FFEDD5',
};
