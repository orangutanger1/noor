import React, { useState, useEffect } from 'react';
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
import { Sun, Moon, Check, Info } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboarding } from '@/providers/OnboardingProvider';

interface CalculationMethod {
  id: string;
  name: string;
  fullName: string;
  region: string;
  fajrAngle: number;
  ishaAngle: number;
}

const calculationMethods: CalculationMethod[] = [
  {
    id: 'isna',
    name: 'ISNA',
    fullName: 'Islamic Society of North America',
    region: 'North America',
    fajrAngle: 15,
    ishaAngle: 15,
  },
  {
    id: 'mwl',
    name: 'Muslim World League',
    fullName: 'Muslim World League',
    region: 'Europe, Far East',
    fajrAngle: 18,
    ishaAngle: 17,
  },
  {
    id: 'egypt',
    name: 'Egyptian',
    fullName: 'Egyptian General Authority of Survey',
    region: 'Africa, Middle East',
    fajrAngle: 19.5,
    ishaAngle: 17.5,
  },
  {
    id: 'makkah',
    name: 'Umm al-Qura',
    fullName: 'Umm al-Qura University, Makkah',
    region: 'Saudi Arabia',
    fajrAngle: 18.5,
    ishaAngle: 90, // 90 minutes after Maghrib
  },
];

export default function CalculationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setCalculationMethod, locationData } = useOnboarding();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [selectedMethod, setSelectedMethod] = useState<string>('isna');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Auto-select based on location if available
    // This is a simplified version - a real app would use more sophisticated logic
    if (locationData?.cityName) {
      const city = locationData.cityName.toLowerCase();
      if (city.includes('london') || city.includes('paris') || city.includes('berlin')) {
        setSelectedMethod('mwl');
      } else if (city.includes('cairo') || city.includes('dubai') || city.includes('kuwait')) {
        setSelectedMethod('egypt');
      } else if (city.includes('mecca') || city.includes('riyadh') || city.includes('jeddah')) {
        setSelectedMethod('makkah');
      }
    }
  }, [locationData]);

  const handleContinue = () => {
    setCalculationMethod(selectedMethod);
    router.push('/(onboarding)/notifications');
  };

  const getRecommendedBadge = (methodId: string) => {
    // Show recommended badge for ISNA by default or based on location
    if (methodId === selectedMethod && selectedMethod === 'isna') {
      return true;
    }
    return false;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primaryDark, Colors.light.primary, Colors.light.cream]}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Illustration */}
        <Animated.View style={[styles.illustrationContainer, { opacity: fadeAnim }]}>
          <View style={styles.illustration}>
            <View style={styles.sunMoon}>
              <Sun size={36} color={Colors.light.gold} />
              <View style={styles.horizon} />
              <Moon size={28} color={Colors.light.ivory} />
            </View>
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Prayer Time Calculation</Text>
          <Text style={styles.subtitle}>
            Different methods are used around the world. Choose the one common in your region:
          </Text>

          {/* Methods List */}
          <View style={styles.methodsList}>
            {calculationMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  selectedMethod === method.id && styles.methodCardSelected,
                ]}
                onPress={() => setSelectedMethod(method.id)}
                activeOpacity={0.7}
              >
                <View style={styles.methodRadio}>
                  {selectedMethod === method.id ? (
                    <View style={styles.radioSelected}>
                      <Check size={14} color={Colors.light.ivory} />
                    </View>
                  ) : (
                    <View style={styles.radioUnselected} />
                  )}
                </View>
                <View style={styles.methodInfo}>
                  <View style={styles.methodNameRow}>
                    <Text style={[
                      styles.methodName,
                      selectedMethod === method.id && styles.methodNameSelected,
                    ]}>
                      {method.name}
                    </Text>
                    {method.id === 'isna' && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>Recommended</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.methodFullName}>{method.fullName}</Text>
                  <Text style={styles.methodRegion}>{method.region}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Note */}
          <View style={styles.infoCard}>
            <Info size={16} color={Colors.light.textSecondary} />
            <Text style={styles.infoText}>
              You can change this anytime in Settings
            </Text>
          </View>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <OnboardingButton title="Continue" onPress={handleContinue} />
          <OnboardingProgress currentStep={2} totalSteps={5} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  illustration: {
    width: 140,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunMoon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  horizon: {
    position: 'absolute',
    bottom: 0,
    left: -20,
    right: -20,
    height: 3,
    backgroundColor: Colors.light.goldSoft,
    opacity: 0.6,
    borderRadius: 2,
  },
  mainContent: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.light.ivory,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.goldSoft,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  methodsList: {
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardSelected: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.ivory,
  },
  methodRadio: {
    marginRight: 14,
    marginTop: 2,
  },
  radioUnselected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.cream,
  },
  radioSelected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  methodNameSelected: {
    color: Colors.light.primary,
  },
  recommendedBadge: {
    backgroundColor: Colors.light.gold + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.gold,
    textTransform: 'uppercase',
  },
  methodFullName: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  methodRegion: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontStyle: 'italic',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginLeft: 8,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
});
