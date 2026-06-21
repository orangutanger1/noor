import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useResponsive } from '@/hooks/useResponsive';

export default function NameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateUserProfile, userProfile } = useOnboarding();
  const { isTablet, contentMaxWidth } = useResponsive();

  const [name, setName] = useState(userProfile.name || '');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const inputAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
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
      ]),
      Animated.spring(inputAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = () => {
    updateUserProfile({ name: name.trim() });
    router.push('/(onboarding)/gender');
  };

  const handleSkip = () => {
    router.push('/(onboarding)/gender');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
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
            <View style={styles.iconWrapper}>
              <User size={28} color={Colors.light.primary} strokeWidth={1.5} />
            </View>
            <Text style={styles.greeting}>Assalamu Alaikum!</Text>
            <Text style={styles.title}>What's your name?</Text>
            <Text style={styles.subtitle}>
              We'd love to personalize your experience
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.inputContainer,
              {
                opacity: inputAnim,
                transform: [{
                  scale: inputAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                }],
              },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#9A8B70"
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={name.trim() ? handleContinue : undefined}
              autoCapitalize="words"
              autoCorrect={false}
            />
            <View style={styles.inputLine} />
          </Animated.View>

          {name.trim().length > 0 && (
            <Animated.Text
              style={[
                styles.welcomeText,
                { opacity: fadeAnim },
              ]}
            >
              Nice to meet you, {name.trim().split(' ')[0]}!
            </Animated.Text>
          )}

          <View style={styles.spacer} />

          <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
            <OnboardingButton
              title="Continue"
              onPress={handleContinue}
              disabled={name.trim().length === 0}
            />
            <OnboardingButton
              title="Skip for now"
              variant="text"
              onPress={handleSkip}
            />
            <OnboardingProgress currentStep={3} totalSteps={18} />
          </Animated.View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F0EDE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: Colors.light.primary,
    marginBottom: 8,
    letterSpacing: 1,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#2D2A26',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#5C5650',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    fontSize: 24,
    color: '#2D2A26',
    textAlign: 'center',
    paddingVertical: 16,
    fontWeight: '300',
  },
  inputLine: {
    height: 2,
    backgroundColor: Colors.light.primary,
    borderRadius: 1,
    opacity: 0.3,
  },
  welcomeText: {
    fontSize: 18,
    color: '#5C5650',
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    paddingTop: 20,
  },
});
