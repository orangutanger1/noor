import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Calculator, Clock, Sparkles, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { usePaywall } from '@/hooks/usePaywall';
import { useResponsive } from '@/hooks/useResponsive';

const { width, height } = Dimensions.get('window');

interface PrayerInfo {
  name: string;
  time: string;
  remaining: string;
}

const PRAYER_TIMES = [
  { name: 'Fajr', hour: 5, minute: 23 },
  { name: 'Sunrise', hour: 6, minute: 48 },
  { name: 'Dhuhr', hour: 12, minute: 15 },
  { name: 'Asr', hour: 15, minute: 45 },
  { name: 'Maghrib', hour: 18, minute: 32 },
  { name: 'Isha', hour: 20, minute: 5 },
];

const getNextPrayer = (): PrayerInfo => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const prayer of PRAYER_TIMES) {
    const prayerMinutes = prayer.hour * 60 + prayer.minute;
    if (currentMinutes < prayerMinutes) {
      const diffMinutes = prayerMinutes - currentMinutes;
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      const remaining = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} minutes`;
      return {
        name: prayer.name,
        time: `${prayer.hour.toString().padStart(2, '0')}:${prayer.minute.toString().padStart(2, '0')}`,
        remaining,
      };
    }
  }

  // All prayers passed, next is Fajr tomorrow
  const fajr = PRAYER_TIMES[0];
  const fajrMinutes = fajr.hour * 60 + fajr.minute;
  const minutesTillMidnight = 24 * 60 - currentMinutes;
  const totalMinutes = minutesTillMidnight + fajrMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return {
    name: fajr.name,
    time: `${fajr.hour.toString().padStart(2, '0')}:${fajr.minute.toString().padStart(2, '0')}`,
    remaining: `${hours}h ${minutes}m`,
  };
};

export default function ReadyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { locationData, calculationMethod, completeOnboarding, userProfile } = useOnboarding();
  const { presentPaywall } = usePaywall();
  const { isTablet, contentMaxWidth } = useResponsive();
  const firstName = userProfile.name ? userProfile.name.split(' ')[0] : '';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<PrayerInfo>(getNextPrayer);

  // Update prayer time every minute
  useEffect(() => {
    const updatePrayer = () => {
      setNextPrayer(getNextPrayer());
    };

    const interval = setInterval(updatePrayer, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(imageAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(checkAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getMethodName = (methodId: string) => {
    const methods: Record<string, string> = {
      isna: 'ISNA',
      mwl: 'Muslim World League',
      egypt: 'Egyptian',
      makkah: 'Umm al-Qura',
    };
    return methods[methodId] || 'ISNA';
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      await completeOnboarding();
      // Present the paywall after onboarding is complete
      await presentPaywall();
      router.replace('/(tabs)');
    } catch (_error) {
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: imageAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={isTablet
            ? require('@/assets/images/onboarding/ipadkaaba.jpeg')
            : require('@/assets/images/onboarding/kaaba.png')
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
          { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 24 },
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
            styles.successBadge,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: checkAnim },
              ],
            },
          ]}
        >
          <View style={styles.checkCircle}>
            <Check size={28} color="#FFFFFF" strokeWidth={3} />
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>{firstName ? `${firstName}, You're All Set!` : "You're All Set!"}</Text>
          <Text style={styles.subtitle}>Your spiritual journey awaits</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.prayerCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.prayerCardInner}>
            <View style={styles.sparkleRow}>
              <Sparkles size={16} color={Colors.light.gold} />
              <Text style={styles.prayerCardLabel}>Your next prayer</Text>
              <Sparkles size={16} color={Colors.light.gold} />
            </View>
            <Text style={styles.prayerName}>{nextPrayer.name}</Text>
            <Text style={styles.prayerTime}>{nextPrayer.time}</Text>
            <View style={styles.remainingBadge}>
              <Clock size={14} color={Colors.light.primary} />
              <Text style={styles.remainingText}>in {nextPrayer.remaining}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.summaryCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <MapPin size={16} color={Colors.light.primary} />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryLabel}>Location</Text>
              <Text style={styles.summaryValue}>
                {locationData?.cityName || 'Location set'}
              </Text>
            </View>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <View style={styles.summaryIcon}>
              <Calculator size={16} color={Colors.light.primary} />
            </View>
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryLabel}>Calculation Method</Text>
              <Text style={styles.summaryValue}>
                {getMethodName(calculationMethod)}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.quoteContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.quoteText}>
            "And those who strive for Us - We will surely guide them to Our ways."
          </Text>
          <Text style={styles.quoteSource}>Quran 29:69</Text>
        </Animated.View>

        <View style={styles.spacer} />
        <View style={styles.footer}>
          <OnboardingButton
            title="Start My Journey"
            onPress={handleStart}
            loading={loading}
          />
          <OnboardingProgress currentStep={18} totalSteps={18} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  successBadge: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.gold,
    marginTop: 8,
    fontStyle: 'italic',
  },
  prayerCard: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 20,
    alignSelf: 'center',
  },
  prayerCardInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 24,
    alignItems: 'center',
  },
  sparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prayerCardLabel: {
    fontSize: 13,
    color: '#5C5650',
    marginHorizontal: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  prayerName: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  prayerTime: {
    fontSize: 44,
    fontWeight: '300',
    color: '#2D2A26',
    marginBottom: 16,
  },
  remainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    marginLeft: 8,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  summaryValue: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
    marginTop: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  quoteContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 15,
    color: '#ffffff',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    opacity: 0.9,
  },
  quoteSource: {
    fontSize: 13,
    color: Colors.light.gold,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  footer: {
    width: '100%',
    paddingTop: 20,
  },
});
