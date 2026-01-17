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

const { width, height } = Dimensions.get('window');

export default function Quote1Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const arabicAnim = useRef(new Animated.Value(0)).current;
  const translationAnim = useRef(new Animated.Value(0)).current;
  const sourceAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(300, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(arabicAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translationAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(sourceAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    router.push('/(onboarding)/experience');
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image
          source={require('@/assets/images/onboarding/caveofhira.png')}
          style={styles.backgroundImage}
          contentFit="cover"
          transition={400}
        />
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.3)', 'rgba(15, 23, 42, 0.7)', 'rgba(15, 23, 42, 0.95)']}
          locations={[0, 0.4, 0.75]}
          style={styles.gradient}
        />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.quoteContainer}>
          <Animated.View
            style={[
              styles.decorativeLine,
              { opacity: fadeAnim },
            ]}
          />

          <Animated.Text
            style={[
              styles.arabicText,
              {
                opacity: arabicAnim,
                transform: [{
                  translateY: arabicAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                }],
              },
            ]}
          >
            إِنَّ مَعَ الْعُسْرِ يُسْرًا
          </Animated.Text>

          <Animated.Text
            style={[
              styles.translationText,
              {
                opacity: translationAnim,
                transform: [{
                  translateY: translationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                }],
              },
            ]}
          >
            "Verily, with hardship{'\n'}comes ease."
          </Animated.Text>

          <Animated.Text
            style={[
              styles.sourceText,
              { opacity: sourceAnim },
            ]}
          >
            — Surah Ash-Sharh (94:6)
          </Animated.Text>

          <Animated.View
            style={[
              styles.decorativeLine,
              { opacity: fadeAnim, marginTop: 32 },
            ]}
          />
        </View>

        <View style={styles.spacer} />

        <Animated.View style={[styles.bottomSection, { opacity: buttonAnim }]}>
          <OnboardingButton
            title="Continue"
            onPress={handleContinue}
          />
          <OnboardingProgress currentStep={8} totalSteps={16} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
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
  quoteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  decorativeLine: {
    width: 60,
    height: 2,
    backgroundColor: Colors.light.gold,
    opacity: 0.5,
    marginVertical: 24,
  },
  arabicText: {
    fontSize: 32,
    color: Colors.light.gold,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 2,
    lineHeight: 48,
  },
  translationText: {
    fontSize: 26,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '300',
    lineHeight: 38,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  sourceText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  spacer: {
    flex: 0.3,
  },
  bottomSection: {
    paddingTop: 20,
  },
});
