import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, BookHeart, Trash2, X, Calendar } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { moodOptions } from '@/mocks/islamic-content';
import { JournalEntry } from '@/types';

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const { journalEntries, addJournalEntry, deleteJournalEntry } = useApp();
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<JournalEntry['mood']>(undefined);

  const handleSave = useCallback(() => {
    if (!content.trim()) {
      Alert.alert('Empty Entry', 'Please write something before saving.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addJournalEntry({
      date: new Date().toISOString().split('T')[0],
      content: content.trim(),
      mood: selectedMood,
    });
    setContent('');
    setSelectedMood(undefined);
    setIsWriting(false);
  }, [content, selectedMood, addJournalEntry]);

  const handleDelete = useCallback((entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this reflection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            deleteJournalEntry(entryId);
          },
        },
      ]
    );
  }, [deleteJournalEntry]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMoodEmoji = (mood?: JournalEntry['mood']) => {
    const found = moodOptions.find(m => m.id === mood);
    return found?.emoji || '';
  };

  if (isWriting) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.light.primaryDark, Colors.light.primary, Colors.light.cream]}
          locations={[0, 0.2, 0.5]}
          style={StyleSheet.absoluteFill}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.writeContainer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.writeHeader}>
              <TouchableOpacity
                onPress={() => {
                  setIsWriting(false);
                  setContent('');
                  setSelectedMood(undefined);
                }}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.light.ivory} />
              </TouchableOpacity>
              <Text style={styles.writeTitle}>New Reflection</Text>
              <TouchableOpacity
                onPress={handleSave}
                style={styles.saveButton}
                testID="save-entry"
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.moodSection}>
              <Text style={styles.moodLabel}>How are you feeling?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.moodOptions}>
                  {moodOptions.map(mood => (
                    <TouchableOpacity
                      key={mood.id}
                      style={[
                        styles.moodButton,
                        selectedMood === mood.id && styles.moodButtonSelected,
                        selectedMood === mood.id && { borderColor: mood.color },
                      ]}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setSelectedMood(mood.id as JournalEntry['mood']);
                      }}
                    >
                      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                      <Text style={[
                        styles.moodText,
                        selectedMood === mood.id && { color: mood.color },
                      ]}>
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Write your thoughts, gratitude, or reflections..."
                placeholderTextColor={Colors.light.textMuted}
                multiline
                value={content}
                onChangeText={setContent}
                autoFocus
                testID="journal-input"
              />
            </View>

            <View style={styles.promptCard}>
              <Text style={styles.promptTitle}>Reflection Prompts</Text>
              <Text style={styles.promptText}>{"• What are you grateful for today?"}</Text>
              <Text style={styles.promptText}>• How did you serve Allah today?</Text>
              <Text style={styles.promptText}>• What lesson did you learn?</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primaryDark, Colors.light.primary, Colors.light.cream]}
        locations={[0, 0.25, 0.55]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Journal</Text>
          <Text style={styles.headerArabic}>يوميات روحية</Text>
          <Text style={styles.headerSubtitle}>{journalEntries.length} reflections</Text>
        </View>

        <TouchableOpacity
          style={styles.newEntryButton}
          onPress={() => setIsWriting(true)}
          activeOpacity={0.9}
          testID="new-entry"
        >
          <View style={styles.newEntryIcon}>
            <Plus size={24} color={Colors.light.primary} />
          </View>
          <View style={styles.newEntryText}>
            <Text style={styles.newEntryTitle}>New Reflection</Text>
            <Text style={styles.newEntrySubtitle}>Record your thoughts and gratitude</Text>
          </View>
        </TouchableOpacity>

        {journalEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <BookHeart size={64} color={Colors.light.textMuted} />
            <Text style={styles.emptyTitle}>Your Journal Awaits</Text>
            <Text style={styles.emptyText}>
              Start recording your spiritual reflections, gratitude moments, and daily thoughts.
            </Text>
          </View>
        ) : (
          <View style={styles.entriesList}>
            {journalEntries.map(entry => (
              <View key={entry.id} style={styles.entryCard}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryDateRow}>
                    <Calendar size={14} color={Colors.light.textMuted} />
                    <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                    {entry.mood && (
                      <Text style={styles.entryMood}>{getMoodEmoji(entry.mood)}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDelete(entry.id)}
                    style={styles.deleteButton}
                    testID={`delete-${entry.id}`}
                  >
                    <Trash2 size={16} color={Colors.light.missed} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.entryContent} numberOfLines={4}>
                  {entry.content}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            {`"Verily, in the remembrance of Allah do hearts find rest."`}
          </Text>
          <Text style={styles.quoteSource}>{"— Surah Ar-Ra'd 13:28"}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.cream,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.ivory,
    marginBottom: 4,
  },
  headerArabic: {
    fontSize: 18,
    color: Colors.light.goldSoft,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.goldSoft,
    opacity: 0.8,
  },
  newEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.ivory,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  newEntryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  newEntryText: {
    flex: 1,
  },
  newEntryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  newEntrySubtitle: {
    fontSize: 14,
    color: Colors.light.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  entriesList: {
    gap: 12,
  },
  entryCard: {
    backgroundColor: Colors.light.ivory,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryDate: {
    fontSize: 13,
    color: Colors.light.textMuted,
    fontWeight: '500',
  },
  entryMood: {
    fontSize: 16,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  entryContent: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
  },
  quoteCard: {
    backgroundColor: Colors.light.primaryDark,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 15,
    color: Colors.light.ivory,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  quoteSource: {
    fontSize: 13,
    color: Colors.light.goldSoft,
    marginTop: 12,
  },
  keyboardView: {
    flex: 1,
  },
  writeContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  writeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    padding: 8,
  },
  writeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.ivory,
  },
  saveButton: {
    backgroundColor: Colors.light.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primaryDark,
  },
  moodSection: {
    marginBottom: 20,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.goldSoft,
    marginBottom: 12,
  },
  moodOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  moodButton: {
    alignItems: 'center',
    backgroundColor: Colors.light.ivory,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodButtonSelected: {
    backgroundColor: Colors.light.ivory,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  inputContainer: {
    flex: 1,
    backgroundColor: Colors.light.ivory,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  promptCard: {
    backgroundColor: Colors.light.primary + '15',
    borderRadius: 12,
    padding: 16,
  },
  promptTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  promptText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
});
