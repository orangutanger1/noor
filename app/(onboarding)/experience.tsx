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
import { useOnboarding, IslamicExperience } from '@/providers/OnboardingProvider';
import { useResponsive } from '@/hooks/useResponsive';

const EXPERIENCE_OPTIONS: { value: IslamicExperience; label: string; description: string }[] = [
  {
    value: 'new_to_islam',
    label: 'New to Islam',
    description: 'Recently embraced Islam or just starting to learn',
  },
  {
    value: 'growing',
    label: 'Growing',
    description: 'Learning the basics and building foundations',
  },
  {
    value: 'practicing',
    label: 'Practicing',
    description: 'Comfortable with basics, seeking deeper understanding',
  },
  {
    value: 'knowledgeable',
    label: 'Knowledgeable',
    description: 'Well-versed in Islamic teachings',
  },
];

export default function ExperienceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUserProfile, userProfile } = useOnboarding();
  const { isTablet, contentMaxWidth } = useResponsive();

  const [selected, setSelected] = useState<IslamicExperience | null>(userProfile.islamicExperience);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const optionAnims = useRef(EXPERIENCE_OPTIONS.map(() => new Animated.Value(0))).current;

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

  const handleSelect = (value: IslamicExperience) => {
    setSelected(value);
  };

  const handleContinue = () => {
    if (selected) {
      updateUserProfile({ islamicExperience: selected });
    }
    router.push('/(onboarding)/commitment');
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
          <Text style={styles.title}>Your Islamic{'\n'}journey so far</Text>
          <Text style={styles.subtitle}>
            Everyone's path is unique — where are you today?
          </Text>
        </Animated.View>

        <View style={styles.optionsContainer}>
          {EXPERIENCE_OPTIONS.map((option, index) => {
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
                  <View style={styles.optionText}>
                    <Text style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}>
                      {option.label}
                    </Text>
                    <Text style={[
                      styles.optionDescription,
                      isSelected && styles.optionDescriptionSelected,
                    ]}>
                      {option.description}
                    </Text>
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

        <Animated.Text
          style={[
            styles.reassurance,
            { opacity: fadeAnim },
          ]}
        >
          No judgment here — we're all learning together
        </Animated.Text>

        <View style={styles.spacer} />

        <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
          <OnboardingButton
            title="Continue"
            onPress={handleContinue}
            disabled={!selected}
          />
          <OnboardingProgress currentStep={10} totalSteps={18} />
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
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E2DD',
  },
  optionCardSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 17,
    color: '#2D2A26',
    fontWeight: '600',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#FFFFFF',
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
  },
  reassurance: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9A8B70',
    marginTop: 20,
    fontStyle: 'italic',
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    paddingTop: 20,
  },
});
