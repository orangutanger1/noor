import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Clock, AlertCircle, X, Flame } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/providers/AppProvider';
import { Prayer } from '@/types';

const statusColors = {
  pending: Colors.light.textMuted,
  on_time: Colors.light.success,
  late: Colors.light.warning,
  missed: Colors.light.missed,
};

const statusIcons = {
  pending: Clock,
  on_time: Check,
  late: AlertCircle,
  missed: X,
};

const statusLabels = {
  pending: 'Pending',
  on_time: 'On Time',
  late: 'Qada',
  missed: 'Missed',
};

export default function TrackerScreen() {
  const insets = useSafeAreaInsets();
  const { prayers, updatePrayerStatus, getPrayerStreak } = useApp();
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);

  const completedCount = prayers.filter(p => p.status === 'on_time' || p.status === 'late').length;
  const streak = getPrayerStreak();

  const handleStatusChange = useCallback((prayerId: string, status: Prayer['status']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updatePrayerStatus(prayerId, status);
    setSelectedPrayer(null);
  }, [updatePrayerStatus]);

  const getProgressPercentage = () => {
    const completed = prayers.filter(p => p.status === 'on_time' || p.status === 'late').length;
    return (completed / 5) * 100;
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.primaryDark, Colors.light.cream]}
        locations={[0, 0.3, 0.65]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Salah Tracker</Text>
          <Text style={styles.headerArabic}>متابعة الصلاة</Text>
          <Text style={styles.dateText}>{formatDate()}</Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>{"Today's Progress"}</Text>
              <Text style={styles.progressSubtitle}>{completedCount} of 5 prayers</Text>
            </View>
            <View style={styles.streakBadge}>
              <Flame size={16} color={Colors.light.gold} />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${getProgressPercentage()}%` }]} />
            </View>
            <Text style={styles.progressPercentage}>{Math.round(getProgressPercentage())}%</Text>
          </View>

          <View style={styles.progressDots}>
            {prayers.map((prayer, index) => (
              <View
                key={prayer.id}
                style={[
                  styles.progressDot,
                  { backgroundColor: statusColors[prayer.status] },
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.prayerList}>
          {prayers.map((prayer, index) => {
            const StatusIcon = statusIcons[prayer.status];
            const isSelected = selectedPrayer?.id === prayer.id;
            
            return (
              <View key={prayer.id}>
                <TouchableOpacity
                  style={[
                    styles.prayerCard,
                    isSelected && styles.prayerCardSelected,
                  ]}
                  onPress={() => setSelectedPrayer(isSelected ? null : prayer)}
                  activeOpacity={0.8}
                  testID={`prayer-${prayer.name.toLowerCase()}`}
                >
                  <View style={styles.prayerLeft}>
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: statusColors[prayer.status] + '20' },
                    ]}>
                      <StatusIcon size={20} color={statusColors[prayer.status]} />
                    </View>
                    <View>
                      <Text style={styles.prayerName}>{prayer.name}</Text>
                      <Text style={styles.prayerArabic}>{prayer.nameArabic}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.prayerRight}>
                    <Text style={styles.prayerTime}>{prayer.time}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: statusColors[prayer.status] + '15' },
                    ]}>
                      <Text style={[styles.statusText, { color: statusColors[prayer.status] }]}>
                        {statusLabels[prayer.status]}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {isSelected && (
                  <View style={styles.statusOptions}>
                    <Text style={styles.statusOptionsTitle}>Update Status</Text>
                    <View style={styles.statusButtons}>
                      {(['pending', 'on_time', 'late', 'missed'] as const).map(status => {
                        const Icon = statusIcons[status];
                        return (
                          <TouchableOpacity
                            key={status}
                            style={[
                              styles.statusButton,
                              prayer.status === status && styles.statusButtonActive,
                              { borderColor: statusColors[status] },
                            ]}
                            onPress={() => handleStatusChange(prayer.id, status)}
                          >
                            <Icon size={16} color={statusColors[status]} />
                            <Text style={[styles.statusButtonText, { color: statusColors[status] }]}>
                              {statusLabels[status]}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Status Legend</Text>
          <View style={styles.legendItems}>
            {(['pending', 'on_time', 'late', 'missed'] as const).map(status => {
              const Icon = statusIcons[status];
              return (
                <View key={status} style={styles.legendItem}>
                  <Icon size={14} color={statusColors[status]} />
                  <Text style={styles.legendText}>{statusLabels[status]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>
            {completedCount === 5 
              ? "MashaAllah! All prayers completed today!"
              : completedCount >= 3
              ? "Great progress! Keep going! 💪"
              : "Every prayer counts. You can do this! 🤲"
            }
          </Text>
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
  dateText: {
    fontSize: 14,
    color: Colors.light.goldSoft,
    opacity: 0.8,
  },
  progressCard: {
    backgroundColor: Colors.light.ivory,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 14,
    color: Colors.light.textMuted,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.gold + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.gold,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    width: 40,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  prayerList: {
    gap: 12,
    marginBottom: 20,
  },
  prayerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.ivory,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  prayerCardSelected: {
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statusIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  prayerArabic: {
    fontSize: 14,
    color: Colors.light.textMuted,
  },
  prayerRight: {
    alignItems: 'flex-end',
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusOptions: {
    backgroundColor: Colors.light.cream,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  statusOptionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
    backgroundColor: Colors.light.ivory,
  },
  statusButtonActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  legendCard: {
    backgroundColor: Colors.light.ivory,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  motivationCard: {
    backgroundColor: Colors.light.primaryDark,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  motivationText: {
    fontSize: 15,
    color: Colors.light.ivory,
    textAlign: 'center',
    fontWeight: '500',
  },
});
