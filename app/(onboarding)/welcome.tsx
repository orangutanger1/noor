import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { G, Path } from 'react-native-svg';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import Colors from '@/constants/colors';
import { useResponsive } from '@/hooks/useResponsive';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isTablet, contentMaxWidth } = useResponsive();

  // Animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const featuresOpacity = useRef(new Animated.Value(0)).current;
  const featuresTranslate = useRef(new Animated.Value(20)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(30)).current;

  // Floating animation for logo
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(100, [
        Animated.parallel([
          Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(titleTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(featuresOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(featuresTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(buttonOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.spring(buttonTranslate, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
        ]),
      ]),
    ]).start();

    // Continuous floating animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    floatAnimation.start();

    return () => floatAnimation.stop();
  }, []);

  const handleContinue = () => {
    router.push('/(onboarding)/features');
  };

  const features = [
    'Prayer times & Qibla direction',
    'Daily Quran & Hadith',
    'Track your spiritual journey',
  ];

  return (
    <View style={styles.container}>
      {/* Background gradient circles */}
      <View style={styles.backgroundDecoration}>
        <View style={[styles.gradientCircle, styles.circle1]} />
        <View style={[styles.gradientCircle, styles.circle2]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[
          styles.content,
          { maxWidth: contentMaxWidth, alignSelf: isTablet ? 'center' : undefined, width: '100%' },
        ]}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [
                { scale: logoScale },
                {
                  translateY: floatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.logoBackground}>
            <Svg width={80} height={80} viewBox="0 0 512 512" fill="none">
              <G transform="translate(256, 256)">
                <Path
                  d="M0 -45 C 25 -45 50 -80 50 -130 C 50 -180 0 -210 0 -210 C 0 -210 -50 -180 -50 -130 C -50 -80 -25 -45 0 -45 Z"
                  fill="#FFFFFF"
                />
                <G transform="rotate(72)">
                  <Path
                    d="M0 -45 C 25 -45 50 -80 50 -130 C 50 -180 0 -210 0 -210 C 0 -210 -50 -180 -50 -130 C -50 -80 -25 -45 0 -45 Z"
                    fill="#FFFFFF"
                  />
                </G>
                <G transform="rotate(144)">
                  <Path
                    d="M0 -45 C 25 -45 50 -80 50 -130 C 50 -180 0 -210 0 -210 C 0 -210 -50 -180 -50 -130 C -50 -80 -25 -45 0 -45 Z"
                    fill="#FFFFFF"
                  />
                </G>
                <G transform="rotate(216)">
                  <Path
                    d="M0 -45 C 25 -45 50 -80 50 -130 C 50 -180 0 -210 0 -210 C 0 -210 -50 -180 -50 -130 C -50 -80 -25 -45 0 -45 Z"
                    fill="#FFFFFF"
                  />
                </G>
                <G transform="rotate(288)">
                  <Path
                    d="M0 -45 C 25 -45 50 -80 50 -130 C 50 -180 0 -210 0 -210 C 0 -210 -50 -180 -50 -130 C -50 -80 -25 -45 0 -45 Z"
                    fill="#FFFFFF"
                  />
                </G>
              </G>
            </Svg>
          </View>
        </Animated.View>

        {/* Title Section */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslate }],
            },
          ]}
        >
          <Text style={styles.arabicBismillah}>بِسْمِ اللَّهِ</Text>
          <Text style={styles.title}>Noor</Text>
        </Animated.View>

        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          Your companion for spiritual growth
        </Animated.Text>

        {/* Features */}
        <Animated.View
          style={[
            styles.featuresContainer,
            {
              opacity: featuresOpacity,
              transform: [{ translateY: featuresTranslate }],
            },
          ]}
        >
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.spacer} />

        {/* Bottom Section */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslate }],
            },
          ]}
        >
          <OnboardingButton
            title="Begin Your Journey"
            onPress={handleContinue}
          />
          <OnboardingProgress currentStep={0} totalSteps={18} />
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
  backgroundDecoration: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gradientCircle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circle1: {
    width: width * 1.5,
    height: width * 1.5,
    backgroundColor: 'rgba(4, 120, 87, 0.03)',
    top: -width * 0.5,
    right: -width * 0.5,
  },
  circle2: {
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: 'rgba(184, 134, 11, 0.02)',
    bottom: -width * 0.3,
    left: -width * 0.4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  arabicBismillah: {
    fontSize: 20,
    color: Colors.light.gold,
    marginBottom: 12,
    letterSpacing: 2,
  },
  title: {
    fontSize: 56,
    fontWeight: '200',
    color: '#2D2A26',
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 18,
    color: '#5C5650',
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: 0.5,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E2DD',
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#2D2A26',
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    width: '100%',
    paddingTop: 20,
  },
});
