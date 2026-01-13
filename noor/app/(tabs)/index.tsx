import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2, BookOpen } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { dailyAyahs, dailyHadiths } from '@/mocks/islamic-content';
import { Ayah, Hadith } from '@/types';
import { AyahSeparator } from '@/components/IslamicPattern';
import { useApp } from '@/providers/AppProvider';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { getPrayerStreak, getTodayTasbihCount } = useApp();
  const [dailyAyah, setDailyAyah] = useState<Ayah | null>(null);
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyAyah(dailyAyahs[dayOfYear % dailyAyahs.length]);
    setDailyHadith(dailyHadiths[dayOfYear % dailyHadiths.length]);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleShare = async (type: 'ayah' | 'hadith') => {
    try {
      if (type === 'ayah' && dailyAyah) {
        await Share.share({
          message: `${dailyAyah.arabic}\n\n"${dailyAyah.translation}"\n\n- Surah ${dailyAyah.surahName}, Ayah ${dailyAyah.ayahNumber}\n\nShared via Noor App`,
        });
      } else if (type === 'hadith' && dailyHadith) {
        await Share.share({
          message: `"${dailyHadith.translation}"\n\n- ${dailyHadith.narrator}\n${dailyHadith.collection}, Hadith ${dailyHadith.hadithNumber}\n\nShared via Noor App`,
        });
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primaryDark, Colors.light.primary, Colors.light.cream]}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </Animated.View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getPrayerStreak()}/5</Text>
            <Text style={styles.statLabel}>Prayers Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{getTodayTasbihCount()}</Text>
            <Text style={styles.statLabel}>Dhikr Count</Text>
          </View>
        </View>

        {dailyAyah && (
          <Animated.View style={[styles.card, styles.ayahCard, { opacity: fadeAnim }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <BookOpen size={20} color={Colors.light.gold} />
                <Text style={styles.cardTitle}>Ayah of the Day</Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleShare('ayah')} 
                style={styles.shareButton}
                testID="share-ayah"
              >
                <Share2 size={18} color={Colors.light.gold} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.arabicText}>{dailyAyah.arabic}</Text>
            
            <AyahSeparator />
            
            <Text style={styles.translationText}>{`"${dailyAyah.translation}"`}</Text>
            
            <Text style={styles.transliterationText}>{dailyAyah.transliteration}</Text>
            
            <View style={styles.referenceContainer}>
              <Text style={styles.referenceText}>
                Surah {dailyAyah.surahName} ({dailyAyah.surahNameArabic}) • Ayah {dailyAyah.ayahNumber}
              </Text>
            </View>
          </Animated.View>
        )}

        {dailyHadith && (
          <Animated.View style={[styles.card, styles.hadithCard, { opacity: fadeAnim }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <BookOpen size={20} color={Colors.light.primary} />
                <Text style={[styles.cardTitle, { color: Colors.light.primary }]}>Hadith of the Day</Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleShare('hadith')} 
                style={styles.shareButton}
                testID="share-hadith"
              >
                <Share2 size={18} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.hadithArabic}>{dailyHadith.arabic}</Text>
            
            <Text style={styles.hadithTranslation}>{`"${dailyHadith.translation}"`}</Text>
            
            <View style={styles.hadithMeta}>
              <Text style={styles.narratorText}>— {dailyHadith.narrator}</Text>
              <View style={styles.sourceRow}>
                <Text style={styles.sourceText}>{dailyHadith.collection}</Text>
                <View style={[styles.gradeBadge, { backgroundColor: Colors.light.success + '20' }]}>
                  <Text style={[styles.gradeText, { color: Colors.light.success }]}>{dailyHadith.grade}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={styles.inspirationCard}>
          <Text style={styles.inspirationText}>
            {`"The best among you is the one who learns the Quran and teaches it."`}
          </Text>
          <Text style={styles.inspirationSource}>— Prophet Muhammad ﷺ</Text>
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
  bismillah: {
    fontSize: 24,
    color: Colors.light.ivory,
    fontWeight: '500',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 32,
    color: Colors.light.ivory,
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.light.goldSoft,
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.light.ivory,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  ayahCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.gold,
  },
  hadithCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  arabicText: {
    fontSize: 28,
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 48,
    fontWeight: '400',
    writingDirection: 'rtl',
  },
  translationText: {
    fontSize: 17,
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  transliterationText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  referenceContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  referenceText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  hadithArabic: {
    fontSize: 22,
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
    writingDirection: 'rtl',
  },
  hadithTranslation: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 26,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  hadithMeta: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  narratorText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 8,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  sourceText: {
    fontSize: 13,
    color: Colors.light.textMuted,
  },
  gradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  inspirationCard: {
    backgroundColor: Colors.light.primaryDark,
    borderRadius: 20,
    padding: 24,
    marginTop: 8,
  },
  inspirationText: {
    fontSize: 16,
    color: Colors.light.ivory,
    textAlign: 'center',
    lineHeight: 26,
    fontStyle: 'italic',
  },
  inspirationSource: {
    fontSize: 13,
    color: Colors.light.goldSoft,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
});
