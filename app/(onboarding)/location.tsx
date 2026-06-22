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
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Search, ChevronRight } from 'lucide-react-native';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';
import { OnboardingButton } from '@/components/onboarding/OnboardingButton';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useResponsive } from '@/hooks/useResponsive';

const { width, height } = Dimensions.get('window');

export default function LocationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setLocationData } = useOnboarding();
  const { isTablet, contentMaxWidth } = useResponsive();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const [loading, setLoading] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualCity, setManualCity] = useState('');
  const [locationGranted, setLocationGranted] = useState(false);
  const [detectedCity, setDetectedCity] = useState('');
  const [suggestions, setSuggestions] = useState<{ label: string; lat: number; lon: number }[]>([]);
  const pickedCoords = useRef<{ lat: number; lon: number } | null>(null);
  const justPicked = useRef(false);

  // Debounced city autocomplete via OpenStreetMap Nominatim (free, no key).
  // ponytail: Nominatim ~1 req/s fair-use; swap to Google Places if it rate-limits in production.
  useEffect(() => {
    const q = manualCity.trim();
    if (justPicked.current) {
      justPicked.current = false;
      return;
    }
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&featuretype=city&q=${encodeURIComponent(q)}`,
          { headers: { 'User-Agent': 'NoorApp/1.1 (prayer-times)' } }
        );
        const data = await res.json();
        const items = (Array.isArray(data) ? data : []).map((d: any) => {
          const a = d.address || {};
          const city = a.city || a.town || a.village || a.county || d.name;
          const label = [city, a.country].filter(Boolean).join(', ') || d.display_name;
          return { label, lat: parseFloat(d.lat), lon: parseFloat(d.lon) };
        }).filter((x: any) => x.label && !isNaN(x.lat));
        // Dedupe by label.
        const seen = new Set<string>();
        setSuggestions(items.filter((x: any) => !seen.has(x.label) && seen.add(x.label)));
      } catch {
        setSuggestions([]);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [manualCity]);

  const handlePickSuggestion = (s: { label: string; lat: number; lon: number }) => {
    justPicked.current = true;
    pickedCoords.current = { lat: s.lat, lon: s.lon };
    setManualCity(s.label);
    setSuggestions([]);
  };

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
    } catch (_error) {
      setShowManualInput(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async () => {
    const city = manualCity.trim();
    if (city.length < 2) {
      Alert.alert('Enter a city', 'Please enter a valid city name.');
      return;
    }

    let coords = pickedCoords.current;
    // No suggestion picked — resolve typed text to coordinates so prayer times are accurate.
    if (!coords) {
      try {
        const [geo] = await Location.geocodeAsync(city);
        if (geo) coords = { lat: geo.latitude, lon: geo.longitude };
      } catch {
        // fall through with null coords
      }
    }

    setLocationData({
      latitude: coords?.lat ?? 0,
      longitude: coords?.lon ?? 0,
      cityName: city,
      method: 'manual',
    });

    router.push('/(onboarding)/calculation');
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image
          source={isTablet
            ? require('@/assets/images/onboarding/ipaddunes.jpeg')
            : require('@/assets/images/onboarding/dunes.png')
          }
          style={styles.backgroundImage}
          contentFit="cover"
          transition={400}
          placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
        />
        <View style={styles.overlay} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[
          styles.content,
          { maxWidth: contentMaxWidth, alignSelf: isTablet ? 'center' : undefined, width: '100%' },
        ]}>
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
              {suggestions.length > 0 && (
                <View style={styles.suggestions}>
                  {suggestions.map((s, i) => (
                    <TouchableOpacity
                      key={s.label}
                      style={[styles.suggestionItem, i > 0 && styles.suggestionDivider]}
                      onPress={() => handlePickSuggestion(s)}
                      activeOpacity={0.7}
                    >
                      <MapPin size={16} color="rgba(255,255,255,0.4)" />
                      <Text style={styles.suggestionText} numberOfLines={1}>{s.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Animated.View>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
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
                  <TouchableOpacity
                    style={styles.skipButton}
                    onPress={() => setShowManualInput(true)}
                  >
                    <Text style={styles.skipText}>Enter manually instead</Text>
                    <ChevronRight size={16} color="rgba(255,255,255,0.5)" />
                  </TouchableOpacity>
                  <OnboardingButton
                    title="Continue"
                    onPress={handleEnableLocation}
                    loading={loading}
                  />
                </>
              )}
            </>
          )}
          <OnboardingProgress currentStep={14} totalSteps={18} />
        </Animated.View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImage: {
    width: width,
    height: height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    borderRadius: 6,
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
  suggestions: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  suggestionDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 6,
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
