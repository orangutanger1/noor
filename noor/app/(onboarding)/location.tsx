import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Shield, Check, Search } from 'lucide-react-native';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { useOnboarding } from '@/providers/OnboardingProvider';

export default function LocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setLocationData } = useOnboarding();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEnableLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Try to get city name from coordinates
        const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
        const cityName = address?.city || address?.subregion || 'Your Location';

        setLocationData({
          latitude,
          longitude,
          cityName,
          method: 'auto',
        });

        setLocationGranted(true);

        // Short delay to show success state
        setTimeout(() => {
          router.push('/(onboarding)/calculation');
        }, 500);
      } else {
        Alert.alert(
          'Location Permission',
          'Location permission was denied. You can set your location manually.',
          [
            { text: 'OK', onPress: () => setShowManualInput(true) }
          ]
        );
      }
    } catch (error) {
      console.log('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your location. Please try setting it manually.',
        [
          { text: 'OK', onPress: () => setShowManualInput(true) }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualLocation = () => {
    setShowManualInput(true);
  };

  const handleManualSubmit = () => {
    if (manualCity.trim().length < 2) {
      Alert.alert('Invalid City', 'Please enter a valid city name.');
      return;
    }

    // For manual entry, we'll use a default location
    // In a real app, you'd geocode the city name
    setLocationData({
      latitude: 0,
      longitude: 0,
      cityName: manualCity.trim(),
      method: 'manual',
    });

    router.push('/(onboarding)/calculation');
  };

  const benefits = [
    'Calculate accurate prayer times for your city',
    'Point you toward the Qibla',
    'Adjust for local sunrise and sunset',
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primaryDark, Colors.light.primary, Colors.light.cream]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        {/* Illustration */}
        <Animated.View style={[styles.illustrationContainer, { opacity: fadeAnim }]}>
          <View style={styles.illustration}>
            <View style={styles.mosqueShape}>
              <View style={styles.dome} />
              <View style={styles.minaret} />
            </View>
            <View style={styles.locationPin}>
              <MapPin size={32} color={Colors.light.gold} fill={Colors.light.gold} />
            </View>
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Enable Location Services</Text>
          <Text style={styles.subtitle}>Noor uses your location to:</Text>

          <View style={styles.benefitsList}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Check size={18} color={Colors.light.success} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Privacy Notice */}
          <View style={styles.privacyCard}>
            <Shield size={20} color={Colors.light.primary} />
            <Text style={styles.privacyText}>
              Your location stays on your device. We never track or share your whereabouts.
            </Text>
          </View>

          {/* Manual Input */}
          {showManualInput && (
            <View style={styles.manualInputContainer}>
              <Text style={styles.manualLabel}>Enter your city:</Text>
              <View style={styles.inputWrapper}>
                <Search size={18} color={Colors.light.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Chicago, London, Dubai"
                  placeholderTextColor={Colors.light.textMuted}
                  value={manualCity}
                  onChangeText={setManualCity}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={handleManualSubmit}
                />
              </View>
            </View>
          )}
        </Animated.View>

        {/* Footer */}
        <View style={styles.footer}>
          {showManualInput ? (
            <OnboardingButton
              title="Continue"
              onPress={handleManualSubmit}
              disabled={manualCity.trim().length < 2}
            />
          ) : locationGranted ? (
            <View style={styles.successContainer}>
              <Check size={24} color={Colors.light.success} />
              <Text style={styles.successText}>Location enabled!</Text>
            </View>
          ) : (
            <>
              <OnboardingButton
                title="Enable Location"
                onPress={handleEnableLocation}
                loading={loading}
              />
              <OnboardingButton
                title="Set Location Manually"
                onPress={handleManualLocation}
                variant="text"
                style={{ marginTop: 8 }}
              />
            </>
          )}
          <OnboardingProgress currentStep={1} totalSteps={5} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  illustration: {
    width: 120,
    height: 120,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mosqueShape: {
    alignItems: 'center',
  },
  dome: {
    width: 60,
    height: 35,
    backgroundColor: Colors.light.ivory,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    opacity: 0.9,
  },
  minaret: {
    width: 12,
    height: 50,
    backgroundColor: Colors.light.ivory,
    marginTop: -5,
    opacity: 0.9,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  locationPin: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    backgroundColor: Colors.light.ivory,
    borderRadius: 20,
    padding: 8,
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.ivory,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.goldSoft,
    textAlign: 'center',
    marginBottom: 24,
  },
  benefitsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  benefitText: {
    fontSize: 15,
    color: Colors.light.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.light.primary + '15',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.primary + '30',
  },
  privacyText: {
    fontSize: 13,
    color: Colors.light.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  manualInputContainer: {
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
  },
  manualLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.cream,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 14,
    marginLeft: 10,
  },
  footer: {
    marginTop: 'auto',
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  successText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.light.success,
    marginLeft: 8,
  },
});
