import { useQuery } from '@tanstack/react-query';
import { loadSurah } from '@/data/quran';
import { SurahData } from '@/types/quran';

export function useQuranData(surahNumber: number) {
  return useQuery<SurahData, Error>({
    queryKey: ['surah', surahNumber],
    queryFn: () => loadSurah(surahNumber),
    staleTime: Infinity, // Quran data never changes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    enabled: surahNumber >= 1 && surahNumber <= 114,
  });
}
