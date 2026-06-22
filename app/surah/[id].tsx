import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import {
  ChevronLeft,
  Bookmark,
  Highlighter,
  Copy,
  X,
} from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useApp } from '@/providers/AppProvider';
import { useQuranData } from '@/hooks/useQuranData';
import { AyahItem } from '@/components/quran/AyahItem';
import { HighlightColorPicker } from '@/components/quran/HighlightColorPicker';
import { QuranAyah, HighlightColor } from '@/types/quran';

export default function SurahScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const surahNumber = parseInt(id || '1', 10);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const {
    addQuranBookmark,
    updateLastRead,
    addQuranHighlight,
    removeQuranHighlight,
    getHighlightsForAyah,
    lastReadPosition,
    isChapterBookmarked,
    toggleChapterBookmark,
  } = useApp();

  const { data: surah, isLoading, error } = useQuranData(surahNumber);
  const flatListRef = useRef<FlatList>(null);

  const [selectedAyah, setSelectedAyah] = useState<QuranAyah | null>(null);
  const [wordSelection, setWordSelection] = useState<
    { field: 'arabic' | 'translation'; start: number; end: number } | null
  >(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [hasScrolledToLastRead, setHasScrolledToLastRead] = useState(false);

  const chapterIsBookmarked = surah ? isChapterBookmarked(surah.number) : false;

  const handleToggleChapterBookmark = useCallback(async () => {
    if (!surah) return;

    const wasAdded = await toggleChapterBookmark({
      surahNumber: surah.number,
      surahName: surah.name,
      surahNameArabic: surah.nameArabic,
      ayahCount: surah.ayahCount,
      revelationType: surah.revelationType,
    });

    Haptics.notificationAsync(
      wasAdded
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
  }, [surah, toggleChapterBookmark]);

  // Scroll to last read position if returning to same surah
  useEffect(() => {
    if (
      surah &&
      lastReadPosition &&
      lastReadPosition.surahNumber === surahNumber &&
      !hasScrolledToLastRead
    ) {
      const ayahIndex = lastReadPosition.ayahNumber - 1;
      if (ayahIndex > 0 && ayahIndex < surah.ayahs.length) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: ayahIndex,
            animated: true,
            viewPosition: 0,
          });
        }, 500);
      }
      setHasScrolledToLastRead(true);
    }
  }, [surah, lastReadPosition, surahNumber, hasScrolledToLastRead]);

  const handleAyahLongPress = useCallback((ayah: QuranAyah) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedAyah(ayah);
    setShowContextMenu(true);
  }, []);

  const handleBookmark = useCallback(() => {
    if (!selectedAyah || !surah) return;

    addQuranBookmark({
      surahNumber: surah.number,
      surahName: surah.name,
      surahNameArabic: surah.nameArabic,
      ayahNumber: selectedAyah.number,
      ayahText: selectedAyah.arabic,
      translation: selectedAyah.translation,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowContextMenu(false);
    setSelectedAyah(null);

    Alert.alert('Bookmarked', `Verse ${selectedAyah.number} has been bookmarked.`);
  }, [selectedAyah, surah, addQuranBookmark]);

  const handleHighlight = useCallback(() => {
    setWordSelection(null); // context-menu highlight = whole verse
    setShowContextMenu(false);
    setShowColorPicker(true);
  }, []);

  const handleSelectWords = useCallback(
    (ayah: QuranAyah, field: 'arabic' | 'translation', start: number, end: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedAyah(ayah);
      setWordSelection({ field, start, end });
      setShowColorPicker(true);
    },
    []
  );

  const handleSelectHighlightColor = useCallback(
    (color: HighlightColor) => {
      if (!selectedAyah || !surah) return;

      addQuranHighlight({
        surahNumber: surah.number,
        ayahNumber: selectedAyah.number,
        surahName: surah.name,
        surahNameArabic: surah.nameArabic,
        ayahText: selectedAyah.arabic,
        translation: selectedAyah.translation,
        color,
        ...(wordSelection
          ? { field: wordSelection.field, startWord: wordSelection.start, endWord: wordSelection.end }
          : {}),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setWordSelection(null);
      setSelectedAyah(null);
    },
    [selectedAyah, surah, addQuranHighlight, wordSelection]
  );

  const handleRemoveHighlight = useCallback(() => {
    if (!selectedAyah || !surah) return;
    removeQuranHighlight(surah.number, selectedAyah.number);
    setWordSelection(null);
    setSelectedAyah(null);
  }, [selectedAyah, surah, removeQuranHighlight]);

  const handleCopy = useCallback(async () => {
    if (!selectedAyah || !surah) return;

    const text = `${selectedAyah.arabic}\n\n${selectedAyah.translation}\n\n- ${surah.name} ${selectedAyah.number}`;
    await Clipboard.setStringAsync(text);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowContextMenu(false);
    setSelectedAyah(null);

    Alert.alert('Copied', 'Verse copied to clipboard.');
  }, [selectedAyah, surah]);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ item: QuranAyah }> }) => {
      if (viewableItems.length > 0 && surah) {
        const firstVisibleAyah = viewableItems[0].item;
        updateLastRead({
          surahNumber: surah.number,
          ayahNumber: firstVisibleAyah.number,
          surahName: surah.name,
          surahNameArabic: surah.nameArabic,
        });
      }
    },
    [surah, updateLastRead]
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 1000,
  }).current;

  const renderAyah = useCallback(
    ({ item }: { item: QuranAyah }) => {
      const highlights = getHighlightsForAyah(surahNumber, item.number);
      return (
        <AyahItem
          ayah={item}
          surahNumber={surahNumber}
          highlights={highlights}
          onLongPress={handleAyahLongPress}
          onSelectWords={handleSelectWords}
        />
      );
    },
    [surahNumber, getHighlightsForAyah, handleAyahLongPress, handleSelectWords]
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<QuranAyah> | null | undefined, index: number) => ({
      length: 200,
      offset: 200 * index,
      index,
    }),
    []
  );

  const onScrollToIndexFailed = useCallback(
    (info: { index: number; highestMeasuredFrameIndex: number }) => {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: Math.min(info.index, info.highestMeasuredFrameIndex),
          animated: true,
        });
      }, 100);
    },
    []
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Loading surah...</Text>
      </View>
    );
  }

  if (error || !surah) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.missed }]}>
          Failed to load surah. Please try again.
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ListHeaderComponent = () => (
    <View style={styles.headerContent}>
      <Text style={[styles.surahNameArabic, { color: colors.text }]}>{surah.nameArabic}</Text>
      <Text style={[styles.surahNameEnglish, { color: colors.textMuted }]}>{surah.englishName}</Text>
      <Text style={[styles.surahMeta, { color: colors.textSecondary }]}>
        {surah.ayahCount} verses | {surah.revelationType}
      </Text>

      {surahNumber !== 9 && (
        <View style={[styles.bismillah, { backgroundColor: colors.surface }]}>
          <Text style={[styles.bismillahArabic, { color: colors.text }]}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>
          <Text style={[styles.bismillahEnglish, { color: colors.textMuted }]}>
            In the name of Allah, the Most Gracious, the Most Merciful
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: surah.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronLeft size={24} color={colors.ivory} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleToggleChapterBookmark} style={styles.headerBookmarkButton}>
              <Bookmark
                size={22}
                color={colors.ivory}
                fill={chapterIsBookmarked ? colors.ivory : 'transparent'}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          ref={flatListRef}
          data={surah.ayahs}
          renderItem={renderAyah}
          keyExtractor={(item) => `${surahNumber}-${item.number}`}
          ListHeaderComponent={ListHeaderComponent}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={getItemLayout}
          onScrollToIndexFailed={onScrollToIndexFailed}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      </View>

      {/* Context Menu Modal */}
      <Modal
        visible={showContextMenu}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowContextMenu(false);
          setSelectedAyah(null);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowContextMenu(false);
            setSelectedAyah(null);
          }}
        >
          <View style={[styles.contextMenu, { backgroundColor: colors.surface }]}>
            <View style={[styles.contextMenuHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.contextMenuTitle, { color: colors.text }]}>
                Verse {selectedAyah?.number}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowContextMenu(false);
                  setSelectedAyah(null);
                }}
              >
                <X size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.contextMenuItem} onPress={handleBookmark}>
              <Bookmark size={20} color={colors.primary} />
              <Text style={[styles.contextMenuItemText, { color: colors.text }]}>Bookmark</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contextMenuItem} onPress={handleHighlight}>
              <Highlighter size={20} color={colors.gold} />
              <Text style={[styles.contextMenuItemText, { color: colors.text }]}>Highlight</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contextMenuItem} onPress={handleCopy}>
              <Copy size={20} color={colors.textSecondary} />
              <Text style={[styles.contextMenuItemText, { color: colors.text }]}>Copy</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Highlight Color Picker */}
      <HighlightColorPicker
        visible={showColorPicker}
        onClose={() => {
          setShowColorPicker(false);
          setWordSelection(null);
          setSelectedAyah(null);
        }}
        onSelectColor={handleSelectHighlightColor}
        onRemoveHighlight={handleRemoveHighlight}
        currentColor={undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    marginLeft: 8,
  },
  headerBookmarkButton: {
    marginRight: 8,
    padding: 4,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  surahNameArabic: {
    fontSize: 36,
    fontWeight: '400',
    marginBottom: 8,
  },
  surahNameEnglish: {
    fontSize: 16,
    marginBottom: 4,
  },
  surahMeta: {
    fontSize: 13,
    marginBottom: 20,
  },
  bismillah: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  bismillahArabic: {
    fontSize: 24,
    marginBottom: 8,
  },
  bismillahEnglish: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contextMenu: {
    width: '80%',
    maxWidth: 280,
    borderRadius: 12,
    overflow: 'hidden',
  },
  contextMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  contextMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  contextMenuItemText: {
    fontSize: 15,
  },
});
