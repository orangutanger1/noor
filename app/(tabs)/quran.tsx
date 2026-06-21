import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
} from 'react-native';
import {
  Search,
  Bookmark,
  BookMarked,
  X,
  ChevronRight,
  Star,
  Book,
  FileText,
  History,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { shadows } from '@/constants/colors';
import { useTheme } from '@/providers/ThemeProvider';
import { useApp } from '@/providers/AppProvider';
import { quranSurahs } from '@/mocks/islamic-content';
import { Surah } from '@/types';

export default function QuranScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { quranBookmarks, deleteQuranBookmark, lastReadPosition, readingHistory } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarks, setShowBookmarks] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // Reset navigation guard when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      isNavigatingRef.current = false;
    }, [])
  );

  const filteredSurahs = quranSurahs.filter(surah =>
    surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.nameArabic.includes(searchQuery) ||
    surah.number.toString().includes(searchQuery)
  );

  const handleSurahPress = useCallback((surah: Surah) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/surah/${surah.number}`);
  }, [router]);

  const handleLastRead = useCallback(() => {
    if (isNavigatingRef.current) return;
    if (lastReadPosition) {
      isNavigatingRef.current = true;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/surah/${lastReadPosition.surahNumber}`);
    }
  }, [lastReadPosition, router]);

  const handleBookmarkPress = useCallback((bookmark: typeof quranBookmarks[0]) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowBookmarks(false);
    router.push(`/surah/${bookmark.surahNumber}`);
  }, [quranBookmarks, router]);

  const isChapterBookmarked = (surahNumber: number) => {
    return quranBookmarks.some(b => b.type === 'chapter' && b.surahNumber === surahNumber);
  };

  const hasVerseBookmark = (surahNumber: number) => {
    return quranBookmarks.some(b => (b.type === 'verse' || !b.type) && b.surahNumber === surahNumber);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Quran</Text>
            <Text style={[styles.headerArabic, { color: colors.textMuted }]}>القرآن الكريم</Text>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={20} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search surahs..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.surface }]}
              onPress={() => setShowBookmarks(true)}
            >
              <BookMarked size={20} color={colors.primary} />
              <Text style={[styles.quickActionText, { color: colors.text }]}>Bookmarks</Text>
              <Text style={[styles.quickActionCount, { color: colors.textMuted }]}>{quranBookmarks.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickAction,
                { backgroundColor: colors.surface },
                !lastReadPosition && { opacity: 0.5 },
              ]}
              onPress={handleLastRead}
              disabled={!lastReadPosition}
            >
              <Star size={20} color={colors.gold} />
              <View style={styles.lastReadInfo}>
                <Text style={[styles.quickActionText, { color: colors.text }]}>Last Read</Text>
                {lastReadPosition && (
                  <Text style={[styles.lastReadMeta, { color: colors.textMuted }]} numberOfLines={1}>
                    {lastReadPosition.surahName} : {lastReadPosition.ayahNumber}
                  </Text>
                )}
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Surah List */}
          <View style={styles.surahListHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>All Surahs</Text>
            <Text style={[styles.surahCount, { color: colors.textMuted }]}>{filteredSurahs.length} surahs</Text>
          </View>

          <View style={[styles.surahList, shadows.sm, { backgroundColor: colors.surface }]}>
            {filteredSurahs.map((surah, index) => (
              <TouchableOpacity
                key={surah.number}
                style={[
                  styles.surahItem,
                  { borderBottomColor: colors.border },
                  index === filteredSurahs.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => handleSurahPress(surah)}
                activeOpacity={0.7}
              >
                <View style={styles.surahLeft}>
                  <View style={[styles.surahNumber, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
                    <Text style={[styles.surahNumberText, { color: colors.primary }]}>{surah.number}</Text>
                  </View>
                  <View style={styles.surahInfo}>
                    <Text style={[styles.surahName, { color: colors.text }]}>{surah.name}</Text>
                    <Text style={[styles.surahMeta, { color: colors.textMuted }]}>
                      {surah.englishName} • {surah.ayahCount} ayahs
                    </Text>
                  </View>
                </View>
                <View style={styles.surahRight}>
                  <Text style={[styles.surahArabic, { color: colors.text }]}>{surah.nameArabic}</Text>
                  <View style={styles.surahBadges}>
                    <View style={[styles.typeBadge, { backgroundColor: surah.revelationType === 'Meccan' ? colors.gold + '20' : colors.primary + '20' }]}>
                      <Text style={[styles.typeText, { color: surah.revelationType === 'Meccan' ? colors.gold : colors.primary }]}>
                        {surah.revelationType}
                      </Text>
                    </View>
                    {isChapterBookmarked(surah.number) && (
                      <Bookmark size={16} color={colors.primary} fill={colors.primary} />
                    )}
                    {hasVerseBookmark(surah.number) && !isChapterBookmarked(surah.number) && (
                      <Bookmark size={16} color={colors.gold} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {filteredSurahs.length === 0 && (
            <View style={styles.emptyState}>
              <Search size={48} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No surahs found</Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Try searching with a different term
              </Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Bookmarks Modal */}
      <Modal
        visible={showBookmarks}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBookmarks(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowBookmarks(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Bookmarks</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {quranBookmarks.length === 0 ? (
              <View style={styles.emptyBookmarks}>
                <BookMarked size={48} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Bookmarks Yet</Text>
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                  Long-press any verse to bookmark it, or tap the bookmark icon in the header to bookmark a chapter
                </Text>
              </View>
            ) : (
              <>
                {/* Chapter Bookmarks */}
                {quranBookmarks.filter(b => b.type === 'chapter').length > 0 && (
                  <View style={styles.bookmarkSection}>
                    <View style={styles.bookmarkSectionHeader}>
                      <Book size={16} color={colors.primary} />
                      <Text style={[styles.bookmarkSectionTitle, { color: colors.text }]}>Chapters</Text>
                    </View>
                    {quranBookmarks
                      .filter(b => b.type === 'chapter')
                      .map(bookmark => (
                        <TouchableOpacity
                          key={bookmark.id}
                          style={[styles.bookmarkItem, { backgroundColor: colors.surface }]}
                          onPress={() => handleBookmarkPress(bookmark)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.bookmarkInfo}>
                            <View style={styles.bookmarkTitleRow}>
                              <Text style={[styles.bookmarkSurah, { color: colors.text }]}>
                                {bookmark.surahNumber}. {bookmark.surahName}
                              </Text>
                              <Text style={[styles.bookmarkArabicName, { color: colors.textMuted }]}>
                                {bookmark.surahNameArabic}
                              </Text>
                            </View>
                            <Text style={[styles.bookmarkMeta, { color: colors.textSecondary }]}>
                              {bookmark.ayahCount} verses • {bookmark.revelationType}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => deleteQuranBookmark(bookmark.id)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <X size={20} color={colors.missed} />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                  </View>
                )}

                {/* Verse Bookmarks */}
                {quranBookmarks.filter(b => b.type === 'verse' || !b.type).length > 0 && (
                  <View style={styles.bookmarkSection}>
                    <View style={styles.bookmarkSectionHeader}>
                      <FileText size={16} color={colors.gold} />
                      <Text style={[styles.bookmarkSectionTitle, { color: colors.text }]}>Verses</Text>
                    </View>
                    {quranBookmarks
                      .filter(b => b.type === 'verse' || !b.type)
                      .map(bookmark => (
                        <TouchableOpacity
                          key={bookmark.id}
                          style={[styles.bookmarkItem, { backgroundColor: colors.surface }]}
                          onPress={() => handleBookmarkPress(bookmark)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.bookmarkInfo}>
                            <Text style={[styles.bookmarkSurah, { color: colors.text }]}>
                              {bookmark.surahName} : {bookmark.ayahNumber}
                            </Text>
                            <Text style={[styles.bookmarkArabic, { color: colors.textMuted }]} numberOfLines={1}>
                              {bookmark.ayahText || bookmark.surahNameArabic}
                            </Text>
                            <Text style={[styles.bookmarkNote, { color: colors.textSecondary }]} numberOfLines={2}>
                              {bookmark.translation}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => deleteQuranBookmark(bookmark.id)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <X size={20} color={colors.missed} />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                  </View>
                )}

                {/* Reading History */}
                {readingHistory.length > 0 && (
                  <View style={styles.bookmarkSection}>
                    <View style={styles.bookmarkSectionHeader}>
                      <History size={16} color={colors.textSecondary} />
                      <Text style={[styles.bookmarkSectionTitle, { color: colors.text }]}>Reading History</Text>
                      <Text style={[styles.historyLimit, { color: colors.textMuted }]}>Last {readingHistory.length}</Text>
                    </View>
                    {readingHistory.map(entry => (
                      <TouchableOpacity
                        key={entry.id}
                        style={[styles.bookmarkItem, { backgroundColor: colors.surface }]}
                        onPress={() => handleBookmarkPress({ ...entry, id: entry.id, type: 'verse', surahNumber: entry.surahNumber, surahName: entry.surahName, surahNameArabic: entry.surahNameArabic, ayahNumber: entry.ayahNumber, createdAt: entry.timestamp })}
                        activeOpacity={0.7}
                      >
                        <View style={styles.bookmarkInfo}>
                          <Text style={[styles.bookmarkSurah, { color: colors.text }]}>
                            {entry.surahName} : {entry.ayahNumber}
                          </Text>
                          <Text style={[styles.bookmarkArabic, { color: colors.textMuted }]}>
                            {entry.surahNameArabic}
                          </Text>
                          <Text style={[styles.historyTimestamp, { color: colors.textMuted }]}>
                            {new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        <ChevronRight size={18} color={colors.textMuted} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: '300', marginBottom: 4, letterSpacing: -0.5 },
  headerArabic: { fontSize: 18 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    gap: 12,
  },
  searchInput: { flex: 1, fontSize: 16 },
  quickActions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  quickActionText: { fontSize: 14, fontWeight: '600' },
  quickActionCount: { fontSize: 13 },
  lastReadInfo: { flex: 1 },
  lastReadMeta: { fontSize: 11, marginTop: 2 },
  surahListHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600' },
  surahCount: { fontSize: 13 },
  surahList: { borderRadius: 16, overflow: 'hidden' },
  surahItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
  },
  surahLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  surahNumber: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  surahNumberText: { fontSize: 14, fontWeight: '700' },
  surahInfo: { flex: 1 },
  surahName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  surahMeta: { fontSize: 12 },
  surahRight: { alignItems: 'flex-end', gap: 6 },
  surahArabic: { fontSize: 18, fontWeight: '500' },
  surahBadges: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 10, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '600' },
  modalContent: { flex: 1 },
  modalScrollContent: { padding: 20 },
  emptyBookmarks: { alignItems: 'center', paddingVertical: 48 },
  bookmarkSection: { marginBottom: 20 },
  bookmarkSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  bookmarkSectionTitle: { fontSize: 14, fontWeight: '600' },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  bookmarkInfo: { flex: 1 },
  bookmarkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  bookmarkSurah: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  bookmarkArabicName: { fontSize: 16 },
  bookmarkArabic: { fontSize: 14, marginBottom: 4 },
  bookmarkMeta: { fontSize: 12, marginTop: 2 },
  bookmarkNote: { fontSize: 13 },
  historyLimit: { fontSize: 12, marginLeft: 'auto' },
  historyTimestamp: { fontSize: 11, marginTop: 4 },
});
