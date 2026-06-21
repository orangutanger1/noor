export interface Ayah {
  id: number;
  surah: number;
  surahName: string;
  surahNameArabic: string;
  ayahNumber: number;
  arabic: string;
  translation: string;
  transliteration: string;
}

export interface Hadith {
  id: number;
  collection: string;
  bookNumber: number;
  hadithNumber: number;
  arabic: string;
  translation: string;
  narrator: string;
  grade: 'Sahih' | 'Hasan' | 'Da\'if';
}

export interface PrayerTime {
  name: string;
  nameArabic: string;
  time: string;
  isNext: boolean;
}

export interface Prayer {
  id: string;
  name: string;
  nameArabic: string;
  status: 'pending' | 'on_time' | 'late' | 'missed';
  time: string;
}

export interface DailyPrayers {
  date: string;
  prayers: Prayer[];
}

export interface TasbihPreset {
  id: string;
  name: string;
  nameArabic: string;
  arabic: string;
  target: number;
}

export interface TasbihSession {
  id: string;
  presetId: string;
  count: number;
  target: number;
  date: string;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: 'grateful' | 'peaceful' | 'reflective' | 'hopeful' | 'struggling';
  createdAt: string;
  updatedAt: string;
}

export interface DuaEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  category: 'personal' | 'family' | 'health' | 'guidance' | 'gratitude' | 'other';
  isAnswered?: boolean;
  answeredDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type QuranBookmarkType = 'verse' | 'chapter';

export interface QuranBookmark {
  id: string;
  type: QuranBookmarkType;
  surahNumber: number;
  surahName: string;
  surahNameArabic: string;
  ayahNumber?: number; // Optional for chapter bookmarks
  ayahText?: string; // Optional for chapter bookmarks
  translation?: string; // Optional for chapter bookmarks
  ayahCount?: number; // For chapter bookmarks
  revelationType?: 'Meccan' | 'Medinan'; // For chapter bookmarks
  note?: string;
  highlightColor?: string;
  createdAt: string;
}

export interface Surah {
  number: number;
  name: string;
  nameArabic: string;
  englishName: string;
  ayahCount: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface UserSettings {
  calculationMethod: 'ISNA' | 'MWL' | 'Egyptian';
  notifications: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    preReminder: number;
  };
  language: 'en' | 'ar';
}

export interface UserStats {
  totalPrayers: number;
  totalDhikr: number;
  totalDuas: number;
  currentStreak: number;
  longestStreak: number;
}

// Subscription Types
export type SubscriptionPlan = 'monthly' | 'yearly';

export interface SubscriptionInfo {
  isActive: boolean;
  plan: SubscriptionPlan | null;
  expirationDate: string | null;
  willRenew: boolean;
  price?: string;
  productIdentifier?: string;
}

export interface PurchasePackageInfo {
  identifier: string;
  price: string;
  pricePerMonth?: string;
  title: string;
  description: string;
  introPrice?: string;
  introDuration?: string;
}

// Re-export quran types
export * from './quran';

// Re-export ramadan types
export * from './ramadan';
