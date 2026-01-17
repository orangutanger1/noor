import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Clock,
  BookOpen,
  Target,
  GraduationCap,
  Users,
  Sparkles,
  Moon,
  Heart,
  Check,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useOnboarding, Motivation } from '@/providers/OnboardingProvider';

const MOTIVATION_OPTIONS: { value: Motivation; label: string; icon: any }[] = [
  { value: 'prayer_times', label: 'Accurate prayer times', icon: Clock },
  { value: 'quran_connection', label: 'Connect with Quran', icon: BookOpen },
  { value: 'build_habits', label: 'Build spiritual habits', icon: Target },
  { value: 'learn_more', label: 'Learn more about Islam', icon: GraduationCap },
  { value: 'community', label: 'Feel part of Ummah', icon: Users },
  { value: 'spiritual_growth', label: 'Grow spiritually', icon: Sparkles },
  { value: 'ramadan_prep', label: 'Prepare for Ramadan', icon: Moon },
  { value: 'new_muslim', label: "I'm new to Islam", icon: Heart },
];

export default function MotivationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUserProfile, userProfile } = useOnboarding();

  const [selected, setSelected] = useState<Motivation[]>(userProfile.motivations || []);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const optionAnims = useRef(MOTIVATION_OPTIONS.map(() => new Animated.Value(0))).current;

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
      Animated.stagger(50, optionAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      )).start();
    });
  }, []);

  const handleToggle = (value: Motivation) => {
    setSelected(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value);
      }
      return [...prev, value];
    });
  };

  const handleContinue = () => {
    updateUserProfile({ motivations: selected });
    router.push('/(onboarding)/lifestage');
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
          <Text style={styles.title}>What brings you{'\n'}to Noor?</Text>
          <Text style={styles.subtitle}>
            Select all that apply
          </Text>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.optionsContainer}
          showsVerticalScrollIndicator={false}
        >
          {MOTIVATION_OPTIONS.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selected.includes(option.value);
            return (
              <Animated.View
                key={option.value}
                style={{
                  opacity: optionAnims[index],
                  transform: [{
                    translateX: optionAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  }],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => handleToggle(option.value)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.optionIcon,
                    isSelected && styles.optionIconSelected,
                  ]}>
                    <Icon
                      size={20}
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
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Check size={16} color={Colors.light.gold} strokeWidth={2.5} />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </ScrollView>

        <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
          {selected.length > 0 && (
            <Text style={styles.selectedCount}>
              {selected.length} selected
            </Text>
          )}
          <OnboardingButton
            title="Continue"
            onPress={handleContinue}
            disabled={selected.length === 0}
          />
          <OnboardingProgress currentStep={6} totalSteps={16} />
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
    paddingHorizontal: 28,
  },
  header: {
    marginBottom: 24,
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
  scrollView: {
    flex: 1,
  },
  optionsContainer: {
    gap: 10,
    paddingBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  optionCardSelected: {
    backgroundColor: 'rgba(201, 162, 39, 0.1)',
    borderColor: Colors.light.gold,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionIconSelected: {
    backgroundColor: 'rgba(201, 162, 39, 0.2)',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: '#ffffff',
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(201, 162, 39, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    paddingTop: 16,
  },
  selectedCount: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.light.gold,
    marginBottom: 12,
  },
});
