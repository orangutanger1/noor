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
import { useOnboarding, CommitmentLevel } from '@/providers/OnboardingProvider';
import { useResponsive } from '@/hooks/useResponsive';

const COMMITMENT_OPTIONS: { value: CommitmentLevel; label: string; description: string; arabicWord: string }[] = [
  {
    value: 'exploring',
    label: 'Exploring',
    description: 'Curious and learning about Islamic practices',
    arabicWord: 'مستكشف',
  },
  {
    value: 'building_habits',
    label: 'Building Habits',
    description: 'Working on establishing consistent routines',
    arabicWord: 'متطور',
  },
  {
    value: 'consistent',
    label: 'Consistent',
    description: 'Regularly practicing the fundamentals',
    arabicWord: 'ملتزم',
  },
  {
    value: 'devoted',
    label: 'Devoted',
    description: 'Deeply committed to my spiritual practice',
    arabicWord: 'مُخلص',
  },
];

export default function CommitmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUserProfile, userProfile } = useOnboarding();
  const { isTablet, contentMaxWidth } = useResponsive();

  const [selected, setSelected] = useState<CommitmentLevel | null>(userProfile.commitmentLevel);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const optionAnims = useRef(COMMITMENT_OPTIONS.map(() => new Animated.Value(0))).current;

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
      Animated.stagger(80, optionAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      )).start();
    });
  }, []);

  const handleSelect = (value: CommitmentLevel) => {
    setSelected(value);
  };

  const handleContinue = () => {
    if (selected) {
      updateUserProfile({ commitmentLevel: selected });
    }
    router.push('/(onboarding)/quote2');
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
          <Text style={styles.title}>Your current{'\n'}spiritual practice</Text>
          <Text style={styles.subtitle}>
            Be honest — this helps us support you better
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {COMMITMENT_OPTIONS.map((option, index) => {
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
                    <View style={styles.optionHeader}>
                      <Text style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={[
                        styles.optionArabic,
                        isSelected && styles.optionArabicSelected,
                      ]}>
                        {option.arabicWord}
                      </Text>
                    </View>
                    <Text style={[
                      styles.optionDescription,
                      isSelected && styles.optionDescriptionSelected,
                    ]}>
                      {option.description}
                    </Text>
                  </View>
                  <View style={[styles.checkIcon, !isSelected && styles.checkIconHidden]}>
                    <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
                  </View>
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
          <OnboardingProgress currentStep={11} totalSteps={18} />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E2DD',
  },
  optionCardSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  optionLabel: {
    fontSize: 17,
    color: '#2D2A26',
    fontWeight: '600',
  },
  optionLabelSelected: {
    color: '#FFFFFF',
  },
  optionArabic: {
    fontSize: 16,
    color: '#9A8B70',
  },
  optionArabicSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  optionDescription: {
    fontSize: 13,
    color: '#9A8B70',
    lineHeight: 18,
  },
  optionDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  checkIconHidden: {
    opacity: 0,
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    paddingTop: 20,
  },
});
