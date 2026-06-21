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
import {
  GraduationCap,
  Briefcase,
  Building,
  Baby,
  Sun,
  MoreHorizontal,
  Check,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useOnboarding, LifeStage } from '@/providers/OnboardingProvider';
import { useResponsive } from '@/hooks/useResponsive';

const LIFESTAGE_OPTIONS: { value: LifeStage; label: string; description: string; icon: typeof GraduationCap }[] = [
  {
    value: 'student',
    label: 'Student',
    description: 'Focused on education',
    icon: GraduationCap,
  },
  {
    value: 'early_career',
    label: 'Early Career',
    description: 'Building my professional path',
    icon: Briefcase,
  },
  {
    value: 'established_career',
    label: 'Established Career',
    description: 'Settled in my profession',
    icon: Building,
  },
  {
    value: 'parent',
    label: 'Parent',
    description: 'Raising a family',
    icon: Baby,
  },
  {
    value: 'retired',
    label: 'Retired',
    description: 'Enjoying life at my pace',
    icon: Sun,
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Something else',
    icon: MoreHorizontal,
  },
];

export default function LifeStageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUserProfile, userProfile } = useOnboarding();
  const { isTablet, contentMaxWidth } = useResponsive();

  const [selected, setSelected] = useState<LifeStage | null>(userProfile.lifeStage);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const optionAnims = useRef(LIFESTAGE_OPTIONS.map(() => new Animated.Value(0))).current;

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
      Animated.stagger(60, optionAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      )).start();
    });
  }, []);

  const handleSelect = (value: LifeStage) => {
    setSelected(value);
  };

  const handleContinue = () => {
    if (selected) {
      updateUserProfile({ lifeStage: selected });
    }
    router.push('/(onboarding)/quote1');
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
          <Text style={styles.title}>Where are you{'\n'}in life?</Text>
          <Text style={styles.subtitle}>
            We'll personalize your experience accordingly
          </Text>
        </Animated.View>

        <View style={styles.optionsGrid}>
          {LIFESTAGE_OPTIONS.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selected === option.value;
            return (
              <Animated.View
                key={option.value}
                style={[
                  styles.optionWrapper,
                  {
                    opacity: optionAnims[index],
                    transform: [{
                      scale: optionAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => handleSelect(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.optionIcon,
                    isSelected && styles.optionIconSelected,
                  ]}>
                    <Icon
                      size={22}
                      color={isSelected ? '#FFFFFF' : Colors.light.primary}
                      strokeWidth={1.5}
                    />
                  </View>
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
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
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
          <OnboardingProgress currentStep={7} totalSteps={18} />
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
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 28,
    paddingHorizontal: 4,
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionWrapper: {
    width: '48%',
  },
  optionCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E5E2DD',
    position: 'relative',
    minHeight: 130,
  },
  optionCardSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F0EDE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  optionIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionLabel: {
    fontSize: 15,
    color: '#2D2A26',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: '#FFFFFF',
  },
  optionDescription: {
    fontSize: 12,
    color: '#9A8B70',
    textAlign: 'center',
  },
  optionDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
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
