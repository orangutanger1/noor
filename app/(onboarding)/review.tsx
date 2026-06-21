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
import { Star, Heart, Users } from 'lucide-react-native';
import * as StoreReview from 'expo-store-review';
import Colors from '@/constants/colors';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useResponsive } from '@/hooks/useResponsive';

export default function ReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isTablet, contentMaxWidth } = useResponsive();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const starsAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.sequence([
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
      ]),
      Animated.spring(starsAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.stagger(100, cardAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      )),
    ]).start();
  }, []);

  const handleRate = async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      }
    } catch (_error) {
      // Silently continue if review isn't available
    }
    router.push('/(onboarding)/location');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/location');
  };

  const reasons = [
    {
      icon: Users,
      text: 'Help other Muslims discover Noor',
    },
    {
      icon: Heart,
      text: 'Support our small team\'s mission',
    },
    {
      icon: Star,
      text: 'Shape the future of this app',
    },
  ];

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
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.arabicText}>جَزَاكُمُ ٱللَّٰهُ خَيْرًا</Text>
          <Text style={styles.title}>Enjoying Noor{'\n'}so far?</Text>
          <Text style={styles.subtitle}>
            Your review helps other Muslims find their path
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.starsContainer,
            {
              opacity: starsAnim,
              transform: [{
                scale: starsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              }],
            },
          ]}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              size={32}
              color={Colors.light.gold}
              fill={Colors.light.gold}
              strokeWidth={1}
            />
          ))}
        </Animated.View>

        <View style={styles.reasonsContainer}>
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <Animated.View
                key={index}
                style={[
                  styles.reasonCard,
                  {
                    opacity: cardAnims[index],
                    transform: [{
                      translateY: cardAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    }],
                  },
                ]}
              >
                <View style={styles.reasonIcon}>
                  <Icon size={20} color={Colors.light.primary} strokeWidth={1.5} />
                </View>
                <Text style={styles.reasonText}>{reason.text}</Text>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
          <OnboardingButton
            title="Rate Noor"
            onPress={handleRate}
          />
          <OnboardingButton
            title="Maybe Later"
            variant="text"
            onPress={handleSkip}
          />
          <OnboardingProgress currentStep={13} totalSteps={18} />
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
    alignItems: 'center',
    marginBottom: 32,
  },
  arabicText: {
    fontSize: 22,
    color: Colors.light.gold,
    marginBottom: 16,
    letterSpacing: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#2D2A26',
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#5C5650',
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  reasonsContainer: {
    gap: 12,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E2DD',
  },
  reasonIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F0EDE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  reasonText: {
    flex: 1,
    fontSize: 16,
    color: '#2D2A26',
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    paddingTop: 20,
  },
});
