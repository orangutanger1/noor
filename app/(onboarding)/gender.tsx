import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useOnboarding, Gender } from '@/providers/OnboardingProvider';
import { useResponsive } from '@/hooks/useResponsive';

const GENDER_OPTIONS: { value: Gender; label: string; arabicLabel: string }[] = [
  { value: 'male', label: 'Brother', arabicLabel: 'أخ' },
  { value: 'female', label: 'Sister', arabicLabel: 'أخت' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say', arabicLabel: '' },
];

export default function GenderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUserProfile, userProfile } = useOnboarding();
  const { isTablet, contentMaxWidth } = useResponsive();

  const [selected, setSelected] = useState<Gender | null>(userProfile.gender);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const optionAnims = useRef(GENDER_OPTIONS.map(() => new Animated.Value(0))).current;

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
      Animated.stagger(100, optionAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      )).start();
    });
  }, []);

  const handleSelect = (value: Gender) => {
    setSelected(value);
  };

  const handleContinue = () => {
    if (selected) {
      updateUserProfile({ gender: selected });
    }
    router.push('/(onboarding)/age');
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
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>How should we{'\n'}address you?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your experience
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {GENDER_OPTIONS.map((option, index) => {
            const isSelected = selected === option.value;
            return (
              <Animated.View
                key={option.value}
                style={{
                  opacity: optionAnims[index],
                  transform: [{
                    translateY: optionAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => handleSelect(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <Text style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}>
                      {option.label}
                    </Text>
                    {option.arabicLabel ? (
                      <Text style={[
                        styles.optionArabic,
                        isSelected && styles.optionArabicSelected,
                      ]}>
                        {option.arabicLabel}
                      </Text>
                    ) : null}
                  </View>
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.spacer} />

        <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
          <OnboardingButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selected}
          />
          <OnboardingProgress currentStep={4} totalSteps={18} />
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
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#2D2A26',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: '#5C5650',
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E2DD',
  },
  optionCardSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionLabel: {
    fontSize: 18,
    color: '#2D2A26',
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: '#FFFFFF',
  },
  optionArabic: {
    fontSize: 18,
    color: '#9A8B70',
  },
  optionArabicSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    paddingTop: 20,
  },
});
