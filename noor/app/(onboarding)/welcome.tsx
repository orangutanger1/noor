import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { CrescentStar } from '@/components/IslamicPattern';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Staggered entrance animations
  const imageScale = useRef(new Animated.Value(1.1)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const symbolOpacity = useRef(new Animated.Value(0)).current;
  const symbolTranslate = useRef(new Animated.Value(-20)).current;
  const arabicOpacity = useRef(new Animated.Value(0)).current;
  const arabicTranslate = useRef(new Animated.Value(20)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(30)).current;
  const descriptionOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslate = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Orchestrated cinematic entrance
    Animated.sequence([
      // Image fade and subtle zoom
      Animated.parallel([
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(imageScale, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Staggered content animations
    Animated.stagger(150, [
      // Symbol
      Animated.parallel([
        Animated.timing(symbolOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(symbolTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      // Arabic text
      Animated.parallel([
        Animated.timing(arabicOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(arabicTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      // Title
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(titleTranslate, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
      // Description
      Animated.timing(descriptionOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      // Button
      Animated.parallel([
        Animated.timing(buttonOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(buttonTranslate, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleContinue = () => {
    router.push('/(onboarding)/features');
  };

  return (
    <View style={styles.container}>
      {/* Background Image with Ken Burns effect */}
      <Animated.View
        style={[
          styles.imageWrapper,
          {
            opacity: imageOpacity,
            transform: [{ scale: imageScale }],
          },
        ]}
      >
        <Image
          source={require('@/assets/images/onboarding/kaaba.png')}
          style={styles.backgroundImage}
          contentFit="cover"
          transition={400}
          placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
        />
      </Animated.View>

      {/* Gradient overlay */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(10, 16, 32, 0.3)',
          'rgba(10, 16, 32, 0.7)',
          'rgba(10, 16, 32, 0.95)',
        ]}
        locations={[0, 0.35, 0.6, 0.85]}
        style={styles.gradient}
      />

      {/* Content */}
      <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.spacer} />

        {/* Text Content */}
        <View style={styles.textContent}>
          {/* Crescent symbol */}
          <Animated.View
            style={[
              styles.symbolContainer,
              {
                opacity: symbolOpacity,
                transform: [{ translateY: symbolTranslate }],
              },
            ]}
          >
            <CrescentStar size={44} color="#FDE68A" opacity={0.9} />
          </Animated.View>

          {/* Arabic Bismillah */}
          <Animated.Text
            style={[
              styles.arabicText,
              {
                opacity: arabicOpacity,
                transform: [{ translateY: arabicTranslate }],
              },
            ]}
          >
            بِسْمِ اللَّهِ
          </Animated.Text>

          {/* Title */}
          <Animated.View
            style={{
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslate }],
            }}
          >
            <Text style={styles.title}>Noor</Text>
            <Text style={styles.subtitle}>Your spiritual companion</Text>
          </Animated.View>

          {/* Description */}
          <Animated.Text style={[styles.description, { opacity: descriptionOpacity }]}>
            Prayer times, Quran, and daily reflection{'\n'}to illuminate your path
          </Animated.Text>
        </View>

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
            title="Get Started"
            onPress={handleContinue}
          />
          <OnboardingProgress currentStep={0} totalSteps={16} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1020',
  },
  imageWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: width,
    height: height,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  spacer: {
    flex: 0.45,
  },
  textContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  symbolContainer: {
    marginBottom: 24,
  },
  arabicText: {
    fontSize: 26,
    color: 'rgba(253, 230, 138, 0.85)',
    marginBottom: 20,
    letterSpacing: 3,
    fontWeight: '300',
  },
  title: {
    fontSize: 64,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.55)',
    fontWeight: '400',
    letterSpacing: 1,
    marginBottom: 28,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.4)',
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  bottomSection: {
    paddingTop: 20,
  },
});
