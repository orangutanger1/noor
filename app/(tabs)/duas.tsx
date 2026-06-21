import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import {
  Plus,
  Heart,
  Trash2,
  X,
  Calendar,
  Check,
  User,
  Users,
  Compass,
  Sparkles,
  MoreHorizontal,
  CheckCircle,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors, { shadows } from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { DuaEntry } from '@/types';
import { duaCategories } from '@/mocks/islamic-content';

const categoryIcons: Record<string, typeof User> = {
  personal: User,
  family: Users,
  health: Heart,
  guidance: Compass,
  gratitude: Sparkles,
  other: MoreHorizontal,
};

export default function DuasScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { duaEntries, addDuaEntry, updateDuaEntry, deleteDuaEntry, journalEntries } = useApp();
  const [isWriting, setIsWriting] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DuaEntry['category']>('personal');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'answered'>('all');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleSave = useCallback(() => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please enter both a title and your dua.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addDuaEntry({
      date: new Date().toISOString().split('T')[0],
      title: title.trim(),
      content: content.trim(),
      category: selectedCategory,
      isAnswered: false,
    });
    setTitle('');
    setContent('');
    setSelectedCategory('personal');
    setIsWriting(false);
  }, [title, content, selectedCategory, addDuaEntry]);

  const handleMarkAnswered = useCallback((entryId: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateDuaEntry(entryId, {
      isAnswered: true,
      answeredDate: new Date().toISOString().split('T')[0],
    });
  }, [updateDuaEntry]);

  const handleDelete = useCallback((entryId: string) => {
    Alert.alert(
      'Delete Dua',
      'Are you sure you want to delete this dua?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            deleteDuaEntry(entryId);
          },
        },
      ]
    );
  }, [deleteDuaEntry]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryInfo = (category: DuaEntry['category']) => {
    const info = duaCategories.find(c => c.id === category);
    return info || duaCategories[5];
  };

  const filteredDuas = duaEntries.filter(dua => {
    if (activeFilter === 'active') return !dua.isAnswered;
    if (activeFilter === 'answered') return dua.isAnswered;
    return true;
  });

  const activeDuas = duaEntries.filter(d => !d.isAnswered).length;
  const answeredDuas = duaEntries.filter(d => d.isAnswered).length;

  if (isWriting) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.writeContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.writeHeader}>
              <TouchableOpacity
                onPress={() => {
                  setIsWriting(false);
                  setTitle('');
                  setContent('');
                }}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.writeTitle, { color: colors.text }]}>New Dua</Text>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.categorySection}>
              <Text style={[styles.categoryLabel, { color: colors.textMuted }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryOptions}>
                  {duaCategories.map(category => {
                    const Icon = categoryIcons[category.id];
                    const isSelected = selectedCategory === category.id;
                    return (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryButton,
                          { backgroundColor: colors.surface, borderColor: isSelected ? category.color : colors.border },
                          isSelected && { borderWidth: 2 },
                        ]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setSelectedCategory(category.id as DuaEntry['category']);
                        }}
                      >
                        <Icon size={18} color={isSelected ? category.color : colors.textMuted} />
                        <Text style={[styles.categoryText, { color: isSelected ? category.color : colors.textSecondary }]}>
                          {category.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.titleInput, { color: colors.text }]}
                placeholder="Title (e.g., 'For my family's health')"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
              <View style={[styles.inputDivider, { backgroundColor: colors.border }]} />
              <TextInput
                style={[styles.textInput, { color: colors.text }]}
                placeholder="Write your dua or what you're asking Allah for..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={content}
                onChangeText={setContent}
              />
            </View>

            <View style={[styles.promptCard, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
              <Text style={[styles.promptTitle, { color: colors.primary }]}>Remember</Text>
              <Text style={[styles.promptText, { color: colors.textSecondary }]}>
                Make dua with sincerity and trust in Allah's wisdom. He hears all prayers.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Duas</Text>
            <Text style={[styles.headerArabic, { color: colors.textMuted }]}>الدعاء</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>
              {activeDuas} active • {answeredDuas} answered
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.newEntryButton, shadows.sm, { backgroundColor: colors.surface }]}
            onPress={() => setIsWriting(true)}
            activeOpacity={0.9}
          >
            <View style={[styles.newEntryIcon, { backgroundColor: colors.primary + '15' }]}>
              <Plus size={24} color={colors.primary} />
            </View>
            <View style={styles.newEntryText}>
              <Text style={[styles.newEntryTitle, { color: colors.text }]}>New Dua</Text>
              <Text style={[styles.newEntrySubtitle, { color: colors.textMuted }]}>Record a prayer or request</Text>
            </View>
          </TouchableOpacity>

          {/* Filter Tabs */}
          <View style={[styles.filterTabs, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
            {(['all', 'active', 'answered'] as const).map(filter => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterTab, activeFilter === filter && { backgroundColor: colors.primary }]}
                onPress={() => { Haptics.selectionAsync(); setActiveFilter(filter); }}
              >
                <Text style={[styles.filterText, activeFilter === filter && { color: '#FFF' }]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredDuas.length === 0 ? (
            <View style={styles.emptyState}>
              <Heart size={64} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {activeFilter === 'answered' ? 'No Answered Duas Yet' : 'Your Duas Await'}
              </Text>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {activeFilter === 'answered'
                  ? 'Mark your duas as answered when Allah grants them'
                  : 'Start recording your prayers and watch as Allah answers them'}
              </Text>
            </View>
          ) : (
            <View style={styles.duasList}>
              {filteredDuas.map(dua => {
                const categoryInfo = getCategoryInfo(dua.category);
                const CategoryIcon = categoryIcons[dua.category];
                return (
                  <View key={dua.id} style={[styles.duaCard, shadows.sm, { backgroundColor: colors.surface }]}>
                    <View style={styles.duaHeader}>
                      <View style={styles.duaCategoryRow}>
                        <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color + '15' }]}>
                          <CategoryIcon size={16} color={categoryInfo.color} />
                        </View>
                        <Text style={[styles.duaTitle, { color: colors.text }]} numberOfLines={1}>
                          {dua.title}
                        </Text>
                      </View>
                      <View style={styles.duaActions}>
                        {!dua.isAnswered && (
                          <TouchableOpacity
                            onPress={() => handleMarkAnswered(dua.id)}
                            style={[styles.answerButton, { backgroundColor: colors.success + '15' }]}
                          >
                            <CheckCircle size={16} color={colors.success} />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => handleDelete(dua.id)}
                          style={styles.deleteButton}
                        >
                          <Trash2 size={16} color={colors.missed} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={[styles.duaContent, { color: colors.text }]} numberOfLines={3}>
                      {dua.content}
                    </Text>

                    <View style={styles.duaFooter}>
                      <View style={styles.duaDateRow}>
                        <Calendar size={12} color={colors.textMuted} />
                        <Text style={[styles.duaDate, { color: colors.textMuted }]}>{formatDate(dua.date)}</Text>
                      </View>
                      {dua.isAnswered && (
                        <View style={[styles.answeredBadge, { backgroundColor: colors.success + '15' }]}>
                          <Check size={12} color={colors.success} />
                          <Text style={[styles.answeredText, { color: colors.success }]}>Answered</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          <View style={[styles.quoteCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.quoteText}>
              {`"And your Lord says: Call upon Me; I will respond to you."`}
            </Text>
            <Text style={styles.quoteSource}>— Surah Ghafir 40:60</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: '300', marginBottom: 4, letterSpacing: -0.5 },
  headerArabic: { fontSize: 18, marginBottom: 8 },
  headerSubtitle: { fontSize: 14 },
  newEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  newEntryIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  newEntryText: { flex: 1 },
  newEntryTitle: { fontSize: 17, fontWeight: '600', marginBottom: 4 },
  newEntrySubtitle: { fontSize: 14 },
  filterTabs: { flexDirection: 'row', borderRadius: 10, padding: 4, marginBottom: 20 },
  filterTab: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.light.textSecondary },
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  duasList: { gap: 12 },
  duaCard: { borderRadius: 16, padding: 16 },
  duaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  duaCategoryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  categoryIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  duaTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  duaActions: { flexDirection: 'row', gap: 8 },
  answerButton: { padding: 8, borderRadius: 8 },
  deleteButton: { padding: 8, borderRadius: 8 },
  duaContent: { fontSize: 15, lineHeight: 22, marginBottom: 12 },
  duaFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  duaDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  duaDate: { fontSize: 12 },
  answeredBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  answeredText: { fontSize: 11, fontWeight: '600' },
  quoteCard: { borderRadius: 16, padding: 20, marginTop: 24, alignItems: 'center' },
  quoteText: { fontSize: 15, color: '#FFF', textAlign: 'center', fontStyle: 'italic', lineHeight: 24 },
  quoteSource: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 12 },
  keyboardView: { flex: 1 },
  writeContainer: { flex: 1, paddingHorizontal: 20 },
  writeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  closeButton: { padding: 8 },
  writeTitle: { fontSize: 18, fontWeight: '600' },
  saveButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  saveText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  categorySection: { marginBottom: 20 },
  categoryLabel: { fontSize: 14, fontWeight: '500', marginBottom: 12 },
  categoryOptions: { flexDirection: 'row', gap: 10 },
  categoryButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, gap: 8 },
  categoryText: { fontSize: 13, fontWeight: '500' },
  inputContainer: { flex: 1, borderRadius: 16, padding: 16, marginBottom: 16 },
  titleInput: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  inputDivider: { height: 1, marginBottom: 12 },
  textInput: { flex: 1, fontSize: 16, lineHeight: 24, textAlignVertical: 'top' },
  promptCard: { borderRadius: 12, padding: 16 },
  promptTitle: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  promptText: { fontSize: 13, lineHeight: 20 },
});
