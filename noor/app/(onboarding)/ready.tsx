import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Calculator, Clock, Sparkles, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboarding } from '@/providers/OnboardingProvider';

const { width, height } = Dimensions.get('window');

export default function ReadyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { locationData, calculationMethod, completeOnboarding, userProfile } = useOnboarding();
  const firstName = userProfile.name ? userProfile.name.split(' ')[0] : '';
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(40));
  const [imageAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [checkAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);

  const [nextPrayer] = useState({
    name: 'Maghrib',
    time: '18:32',
    remaining: '54 minutes',
  });

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
      {/* Background Image */}
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
          source={require('@/assets/images/onboarding/kaaba.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[
            'rgba(26, 54, 54, 0.3)',
            'rgba(26, 54, 54, 0.6)',
            'rgba(26, 54, 54, 0.95)',
          ]}
          locations={[0, 0.45, 0.8]}
          style={styles.imageOverlay}
        />
      </Animated.View>

      <View style={[styles.content, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 20 }]}>
        {/* Success Badge */}
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
            <Check size={28} color={Colors.light.ivory} strokeWidth={3} />
          </View>
        </Animated.View>

        {/* Title */}
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

        {/* Prayer Preview Card */}
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

        {/* Settings Summary */}
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

        {/* Quote */}
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

        {/* Footer */}
        <View style={styles.footer}>
          <OnboardingButton
            title="Start My Journey"
            onPress={handleStart}
            loading={loading}
          />
          <OnboardingProgress currentStep={15} totalSteps={16} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primaryDark,
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: width,
    height: height,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  successBadge: {
    marginBottom: 20,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.light.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.light.ivory,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.goldSoft,
    marginTop: 8,
    fontStyle: 'italic',
  },
  prayerCard: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 20,
  },
  prayerCardInner: {
    backgroundColor: Colors.light.ivory,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  sparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  prayerCardLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginHorizontal: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  prayerName: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  prayerTime: {
    fontSize: 44,
    fontWeight: '300',
    color: Colors.light.text,
    marginBottom: 16,
  },
  remainingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    marginLeft: 8,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.light.goldSoft,
    opacity: 0.8,
  },
  summaryValue: {
    fontSize: 15,
    color: Colors.light.ivory,
    fontWeight: '600',
    marginTop: 2,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 12,
  },
  quoteContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
    color: Colors.light.gold,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    width: '100%',
    paddingTop: 16,
  },
});
