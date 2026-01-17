import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calculator, Check, Info, Globe } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboarding } from '@/providers/OnboardingProvider';

const { width, height } = Dimensions.get('window');

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
    ishaAngle: 90,
  },
];

export default function CalculationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setCalculationMethod, locationData } = useOnboarding();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [imageAnim] = useState(new Animated.Value(0));
  const [selectedMethod, setSelectedMethod] = useState<string>('isna');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(imageAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

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

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Animated.View style={[styles.imageContainer, { opacity: imageAnim }]}>
        <Image
          source={require('@/assets/images/onboarding/caveofhira.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <LinearGradient
          colors={[
            'rgba(26, 54, 54, 0.5)',
            'rgba(26, 54, 54, 0.75)',
            'rgba(26, 54, 54, 0.98)',
          ]}
          locations={[0, 0.35, 0.65]}
          style={styles.imageOverlay}
        />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Calculator size={28} color={Colors.light.gold} />
          </View>
          <Text style={styles.title}>Prayer Calculation</Text>
          <Text style={styles.subtitle}>
            Select the calculation method used in your region for accurate prayer times
          </Text>
        </Animated.View>

        {/* Methods List */}
        <Animated.View
          style={[
            styles.methodsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {calculationMethods.map((method, index) => (
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
                  <Text
                    style={[
                      styles.methodName,
                      selectedMethod === method.id && styles.methodNameSelected,
                    ]}
                  >
                    {method.name}
                  </Text>
                  {method.id === 'isna' && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>Popular</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.methodFullName}>{method.fullName}</Text>
                <View style={styles.regionRow}>
                  <Globe size={12} color={Colors.light.textMuted} />
                  <Text style={styles.methodRegion}>{method.region}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Info Note */}
        <Animated.View
          style={[
            styles.infoCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Info size={16} color={Colors.light.goldSoft} />
          <Text style={styles.infoText}>
            You can change this anytime in Settings
          </Text>
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          <OnboardingButton title="Continue" onPress={handleContinue} />
          <OnboardingProgress currentStep={13} totalSteps={16} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primaryDark,
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: width,
    height: height,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    flexGrow: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.ivory,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.goldSoft,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  methodsContainer: {
    marginBottom: 16,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardSelected: {
    borderColor: Colors.light.gold,
    backgroundColor: Colors.light.ivory,
  },
  methodRadio: {
    marginRight: 14,
    marginTop: 2,
  },
  radioUnselected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.cream,
  },
  radioSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.text,
  },
  methodNameSelected: {
    color: Colors.light.primary,
  },
  recommendedBadge: {
    backgroundColor: Colors.light.gold + '25',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 10,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  methodFullName: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodRegion: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginLeft: 6,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderRadius: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: Colors.light.goldSoft,
    marginLeft: 8,
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
});
