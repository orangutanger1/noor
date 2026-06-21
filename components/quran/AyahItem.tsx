import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { QuranAyah, HighlightColor, HIGHLIGHT_COLORS } from '@/types/quran';

interface AyahItemProps {
  ayah: QuranAyah;
  surahNumber: number;
  highlightColor?: HighlightColor;
  onLongPress: (ayah: QuranAyah) => void;
}

function AyahItemComponent({ ayah, surahNumber, highlightColor, onLongPress }: AyahItemProps) {
  const { colors, isDark } = useTheme();

  const backgroundColor = highlightColor
    ? isDark
      ? HIGHLIGHT_COLORS[highlightColor] + '40'
      : HIGHLIGHT_COLORS[highlightColor]
    : colors.surface;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onLongPress={() => onLongPress(ayah)}
      delayLongPress={300}
      activeOpacity={0.7}
    >
      <View style={styles.ayahHeader}>
        <View style={[styles.ayahNumberBadge, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.ayahNumberText, { color: colors.primary }]}>{ayah.number}</Text>
        </View>
      </View>
      <Text style={[styles.arabicText, { color: colors.text }]}>{ayah.arabic}</Text>
      <Text style={[styles.translationText, { color: colors.textSecondary }]}>
        {ayah.translation}
      </Text>
    </TouchableOpacity>
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
  arabicText: {
    fontSize: 24,
    lineHeight: 48,
    marginBottom: 12,
    textAlign: 'right',
    fontFamily: 'System',
  },
  translationText: {
    fontSize: 15,
    lineHeight: 24,
  },
});

export const AyahItem = memo(AyahItemComponent);
