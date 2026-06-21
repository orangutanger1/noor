import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Moon,
  Star,
  Check,
  X,
  AlertCircle,
  Clock,
  BookOpen,
  Heart,
  ChevronLeft,
  Sunrise,
  Sunset,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { PrayerTimes, CalculationMethod, Coordinates } from 'adhan';
import { shadows } from '@/constants/colors';
import { useTheme } from '@/providers/ThemeProvider';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useRamadan } from '@/providers/RamadanProvider';
import { ProFeatureGate } from '@/components/subscription';
import { getRamadanConfig, RAMADAN_TOTAL_DAYS, isLastTenNights, isLaylatulQadr, getDateForDay, ramadanDuas } from '@/data/ramadan';
import { FastingStatus } from '@/types/ramadan';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Calendar cell size: screen - content padding (40) - card padding (32) - card border (2), divided by 7 columns, minus cell margin (4)
const CALENDAR_CELL_SIZE = Math.floor((SCREEN_WIDTH - 74) / 7) - 4;

type TabType = 'today' | 'calendar' | 'duas';

const getCalculationMethod = (methodKey: string) => {
  switch (methodKey) {
    case 'isna': return CalculationMethod.NorthAmerica();
    case 'mwl': return CalculationMethod.MuslimWorldLeague();
    case 'egypt': return CalculationMethod.Egyptian();
    case 'makkah': return CalculationMethod.UmmAlQura();
    case 'karachi': return CalculationMethod.Karachi();
    case 'singapore': return CalculationMethod.Singapore();
    default: return CalculationMethod.NorthAmerica();
  }
};

const formatTime12h = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
};

const FASTING_OPTIONS: { status: FastingStatus; label: string; color: string; icon: typeof Check }[] = [
  { status: 'fasted', label: 'Fasted', color: '#059669', icon: Check },
  { status: 'not_fasted', label: 'Not Fasted', color: '#B91C1C', icon: X },
  { status: 'excused', label: 'Excused', color: '#D97706', icon: AlertCircle },
  { status: 'pending', label: 'Pending', color: '#9A8B70', icon: Clock },
];

const FASTING_COLORS: Record<FastingStatus, string> = {
  fasted: '#059669',
  not_fasted: '#B91C1C',
  excused: '#D97706',
  pending: '#D4C9B5',
};

