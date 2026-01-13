import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { Prayer, JournalEntry, TasbihSession } from '@/types';
import { prayerNames } from '@/mocks/islamic-content';

const PRAYERS_KEY = 'noor_prayers';
const JOURNAL_KEY = 'noor_journal';
const TASBIH_KEY = 'noor_tasbih';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prayersData, journalData, tasbihData] = await Promise.all([
        AsyncStorage.getItem(PRAYERS_KEY),
        AsyncStorage.getItem(JOURNAL_KEY),
        AsyncStorage.getItem(TASBIH_KEY),
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
    } catch (error) {
      console.log('Error loading data:', error);
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

  return {
    prayers,
    journalEntries,
    tasbihSessions,
    isLoading,
    updatePrayerStatus,
    addJournalEntry,
    deleteJournalEntry,
    saveTasbihSession,
    getPrayerStreak,
    getTodayTasbihCount,
  };
});
