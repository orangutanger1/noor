import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Calculator, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboarding } from '@/providers/OnboardingProvider';

export default function ReadyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { locationData, calculationMethod, completeOnboarding } = useOnboarding();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [loading, setLoading] = useState(false);

  // Mock next prayer time - in a real app this would be calculated
  const [nextPrayer] = useState({
    name: 'Maghrib',
    time: '18:32',
    remaining: '54 minutes',
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
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
      // Navigate to main app and reset navigation stack
      router.replace('/(tabs)');
    } catch (error) {
      console.log('Error completing onboarding:', error);
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primaryDark, Colors.light.primary, Colors.light.cream]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
        {/* Success Animation */}
        <Animated.View
          style={[
            styles.illustrationContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.successIcon}>
            <View style={styles.iconGlow1} />
            <View style={styles.iconGlow2} />
            <View style={styles.iconInner}>
              <Text style={styles.iconText}>N</Text>
            </View>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View style={[styles.titleContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>You're All Set!</Text>
        </Animated.View>

        {/* Prayer Preview Card */}
        <Animated.View style={[styles.prayerCard, { opacity: fadeAnim }]}>
          <Text style={styles.prayerCardLabel}>Your next prayer:</Text>
          <Text style={styles.prayerName}>{nextPrayer.name}</Text>
          <Text style={styles.prayerTime}>{nextPrayer.time}</Text>
          <View style={styles.remainingBadge}>
            <Clock size={14} color={Colors.light.primary} />
            <Text style={styles.remainingText}>in {nextPrayer.remaining}</Text>
          </View>
        </Animated.View>

        {/* Settings Summary */}
        <Animated.View style={[styles.summaryContainer, { opacity: fadeAnim }]}>
          <View style={styles.summaryItem}>
            <MapPin size={16} color={Colors.light.goldSoft} />
            <Text style={styles.summaryText}>
              {locationData?.cityName || 'Location set'}
            </Text>
          </View>
          <View style={styles.summaryDot} />
          <View style={styles.summaryItem}>
            <Calculator size={16} color={Colors.light.goldSoft} />
            <Text style={styles.summaryText}>
              {getMethodName(calculationMethod)}
            </Text>
          </View>
        </Animated.View>

        {/* Quote */}
        <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim }]}>
          <Text style={styles.quoteText}>
            "And those who strive for Us - We will surely guide them to Our ways."
          </Text>
          <Text style={styles.quoteSource}>— Quran 29:69</Text>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <OnboardingButton
            title="Start My Journey"
            onPress={handleStart}
            loading={loading}
          />
          <OnboardingProgress currentStep={4} totalSteps={5} />
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
    alignItems: 'center',
  },
  illustrationContainer: {
    marginBottom: 24,
  },
  successIcon: {
    width: 100,
    height: 100,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.gold,
    opacity: 0.1,
  },
  iconGlow2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.light.gold,
    opacity: 0.05,
  },
  iconInner: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.light.ivory,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  iconText: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.ivory,
    textAlign: 'center',
  },
  prayerCard: {
    backgroundColor: Colors.light.ivory,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
  },
  prayerCardLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  prayerName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  prayerTime: {
    fontSize: 36,
    fontWeight: '300',
    color: Colors.light.text,
    marginBottom: 12,
  },
  remainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
    marginLeft: 6,
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 13,
    color: Colors.light.goldSoft,
    marginLeft: 6,
  },
  summaryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.goldSoft,
    opacity: 0.5,
    marginHorizontal: 12,
  },
  quoteContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quoteText: {
    fontSize: 15,
    color: Colors.light.ivory,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    opacity: 0.9,
  },
  quoteSource: {
    fontSize: 13,
    color: Colors.light.goldSoft,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
  },
});
