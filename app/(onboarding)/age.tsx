import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useOnboarding, AgeRange } from '@/providers/OnboardingProvider';
import { useResponsive } from '@/hooks/useResponsive';

const AGE_OPTIONS: { value: AgeRange; label: string }[] = [
  { value: '13-17', label: '13-17 years' },
  { value: '18-24', label: '18-24 years' },
  { value: '25-34', label: '25-34 years' },
  { value: '35-44', label: '35-44 years' },
  { value: '45-54', label: '45-54 years' },
  { value: '55+', label: '55+ years' },
];

export default function AgeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUserProfile, userProfile } = useOnboarding();
  const { isTablet, contentMaxWidth } = useResponsive();

  const [selected, setSelected] = useState<AgeRange>(userProfile.ageRange || '25-34');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pickerAnim = useRef(new Animated.Value(0)).current;

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
      Animated.spring(pickerAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const handleContinue = () => {
    updateUserProfile({ ageRange: selected });
    router.push('/(onboarding)/motivation');
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
          <Text style={styles.title}>What's your{'\n'}age range?</Text>
          <Text style={styles.subtitle}>
            This helps us tailor content to your life stage
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.pickerContainer,
            {
              opacity: pickerAnim,
              transform: [{
                scale: pickerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              }],
            },
          ]}
        >
          <Picker
            selectedValue={selected}
            onValueChange={(value) => setSelected(value)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {AGE_OPTIONS.map((option) => (
              <Picker.Item
                key={option.value}
                label={option.label}
                value={option.value}
                color={Platform.OS === 'ios' ? Colors.light.text : undefined}
              />
            ))}
          </Picker>
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
          <OnboardingButton
            title="Continue"
            onPress={handleContinue}
          />
          <OnboardingProgress currentStep={5} totalSteps={18} />
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
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E2DD',
    overflow: 'hidden',
  },
  picker: {
    height: 200,
  },
  pickerItem: {
    fontSize: 20,
    color: Colors.light.text,
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    paddingTop: 20,
  },
});
