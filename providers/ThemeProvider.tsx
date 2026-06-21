import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/colors';

const THEME_KEY = 'noor_theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme) {
        setThemeMode(savedTheme as ThemeMode);
      }
    } catch (_error) {
      // Failed to load theme, using default
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
      setThemeMode(mode);
    } catch (_error) {
      // Failed to save theme
    }
  }, []);

  const toggleDarkMode = useCallback(async () => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    await setTheme(newMode);
  }, [themeMode, setTheme]);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const colors = isDark ? Colors.dark : Colors.light;

  return {
    themeMode,
    isDark,
    colors,
    isLoading,
    setTheme,
    toggleDarkMode,
  };
});
