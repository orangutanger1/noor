import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Share,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Share2, BookOpen, RotateCcw, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Colors, { shadows, typography } from '@/constants/colors';
import { dailyAyahs, dailyHadiths } from '@/mocks/islamic-content';
import { Ayah, Hadith } from '@/types';
import { AyahSeparator, IslamicStar, CrescentStar } from '@/components/IslamicPattern';
import { useApp } from '@/providers/AppProvider';
import { useOnboarding } from '@/providers/OnboardingProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getPrayerStreak, getTodayTasbihCount } = useApp();
  const { resetOnboarding } = useOnboarding();
  const [dailyAyah, setDailyAyah] = useState<Ayah | null>(null);
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);

  // Staggered entrance animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(20)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsTranslate = useRef(new Animated.Value(30)).current;
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
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(headerTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(statsOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(statsTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ayahOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(ayahTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(hadithOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(hadithTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(inspirationOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
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
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { arabic: 'صباح الخير', english: 'Good Morning' };
    if (hour < 17) return { arabic: 'مساء الخير', english: 'Good Afternoon' };
    return { arabic: 'مساء النور', english: 'Good Evening' };
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Reset Onboarding',
      'This will reset the onboarding and show you the new visuals. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetOnboarding();
            router.replace('/(onboarding)/welcome');
          },
        },
      ]
    );
  };

  const greeting = getGreeting();
  const prayerStreak = getPrayerStreak();
  const dhikrCount = getTodayTasbihCount();

  return (
    <View style={styles.container}>
      {/* Refined gradient background */}
      <LinearGradient
        colors={['#022C22', '#047857', '#065F46', '#FAF8F3']}
        locations={[0, 0.15, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle pattern overlay */}
      <View style={styles.patternOverlay}>
        <IslamicStar size={120} color="#FDE68A" opacity={0.03} />
      </View>

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
          <View style={styles.headerDecoration}>
            <CrescentStar size={32} color="#FDE68A" opacity={0.6} />
          </View>
          <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
          <Text style={styles.greetingArabic}>{greeting.arabic}</Text>
          <Text style={styles.greetingEnglish}>{greeting.english}</Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </Animated.View>

        {/* Temporary Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetOnboarding}
          activeOpacity={0.8}
        >
          <RotateCcw size={14} color="#FDFCF9" />
          <Text style={styles.resetButtonText}>View Onboarding</Text>
        </TouchableOpacity>

        {/* Stats Row */}
        <Animated.View
          style={[
            styles.statsRow,
            { opacity: statsOpacity, transform: [{ translateY: statsTranslate }] },
          ]}
        >
          <View style={[styles.statCard, shadows.md]}>
            <View style={styles.statIconContainer}>
              <Sparkles size={18} color={Colors.light.gold} />
            </View>
            <Text style={styles.statValue}>{prayerStreak}/5</Text>
            <Text style={styles.statLabel}>Prayers Today</Text>
          </View>
          <View style={[styles.statCard, shadows.md]}>
            <View style={styles.statIconContainer}>
              <View style={styles.dhikrDot} />
            </View>
            <Text style={styles.statValue}>{dhikrCount}</Text>
            <Text style={styles.statLabel}>Dhikr Count</Text>
          </View>
        </Animated.View>

        {/* Ayah of the Day */}
        {dailyAyah && (
          <Animated.View
            style={[
              styles.card,
              styles.ayahCard,
              shadows.lg,
              { opacity: ayahOpacity, transform: [{ translateY: ayahTranslate }] },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={styles.cardIconContainer}>
                  <BookOpen size={18} color={Colors.light.gold} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Ayah of the Day</Text>
                  <Text style={styles.cardSubtitle}>آية اليوم</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleShare('ayah')}
                style={styles.shareButton}
                activeOpacity={0.7}
              >
                <Share2 size={16} color={Colors.light.gold} />
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

        {/* Hadith of the Day */}
        {dailyHadith && (
          <Animated.View
            style={[
              styles.card,
              styles.hadithCard,
              shadows.lg,
              { opacity: hadithOpacity, transform: [{ translateY: hadithTranslate }] },
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <View style={[styles.cardIconContainer, styles.cardIconContainerGreen]}>
                  <BookOpen size={18} color={Colors.light.primary} />
                </View>
                <View>
                  <Text style={[styles.cardTitle, styles.cardTitleGreen]}>Hadith of the Day</Text>
                  <Text style={styles.cardSubtitle}>حديث اليوم</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleShare('hadith')}
                style={[styles.shareButton, styles.shareButtonGreen]}
                activeOpacity={0.7}
              >
                <Share2 size={16} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.hadithArabic}>{dailyHadith.arabic}</Text>

            <Text style={styles.hadithTranslation}>{`"${dailyHadith.translation}"`}</Text>

            <View style={styles.hadithMeta}>
              <Text style={styles.narratorText}>— {dailyHadith.narrator}</Text>
              <View style={styles.sourceRow}>
                <Text style={styles.sourceText}>{dailyHadith.collection}</Text>
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeText}>{dailyHadith.grade}</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Inspiration Card */}
        <Animated.View style={[styles.inspirationCard, shadows.xl, { opacity: inspirationOpacity }]}>
          <LinearGradient
            colors={['#022C22', '#065F46']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.inspirationGradient}
          >
            <View style={styles.inspirationPattern}>
              <IslamicStar size={80} color="#FDE68A" opacity={0.08} />
            </View>
            <Text style={styles.inspirationText}>
              {`"The best among you is the one who learns the Quran and teaches it."`}
            </Text>
            <View style={styles.inspirationSourceRow}>
              <View style={styles.inspirationDivider} />
              <Text style={styles.inspirationSource}>Prophet Muhammad ﷺ</Text>
              <View style={styles.inspirationDivider} />
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  patternOverlay: {
    position: 'absolute',
    top: 60,
    right: -40,
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerDecoration: {
    marginBottom: 12,
  },
  bismillah: {
    fontSize: 22,
    color: 'rgba(253, 252, 249, 0.8)',
    fontWeight: '400',
    marginBottom: 20,
    letterSpacing: 1,
  },
  greetingArabic: {
    fontSize: 36,
    color: '#FDFCF9',
    fontWeight: '300',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  greetingEnglish: {
    fontSize: 14,
    color: 'rgba(253, 252, 249, 0.6)',
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  date: {
    fontSize: 13,
    color: Colors.light.goldSoft,
    opacity: 0.9,
    fontWeight: '400',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: 'rgba(217, 119, 6, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FDFCF9',
    letterSpacing: 0.3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dhikrDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.gold,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.light.text,
    marginBottom: 4,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
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
    borderRadius: 12,
    backgroundColor: Colors.light.goldMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIconContainerGreen: {
    backgroundColor: '#D1FAE5',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.textGold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  cardTitleGreen: {
    color: Colors.light.primary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  shareButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: Colors.light.goldMuted,
  },
  shareButtonGreen: {
    backgroundColor: '#D1FAE5',
  },
  arabicText: {
    fontSize: 28,
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 52,
    fontWeight: '400',
    writingDirection: 'rtl',
  },
  translationText: {
    fontSize: 17,
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  transliterationText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  referenceContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  referenceText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  hadithArabic: {
    fontSize: 22,
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 20,
    writingDirection: 'rtl',
  },
  hadithTranslation: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  hadithMeta: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
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
    backgroundColor: Colors.light.successBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gradeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inspirationCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 8,
  },
  inspirationGradient: {
    padding: 28,
    position: 'relative',
  },
  inspirationPattern: {
    position: 'absolute',
    top: -20,
    right: -20,
    opacity: 0.5,
  },
  inspirationText: {
    fontSize: 18,
    color: '#FDFCF9',
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
    backgroundColor: Colors.light.goldSoft,
    opacity: 0.4,
  },
  inspirationSource: {
    fontSize: 13,
    color: Colors.light.goldSoft,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
