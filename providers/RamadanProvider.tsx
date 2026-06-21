import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { RamadanTracker, RamadanDay, RamadanStats, FastingStatus } from '@/types/ramadan';
import { getRamadanConfig, getRamadanDayNumber, isRamadanActive, isRamadanSeason, getDateForDay } from '@/data/ramadan';

const RAMADAN_KEY = 'noor_ramadan';

// Computed once at launch; the active-or-next Ramadan stays fixed for the session.
const ramadanConfig = getRamadanConfig();

const createDefaultTracker = (): RamadanTracker => ({
  year: ramadanConfig.year,
  days: Array.from({ length: ramadanConfig.totalDays }, (_, i) => ({
    dayNumber: i + 1,
    date: getDateForDay(i + 1).toISOString().split('T')[0],
    fastingStatus: 'pending' as FastingStatus,
    taraweehPrayed: false,
    dailyGoals: { charity: false, quranReading: false },
    notes: '',
  })),
  lastUpdated: new Date().toISOString(),
});

export const [RamadanProvider, useRamadan] = createContextHook(() => {
  const [tracker, setTracker] = useState<RamadanTracker>(createDefaultTracker());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem(RAMADAN_KEY);
      if (data) {
        const parsed: RamadanTracker = JSON.parse(data);
        if (parsed.year === ramadanConfig.year) {
          setTracker(parsed);
        } else {
          // Different year — start fresh
          setTracker(createDefaultTracker());
        }
      }
    } catch (_error) {
      // Use default
    } finally {
      setIsLoading(false);
    }
  };

  const updateDay = useCallback((dayNumber: number, updater: (day: RamadanDay) => RamadanDay) => {
    setTracker(prev => {
      const updated = {
        ...prev,
        days: prev.days.map(d => d.dayNumber === dayNumber ? updater(d) : d),
        lastUpdated: new Date().toISOString(),
      };
      AsyncStorage.setItem(RAMADAN_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateFastingStatus = useCallback((dayNumber: number, status: FastingStatus) => {
    updateDay(dayNumber, day => ({ ...day, fastingStatus: status }));
  }, [updateDay]);

  const toggleTaraweeh = useCallback((dayNumber: number) => {
    updateDay(dayNumber, day => ({ ...day, taraweehPrayed: !day.taraweehPrayed }));
  }, [updateDay]);

  const toggleDailyGoal = useCallback((dayNumber: number, goal: 'charity' | 'quranReading') => {
    updateDay(dayNumber, day => ({
      ...day,
      dailyGoals: { ...day.dailyGoals, [goal]: !day.dailyGoals[goal] },
    }));
  }, [updateDay]);

  const currentDayNumber = useMemo(() => getRamadanDayNumber(), []);
  const isActive = useMemo(() => isRamadanActive(), []);
  const isSeason = useMemo(() => isRamadanSeason(), []);

  const stats: RamadanStats = useMemo(() => {
    const days = tracker.days;
    const daysFasted = days.filter(d => d.fastingStatus === 'fasted').length;
    const taraweehCount = days.filter(d => d.taraweehPrayed).length;
    const charityDays = days.filter(d => d.dailyGoals.charity).length;
    const quranDays = days.filter(d => d.dailyGoals.quranReading).length;

    // Calculate current streak (consecutive fasted days ending at current or most recent day)
    let currentStreak = 0;
    const upTo = currentDayNumber > 0 ? currentDayNumber : ramadanConfig.totalDays;
    for (let i = upTo - 1; i >= 0; i--) {
      if (days[i].fastingStatus === 'fasted') {
        currentStreak++;
      } else if (days[i].fastingStatus !== 'pending') {
        break;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let streak = 0;
    for (const day of days) {
      if (day.fastingStatus === 'fasted') {
        streak++;
        longestStreak = Math.max(longestStreak, streak);
      } else {
        streak = 0;
      }
    }

    const totalDays = currentDayNumber > 0 ? currentDayNumber : 0;
    const progressPercent = totalDays > 0 ? Math.round((daysFasted / totalDays) * 100) : 0;

    return {
      daysFasted,
      totalDays,
      currentStreak,
      longestStreak,
      taraweehCount,
      charityDays,
      quranDays,
      progressPercent,
    };
  }, [tracker.days, currentDayNumber]);

  return {
    tracker,
    isLoading,
    stats,
    currentDayNumber,
    isActive,
    isSeason,
    updateFastingStatus,
    toggleTaraweeh,
    toggleDailyGoal,
  };
});
