import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Switch,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Sunrise, Sun, SunDim, Sunset, Moon, Clock, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useResponsive } from '@/hooks/useResponsive';

const { width, height } = Dimensions.get('window');

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
  { value: 0, label: 'At time' },
  { value: 5, label: '5 min before' },
  { value: 10, label: '10 min before' },
  { value: 15, label: '15 min before' },
  { value: 30, label: '30 min before' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setNotificationSettings } = useOnboarding();
  const { isTablet, contentMaxWidth } = useResponsive();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const [prayers, setPrayers] = useState(initialPrayers);
  const [reminderTime, setReminderTime] = useState(15);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(imageAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const togglePrayer = (prayerId: string) => {
    setPrayers((prev) =>
      prev.map((p) => (p.id === prayerId ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleEnableNotifications = async () => {
    setLoading(true);
    try {
      const enabledPrayers = prayers.filter((p) => p.enabled).map((p) => p.id);
      setNotificationSettings({
        enabled: true,
        prayers: enabledPrayers,
        reminderMinutes: reminderTime,
      });

      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push('/(onboarding)/ready');
    } catch (_error) {
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

  const enabledCount = prayers.filter((p) => p.enabled).length;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, { opacity: imageAnim }]}>
        <Image
          source={isTablet
            ? require('@/assets/images/onboarding/ipadmosque.jpeg')
            : require('@/assets/images/onboarding/mosque.png')
          }
          style={styles.backgroundImage}
          contentFit="cover"
        />
        <View style={styles.overlay} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[
          styles.content,
          { maxWidth: contentMaxWidth, alignSelf: isTablet ? 'center' : undefined, width: '100%' },
        ]}>
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Bell size={28} color={Colors.light.gold} />
          </View>
          <Text style={styles.title}>Stay Connected</Text>
          <Text style={styles.subtitle}>
            Receive gentle reminders for each prayer time
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.prayersCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Prayer Notifications</Text>
            <Text style={styles.enabledBadge}>{enabledCount}/5 enabled</Text>
          </View>

          {prayers.map((prayer, index) => {
            const Icon = prayer.icon;
            const isLast = index === prayers.length - 1;
            return (
              <View
                key={prayer.id}
                style={[styles.prayerRow, !isLast && styles.prayerRowBorder]}
              >
                <View style={styles.prayerInfo}>
                  <View style={[styles.prayerIcon, prayer.enabled && styles.prayerIconEnabled]}>
                    <Icon size={18} color={prayer.enabled ? Colors.light.primary : '#9A8B70'} />
                  </View>
                  <View>
                    <Text style={[styles.prayerName, !prayer.enabled && styles.prayerNameDisabled]}>
                      {prayer.name}
                    </Text>
                    <Text style={styles.prayerArabic}>{prayer.nameArabic}</Text>
                  </View>
                </View>
                <Switch
                  value={prayer.enabled}
                  onValueChange={() => togglePrayer(prayer.id)}
                  trackColor={{
                    false: '#E5E2DD',
                    true: Colors.light.primary + '60',
                  }}
                  thumbColor={prayer.enabled ? Colors.light.primary : '#FFFFFF'}
                  ios_backgroundColor="#E5E2DD"
                />
              </View>
            );
          })}
        </Animated.View>

        <Animated.View
          style={[
            styles.reminderCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.reminderContent}
            onPress={cycleReminderTime}
            activeOpacity={0.7}
          >
            <View style={styles.reminderLeft}>
              <Clock size={20} color={Colors.light.primary} />
              <View style={styles.reminderTextContainer}>
                <Text style={styles.reminderLabel}>Remind me</Text>
                <Text style={styles.reminderValue}>
                  {reminderOptions.find((o) => o.value === reminderTime)?.label}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9A8B70" />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.spacer} />
        <View style={styles.footer}>
          <OnboardingButton
            title="Enable Notifications"
            onPress={handleEnableNotifications}
            loading={loading}
          />
          <OnboardingButton
            title="Maybe Later"
            onPress={handleSkip}
            variant="text"
          />
          <OnboardingProgress currentStep={16} totalSteps={18} />
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
  prayersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E2DD',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C5650',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  enabledBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  prayerRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E2DD',
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0EDE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  prayerIconEnabled: {
    backgroundColor: Colors.light.primary + '15',
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2A26',
  },
  prayerNameDisabled: {
    color: '#9A8B70',
  },
  prayerArabic: {
    fontSize: 13,
    color: '#9A8B70',
    marginTop: 2,
  },
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    overflow: 'hidden',
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTextContainer: {
    marginLeft: 14,
  },
  reminderLabel: {
    fontSize: 13,
    color: '#5C5650',
  },
  reminderValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    marginTop: 2,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    width: '100%',
    paddingTop: 20,
  },
});