export default function RamadanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { locationData, onboardingData } = useOnboarding();
  const {
    tracker,
    stats,
    currentDayNumber,
    isActive,
    isSeason,
    updateFastingStatus,
    toggleTaraweeh,
    toggleDailyGoal,
  } = useRamadan();

  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // Calculate Suhoor/Iftar times using adhan library
  const prayerTimesData = useMemo(() => {
    const lat = locationData?.latitude || 40.7128;
    const lon = locationData?.longitude || -74.006;
    const methodKey = onboardingData.calculationMethod || 'isna';
    const coordinates = new Coordinates(lat, lon);
    const params = getCalculationMethod(methodKey);
    const today = new Date();
    const pt = new PrayerTimes(coordinates, today, params);
    return {
      suhoor: formatTime12h(pt.fajr),
      iftar: formatTime12h(pt.maghrib),
    };
  }, [locationData, onboardingData.calculationMethod]);

  // Tracker is only usable during Ramadan (or the ~30-day run-up). Outside that the
  // home card is hidden, so this only triggers on a deep link — show a simple notice.
  if (!isActive && !isSeason) {
    const startLabel = getRamadanConfig().startDate.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
    return (
      <View style={[styles.container, styles.gateContainer, { backgroundColor: colors.background, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]}>
        <TouchableOpacity style={styles.gateBack} onPress={() => router.back()}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Moon size={48} color={colors.primary} />
        <Text style={[styles.gateTitle, { color: colors.text }]}>Ramadan Tracker</Text>
        <Text style={[styles.gateSubtitle, { color: colors.textMuted }]}>
          Available during Ramadan. The next Ramadan begins {startLabel}.
        </Text>
      </View>
    );
  }

  const hijriYear = getRamadanConfig().year;
  const displayDayNumber = isActive && currentDayNumber > 0 ? currentDayNumber : 1;
  const currentDay = tracker.days[displayDayNumber - 1];
  const todayDua = ramadanDuas.find(d => d.dayNumber === displayDayNumber) || ramadanDuas[0];

  const renderTabButton = (tab: TabType, label: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && { backgroundColor: colors.primary }]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabLabel, { color: colors.textSecondary }, activeTab === tab && { color: '#FFF' }]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderTodayTab = () => (
    <View>
      {/* Day Header */}
      <View style={[styles.dayHeader, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.dayHeaderTop}>
          <View style={[styles.dayBadge, { backgroundColor: colors.primary }]}>
            <Moon size={16} color="#FFF" />
            <Text style={styles.dayBadgeText}>Day {displayDayNumber}</Text>
          </View>
          {isLastTenNights(displayDayNumber) && (
            <View style={[styles.lastTenBadge, { backgroundColor: colors.gold + '20' }]}>
              <Star size={12} color={colors.gold} fill={colors.gold} />
              <Text style={[styles.lastTenText, { color: colors.gold }]}>Last 10 Nights</Text>
            </View>
          )}
        </View>
        <Text style={[styles.dayDate, { color: colors.textMuted }]}>
          {getDateForDay(displayDayNumber).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>

        {/* Suhoor & Iftar Times */}
        <View style={styles.timesRow}>
          <View style={[styles.timeCard, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
            <Sunrise size={18} color={colors.gold} />
            <View>
              <Text style={[styles.timeLabel, { color: colors.textMuted }]}>Suhoor ends</Text>
              <Text style={[styles.timeValue, { color: colors.text }]}>{prayerTimesData.suhoor}</Text>
            </View>
          </View>
          <View style={[styles.timeCard, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
            <Sunset size={18} color={colors.gold} />
            <View>
              <Text style={[styles.timeLabel, { color: colors.textMuted }]}>Iftar</Text>
              <Text style={[styles.timeValue, { color: colors.text }]}>{prayerTimesData.iftar}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Fasting Status */}
      <View style={[styles.section, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Fasting Status</Text>
        <View style={styles.fastingOptions}>
          {FASTING_OPTIONS.map(opt => {
            const isSelected = currentDay?.fastingStatus === opt.status;
            const Icon = opt.icon;
            return (
              <TouchableOpacity
                key={opt.status}
                style={[
                  styles.fastingButton,
                  { borderColor: opt.color + '40' },
                  isSelected && { backgroundColor: opt.color + '20', borderColor: opt.color },
                ]}
                onPress={() => updateFastingStatus(displayDayNumber, opt.status)}
              >
                <Icon size={16} color={opt.color} />
                <Text style={[styles.fastingButtonText, { color: opt.color }]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Taraweeh & Daily Goals */}
      <View style={[styles.section, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Ibadah</Text>

        <TouchableOpacity
          style={[styles.goalRow, { borderBottomColor: colors.border }]}
          onPress={() => toggleTaraweeh(displayDayNumber)}
        >
          <View style={styles.goalLeft}>
            <Moon size={18} color={colors.primary} />
            <Text style={[styles.goalLabel, { color: colors.text }]}>Taraweeh Prayer</Text>
          </View>
          <View style={[
            styles.checkbox,
            { borderColor: colors.border },
            currentDay?.taraweehPrayed && { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}>
            {currentDay?.taraweehPrayed && <Check size={14} color="#FFF" strokeWidth={3} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.goalRow, { borderBottomColor: colors.border }]}
          onPress={() => toggleDailyGoal(displayDayNumber, 'charity')}
        >
          <View style={styles.goalLeft}>
            <Heart size={18} color={colors.gold} />
            <Text style={[styles.goalLabel, { color: colors.text }]}>Charity / Sadaqah</Text>
          </View>
          <View style={[
            styles.checkbox,
            { borderColor: colors.border },
            currentDay?.dailyGoals.charity && { backgroundColor: colors.gold, borderColor: colors.gold },
          ]}>
            {currentDay?.dailyGoals.charity && <Check size={14} color="#FFF" strokeWidth={3} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.goalRow}
          onPress={() => toggleDailyGoal(displayDayNumber, 'quranReading')}
        >
          <View style={styles.goalLeft}>
            <BookOpen size={18} color={colors.primary} />
            <Text style={[styles.goalLabel, { color: colors.text }]}>Quran Reading</Text>
          </View>
          <View style={[
            styles.checkbox,
            { borderColor: colors.border },
            currentDay?.dailyGoals.quranReading && { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}>
            {currentDay?.dailyGoals.quranReading && <Check size={14} color="#FFF" strokeWidth={3} />}
          </View>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={[styles.section, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Progress</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.daysFasted}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Fasted</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.gold }]}>{stats.currentStreak}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.taraweehCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Taraweeh</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.gold }]}>{stats.quranDays}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Quran</Text>
          </View>
        </View>
        {stats.totalDays > 0 && (
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
              <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${stats.progressPercent}%` }]} />
            </View>
            <Text style={[styles.progressPercent, { color: colors.primary }]}>{stats.progressPercent}%</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderCalendarTab = () => {
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    // Determine start day of week for day 1
    const startDate = getDateForDay(1);
    const startDow = startDate.getDay(); // 0=Sun

    // Build grid cells: empty cells for offset + 30 day cells
    const cells: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let i = 1; i <= RAMADAN_TOTAL_DAYS; i++) cells.push(i);

    return (
      <View>
        <View style={[styles.calendarCard, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.calendarTitle, { color: colors.text }]}>Ramadan {hijriYear} AH</Text>

          {/* Day labels */}
          <View style={styles.calendarRow}>
            {dayLabels.map((label, i) => (
              <View key={i} style={styles.calendarCell}>
                <Text style={[styles.dayLabel, { color: colors.textMuted }]}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          {Array.from({ length: Math.ceil(cells.length / 7) }, (_, rowIdx) => (
            <View key={rowIdx} style={styles.calendarRow}>
              {cells.slice(rowIdx * 7, rowIdx * 7 + 7).map((dayNum, colIdx) => {
                if (dayNum === null) {
                  return <View key={`empty-${colIdx}`} style={styles.calendarCell} />;
                }
                const day = tracker.days[dayNum - 1];
                const isCurrent = dayNum === currentDayNumber;
                const isLast10 = isLastTenNights(dayNum);
                const isLQ = isLaylatulQadr(dayNum);
                const isEditing = selectedCalendarDay === dayNum;

                return (
                  <TouchableOpacity
                    key={dayNum}
                    style={[
                      styles.calendarCell,
                      styles.calendarDayCell,
                      { backgroundColor: FASTING_COLORS[day.fastingStatus] + '20' },
                      isLast10 && { borderWidth: 2, borderColor: colors.gold },
                      isCurrent && { borderWidth: 2, borderColor: colors.primary },
                      isEditing && { borderWidth: 2, borderColor: colors.text },
                    ]}
                    onPress={() => setSelectedCalendarDay(isEditing ? null : dayNum)}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      { color: colors.text },
                      isCurrent && { fontWeight: '700' },
                    ]}>
                      {dayNum}
                    </Text>
                    {isLQ && <Star size={8} color={colors.gold} fill={colors.gold} style={styles.starIcon} />}
                    <View style={[styles.statusDot, { backgroundColor: FASTING_COLORS[day.fastingStatus] }]} />
                  </TouchableOpacity>
                );
              })}
              {/* Pad last row */}
              {rowIdx === Math.ceil(cells.length / 7) - 1 &&
                Array.from({ length: 7 - (cells.length % 7 || 7) }, (_, i) => (
                  <View key={`pad-${i}`} style={styles.calendarCell} />
                ))
              }
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={[styles.legendCard, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.legendRow}>
            {FASTING_OPTIONS.map(opt => (
              <View key={opt.status} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: opt.color }]} />
                <Text style={[styles.legendText, { color: colors.textMuted }]}>{opt.label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.gold }]} />
              <Text style={[styles.legendText, { color: colors.textMuted }]}>Last 10</Text>
            </View>
            <View style={styles.legendItem}>
              <Star size={10} color={colors.gold} fill={colors.gold} />
              <Text style={[styles.legendText, { color: colors.textMuted }]}>Laylatul Qadr</Text>
            </View>
          </View>
        </View>

        {/* Inline editor + dua */}
        {selectedCalendarDay && (() => {
          const selectedDua = ramadanDuas.find(d => d.dayNumber === selectedCalendarDay);
          return (
            <View style={[styles.inlineEditor, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.editorTitle, { color: colors.text }]}>Day {selectedCalendarDay} — Fasting Status</Text>
              <View style={styles.fastingOptions}>
                {FASTING_OPTIONS.map(opt => {
                  const day = tracker.days[selectedCalendarDay - 1];
                  const isSelected = day?.fastingStatus === opt.status;
                  const Icon = opt.icon;
                  return (
                    <TouchableOpacity
                      key={opt.status}
                      style={[
                        styles.fastingButton,
                        { borderColor: opt.color + '40' },
                        isSelected && { backgroundColor: opt.color + '20', borderColor: opt.color },
                      ]}
                      onPress={() => {
                        updateFastingStatus(selectedCalendarDay, opt.status);
                      }}
                    >
                      <Icon size={16} color={opt.color} />
                      <Text style={[styles.fastingButtonText, { color: opt.color }]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedDua && (
                <View style={[styles.calendarDuaSection, { borderTopColor: colors.border }]}>
                  <View style={styles.duaHeader}>
                    <Text style={[styles.duaDayLabel, { color: colors.primary }]}>Day {selectedDua.dayNumber} Dua</Text>
                    <View style={[styles.themeBadgeSmall, { backgroundColor: colors.primary + '15' }]}>
                      <Text style={[styles.themeBadgeSmallText, { color: colors.primary }]}>{selectedDua.theme}</Text>
                    </View>
                  </View>
                  <Text style={[styles.duaArabic, { color: colors.text }]}>{selectedDua.arabic}</Text>
                  <Text style={[styles.duaTranslation, { color: colors.text }]}>"{selectedDua.translation}"</Text>
                  <Text style={[styles.duaTransliteration, { color: colors.textMuted }]}>{selectedDua.transliteration}</Text>
                </View>
              )}
            </View>
          );
        })()}
      </View>
    );
  };

  const renderDuasTab = () => (
    <View>
      {/* Today's Dua */}
      <View style={[styles.todayDua, shadows.sm, { backgroundColor: colors.primary }]}>
        <View style={styles.todayDuaHeader}>
          <Text style={styles.todayDuaLabel}>Day {displayDayNumber} Dua</Text>
          <View style={[styles.themeBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.themeBadgeText}>{todayDua.theme}</Text>
          </View>
        </View>
        <Text style={styles.todayDuaArabic}>{todayDua.arabic}</Text>
        <Text style={styles.todayDuaTranslation}>"{todayDua.translation}"</Text>
        <Text style={styles.todayDuaTransliteration}>{todayDua.transliteration}</Text>
      </View>

      {/* All Duas */}
      {ramadanDuas.map(dua => (
        <View key={dua.id} style={[styles.duaCard, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.duaHeader}>
            <Text style={[styles.duaDayLabel, { color: colors.primary }]}>Day {dua.dayNumber}</Text>
            <View style={[styles.themeBadgeSmall, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.themeBadgeSmallText, { color: colors.primary }]}>{dua.theme}</Text>
            </View>
          </View>
          <Text style={[styles.duaArabic, { color: colors.text }]}>{dua.arabic}</Text>
          <Text style={[styles.duaTranslation, { color: colors.text }]}>"{dua.translation}"</Text>
          <Text style={[styles.duaTransliteration, { color: colors.textMuted }]}>{dua.transliteration}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ProFeatureGate featureName="the Ramadan Tracker">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ChevronLeft size={24} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Ramadan</Text>
                <Text style={[styles.headerArabic, { color: colors.textMuted }]}>رمضان</Text>
              </View>
              <View style={{ width: 40 }} />
            </View>

            {/* Tab Selector */}
            <View style={[styles.tabContainer, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
              {renderTabButton('today', 'Today')}
              {renderTabButton('calendar', 'Calendar')}
              {renderTabButton('duas', 'Duas')}
            </View>

            {activeTab === 'today' && renderTodayTab()}
            {activeTab === 'calendar' && renderCalendarTab()}
            {activeTab === 'duas' && renderDuasTab()}
          </ScrollView>
        </Animated.View>
      </View>
    </ProFeatureGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gateContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 16 },
  gateBack: { position: 'absolute', left: 16, top: 56, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  gateTitle: { fontSize: 24, fontWeight: '300', letterSpacing: -0.5 },
  gateSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '300', letterSpacing: -0.5 },
  headerArabic: { fontSize: 16 },

  // Tabs
  tabContainer: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 20 },
  tabButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  tabLabel: { fontSize: 13, fontWeight: '600' },

  // Today tab
  dayHeader: { borderRadius: 12, borderWidth: 1, padding: 20, marginBottom: 16 },
  dayHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  dayBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  dayBadgeText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  lastTenBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  lastTenText: { fontSize: 11, fontWeight: '600' },
  dayDate: { fontSize: 14, marginBottom: 16 },

  timesRow: { flexDirection: 'row', gap: 12 },
  timeCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 8 },
  timeLabel: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  timeValue: { fontSize: 16, fontWeight: '600' },

  // Sections
  section: { borderRadius: 12, borderWidth: 1, padding: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },

  // Fasting options
  fastingOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fastingButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5 },
  fastingButtonText: { fontSize: 13, fontWeight: '600' },

  // Goals
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  goalLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  goalLabel: { fontSize: 15, fontWeight: '500' },
  checkbox: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },

  // Stats
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 28, fontWeight: '300', letterSpacing: -1 },
  statLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  progressBarContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressPercent: { fontSize: 14, fontWeight: '600', width: 40 },

  // Calendar
  calendarCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  calendarTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  calendarRow: { flexDirection: 'row', justifyContent: 'center' },
  calendarCell: { width: CALENDAR_CELL_SIZE, height: CALENDAR_CELL_SIZE, justifyContent: 'center', alignItems: 'center', margin: 2, borderRadius: 8 },
  calendarDayCell: { position: 'relative' },
  calendarDayText: { fontSize: 14, fontWeight: '500' },
  dayLabel: { fontSize: 11, fontWeight: '600' },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginTop: 2 },
  starIcon: { position: 'absolute', top: 2, right: 2 },

  legendCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, fontWeight: '500' },

  inlineEditor: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16 },
  editorTitle: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  calendarDuaSection: { borderTopWidth: 1, marginTop: 16, paddingTop: 16 },

  // Duas
  todayDua: { borderRadius: 12, padding: 24, marginBottom: 16 },
  todayDuaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  todayDuaLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  themeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  themeBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  todayDuaArabic: { color: '#FFF', fontSize: 24, textAlign: 'center', lineHeight: 44, marginBottom: 16, writingDirection: 'rtl' },
  todayDuaTranslation: { color: 'rgba(255,255,255,0.9)', fontSize: 15, textAlign: 'center', lineHeight: 24, fontStyle: 'italic', marginBottom: 12 },
  todayDuaTransliteration: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', fontStyle: 'italic' },

  duaCard: { borderRadius: 12, borderWidth: 1, padding: 20, marginBottom: 12 },
  duaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  duaDayLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  themeBadgeSmall: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  themeBadgeSmallText: { fontSize: 11, fontWeight: '600' },
  duaArabic: { fontSize: 22, textAlign: 'center', lineHeight: 40, marginBottom: 12, writingDirection: 'rtl' },
  duaTranslation: { fontSize: 15, textAlign: 'center', lineHeight: 24, fontStyle: 'italic', marginBottom: 8 },
  duaTransliteration: { fontSize: 13, textAlign: 'center', fontStyle: 'italic' },
});
