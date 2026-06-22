import React, { memo, useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '@/providers/ThemeProvider';
import { QuranAyah, QuranHighlight, HighlightColor, HIGHLIGHT_COLORS } from '@/types/quran';
import {
  tokenize,
  findWordAtPoint,
  rangeFromIndices,
  indexInRanges,
  WordFrame,
} from '@/utils/wordSelection';

type Field = 'arabic' | 'translation';

interface AyahItemProps {
  ayah: QuranAyah;
  surahNumber: number;
  highlights: QuranHighlight[];
  onLongPress: (ayah: QuranAyah) => void;
  onSelectWords: (ayah: QuranAyah, field: Field, start: number, end: number) => void;
}

interface CardFrame extends WordFrame {
  field: Field;
  idx: number;
}

function AyahItemComponent({ ayah, surahNumber, highlights, onLongPress, onSelectWords }: AyahItemProps) {
  const { colors, isDark } = useTheme();

  const arabicWords = useMemo(() => tokenize(ayah.arabic), [ayah.arabic]);
  const translationWords = useMemo(() => tokenize(ayah.translation), [ayah.translation]);

  // Committed word-range highlights split by field. Legacy (no field) => whole-verse tint.
  const legacy = highlights.find(h => h.field === undefined);
  const arabicRanges = highlights.filter(h => h.field === 'arabic' && h.startWord !== undefined);
  const translationRanges = highlights.filter(h => h.field === 'translation' && h.startWord !== undefined);

  const tint = (c: HighlightColor) => (isDark ? HIGHLIGHT_COLORS[c] + '40' : HIGHLIGHT_COLORS[c]);

  // Frames captured in card coordinates: blockOffset + word frame.
  const offsets = useRef<Record<Field, { x: number; y: number }>>({
    arabic: { x: 0, y: 0 },
    translation: { x: 0, y: 0 },
  });
  const wordFrames = useRef<Record<Field, WordFrame[]>>({ arabic: [], translation: [] });

  const [drag, setDrag] = useState<{ field: Field; start: number; end: number } | null>(null);
  const dragRef = useRef<{ field: Field; start: number; end: number } | null>(null);
  const setDragBoth = useCallback((d: { field: Field; start: number; end: number } | null) => {
    dragRef.current = d;
    setDrag(d);
  }, []);

  const buildCardFrames = useCallback((): CardFrame[] => {
    const out: CardFrame[] = [];
    (['arabic', 'translation'] as Field[]).forEach(field => {
      const off = offsets.current[field];
      wordFrames.current[field].forEach((f, idx) => {
        if (!f) return;
        out.push({ field, idx, x: off.x + f.x, y: off.y + f.y, w: f.w, h: f.h });
      });
    });
    return out;
  }, []);

  const dragStart = useRef<{ field: Field; idx: number } | null>(null);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        // ponytail: 250ms hold-then-drag. Tune on device vs scroll feel; raise if scrolling mis-triggers select.
        .activateAfterLongPress(250)
        .onStart(e => {
          const frames = buildCardFrames();
          const i = findWordAtPoint(frames.map(f => ({ x: f.x, y: f.y, w: f.w, h: f.h })), e.x, e.y);
          if (i < 0) return;
          const hit = frames[i];
          dragStart.current = { field: hit.field, idx: hit.idx };
          setDragBoth({ field: hit.field, start: hit.idx, end: hit.idx });
        })
        .onUpdate(e => {
          const start = dragStart.current;
          if (!start) return;
          // Constrain to the field the drag began in.
          const fieldFrames = buildCardFrames().filter(f => f.field === start.field);
          const i = findWordAtPoint(fieldFrames.map(f => ({ x: f.x, y: f.y, w: f.w, h: f.h })), e.x, e.y);
          if (i < 0) return;
          const r = rangeFromIndices(start.idx, fieldFrames[i].idx);
          setDragBoth({ field: start.field, start: r.start, end: r.end });
        })
        .onEnd(() => {
          const d = dragRef.current;
          dragStart.current = null;
          setDragBoth(null);
          if (d) onSelectWords(ayah, d.field, d.start, d.end);
        })
        .onFinalize(() => {
          dragStart.current = null;
        }),
    [buildCardFrames, setDragBoth, ayah, onSelectWords]
  );

  const longPress = useMemo(
    () =>
      Gesture.LongPress()
        .runOnJS(true)
        .minDuration(260)
        .onStart(() => onLongPress(ayah)),
    [ayah, onLongPress]
  );

  const gesture = useMemo(() => Gesture.Exclusive(pan, longPress), [pan, longPress]);

  const renderWords = (
    field: Field,
    words: string[],
    ranges: QuranHighlight[],
    baseColor: string,
    textStyle: object,
    rtl: boolean
  ) => {
    const committed = ranges.map(r => ({ start: r.startWord!, end: r.endWord!, color: r.color }));
    // Visual order: Arabic flows right-to-left; reverse render order but keep logical idx.
    const order = rtl ? [...words.keys()].reverse() : [...words.keys()];
    return (
      <View
        style={[styles.wordWrap, rtl && styles.wordWrapRtl]}
        onLayout={(e: LayoutChangeEvent) => {
          offsets.current[field] = { x: e.nativeEvent.layout.x, y: e.nativeEvent.layout.y };
        }}
      >
        {order.map(idx => {
          const selected = drag?.field === field && idx >= drag.start && idx <= drag.end;
          const committedHit = committed.find(c => idx >= c.start && idx <= c.end);
          const bg = selected
            ? colors.primary + '55'
            : committedHit
            ? tint(committedHit.color)
            : 'transparent';
          return (
            <View
              key={idx}
              style={[styles.word, { backgroundColor: bg }]}
              onLayout={(e: LayoutChangeEvent) => {
                const { x, y, width, height } = e.nativeEvent.layout;
                wordFrames.current[field][idx] = { x, y, w: width, h: height };
              }}
            >
              <Text style={[textStyle, { color: baseColor }]}>{words[idx]}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const cardBg = legacy ? tint(legacy.color) : colors.surface;

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.container, { backgroundColor: cardBg }]}>
        <View style={styles.ayahHeader}>
          <View style={[styles.ayahNumberBadge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.ayahNumberText, { color: colors.primary }]}>{ayah.number}</Text>
          </View>
        </View>
        {renderWords('arabic', arabicWords, arabicRanges, colors.text, styles.arabicText, true)}
        {renderWords('translation', translationWords, translationRanges, colors.textSecondary, styles.translationText, false)}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
  },
  ayahHeader: {
    marginBottom: 12,
  },
  ayahNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  ayahNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  wordWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  wordWrapRtl: {
    justifyContent: 'flex-end',
  },
  word: {
    borderRadius: 4,
  },
  arabicText: {
    fontSize: 24,
    lineHeight: 48,
    fontFamily: 'System',
    paddingHorizontal: 2,
  },
  translationText: {
    fontSize: 15,
    lineHeight: 24,
    paddingHorizontal: 1,
  },
});

export const AyahItem = memo(AyahItemComponent);
