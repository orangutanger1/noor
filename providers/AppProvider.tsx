import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { Prayer, JournalEntry, TasbihSession, DuaEntry, QuranBookmark, LastReadPosition, QuranHighlight, HighlightColor, ReadingHistoryEntry, MAX_READING_HISTORY } from '@/types';
import { prayerNames } from '@/mocks/islamic-content';

const PRAYERS_KEY = 'noor_prayers';
const JOURNAL_KEY = 'noor_journal';
const TASBIH_KEY = 'noor_tasbih';
const DUAS_KEY = 'noor_duas';
const BOOKMARKS_KEY = 'noor_bookmarks';
const LAST_READ_KEY = 'noor_last_read';
const READING_HISTORY_KEY = 'noor_reading_history';
const HIGHLIGHTS_KEY = 'noor_highlights';
const STATS_KEY = 'noor_stats';

const getTodayDate = () => new Date().toISOString().split('T')[0];

const generateTodayPrayers = (): Prayer[] => {
  const times = ['05:30', '12:30', '15:45', '18:15', '19:45'];
  return prayerNames.map((prayer, index) => ({
    id: `${getTodayDate()}-${prayer.id}`,
    name: prayer.name,
    nameArabic: prayer.nameArabic,
    status: 'pending' as const,
    time: times[index],
  }));
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [tasbihSessions, setTasbihSessions] = useState<TasbihSession[]>([]);
  const [duaEntries, setDuaEntries] = useState<DuaEntry[]>([]);
  const [quranBookmarks, setQuranBookmarks] = useState<QuranBookmark[]>([]);
  const [lastReadPosition, setLastReadPosition] = useState<LastReadPosition | null>(null);
  const [readingHistory, setReadingHistory] = useState<ReadingHistoryEntry[]>([]);
  const [quranHighlights, setQuranHighlights] = useState<QuranHighlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prayersData, journalData, tasbihData, duasData, bookmarksData, lastReadData, readingHistoryData, highlightsData] = await Promise.all([
        AsyncStorage.getItem(PRAYERS_KEY),
        AsyncStorage.getItem(JOURNAL_KEY),
        AsyncStorage.getItem(TASBIH_KEY),
        AsyncStorage.getItem(DUAS_KEY),
        AsyncStorage.getItem(BOOKMARKS_KEY),
        AsyncStorage.getItem(LAST_READ_KEY),
        AsyncStorage.getItem(READING_HISTORY_KEY),
        AsyncStorage.getItem(HIGHLIGHTS_KEY),
      ]);

      if (prayersData) {
        const parsed = JSON.parse(prayersData);
        const today = getTodayDate();
        if (parsed.date === today) {
          setPrayers(parsed.prayers);
        } else {
          setPrayers(generateTodayPrayers());
        }
      } else {
        setPrayers(generateTodayPrayers());
      }

      if (journalData) {
        setJournalEntries(JSON.parse(journalData));
      }

      if (tasbihData) {
        setTasbihSessions(JSON.parse(tasbihData));
      }

      if (duasData) {
        setDuaEntries(JSON.parse(duasData));
      }

      if (bookmarksData) {
        setQuranBookmarks(JSON.parse(bookmarksData));
      }

      if (lastReadData) {
        setLastReadPosition(JSON.parse(lastReadData));
      }

      if (readingHistoryData) {
        setReadingHistory(JSON.parse(readingHistoryData));
      }

      if (highlightsData) {
        setQuranHighlights(JSON.parse(highlightsData));
      }
    } catch (_error) {
      setPrayers(generateTodayPrayers());
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrayerStatus = useCallback(async (prayerId: string, status: Prayer['status']) => {
    setPrayers(prev => {
      const updated = prev.map(p => 
        p.id === prayerId ? { ...p, status } : p
      );
      AsyncStorage.setItem(PRAYERS_KEY, JSON.stringify({
        date: getTodayDate(),
        prayers: updated,
      }));
      return updated;
    });
  }, []);

  const addJournalEntry = useCallback(async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJournalEntries(prev => {
      const updated = [newEntry, ...prev];
      AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteJournalEntry = useCallback(async (entryId: string) => {
    setJournalEntries(prev => {
      const updated = prev.filter(e => e.id !== entryId);
      AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const saveTasbihSession = useCallback(async (session: Omit<TasbihSession, 'id'>) => {
    const newSession: TasbihSession = {
      ...session,
      id: Date.now().toString(),
    };
    setTasbihSessions(prev => {
      const updated = [newSession, ...prev];
      AsyncStorage.setItem(TASBIH_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getPrayerStreak = useCallback(() => {
    const completedToday = prayers.filter(p => p.status === 'on_time' || p.status === 'late').length;
    return completedToday;
  }, [prayers]);

  const getTodayTasbihCount = useCallback(() => {
    const today = getTodayDate();
    return tasbihSessions
      .filter(s => s.date === today)
      .reduce((acc, s) => acc + s.count, 0);
  }, [tasbihSessions]);

  const getTotalDhikrCount = useCallback(() => {
    return tasbihSessions.reduce((acc, s) => acc + s.count, 0);
  }, [tasbihSessions]);

  const getTotalPrayersCompleted = useCallback(() => {
    // This is a simplified version - in a real app you'd track historical data
    return prayers.filter(p => p.status === 'on_time' || p.status === 'late').length;
  }, [prayers]);

  const addDuaEntry = useCallback(async (entry: Omit<DuaEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEntry: DuaEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDuaEntries(prev => {
      const updated = [newEntry, ...prev];
      AsyncStorage.setItem(DUAS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateDuaEntry = useCallback(async (entryId: string, updates: Partial<DuaEntry>) => {
    setDuaEntries(prev => {
      const updated = prev.map(e =>
        e.id === entryId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      );
      AsyncStorage.setItem(DUAS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteDuaEntry = useCallback(async (entryId: string) => {
    setDuaEntries(prev => {
      const updated = prev.filter(e => e.id !== entryId);
      AsyncStorage.setItem(DUAS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addQuranBookmark = useCallback(async (bookmark: Omit<QuranBookmark, 'id' | 'createdAt' | 'type'> & { type?: 'verse' | 'chapter' }) => {
    const bookmarkType = bookmark.type || 'verse';

    // Check for duplicate bookmarks
    const isDuplicate = quranBookmarks.some(b => {
      if (bookmarkType === 'chapter') {
        return b.type === 'chapter' && b.surahNumber === bookmark.surahNumber;
      } else {
        return b.type === 'verse' && b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber;
      }
    });

    if (isDuplicate) {
      // Don't add duplicate bookmark
      return;
    }

    const newBookmark: QuranBookmark = {
      ...bookmark,
      type: bookmarkType,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setQuranBookmarks(prev => {
      const updated = [newBookmark, ...prev];
      AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [quranBookmarks]);

  const deleteQuranBookmark = useCallback(async (bookmarkId: string) => {
    setQuranBookmarks(prev => {
      const updated = prev.filter(b => b.id !== bookmarkId);
      AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isVerseBookmarked = useCallback((surahNumber: number, ayahNumber: number): boolean => {
    return quranBookmarks.some(
      b => b.type === 'verse' && b.surahNumber === surahNumber && b.ayahNumber === ayahNumber
    );
  }, [quranBookmarks]);

  const isChapterBookmarked = useCallback((surahNumber: number): boolean => {
    return quranBookmarks.some(
      b => b.type === 'chapter' && b.surahNumber === surahNumber
    );
  }, [quranBookmarks]);

  const toggleChapterBookmark = useCallback(async (chapter: {
    surahNumber: number;
    surahName: string;
    surahNameArabic: string;
    ayahCount: number;
    revelationType: 'Meccan' | 'Medinan';
  }) => {
    const existingBookmark = quranBookmarks.find(
      b => b.type === 'chapter' && b.surahNumber === chapter.surahNumber
    );

    if (existingBookmark) {
      // Remove bookmark
      setQuranBookmarks(prev => {
        const updated = prev.filter(b => b.id !== existingBookmark.id);
        AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
        return updated;
      });
      return false;
    } else {
      // Add bookmark
      const newBookmark: QuranBookmark = {
        id: Date.now().toString(),
        type: 'chapter',
        surahNumber: chapter.surahNumber,
        surahName: chapter.surahName,
        surahNameArabic: chapter.surahNameArabic,
        ayahCount: chapter.ayahCount,
        revelationType: chapter.revelationType,
        createdAt: new Date().toISOString(),
      };
      setQuranBookmarks(prev => {
        const updated = [newBookmark, ...prev];
        AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
        return updated;
      });
      return true;
    }
  }, [quranBookmarks]);

  const updateLastRead = useCallback(async (position: Omit<LastReadPosition, 'timestamp'>) => {
    const timestamp = new Date().toISOString();
    const newPosition: LastReadPosition = {
      ...position,
      timestamp,
    };
    setLastReadPosition(newPosition);
    AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify(newPosition));

    // Update reading history
    const historyEntry: ReadingHistoryEntry = {
      ...newPosition,
      // Unique per verse — entries are deduped by surah/ayah, and Date.now() collided on same-ms updates.
      id: `${position.surahNumber}-${position.ayahNumber}`,
    };

    setReadingHistory(prev => {
      // Remove any existing entry for the same surah/ayah to avoid duplicates
      const filtered = prev.filter(
        entry => !(entry.surahNumber === position.surahNumber && entry.ayahNumber === position.ayahNumber)
      );

      // Add new entry at the beginning and limit to MAX_READING_HISTORY
      const updated = [historyEntry, ...filtered].slice(0, MAX_READING_HISTORY);
      AsyncStorage.setItem(READING_HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addQuranHighlight = useCallback(async (highlight: Omit<QuranHighlight, 'id' | 'createdAt'>) => {
    const newHighlight: QuranHighlight = {
      ...highlight,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setQuranHighlights(prev => {
      // Replace an existing highlight covering the exact same span; keep other spans.
      const filtered = prev.filter(
        h => !(
          h.surahNumber === highlight.surahNumber &&
          h.ayahNumber === highlight.ayahNumber &&
          h.field === highlight.field &&
          h.startWord === highlight.startWord &&
          h.endWord === highlight.endWord
        )
      );
      const updated = [newHighlight, ...filtered];
      AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeQuranHighlight = useCallback(async (surahNumber: number, ayahNumber: number) => {
    setQuranHighlights(prev => {
      const updated = prev.filter(
        h => !(h.surahNumber === surahNumber && h.ayahNumber === ayahNumber)
      );
      AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeQuranHighlightById = useCallback(async (id: string) => {
    setQuranHighlights(prev => {
      const updated = prev.filter(h => h.id !== id);
      AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getHighlightForAyah = useCallback((surahNumber: number, ayahNumber: number): QuranHighlight | undefined => {
    return quranHighlights.find(
      h => h.surahNumber === surahNumber && h.ayahNumber === ayahNumber
    );
  }, [quranHighlights]);

  const getHighlightsForAyah = useCallback((surahNumber: number, ayahNumber: number): QuranHighlight[] => {
    return quranHighlights.filter(
      h => h.surahNumber === surahNumber && h.ayahNumber === ayahNumber
    );
  }, [quranHighlights]);

  const clearReadingHistory = useCallback(async () => {
    setReadingHistory([]);
    AsyncStorage.setItem(READING_HISTORY_KEY, JSON.stringify([]));
  }, []);

  const deleteAllData = useCallback(async () => {
    try {
      // Clear all AsyncStorage keys for app data
      await Promise.all([
        AsyncStorage.removeItem(PRAYERS_KEY),
        AsyncStorage.removeItem(JOURNAL_KEY),
        AsyncStorage.removeItem(TASBIH_KEY),
        AsyncStorage.removeItem(DUAS_KEY),
        AsyncStorage.removeItem(BOOKMARKS_KEY),
        AsyncStorage.removeItem(LAST_READ_KEY),
        AsyncStorage.removeItem(READING_HISTORY_KEY),
        AsyncStorage.removeItem(HIGHLIGHTS_KEY),
        AsyncStorage.removeItem(STATS_KEY),
      ]);

      // Reset all state to defaults
      setPrayers(generateTodayPrayers());
      setJournalEntries([]);
      setTasbihSessions([]);
      setDuaEntries([]);
      setQuranBookmarks([]);
      setLastReadPosition(null);
      setReadingHistory([]);
      setQuranHighlights([]);
    } catch (_error) {
      throw new Error('Failed to delete data');
    }
  }, []);

  return {
    prayers,
    journalEntries,
    tasbihSessions,
    duaEntries,
    quranBookmarks,
    lastReadPosition,
    readingHistory,
    quranHighlights,
    isLoading,
    updatePrayerStatus,
    addJournalEntry,
    deleteJournalEntry,
    saveTasbihSession,
    getPrayerStreak,
    getTodayTasbihCount,
    getTotalDhikrCount,
    getTotalPrayersCompleted,
    addDuaEntry,
    updateDuaEntry,
    deleteDuaEntry,
    addQuranBookmark,
    deleteQuranBookmark,
    isVerseBookmarked,
    isChapterBookmarked,
    toggleChapterBookmark,
    updateLastRead,
    clearReadingHistory,
    addQuranHighlight,
    removeQuranHighlight,
    removeQuranHighlightById,
    getHighlightForAyah,
    getHighlightsForAyah,
    deleteAllData,
  };
});
