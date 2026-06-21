import { SurahData } from '@/types/quran';

// Lazy loader for surah data - loads on demand to minimize memory usage
const surahCache = new Map<number, SurahData>();

export async function loadSurah(surahNumber: number): Promise<SurahData> {
  // Return cached data if available
  if (surahCache.has(surahNumber)) {
    return surahCache.get(surahNumber)!;
  }

  // Validate surah number
  if (surahNumber < 1 || surahNumber > 114) {
    throw new Error(`Invalid surah number: ${surahNumber}. Must be between 1 and 114.`);
  }

  // Dynamically import the surah data
  const paddedNumber = String(surahNumber).padStart(3, '0');

  let surahData: SurahData;

  // Use dynamic require for each surah
  switch (surahNumber) {
    case 1: surahData = require('./surah-001.json'); break;
    case 2: surahData = require('./surah-002.json'); break;
    case 3: surahData = require('./surah-003.json'); break;
    case 4: surahData = require('./surah-004.json'); break;
    case 5: surahData = require('./surah-005.json'); break;
    case 6: surahData = require('./surah-006.json'); break;
    case 7: surahData = require('./surah-007.json'); break;
    case 8: surahData = require('./surah-008.json'); break;
    case 9: surahData = require('./surah-009.json'); break;
    case 10: surahData = require('./surah-010.json'); break;
    case 11: surahData = require('./surah-011.json'); break;
    case 12: surahData = require('./surah-012.json'); break;
    case 13: surahData = require('./surah-013.json'); break;
    case 14: surahData = require('./surah-014.json'); break;
    case 15: surahData = require('./surah-015.json'); break;
    case 16: surahData = require('./surah-016.json'); break;
    case 17: surahData = require('./surah-017.json'); break;
    case 18: surahData = require('./surah-018.json'); break;
    case 19: surahData = require('./surah-019.json'); break;
    case 20: surahData = require('./surah-020.json'); break;
    case 21: surahData = require('./surah-021.json'); break;
    case 22: surahData = require('./surah-022.json'); break;
    case 23: surahData = require('./surah-023.json'); break;
    case 24: surahData = require('./surah-024.json'); break;
    case 25: surahData = require('./surah-025.json'); break;
    case 26: surahData = require('./surah-026.json'); break;
    case 27: surahData = require('./surah-027.json'); break;
    case 28: surahData = require('./surah-028.json'); break;
    case 29: surahData = require('./surah-029.json'); break;
    case 30: surahData = require('./surah-030.json'); break;
    case 31: surahData = require('./surah-031.json'); break;
    case 32: surahData = require('./surah-032.json'); break;
    case 33: surahData = require('./surah-033.json'); break;
    case 34: surahData = require('./surah-034.json'); break;
    case 35: surahData = require('./surah-035.json'); break;
    case 36: surahData = require('./surah-036.json'); break;
    case 37: surahData = require('./surah-037.json'); break;
    case 38: surahData = require('./surah-038.json'); break;
    case 39: surahData = require('./surah-039.json'); break;
    case 40: surahData = require('./surah-040.json'); break;
    case 41: surahData = require('./surah-041.json'); break;
    case 42: surahData = require('./surah-042.json'); break;
    case 43: surahData = require('./surah-043.json'); break;
    case 44: surahData = require('./surah-044.json'); break;
    case 45: surahData = require('./surah-045.json'); break;
    case 46: surahData = require('./surah-046.json'); break;
    case 47: surahData = require('./surah-047.json'); break;
    case 48: surahData = require('./surah-048.json'); break;
    case 49: surahData = require('./surah-049.json'); break;
    case 50: surahData = require('./surah-050.json'); break;
    case 51: surahData = require('./surah-051.json'); break;
    case 52: surahData = require('./surah-052.json'); break;
    case 53: surahData = require('./surah-053.json'); break;
    case 54: surahData = require('./surah-054.json'); break;
    case 55: surahData = require('./surah-055.json'); break;
    case 56: surahData = require('./surah-056.json'); break;
    case 57: surahData = require('./surah-057.json'); break;
    case 58: surahData = require('./surah-058.json'); break;
    case 59: surahData = require('./surah-059.json'); break;
    case 60: surahData = require('./surah-060.json'); break;
    case 61: surahData = require('./surah-061.json'); break;
    case 62: surahData = require('./surah-062.json'); break;
    case 63: surahData = require('./surah-063.json'); break;
    case 64: surahData = require('./surah-064.json'); break;
    case 65: surahData = require('./surah-065.json'); break;
    case 66: surahData = require('./surah-066.json'); break;
    case 67: surahData = require('./surah-067.json'); break;
    case 68: surahData = require('./surah-068.json'); break;
    case 69: surahData = require('./surah-069.json'); break;
    case 70: surahData = require('./surah-070.json'); break;
    case 71: surahData = require('./surah-071.json'); break;
    case 72: surahData = require('./surah-072.json'); break;
    case 73: surahData = require('./surah-073.json'); break;
    case 74: surahData = require('./surah-074.json'); break;
    case 75: surahData = require('./surah-075.json'); break;
    case 76: surahData = require('./surah-076.json'); break;
    case 77: surahData = require('./surah-077.json'); break;
    case 78: surahData = require('./surah-078.json'); break;
    case 79: surahData = require('./surah-079.json'); break;
    case 80: surahData = require('./surah-080.json'); break;
    case 81: surahData = require('./surah-081.json'); break;
    case 82: surahData = require('./surah-082.json'); break;
    case 83: surahData = require('./surah-083.json'); break;
    case 84: surahData = require('./surah-084.json'); break;
    case 85: surahData = require('./surah-085.json'); break;
    case 86: surahData = require('./surah-086.json'); break;
    case 87: surahData = require('./surah-087.json'); break;
    case 88: surahData = require('./surah-088.json'); break;
    case 89: surahData = require('./surah-089.json'); break;
    case 90: surahData = require('./surah-090.json'); break;
    case 91: surahData = require('./surah-091.json'); break;
    case 92: surahData = require('./surah-092.json'); break;
    case 93: surahData = require('./surah-093.json'); break;
    case 94: surahData = require('./surah-094.json'); break;
    case 95: surahData = require('./surah-095.json'); break;
    case 96: surahData = require('./surah-096.json'); break;
    case 97: surahData = require('./surah-097.json'); break;
    case 98: surahData = require('./surah-098.json'); break;
    case 99: surahData = require('./surah-099.json'); break;
    case 100: surahData = require('./surah-100.json'); break;
    case 101: surahData = require('./surah-101.json'); break;
    case 102: surahData = require('./surah-102.json'); break;
    case 103: surahData = require('./surah-103.json'); break;
    case 104: surahData = require('./surah-104.json'); break;
    case 105: surahData = require('./surah-105.json'); break;
    case 106: surahData = require('./surah-106.json'); break;
    case 107: surahData = require('./surah-107.json'); break;
    case 108: surahData = require('./surah-108.json'); break;
    case 109: surahData = require('./surah-109.json'); break;
    case 110: surahData = require('./surah-110.json'); break;
    case 111: surahData = require('./surah-111.json'); break;
    case 112: surahData = require('./surah-112.json'); break;
    case 113: surahData = require('./surah-113.json'); break;
    case 114: surahData = require('./surah-114.json'); break;
    default:
      throw new Error(`Invalid surah number: ${surahNumber}`);
  }

  // Cache the loaded data
  surahCache.set(surahNumber, surahData);

  return surahData;
}

// Clear cache to free memory (useful when leaving the Quran screen)
export function clearSurahCache(): void {
  surahCache.clear();
}

// Preload a range of surahs (useful for smoother navigation)
export async function preloadSurahs(start: number, end: number): Promise<void> {
  const promises: Promise<SurahData>[] = [];
  for (let i = start; i <= end && i <= 114; i++) {
    if (!surahCache.has(i)) {
      promises.push(loadSurah(i));
    }
  }
  await Promise.all(promises);
}
