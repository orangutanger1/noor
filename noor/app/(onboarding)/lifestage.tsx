import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

const LIFESTAGE_OPTIONS: { value: LifeStage; label: string; description: string; icon: any }[] = [
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
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#0f172a']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />

      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
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
                      color={isSelected ? Colors.light.gold : 'rgba(255,255,255,0.5)'}
                      strokeWidth={1.5}
                    />
                  </View>
                  <Text style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Check size={12} color={Colors.light.gold} strokeWidth={3} />
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
          <OnboardingProgress currentStep={7} totalSteps={16} />
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
    color: '#ffffff',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
    minHeight: 130,
  },
  optionCardSelected: {
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
    borderColor: Colors.light.gold,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  optionIconSelected: {
    backgroundColor: 'rgba(201, 162, 39, 0.2)',
  },
  optionLabel: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: '#ffffff',
  },
  optionDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(201, 162, 39, 0.3)',
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
