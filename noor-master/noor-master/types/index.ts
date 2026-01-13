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
