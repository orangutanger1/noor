import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calculator, Check, Info, Globe, ChevronDown } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useResponsive } from '@/hooks/useResponsive';

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
  {
    id: 'karachi',
    name: 'Karachi',
    fullName: 'University of Islamic Sciences, Karachi',
    region: 'Pakistan, Bangladesh',
    fajrAngle: 18,
    ishaAngle: 18,
  },
  {
    id: 'uoif',
    name: 'UOIF',
    fullName: 'Union Organization islamic de France',
    region: 'France',
    fajrAngle: 12,
    ishaAngle: 12,
  },
  {
    id: 'singapore',
    name: 'Singapore',
    fullName: 'Majlis Ugama Islam Singapura',
    region: 'Singapore',
    fajrAngle: 20,
    ishaAngle: 18,
  },
];

export default function CalculationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setCalculationMethod, locationData } = useOnboarding();
  const { isTablet, contentMaxWidth } = useResponsive();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const [selectedMethod, setSelectedMethod] = useState<string>('isna');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const selectedMethodData = calculationMethods.find(m => m.id === selectedMethod) || calculationMethods[0];

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
  }, []);

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
    setDropdownVisible(false);
  };

  const handleContinue = () => {
    setCalculationMethod(selectedMethod);
    router.push('/(onboarding)/notifications');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, { opacity: imageAnim }]}>
        <Image
          source={isTablet
            ? require('@/assets/images/onboarding/ipadcave.jpeg')
            : require('@/assets/images/onboarding/caveofhira.png')
          }
          style={styles.backgroundImage}
          contentFit="cover"
        />
        <View style={styles.overlay} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[
          styles.content,
          { maxWidth: contentMaxWidth, alignSelf: isTablet ? 'center' : undefined, width: '100%' },
        ]}>
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

        <Animated.View
          style={[
            styles.methodsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.dropdownContent}>
              <View style={styles.methodInfo}>
                <View style={styles.methodNameRow}>
                  <Text style={[styles.methodName, styles.methodNameSelected]}>
                    {selectedMethodData.name}
                  </Text>
                  {selectedMethodData.id === 'isna' && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>Recommended</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.methodFullName}>{selectedMethodData.fullName}</Text>
                <View style={styles.regionRow}>
                  <Globe size={12} color="#9A8B70" />
                  <Text style={styles.methodRegion}>{selectedMethodData.region}</Text>
                </View>
              </View>
              <ChevronDown size={20} color={Colors.light.textMuted} />
            </View>
          </TouchableOpacity>

          <Modal
            visible={dropdownVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setDropdownVisible(false)}
            >
              <View style={styles.dropdownMenu}>
                <Text style={styles.dropdownTitle}>Select Calculation Method</Text>
                {calculationMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.dropdownItem,
                      selectedMethod === method.id && styles.dropdownItemSelected,
                    ]}
                    onPress={() => handleSelectMethod(method.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dropdownItemContent}>
                      <View style={styles.methodInfo}>
                        <View style={styles.methodNameRow}>
                          <Text
                            style={[
                              styles.dropdownItemName,
                              selectedMethod === method.id && styles.dropdownItemNameSelected,
                            ]}
                          >
                            {method.name}
                          </Text>
                          {method.id === 'isna' && (
                            <View style={styles.recommendedBadge}>
                              <Text style={styles.recommendedText}>Recommended</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.dropdownItemRegion}>{method.region}</Text>
                      </View>
                      {selectedMethod === method.id && (
                        <Check size={18} color={Colors.light.primary} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
        </Animated.View>

        <Animated.View
          style={[
            styles.infoCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Info size={16} color={Colors.light.gold} />
          <Text style={styles.infoText}>
            You can change this anytime in Settings
          </Text>
        </Animated.View>

        <View style={styles.footer}>
          <OnboardingButton title="Continue" onPress={handleContinue} />
          <OnboardingProgress currentStep={15} totalSteps={18} />
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  imageContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  methodsContainer: {
    marginBottom: 16,
  },
  dropdownButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    width: '100%',
    maxWidth: 360,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2A26',
    textAlign: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E2DD',
    marginBottom: 8,
  },
  dropdownItem: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(4, 120, 87, 0.08)',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D2A26',
  },
  dropdownItemNameSelected: {
    color: Colors.light.primary,
  },
  dropdownItemRegion: {
    fontSize: 13,
    color: '#9A8B70',
    marginTop: 2,
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
    color: '#2D2A26',
  },
  methodNameSelected: {
    color: Colors.light.primary,
  },
  recommendedBadge: {
    backgroundColor: 'rgba(184, 134, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 10,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  methodFullName: {
    fontSize: 13,
    color: '#5C5650',
    marginBottom: 6,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodRegion: {
    fontSize: 12,
    color: '#9A8B70',
    marginLeft: 6,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(184, 134, 11, 0.1)',
    borderRadius: 6,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: Colors.light.gold,
    marginLeft: 8,
    fontWeight: '500',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 16,
  },
});
