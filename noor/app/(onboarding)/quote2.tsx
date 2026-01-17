import React, { useEffect, useRef } from 'react';
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
import Colors from '@/constants/colors';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useOnboarding } from '@/providers/OnboardingProvider';

const { width } = Dimensions.get('window');

export default function Quote2Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile } = useOnboarding();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  const firstName = userProfile.name ? userProfile.name.split(' ')[0] : '';

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleContinue = () => {
    router.push('/(onboarding)/location');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f172a', '#1a2744', '#0f172a']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />

      {/* Decorative circles */}
      <Animated.View
        style={[
          styles.circle1,
          { transform: [{ scale: pulseAnim }] },
        ]}
      />
      <Animated.View
        style={[
          styles.circle2,
          { transform: [{ scale: pulseAnim }] },
        ]}
      />

      <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.quoteContainer}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Text style={styles.crescent}>☪</Text>
          </Animated.View>

          <Animated.Text
            style={[
              styles.personalMessage,
              {
                opacity: textAnim,
                transform: [{
                  translateY: textAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                }],
              },
            ]}
          >
            {firstName ? `${firstName}, you're not alone` : "You're not alone"}
          </Animated.Text>

          <Animated.Text
            style={[
              styles.hadithText,
              {
                opacity: textAnim,
                transform: [{
                  translateY: textAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                }],
              },
            ]}
          >
            "Take benefit of five before five:{'\n'}
            your youth before your old age,{'\n'}
            your health before your sickness,{'\n'}
            your wealth before your poverty,{'\n'}
            your free time before your busyness,{'\n'}
            and your life before your death."
          </Animated.Text>

          <Animated.Text
            style={[
              styles.sourceText,
              { opacity: textAnim },
            ]}
          >
            — Prophet Muhammad ﷺ (Hakim)
          </Animated.Text>
        </View>

        <Animated.View
          style={[
            styles.encouragement,
            { opacity: textAnim },
          ]}
        >
          <Text style={styles.encouragementText}>
            Let's make the most of your time together
          </Text>
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View style={[styles.bottomSection, { opacity: buttonAnim }]}>
          <OnboardingButton
            title="Let's Set Up Noor"
            onPress={handleContinue}
          />
          <OnboardingProgress currentStep={11} totalSteps={16} />
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
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  circle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(201, 162, 39, 0.05)',
  },
  circle2: {
    position: 'absolute',
    bottom: -50,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(201, 162, 39, 0.03)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  quoteContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  crescent: {
    fontSize: 36,
    color: Colors.light.gold,
  },
  personalMessage: {
    fontSize: 24,
    fontWeight: '300',
    color: Colors.light.gold,
    textAlign: 'center',
    marginBottom: 24,
  },
  hadithText: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 28,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  sourceText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
  encouragement: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  spacer: {
    flex: 0.1,
  },
  bottomSection: {
    paddingTop: 20,
  },
});
