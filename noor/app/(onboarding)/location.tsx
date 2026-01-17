import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TextInput,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Search, ChevronRight } from 'lucide-react-native';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useOnboarding } from '@/providers/OnboardingProvider';

const { width, height } = Dimensions.get('window');

export default function LocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setLocationData } = useOnboarding();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [loading, setLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [locationGranted, setLocationGranted] = useState(false);
  const [detectedCity, setDetectedCity] = useState('');

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
    ]).start();
  }, []);

  const handleEnableLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
        const cityName = address?.city || address?.subregion || 'Your Location';

        setLocationData({
          latitude,
          longitude,
          cityName,
          method: 'auto',
        });

        setDetectedCity(cityName);
        setLocationGranted(true);

        setTimeout(() => {
          router.push('/(onboarding)/calculation');
        }, 800);
      } else {
        setShowManualInput(true);
      }
    } catch (error) {
      console.log('Location error:', error);
      setShowManualInput(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    if (manualCity.trim().length < 2) {
      Alert.alert('Enter a city', 'Please enter a valid city name.');
      return;
    }

    setLocationData({
      latitude: 0,
      longitude: 0,
      cityName: manualCity.trim(),
      method: 'manual',
    });

    router.push('/(onboarding)/calculation');
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <View style={styles.imageWrapper}>
        <Image
          source={require('@/assets/images/onboarding/dunes.png')}
          style={styles.backgroundImage}
          contentFit="cover"
          transition={400}
          placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
        />
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.3)', 'rgba(15, 23, 42, 0.6)', 'rgba(15, 23, 42, 0.98)']}
          locations={[0, 0.4, 0.75]}
          style={styles.gradient}
        />
      </View>

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 }]}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.iconWrapper}>
            <MapPin size={24} color="#ffffff" strokeWidth={1.5} />
          </View>
          <Text style={styles.title}>Where are you?</Text>
          <Text style={styles.subtitle}>
            We'll use your location to show accurate prayer times
          </Text>
        </Animated.View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {locationGranted ? (
            <Animated.View
              style={[
                styles.successCard,
                { opacity: fadeAnim },
              ]}
            >
              <View style={styles.successIcon}>
                <MapPin size={20} color="#10b981" strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.successTitle}>Location found</Text>
                <Text style={styles.successCity}>{detectedCity}</Text>
              </View>
            </Animated.View>
          ) : showManualInput ? (
            <Animated.View
              style={[
                styles.inputCard,
                { opacity: fadeAnim },
              ]}
            >
              <Text style={styles.inputLabel}>Enter your city</Text>
              <View style={styles.inputWrapper}>
                <Search size={18} color="rgba(255,255,255,0.4)" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., London, Dubai, Chicago"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={manualCity}
                  onChangeText={setManualCity}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleManualSubmit}
                />
              </View>
            </Animated.View>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Feature List */}
              <View style={styles.featureList}>
                {[
                  'Accurate prayer times',
                  'Qibla direction',
                  'Local sunrise & sunset',
                ].map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureDot} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.privacyNote}>
                <Text style={styles.privacyText}>
                  Your location stays on your device
                </Text>
              </View>
            </Animated.View>
          )}
        </View>

        {/* Bottom Section */}
        <Animated.View
          style={[
            styles.bottomSection,
            { opacity: fadeAnim },
          ]}
        >
          {!locationGranted && (
            <>
              {showManualInput ? (
                <OnboardingButton
                  title="Continue"
                  onPress={handleManualSubmit}
                  disabled={manualCity.trim().length < 2}
                />
              ) : (
                <>
                  <OnboardingButton
                    title="Use My Location"
                    onPress={handleEnableLocation}
                    loading={loading}
                  />
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => setShowManualInput(true)}
                  >
                    <Text style={styles.skipText}>Enter manually</Text>
                    <ChevronRight size={16} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
          <OnboardingProgress currentStep={12} totalSteps={16} />
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
  imageWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: width,
    height: height,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 24,
  },
  mainContent: {
    flex: 1,
  },
  featureList: {
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  privacyNote: {
    marginTop: 24,
    alignItems: 'center',
  },
  privacyText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.35)',
  },
  inputCard: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    paddingVertical: 16,
    marginLeft: 12,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  successIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  successTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  successCity: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
  },
  bottomSection: {
    paddingTop: 20,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  skipText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    marginRight: 4,
  },
});
