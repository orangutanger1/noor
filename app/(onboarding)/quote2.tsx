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
import Colors from '@/constants/colors';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useResponsive } from '@/hooks/useResponsive';

export default function Quote2Screen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userProfile } = useOnboarding();
  const { isTablet, contentMaxWidth } = useResponsive();

  const fadeAnim = useRef(new Animated.Value(0)).current;
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
  }, []);

  const handleContinue = () => {
    // ponytail: review/social-proof screen skipped; re-add by routing to '/(onboarding)/review'
    router.push('/(onboarding)/location' as any);
  };

  return (
    <View style={styles.container}>
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
        <View style={styles.quoteContainer}>
          <Animated.View
            style={[
              styles.iconContainer,
              { opacity: fadeAnim },
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
        <Animated.View style={[styles.footer, { opacity: buttonAnim }]}>
          <OnboardingButton
            title="Let's Set Up Noor"
            onPress={handleContinue}
          />
          <OnboardingProgress currentStep={12} totalSteps={18} />
        </Animated.View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
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
    backgroundColor: 'rgba(184, 134, 11, 0.15)',
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
    flex: 1,
  },
  footer: {
    width: '100%',
    paddingTop: 20,
  },
});
