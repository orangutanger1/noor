import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Compass, BookOpen, PenLine } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { FeatureItem } from '@/components/onboarding/FeatureItem';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGetStarted = () => {
    router.push('/(onboarding)/location');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primaryDark, Colors.light.primary, Colors.light.cream]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
        {/* Header Section */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* App Icon Placeholder */}
          <View style={styles.iconContainer}>
            <View style={styles.iconInner}>
              <Text style={styles.iconText}>N</Text>
            </View>
            <View style={styles.iconGlow} />
          </View>

          <Text style={styles.bismillah}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>

          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.appName}>Noor</Text>
          <Text style={styles.tagline}>Illuminate Your Spiritual Path</Text>
        </Animated.View>

        {/* Features Section */}
        <Animated.View
          style={[
            styles.featuresContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <FeatureItem
            icon={Clock}
            title="Accurate Prayer Times"
            description="Location-based calculations for your city"
          />
          <FeatureItem
            icon={Compass}
            title="Qibla Direction"
            description="Find the direction to Mecca instantly"
          />
          <FeatureItem
            icon={BookOpen}
            title="Daily Quran & Hadith"
            description="Start each day with divine inspiration"
          />
          <FeatureItem
            icon={PenLine}
            title="Private Spiritual Journal"
            description="Reflect and track your spiritual growth"
          />
        </Animated.View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <OnboardingButton
            title="Get Started"
            onPress={handleGetStarted}
          />
          <OnboardingProgress currentStep={0} totalSteps={5} />
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
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    position: 'relative',
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
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 34,
    backgroundColor: Colors.light.gold,
    opacity: 0.15,
    zIndex: -1,
  },
  iconText: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  bismillah: {
    fontSize: 20,
    color: Colors.light.goldSoft,
    fontWeight: '500',
    marginBottom: 24,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    color: Colors.light.ivory,
    fontWeight: '400',
    opacity: 0.9,
  },
  appName: {
    fontSize: 48,
    color: Colors.light.ivory,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.light.goldSoft,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  featuresContainer: {
    marginTop: 32,
  },
  footer: {
    marginTop: 'auto',
  },
});
