import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, BookOpen, Heart, Compass } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useResponsive } from '@/hooks/useResponsive';

const FEATURES = [
  {
    icon: Clock,
    title: 'Accurate Prayer Times',
    description: 'Never miss a prayer with precise calculations',
  },
  {
    icon: Compass,
    title: 'Qibla Direction',
    description: 'Find the direction to Mecca anywhere',
  },
  {
    icon: BookOpen,
    title: 'Daily Inspiration',
    description: 'Quran verses and Hadith to guide your day',
  },
  {
    icon: Heart,
    title: 'Track Your Journey',
    description: 'Build consistent spiritual habits',
  },
];

export default function FeaturesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isTablet, contentMaxWidth } = useResponsive();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const featureAnims = useRef(FEATURES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.stagger(100, featureAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      )).start();
    });
  }, []);

  const handleContinue = () => {
    router.push('/(onboarding)/stats');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
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
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.title}>Everything you need</Text>
          <Text style={styles.subtitle}>
            A complete companion for your spiritual journey
          </Text>
        </Animated.View>

        <View style={styles.featuresContainer}>
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Animated.View
                key={index}
                style={[
                  styles.featureCard,
                  {
                    opacity: featureAnims[index],
                    transform: [{
                      translateX: featureAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [-30, 0],
                      }),
                    }],
                  },
                ]}
              >
                <View style={styles.featureIcon}>
                  <Icon size={22} color={Colors.light.primary} strokeWidth={1.5} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
          <OnboardingButton
            title="Continue"
            onPress={handleContinue}
          />
          <OnboardingProgress currentStep={1} totalSteps={18} />
        </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEF9',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '300',
    color: '#2D2A26',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#5C5650',
    lineHeight: 24,
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E2DD',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F0EDE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2A26',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#5C5650',
  },
  bottomSection: {
    paddingTop: 20,
  },
});
