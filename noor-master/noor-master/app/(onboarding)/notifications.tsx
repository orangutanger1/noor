import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Sunrise, Sun, SunDim, Sunset, Moon, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboarding } from '@/providers/OnboardingProvider';

interface PrayerNotification {
  id: string;
  name: string;
  nameArabic: string;
  icon: typeof Sunrise;
  enabled: boolean;
}

const initialPrayers: PrayerNotification[] = [
  { id: 'fajr', name: 'Fajr', nameArabic: 'الفجر', icon: Sunrise, enabled: true },
  { id: 'dhuhr', name: 'Dhuhr', nameArabic: 'الظهر', icon: Sun, enabled: true },
  { id: 'asr', name: 'Asr', nameArabic: 'العصر', icon: SunDim, enabled: true },
  { id: 'maghrib', name: 'Maghrib', nameArabic: 'المغرب', icon: Sunset, enabled: true },
  { id: 'isha', name: 'Isha', nameArabic: 'العشاء', icon: Moon, enabled: true },
];

const reminderOptions = [
  { value: 0, label: 'None' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setNotificationSettings } = useOnboarding();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [prayers, setPrayers] = useState(initialPrayers);
  const [reminderTime, setReminderTime] = useState(15);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const togglePrayer = (prayerId: string) => {
    setPrayers((prev) =>
      prev.map((p) => (p.id === prayerId ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      // Save notification preferences
      // Note: In production, you would request notification permissions here
      // using expo-notifications. For now, we just save the preferences.
      const enabledPrayers = prayers.filter((p) => p.enabled).map((p) => p.id);
      setNotificationSettings({
        enabled: true,
        prayers: enabledPrayers,
        reminderMinutes: reminderTime,
      });

      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push('/(onboarding)/ready');
    } catch (error) {
      console.log('Notification error:', error);
      router.push('/(onboarding)/ready');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setNotificationSettings({
      enabled: false,
      prayers: [],
      reminderMinutes: 0,
    });
    router.push('/(onboarding)/ready');
  };

  const cycleReminderTime = () => {
    const currentIndex = reminderOptions.findIndex((o) => o.value === reminderTime);
    const nextIndex = (currentIndex + 1) % reminderOptions.length;
    setReminderTime(reminderOptions[nextIndex].value);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primaryDark, Colors.light.primary, Colors.light.cream]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        {/* Illustration */}
        <Animated.View style={[styles.illustrationContainer, { opacity: fadeAnim }]}>
          <View style={styles.illustration}>
            <View style={styles.bellContainer}>
              <Bell size={48} color={Colors.light.gold} />
              <View style={styles.bellRing} />
            </View>
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Never Miss a Prayer</Text>
          <Text style={styles.subtitle}>
            Get gentle reminders when it's time to pray:
          </Text>

          {/* Prayer Toggles */}
          <View style={styles.prayersList}>
            {prayers.map((prayer) => {
              const Icon = prayer.icon;
              return (
                <View key={prayer.id} style={styles.prayerRow}>
                  <View style={styles.prayerInfo}>
                    <View style={[styles.prayerIcon, prayer.enabled && styles.prayerIconEnabled]}>
                      <Icon size={18} color={prayer.enabled ? Colors.light.primary : Colors.light.textMuted} />
                    </View>
                    <View>
                      <Text style={styles.prayerName}>{prayer.name}</Text>
                      <Text style={styles.prayerArabic}>{prayer.nameArabic}</Text>
                    </View>
                  </View>
                  <Switch
                    value={prayer.enabled}
                    onValueChange={() => togglePrayer(prayer.id)}
                    trackColor={{
                      false: Colors.light.border,
                      true: Colors.light.primary + '60',
                    }}
                    thumbColor={prayer.enabled ? Colors.light.primary : Colors.light.surface}
                    ios_backgroundColor={Colors.light.border}
                  />
                </View>
              );
            })}
          </View>

          {/* Reminder Time */}
          <View style={styles.reminderCard}>
            <View style={styles.reminderInfo}>
              <Clock size={18} color={Colors.light.textSecondary} />
              <Text style={styles.reminderLabel}>Also remind me</Text>
            </View>
            <View style={styles.reminderSelector}>
              <Text
                style={styles.reminderValue}
                onPress={cycleReminderTime}
              >
                {reminderOptions.find((o) => o.value === reminderTime)?.label}
              </Text>
              <Text style={styles.reminderSuffix}>before prayers</Text>
            </View>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <OnboardingButton
            title="Enable Notifications"
            onPress={handleEnableNotifications}
            loading={loading}
          />
          <OnboardingButton
            title="Skip for Now"
            onPress={handleSkip}
            variant="text"
            style={{ marginTop: 8 }}
          />
          <OnboardingProgress currentStep={3} totalSteps={5} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  illustration: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellContainer: {
    position: 'relative',
  },
  bellRing: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.gold,
    opacity: 0.3,
  },
  mainContent: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.ivory,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.goldSoft,
    textAlign: 'center',
    marginBottom: 24,
  },
  prayersList: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.light.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prayerIconEnabled: {
    backgroundColor: Colors.light.primary + '15',
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  prayerArabic: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  reminderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 10,
  },
  reminderSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primary,
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  reminderSuffix: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 8,
  },
  footer: {
    marginTop: 'auto',
  },
});
