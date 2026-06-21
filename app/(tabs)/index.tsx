import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
} from 'react-native';
import { Share2, BookOpen, Sparkles, Moon, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shadows } from '@/constants/colors';
import { dailyAyahs, dailyHadiths } from '@/mocks/islamic-content';
import { Ayah, Hadith } from '@/types';
import { AyahSeparator } from '@/components/IslamicPattern';
import { useRouter } from 'expo-router';
import { useApp } from '@/providers/AppProvider';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { useRamadan } from '@/providers/RamadanProvider';
import { daysUntilRamadan, getRamadanConfig } from '@/data/ramadan';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { getPrayerStreak, getTodayTasbihCount } = useApp();
  const { userProfile } = useOnboarding();
  const firstName = userProfile.name ? userProfile.name.split(' ')[0] : '';
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { stats, currentDayNumber, isSeason, isActive } = useRamadan();
  const [dailyAyah, setDailyAyah] = useState<Ayah | null>(null);
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);

  const showRamadanCard = isSeason || isActive;
  const ramadanStartLabel = getRamadanConfig().startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Staggered entrance animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(20)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsTranslate = useRef(new Animated.Value(30)).current;
  const ramadanOpacity = useRef(new Animated.Value(0)).current;
  const ramadanTranslate = useRef(new Animated.Value(35)).current;
  const ayahOpacity = useRef(new Animated.Value(0)).current;
  const ayahTranslate = useRef(new Animated.Value(40)).current;
  const hadithOpacity = useRef(new Animated.Value(0)).current;
  const hadithTranslate = useRef(new Animated.Value(40)).current;
  const inspirationOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyAyah(dailyAyahs[dayOfYear % dailyAyahs.length]);
    setDailyHadith(dailyHadiths[dayOfYear % dailyHadiths.length]);

    // Orchestrated entrance animation
    const animationSequence = [
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(headerTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(statsOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(statsTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ];

    if (showRamadanCard) {
      animationSequence.push(
        Animated.parallel([
          Animated.timing(ramadanOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(ramadanTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
      );
    }

    animationSequence.push(
      Animated.parallel([
        Animated.timing(ayahOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(ayahTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(hadithOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(hadithTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(inspirationOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
    );

    Animated.stagger(120, animationSequence).start();
  }, []);

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
    } catch (_error) {
      // Sharing failed
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting: { arabic: string; english: string };
    if (hour < 12) {
      timeGreeting = { arabic: 'صباح الخير', english: 'Good Morning' };
    } else if (hour < 17) {
      timeGreeting = { arabic: 'مساء الخير', english: 'Good Afternoon' };
    } else {
      timeGreeting = { arabic: 'مساء النور', english: 'Good Evening' };
    }

    // Add name to English greeting if available
    if (firstName) {
      timeGreeting.english = `${timeGreeting.english}, ${firstName}`;
    }

    return timeGreeting;
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const greeting = getGreeting();
  const prayerStreak = getPrayerStreak();
  const dhikrCount = getTodayTasbihCount();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            { opacity: headerOpacity, transform: [{ translateY: headerTranslate }] },
          ]}
        >
          {/* Arabic Texts */}
          <View style={styles.arabicHeader}>
            <Text style={[styles.bismillah, { color: colors.textMuted }]}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
            <Text style={[styles.greetingArabic, { color: colors.text }]}>{greeting.arabic}</Text>
          </View>

          {/* Main Greeting */}
          <View style={styles.greetingContainer}>
            <Text style={[styles.greetingEnglish, { color: colors.text }]}>{greeting.english}</Text>
            <Text style={[styles.date, { color: colors.textMuted }]}>{formatDate()}</Text>
          </View>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View
          style={[
            styles.statsRow,
            { opacity: statsOpacity, transform: [{ translateY: statsTranslate }] },
          ]}
        >
          <View style={[styles.statCard, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.statIconContainer, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
              <Sparkles size={18} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{prayerStreak}/5</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Prayers Today</Text>
          </View>
          <View style={[styles.statCard, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.statIconContainer, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
              <View style={[styles.dhikrDot, { backgroundColor: colors.primary }]} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>{dhikrCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Dhikr Count</Text>
          </View>
        </Animated.View>

        {/* Ramadan Card */}
        {showRamadanCard && (
          <Animated.View
            style={[
              { opacity: ramadanOpacity, transform: [{ translateY: ramadanTranslate }] },
            ]}
          >
            <TouchableOpacity
              style={[styles.ramadanCard, shadows.sm]}
              activeOpacity={0.85}
              onPress={() => router.push('/ramadan' as any)}
            >
              <View style={styles.ramadanContent}>
                <View style={styles.ramadanIconContainer}>
                  <Moon size={24} color="#FFF" />
                </View>
                <View style={styles.ramadanTextContainer}>
                  {isActive ? (
                    <>
                      <Text style={styles.ramadanTitle}>Ramadan Day {currentDayNumber}</Text>
                      <Text style={styles.ramadanSubtitle}>{stats.daysFasted} days fasted</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.ramadanTitle}>Ramadan is Coming</Text>
                      <Text style={styles.ramadanSubtitle}>Starts {ramadanStartLabel} — {daysUntilRamadan()} days away</Text>
                    </>
                  )}
                </View>
                <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
              </View>
              {isActive && stats.totalDays > 0 && (
                <View style={styles.ramadanProgressBar}>
                  <View style={[styles.ramadanProgressFill, { width: `${stats.progressPercent}%` }]} />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Ayah of the Day */}
        {dailyAyah && (
          <Animated.View
            style={[
              styles.card,
              shadows.sm,
              { opacity: ayahOpacity, transform: [{ translateY: ayahTranslate }], backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardIconContainer, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
                  <BookOpen size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Ayah of the Day</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>آية اليوم</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleShare('ayah')}
                style={[styles.shareButton, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}
                activeOpacity={0.7}
              >
                <Share2 size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.arabicText, { color: colors.text }]}>{dailyAyah.arabic}</Text>

            <AyahSeparator />

            <Text style={[styles.translationText, { color: colors.text }]}>{`"${dailyAyah.translation}"`}</Text>

            <Text style={[styles.transliterationText, { color: colors.textMuted }]}>{dailyAyah.transliteration}</Text>

            <View style={[styles.referenceContainer, { borderTopColor: colors.border }]}>
              <Text style={[styles.referenceText, { color: colors.textSecondary }]}>
                Surah {dailyAyah.surahName} ({dailyAyah.surahNameArabic}) • Ayah {dailyAyah.ayahNumber}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Hadith of the Day */}
        {dailyHadith && (
          <Animated.View
            style={[
              styles.card,
              shadows.sm,
              { opacity: hadithOpacity, transform: [{ translateY: hadithTranslate }], backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardIconContainer, { backgroundColor: isDark ? colors.primaryDark : '#D1FAE5' }]}>
                  <BookOpen size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.cardTitle, { color: colors.primary }]}>Hadith of the Day</Text>
                  <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>حديث اليوم</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleShare('hadith')}
                style={[styles.shareButton, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}
                activeOpacity={0.7}
              >
                <Share2 size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.hadithArabic, { color: colors.text }]}>{dailyHadith.arabic}</Text>

            <Text style={[styles.hadithTranslation, { color: colors.text }]}>{`"${dailyHadith.translation}"`}</Text>

            <View style={[styles.hadithMeta, { borderTopColor: colors.border }]}>
              <Text style={[styles.narratorText, { color: colors.textSecondary }]}>— {dailyHadith.narrator}</Text>
              <View style={styles.sourceRow}>
                <Text style={[styles.sourceText, { color: colors.textMuted }]}>{dailyHadith.collection}</Text>
                <View style={[styles.gradeBadge, { backgroundColor: colors.successBg }]}>
                  <Text style={[styles.gradeText, { color: colors.success }]}>{dailyHadith.grade}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Inspiration Card */}
        <Animated.View style={[styles.inspirationCard, shadows.sm, { opacity: inspirationOpacity, backgroundColor: colors.primary }]}>
          <Text style={styles.inspirationText}>
            {`"The best among you is the one who learns the Quran and teaches it."`}
          </Text>
          <View style={styles.inspirationSourceRow}>
            <View style={styles.inspirationDivider} />
            <Text style={styles.inspirationSource}>Prophet Muhammad ﷺ</Text>
            <View style={styles.inspirationDivider} />
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  arabicHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  bismillah: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  greetingArabic: {
    fontSize: 28,
    fontWeight: '400',
  },
  greetingContainer: {
    alignItems: 'center',
  },
  greetingEnglish: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dhikrDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '300',
    marginBottom: 4,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  card: {
    borderRadius: 8,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  cardSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  shareButton: {
    padding: 10,
    borderRadius: 8,
  },
  arabicText: {
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 52,
    fontWeight: '400',
    writingDirection: 'rtl',
  },
  translationText: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  transliterationText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  referenceContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  referenceText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  hadithArabic: {
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 20,
    writingDirection: 'rtl',
  },
  hadithTranslation: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  hadithMeta: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  narratorText: {
    fontSize: 14,
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
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  gradeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ramadanCard: {
    backgroundColor: '#047857',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  ramadanContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ramadanIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ramadanTextContainer: {
    flex: 1,
  },
  ramadanTitle: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  ramadanSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '500',
  },
  ramadanProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginTop: 14,
    overflow: 'hidden',
  },
  ramadanProgressFill: {
    height: '100%',
    backgroundColor: '#FBBF24',
    borderRadius: 2,
  },
  inspirationCard: {
    borderRadius: 8,
    padding: 28,
    marginTop: 8,
  },
  inspirationText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 30,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  inspirationSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
  },
  inspirationDivider: {
    height: 1,
    width: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  inspirationSource: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
