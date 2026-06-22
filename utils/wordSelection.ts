// Pure helpers for word-level drag selection in the Quran reader.
// Kept framework-free so the selection math is unit-testable (see wordSelection.test.js).

export interface WordFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Split text into words on whitespace. Empty tokens dropped. */
export function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

/**
 * Find the index of the word under point (px, py).
 * 1) direct hit, 2) same visual row nearest by x, 3) nearest centre overall.
 * Returns -1 only for an empty frame list.
 */
export function findWordAtPoint(frames: WordFrame[], px: number, py: number): number {
  if (frames.length === 0) return -1;

  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    if (px >= f.x && px <= f.x + f.w && py >= f.y && py <= f.y + f.h) return i;
  }

  // Same row: point's y falls within the word's vertical band.
  let rowBest = -1;
  let rowBestDx = Infinity;
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    if (py >= f.y && py <= f.y + f.h) {
      const dx = Math.abs(px - (f.x + f.w / 2));
      if (dx < rowBestDx) {
        rowBestDx = dx;
        rowBest = i;
      }
    }
  }
  if (rowBest !== -1) return rowBest;

  // Fallback: nearest centre.
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const cx = f.x + f.w / 2;
    const cy = f.y + f.h / 2;
    const d = (px - cx) ** 2 + (py - cy) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

/** Ordered inclusive range from two word indices. */
export function rangeFromIndices(a: number, b: number): { start: number; end: number } {
  return { start: Math.min(a, b), end: Math.max(a, b) };
}

/** True if word index i is inside any committed [start,end] span. */
export function indexInRanges(i: number, ranges: { start: number; end: number }[]): boolean {
  return ranges.some(r => i >= r.start && i <= r.end);
}
