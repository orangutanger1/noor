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
import { LinearGradient } from 'expo-linear-gradient';
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
  ChevronDown,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useOnboarding, Motivation } from '@/providers/OnboardingProvider';
import { useResponsive } from '@/hooks/useResponsive';

const MOTIVATION_OPTIONS: { value: Motivation; label: string; icon: typeof Clock }[] = [
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
  const { isTablet, contentMaxWidth } = useResponsive();

  const [selected, setSelected] = useState<Motivation[]>(userProfile.motivations || []);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const optionAnims = useRef(MOTIVATION_OPTIONS.map(() => new Animated.Value(0))).current;
  const scrollHintAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

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

    // Bouncing animation for scroll hint
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    bounceAnimation.start();

    return () => bounceAnimation.stop();
  }, []);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 20 && showScrollHint) {
      setShowScrollHint(false);
      Animated.timing(scrollHintAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

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
      <View style={[
        styles.content,
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, maxWidth: contentMaxWidth, alignSelf: isTablet ? 'center' : undefined, width: '100%' },
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
          <Text style={styles.title}>What brings you{'\n'}to Noor?</Text>
          <Text style={styles.subtitle}>
            Select all that apply
          </Text>
        </Animated.View>

        <View style={styles.scrollContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.optionsContainer}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
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
                    {isSelected && (
                      <View style={styles.checkIcon}>
                        <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </ScrollView>

          {/* Scroll hint with gradient */}
          <Animated.View
            style={[
              styles.scrollHintContainer,
              {
                opacity: scrollHintAnim,
                pointerEvents: showScrollHint ? 'none' : 'none',
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(255, 254, 249, 0)', 'rgba(255, 254, 249, 0.9)', 'rgba(255, 254, 249, 1)']}
              style={styles.scrollGradient}
            />
            <Animated.View
              style={[
                styles.scrollHint,
                {
                  transform: [{
                    translateY: bounceAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 6],
                    }),
                  }],
                },
              ]}
            >
              <ChevronDown size={20} color={Colors.light.primary} />
              <Text style={styles.scrollHintText}>Scroll for more</Text>
            </Animated.View>
          </Animated.View>
        </View>

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
          <OnboardingProgress currentStep={6} totalSteps={18} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEF9',
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
    color: '#2D2A26',
    marginBottom: 12,
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: '#5C5650',
  },
  scrollContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  optionsContainer: {
    gap: 10,
    paddingBottom: 60,
  },
  scrollHintContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scrollGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  scrollHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollHintText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '500',
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
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F0EDE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  optionIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    color: '#2D2A26',
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: '#FFFFFF',
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSection: {
    paddingTop: 16,
  },
  selectedCount: {
    textAlign: 'center',
    fontSize: 14,
    color: Colors.light.primary,
    marginBottom: 12,
    fontWeight: '500',
  },
});
