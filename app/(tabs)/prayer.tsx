import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  MapPin,
  Clock,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CloudSun,
  Navigation,
  Circle,
  Check,
  AlertCircle,
  X,
  Flame,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import Svg, { Circle as SvgCircle, Line, G, Text as SvgText, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { PrayerTimes, CalculationMethod, Coordinates, Qibla } from 'adhan';
import Colors, { shadows } from '@/constants/colors';
import { useTheme } from '@/providers/ThemeProvider';
import { useApp } from '@/providers/AppProvider';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { tasbihPresets } from '@/mocks/islamic-content';
import { Prayer } from '@/types';
import { schedulePrayerNotifications } from '@/services/notificationService';

const { width } = Dimensions.get('window');

// Map calculation method keys to adhan CalculationMethod
const getCalculationMethod = (methodKey: string) => {
  switch (methodKey) {
    case 'isna':
      return CalculationMethod.NorthAmerica();
    case 'mwl':
      return CalculationMethod.MuslimWorldLeague();
    case 'egypt':
      return CalculationMethod.Egyptian();
    case 'makkah':
      return CalculationMethod.UmmAlQura();
    case 'karachi':
      return CalculationMethod.Karachi();
    case 'singapore':
      return CalculationMethod.Singapore();
    case 'uoif': {
      const params = CalculationMethod.Other();
      params.fajrAngle = 12;
      params.ishaAngle = 12;
      return params;
    }
    default:
      return CalculationMethod.NorthAmerica();
  }
};

// Method display names for UI
const CALCULATION_METHOD_NAMES: { [key: string]: string } = {
  isna: 'ISNA',
  mwl: 'Muslim World League',
  egypt: 'Egyptian',
  makkah: 'Umm al-Qura',
  karachi: 'Karachi',
  uoif: 'UOIF',
  singapore: 'Singapore',
};

type TabType = 'times' | 'tasbih' | 'tracker';

interface PrayerTimeData {
  name: string;
  nameArabic: string;
  time: string;
  icon: React.ReactNode;
  isNext: boolean;
  isPast: boolean;
  accentColor: string;
}

// Use adhan library for accurate Qibla calculation
const calculateQiblaDirection = (lat: number, lon: number): number => {
  const coordinates = new Coordinates(lat, lon);
  return Qibla(coordinates);
};

// Use adhan library for accurate prayer time calculation
const calculatePrayerTimes = (
  lat: number,
  lon: number,
  methodKey: string,
  date: Date = new Date()
): {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
} => {
  const coordinates = new Coordinates(lat, lon);
  const params = getCalculationMethod(methodKey);
  const prayerTimes = new PrayerTimes(coordinates, date, params);
  
  // Format time to HH:MM
  const formatTime = (time: Date) => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  return {
    fajr: formatTime(prayerTimes.fajr),
    sunrise: formatTime(prayerTimes.sunrise),
    dhuhr: formatTime(prayerTimes.dhuhr),
    asr: formatTime(prayerTimes.asr),
    maghrib: formatTime(prayerTimes.maghrib),
    isha: formatTime(prayerTimes.isha),
  };
};

const generatePrayerTimes = (
  colors: typeof Colors.light, 
  lat: number = 40.7128, 
  lon: number = -74.0060,
  methodKey: string = 'isna'
): PrayerTimeData[] => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const times = calculatePrayerTimes(lat, lon, methodKey);
  
  const prayers = [
    { name: 'Fajr', nameArabic: 'الفجر', time: times.fajr, accentColor: colors.gold, iconComponent: Sunrise },
    { name: 'Sunrise', nameArabic: 'الشروق', time: times.sunrise, accentColor: colors.gold, iconComponent: Sun },
    { name: 'Dhuhr', nameArabic: 'الظهر', time: times.dhuhr, accentColor: colors.primary, iconComponent: CloudSun },
    { name: 'Asr', nameArabic: 'العصر', time: times.asr, accentColor: colors.gold, iconComponent: Sun },
    { name: 'Maghrib', nameArabic: 'المغرب', time: times.maghrib, accentColor: colors.gold, iconComponent: Sunset },
    { name: 'Isha', nameArabic: 'العشاء', time: times.isha, accentColor: colors.text, iconComponent: Moon },
  ];
  
  let foundNext = false;
  return prayers.map(prayer => {
    const [hour, minute] = prayer.time.split(':').map(Number);
    const prayerMinutes = hour * 60 + minute;
    const isPast = currentMinutes > prayerMinutes;
    const isNext = !foundNext && !isPast;
    if (isNext) foundNext = true;
    const IconComponent = prayer.iconComponent;
    return {
      name: prayer.name,
      nameArabic: prayer.nameArabic,
      time: prayer.time,
      icon: <IconComponent size={22} color={prayer.accentColor} />,
      isNext,
      isPast,
      accentColor: prayer.accentColor,
    };
  });
};

const statusColors = {
  pending: Colors.light.textMuted,
  on_time: Colors.light.success,
  late: Colors.light.warning,
  missed: Colors.light.missed,
};

const statusIcons = { pending: Clock, on_time: Check, late: AlertCircle, missed: X };
const statusLabels = { pending: 'Pending', on_time: 'On Time', late: 'Qada', missed: 'Missed' };

export default function PrayerScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { prayers, updatePrayerStatus, getPrayerStreak, saveTasbihSession, getTodayTasbihCount } = useApp();
  const { onboardingData, locationData } = useOnboarding();

  const [activeTab, setActiveTab] = useState<TabType>('times');
  const [locationName, setLocationName] = useState('Loading...');
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeData[]>([]);
  const [timeToNext, setTimeToNext] = useState('');
  const [compassAvailable, setCompassAvailable] = useState(true);
  const [userLat, setUserLat] = useState<number>(locationData?.latitude || 40.7128);
  const [userLon, setUserLon] = useState<number>(locationData?.longitude || -74.0060);

  // Tasbih state
  const [count, setCount] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(tasbihPresets[0]);
  const [showPresets, setShowPresets] = useState(false);
  const tasbihTarget = selectedPreset.target;
  const tasbihProgress = Math.min(count / tasbihTarget, 1);

  // Tracker state
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [rawPrayerTimes, setRawPrayerTimes] = useState<{
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  }>({
    fajr: '00:00',
    sunrise: '00:00',
    dhuhr: '00:00',
    asr: '00:00',
    maghrib: '00:00',
    isha: '00:00',
  });

  useEffect(() => {
    const methodKey = onboardingData.calculationMethod || 'isna';
    const times = calculatePrayerTimes(userLat, userLon, methodKey);
    setRawPrayerTimes(times);
    setPrayerTimes(generatePrayerTimes(colors, userLat, userLon, methodKey));
    getLocation();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [colors, userLat, userLon, onboardingData.calculationMethod]);

  // Schedule notifications when prayer times or settings change
  useEffect(() => {
    if (onboardingData.notifications && rawPrayerTimes.fajr !== '00:00') {
      schedulePrayerNotifications(rawPrayerTimes, onboardingData.notifications);
    }
  }, [rawPrayerTimes, onboardingData.notifications]);

  // Ref to store accelerometer data for tilt compensation
  const accelDataRef = useRef({ x: 0, y: 0, z: -1 });
  const smoothedHeadingRef = useRef(0);
  const isFirstReadingRef = useRef(true);

  useEffect(() => {
    let magSubscription: ReturnType<typeof Magnetometer.addListener> | null = null;
    let accelSubscription: ReturnType<typeof Accelerometer.addListener> | null = null;

    const calculateTiltCompensatedHeading = (
      mx: number, my: number, mz: number,
      ax: number, ay: number, az: number
    ): number => {
      // Normalize accelerometer vector (gravity direction)
      const aNorm = Math.sqrt(ax * ax + ay * ay + az * az);
      if (aNorm === 0) return 0;

      const axN = ax / aNorm;
      const ayN = ay / aNorm;
      const azN = az / aNorm;

      // Calculate pitch and roll from accelerometer
      const pitch = Math.asin(-axN);
      const roll = Math.atan2(ayN, azN);

      // Tilt-compensated magnetic field components
      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      const cosRoll = Math.cos(roll);
      const sinRoll = Math.sin(roll);

      // Project magnetometer readings to horizontal plane
      const xH = mx * cosPitch + my * sinRoll * sinPitch + mz * cosRoll * sinPitch;
      const yH = my * cosRoll - mz * sinRoll;

      // Calculate heading
      let heading = Math.atan2(yH, xH) * (180 / Math.PI);

      // Normalize to 0-360
      if (heading < 0) heading += 360;

      // Adjust for device orientation (pointing with top of device)
      heading = (heading + 90) % 360;

      if (Platform.OS === 'ios') {
        heading = (360 - heading) % 360;
      }

      return heading;
    };

    const startSensors = async () => {
      try {
        const [magAvailable, accelAvailable] = await Promise.all([
          Magnetometer.isAvailableAsync(),
          Accelerometer.isAvailableAsync(),
        ]);

        if (!magAvailable || !accelAvailable) {
          setCompassAvailable(false);
          return;
        }

        // Set update intervals (60ms for smooth updates - same as onboarding compass)
        Accelerometer.setUpdateInterval(60);
        Magnetometer.setUpdateInterval(60);

        // Subscribe to accelerometer
        accelSubscription = Accelerometer.addListener((data) => {
          accelDataRef.current = data;
        });

        // Subscribe to magnetometer
        magSubscription = Magnetometer.addListener((data) => {
          const { x: mx, y: my, z: mz } = data;
          const { x: ax, y: ay, z: az } = accelDataRef.current;

          const rawAngle = calculateTiltCompensatedHeading(mx, my, mz, ax, ay, az);

          // Apply exponential smoothing with wrap-around handling
          let angle: number;
          if (isFirstReadingRef.current) {
            smoothedHeadingRef.current = rawAngle;
            isFirstReadingRef.current = false;
            angle = rawAngle;
          } else {
            // Handle wrap-around at 0/360 degrees
            let diff = rawAngle - smoothedHeadingRef.current;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;

            // Exponential smoothing (alpha = 0.15 for smooth movement)
            const alpha = 0.15;
            smoothedHeadingRef.current = (smoothedHeadingRef.current + alpha * diff + 360) % 360;
            angle = smoothedHeadingRef.current;
          }

          setDeviceHeading(angle);
        });
      } catch (_error) {
        setCompassAvailable(false);
      }
    };

    startSensors();

    return () => {
      if (magSubscription) magSubscription.remove();
      if (accelSubscription) accelSubscription.remove();
    };
  }, []);

  useEffect(() => {
    Animated.spring(progressAnim, { toValue: tasbihProgress, friction: 10, tension: 40, useNativeDriver: false }).start();
  }, [tasbihProgress]);

  const updateTimeToNext = useCallback(() => {
    const nextPrayer = prayerTimes.find(p => p.isNext);
    if (nextPrayer) {
      const [hours, minutes] = nextPrayer.time.split(':').map(Number);
      const now = new Date();
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0);
      const diff = prayerDate.getTime() - now.getTime();
      if (diff > 0) {
        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeToNext(`${hoursLeft}h ${minutesLeft}m`);
      }
    }
  }, [prayerTimes]);

  useEffect(() => {
    const methodKey = onboardingData.calculationMethod || 'isna';
    const interval = setInterval(() => {
      setPrayerTimes(generatePrayerTimes(colors, userLat, userLon, methodKey));
      updateTimeToNext();
    }, 60000);
    updateTimeToNext();
    return () => clearInterval(interval);
  }, [updateTimeToNext, colors, userLat, userLon, onboardingData.calculationMethod]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('Location access denied');
        setQiblaDirection(calculateQiblaDirection(userLat, userLon));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUserLat(loc.coords.latitude);
      setUserLon(loc.coords.longitude);
      setQiblaDirection(calculateQiblaDirection(loc.coords.latitude, loc.coords.longitude));
      const [address] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (address) setLocationName(`${address.city || address.region}, ${address.country}`);
    } catch (_error) {
      setLocationName('Unable to get location');
      setQiblaDirection(calculateQiblaDirection(userLat, userLon));
    }
  };

  const handleTasbihCount = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 60, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
    ]).start();
    setCount(prev => {
      const newCount = prev + 1;
      if (newCount === tasbihTarget) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        saveTasbihSession({ presetId: selectedPreset.id, count: newCount, target: tasbihTarget, date: new Date().toISOString().split('T')[0], completed: true });
      }
      return newCount;
    });
  }, [tasbihTarget, selectedPreset.id, saveTasbihSession]);

  const handleTasbihReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (count > 0 && count < tasbihTarget) {
      saveTasbihSession({ presetId: selectedPreset.id, count, target: tasbihTarget, date: new Date().toISOString().split('T')[0], completed: false });
    }
    setCount(0);
  }, [count, tasbihTarget, selectedPreset.id, saveTasbihSession]);

  const handleStatusChange = useCallback((prayerId: string, status: Prayer['status']) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updatePrayerStatus(prayerId, status);
    setSelectedPrayer(null);
  }, [updatePrayerStatus]);

  const nextPrayer = prayerTimes.find(p => p.isNext);
  const completedCount = prayers.filter(p => p.status === 'on_time' || p.status === 'late').length;
  const streak = getPrayerStreak();
  const isCompleted = count >= tasbihTarget;
  const COUNTER_SIZE = width * 0.6;
  const circumference = 2 * Math.PI * (COUNTER_SIZE / 2 - 20);

  const renderTabButton = (tab: TabType, label: string, icon: React.ReactNode) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tabButton, activeTab === tab && { backgroundColor: colors.primary }]}
      onPress={() => { Haptics.selectionAsync(); setActiveTab(tab); }}
    >
      {icon}
      <Text style={[styles.tabLabel, activeTab === tab && { color: '#FFF' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.locationBadge, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
              <MapPin size={14} color={colors.textSecondary} />
              <Text style={[styles.locationText, { color: colors.textSecondary }]}>{locationName}</Text>
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Prayer</Text>
            <Text style={[styles.headerArabic, { color: colors.textMuted }]}>الصلاة</Text>
          </View>

          {/* Tab Selector */}
          <View style={[styles.tabContainer, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
            {renderTabButton('times', 'Times', <Clock size={16} color={activeTab === 'times' ? '#FFF' : colors.textSecondary} />)}
            {renderTabButton('tasbih', 'Tasbih', <Circle size={16} color={activeTab === 'tasbih' ? '#FFF' : colors.textSecondary} />)}
            {renderTabButton('tracker', 'Tracker', <Check size={16} color={activeTab === 'tracker' ? '#FFF' : colors.textSecondary} />)}
          </View>

          {/* Prayer Times Tab */}
          {activeTab === 'times' && (
            <View>
              {nextPrayer && (
                <View style={[styles.nextPrayerCard, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={styles.nextPrayerHeader}>
                    <View style={[styles.nextPrayerIconContainer, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
                      {nextPrayer.icon}
                    </View>
                    <View style={[styles.nextBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.nextLabel}>NEXT</Text>
                    </View>
                  </View>
                  <Text style={[styles.nextPrayerName, { color: colors.text }]}>{nextPrayer.name}</Text>
                  <Text style={[styles.nextPrayerTime, { color: colors.text }]}>{nextPrayer.time}</Text>
                  <View style={[styles.countdownContainer, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
                    <Clock size={14} color={colors.primary} />
                    <Text style={[styles.countdownText, { color: colors.text }]}>{timeToNext} remaining</Text>
                  </View>
                </View>
              )}

              <View style={[styles.prayerList, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {prayerTimes.map((prayer, index) => (
                  <View
                    key={prayer.name}
                    style={[styles.prayerItem, { borderBottomColor: colors.border }, prayer.isNext && { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }, index === prayerTimes.length - 1 && styles.prayerItemLast]}
                  >
                    <View style={styles.prayerLeft}>
                      <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }, prayer.isPast && styles.iconContainerPast]}>
                        {prayer.icon}
                      </View>
                      <View>
                        <Text style={[styles.prayerName, { color: colors.text }, prayer.isPast && { color: colors.textMuted }]}>{prayer.name}</Text>
                        <Text style={[styles.prayerNameArabic, { color: colors.textMuted }]}>{prayer.nameArabic}</Text>
                      </View>
                    </View>
                    <Text style={[styles.prayerTime, { color: colors.textSecondary }, prayer.isNext && { fontWeight: '700', color: colors.text }, prayer.isPast && { color: colors.textMuted }]}>{prayer.time}</Text>
                  </View>
                ))}
              </View>

              {/* Qibla Compass */}
              <View style={[styles.qiblaSection, shadows.sm, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Qibla Direction</Text>
                {compassAvailable && (
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={[styles.liveText, { color: colors.textMuted }]}>Live</Text>
                  </View>
                )}
                <View style={styles.compassContainer}>
                  <View style={{ transform: [{ rotate: `${-deviceHeading}deg` }] }}>
                    <Svg width={width * 0.5} height={width * 0.5} viewBox={`0 0 ${width * 0.5} ${width * 0.5}`}>
                      <SvgCircle cx={width * 0.25} cy={width * 0.25} r={width * 0.25 - 20} fill={colors.surface} stroke={colors.border} strokeWidth={1} />
                      {['N', 'E', 'S', 'W'].map((dir, i) => {
                        const angle = i * 90;
                        const rad = ((angle - 90) * Math.PI) / 180;
                        const x = width * 0.25 + (width * 0.25 - 45) * Math.cos(rad);
                        const y = width * 0.25 + (width * 0.25 - 45) * Math.sin(rad);
                        return (
                          <SvgText key={dir} x={x} y={y + 5} fill={dir === 'N' ? colors.primary : colors.textMuted} fontSize={dir === 'N' ? 14 : 12} fontWeight={dir === 'N' ? 'bold' : '500'} textAnchor="middle">{dir}</SvgText>
                        );
                      })}
                      {/* Kaaba direction indicator */}
                      <G rotation={qiblaDirection} origin={`${width * 0.25}, ${width * 0.25}`}>
                        <Path 
                          d={`M ${width * 0.25} ${width * 0.25 - (width * 0.25 - 35)} L ${width * 0.25 - 8} ${width * 0.25 - 15} L ${width * 0.25 + 8} ${width * 0.25 - 15} Z`} 
                          fill={colors.gold} 
                          stroke={colors.gold}
                          strokeWidth={2}
                        />
                        {/* Kaaba icon */}
                        <SvgText 
                          x={width * 0.25} 
                          y={width * 0.25 - (width * 0.25 - 25)} 
                          fill={colors.gold} 
                          fontSize={16} 
                          textAnchor="middle"
                        >
                          ✦
                        </SvgText>
                      </G>
                      <SvgCircle cx={width * 0.25} cy={width * 0.25} r={8} fill={colors.surface} stroke={colors.gold} strokeWidth={2} />
                    </Svg>
                  </View>
                </View>
                <Text style={[styles.qiblaDegree, { color: colors.text }]}>{Math.round(qiblaDirection)}° from North</Text>
                <Text style={[styles.qiblaSubtext, { color: colors.textMuted }]}>Point device towards the golden indicator</Text>
              </View>
            </View>
          )}

          {/* Tasbih Tab */}
          {activeTab === 'tasbih' && (
            <View style={styles.tasbihContainer}>
              <View style={styles.todayBadge}>
                <Sparkles size={12} color={colors.gold} />
                <Text style={[styles.todayCount, { color: colors.gold }]}>{getTodayTasbihCount()} today</Text>
              </View>

              <TouchableOpacity
                style={[styles.presetSelector, shadows.sm, { backgroundColor: colors.surface }]}
                onPress={() => setShowPresets(!showPresets)}
              >
                <View>
                  <Text style={[styles.presetName, { color: colors.text }]}>{selectedPreset.name}</Text>
                  <Text style={[styles.presetArabic, { color: colors.textMuted }]}>{selectedPreset.nameArabic}</Text>
                </View>
                <View style={styles.presetMeta}>
                  <Text style={[styles.presetTarget, { color: colors.gold }]}>{selectedPreset.target}x</Text>
                  {showPresets ? <ChevronUp size={20} color={colors.textMuted} /> : <ChevronDown size={20} color={colors.textMuted} />}
                </View>
              </TouchableOpacity>

              {showPresets && (
                <View style={[styles.presetList, shadows.sm, { backgroundColor: colors.surface }]}>
                  {tasbihPresets.map((preset, index) => (
                    <TouchableOpacity
                      key={preset.id}
                      style={[styles.presetItem, selectedPreset.id === preset.id && { backgroundColor: colors.primary + '20' }, index === tasbihPresets.length - 1 && { borderBottomWidth: 0 }]}
                      onPress={() => { Haptics.selectionAsync(); setSelectedPreset(preset); setCount(0); setShowPresets(false); }}
                    >
                      <Text style={[styles.presetItemName, { color: colors.text }]}>{preset.name}</Text>
                      <Text style={[styles.presetItemTarget, { color: colors.textMuted }]}>{preset.target}x</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity activeOpacity={1} onPress={handleTasbihCount}>
                <Animated.View style={[styles.counterContainer, shadows.xl, { transform: [{ scale: scaleAnim }] }]}>
                  <Svg width={COUNTER_SIZE} height={COUNTER_SIZE} style={styles.progressRing}>
                    <SvgCircle cx={COUNTER_SIZE / 2} cy={COUNTER_SIZE / 2} r={COUNTER_SIZE / 2 - 20} fill={colors.surface} stroke={colors.border} strokeWidth={8} />
                    <AnimatedCircle
                      cx={COUNTER_SIZE / 2} cy={COUNTER_SIZE / 2} r={COUNTER_SIZE / 2 - 20}
                      stroke={isCompleted ? colors.gold : colors.primary} strokeWidth={8} fill="none" strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={progressAnim.interpolate({ inputRange: [0, 1], outputRange: [circumference, 0] }) as unknown as number}
                      rotation={-90} origin={`${COUNTER_SIZE / 2}, ${COUNTER_SIZE / 2}`}
                    />
                  </Svg>
                  <View style={styles.counterInner}>
                    <Text style={[styles.countText, { color: isCompleted ? colors.gold : colors.text }]}>{count}</Text>
                    <Text style={[styles.targetText, { color: colors.textMuted }]}>of {tasbihTarget}</Text>
                    {isCompleted && (
                      <View style={[styles.completedBadge, { backgroundColor: colors.success }]}>
                        <Check size={14} color="#FFF" strokeWidth={3} />
                        <Text style={styles.completedText}>Complete</Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              </TouchableOpacity>

              <Text style={[styles.tapHint, { color: colors.textMuted }]}>Tap to count</Text>

              <View style={[styles.dhikrDisplay, shadows.sm, { backgroundColor: colors.primary }]}>
                <Text style={styles.dhikrArabic}>{selectedPreset.arabic || selectedPreset.nameArabic}</Text>
                <Text style={styles.dhikrTranslation}>{selectedPreset.name}</Text>
              </View>

              <TouchableOpacity style={[styles.resetButton, shadows.sm, { backgroundColor: colors.surface }]} onPress={handleTasbihReset}>
                <RotateCcw size={18} color={colors.primary} />
                <Text style={[styles.resetText, { color: colors.primary }]}>Reset Counter</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Tracker Tab */}
          {activeTab === 'tracker' && (
            <View>
              <View style={[styles.progressCard, shadows.sm, { backgroundColor: colors.surface }]}>
                <View style={styles.progressHeader}>
                  <View>
                    <Text style={[styles.progressTitle, { color: colors.text }]}>Today's Progress</Text>
                    <Text style={[styles.progressSubtitle, { color: colors.textMuted }]}>{completedCount} of 5 prayers</Text>
                  </View>
                  <View style={[styles.streakBadge, { backgroundColor: colors.gold + '20' }]}>
                    <Flame size={16} color={colors.gold} />
                    <Text style={[styles.streakText, { color: colors.gold }]}>{streak}</Text>
                  </View>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                    <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${(completedCount / 5) * 100}%` }]} />
                  </View>
                  <Text style={[styles.progressPercentage, { color: colors.primary }]}>{Math.round((completedCount / 5) * 100)}%</Text>
                </View>
              </View>

              <View style={styles.trackerList}>
                {prayers.map((prayer) => {
                  const StatusIcon = statusIcons[prayer.status];
                  const isSelected = selectedPrayer?.id === prayer.id;
                  return (
                    <View key={prayer.id}>
                      <TouchableOpacity
                        style={[styles.trackerCard, shadows.sm, { backgroundColor: colors.surface }, isSelected && { borderWidth: 2, borderColor: colors.primary }]}
                        onPress={() => setSelectedPrayer(isSelected ? null : prayer)}
                      >
                        <View style={styles.trackerLeft}>
                          <View style={[styles.statusIndicator, { backgroundColor: statusColors[prayer.status] + '20' }]}>
                            <StatusIcon size={20} color={statusColors[prayer.status]} />
                          </View>
                          <View>
                            <Text style={[styles.trackerPrayerName, { color: colors.text }]}>{prayer.name}</Text>
                            <Text style={[styles.trackerPrayerArabic, { color: colors.textMuted }]}>{prayer.nameArabic}</Text>
                          </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors[prayer.status] + '15' }]}>
                          <Text style={[styles.statusText, { color: statusColors[prayer.status] }]}>{statusLabels[prayer.status]}</Text>
                        </View>
                      </TouchableOpacity>
                      {isSelected && (
                        <View style={[styles.statusOptions, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
                          <Text style={[styles.statusOptionsTitle, { color: colors.textSecondary }]}>Update Status</Text>
                          <View style={styles.statusButtons}>
                            {(['pending', 'on_time', 'late', 'missed'] as const).map(status => {
                              const Icon = statusIcons[status];
                              return (
                                <TouchableOpacity
                                  key={status}
                                  style={[styles.statusButton, { borderColor: statusColors[status], backgroundColor: colors.surface }]}
                                  onPress={() => handleStatusChange(prayer.id, status)}
                                >
                                  <Icon size={14} color={statusColors[status]} />
                                  <Text style={[styles.statusButtonText, { color: statusColors[status] }]}>{statusLabels[status]}</Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(SvgCircle);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  locationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginBottom: 12 },
  locationText: { fontSize: 13, fontWeight: '500' },
  headerTitle: { fontSize: 32, fontWeight: '300', marginBottom: 4, letterSpacing: -0.5 },
  headerArabic: { fontSize: 18 },
  tabContainer: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 20 },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8 },
  tabLabel: { fontSize: 13, fontWeight: '600', color: Colors.light.textSecondary },
  nextPrayerCard: { borderRadius: 12, borderWidth: 1, padding: 24, alignItems: 'center', marginBottom: 20 },
  nextPrayerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  nextPrayerIconContainer: { width: 44, height: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  nextBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  nextLabel: { fontSize: 10, fontWeight: '800', color: '#FFF', letterSpacing: 1.5 },
  nextPrayerName: { fontSize: 24, fontWeight: '600', marginBottom: 4 },
  nextPrayerTime: { fontSize: 48, fontWeight: '200', letterSpacing: -2, marginBottom: 12 },
  countdownContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6 },
  countdownText: { fontSize: 14, fontWeight: '600' },
  prayerList: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginBottom: 20 },
  prayerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  prayerItemLast: { borderBottomWidth: 0 },
  prayerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconContainer: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  iconContainerPast: { opacity: 0.5 },
  prayerName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  prayerNameArabic: { fontSize: 12 },
  prayerTime: { fontSize: 16, fontWeight: '500', fontVariant: ['tabular-nums'] },
  qiblaSection: { borderRadius: 12, borderWidth: 1, padding: 20, alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  liveText: { fontSize: 12, fontWeight: '600' },
  compassContainer: { alignItems: 'center' },
  qiblaDegree: { fontSize: 28, fontWeight: '300', marginTop: 12 },
  qiblaSubtext: { fontSize: 13, marginTop: 4, textAlign: 'center' },
  tasbihContainer: { alignItems: 'center' },
  todayBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(184, 134, 11, 0.1)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16 },
  todayCount: { fontSize: 13, fontWeight: '500' },
  presetSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, padding: 16, width: '100%', marginBottom: 12 },
  presetName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  presetArabic: { fontSize: 14 },
  presetMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  presetTarget: { fontSize: 14, fontWeight: '700' },
  presetList: { borderRadius: 12, width: '100%', marginBottom: 16, overflow: 'hidden' },
  presetItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
  presetItemName: { fontSize: 15, fontWeight: '500' },
  presetItemTarget: { fontSize: 13 },
  counterContainer: { width: width * 0.6, height: width * 0.6, justifyContent: 'center', alignItems: 'center', borderRadius: width * 0.3, marginVertical: 20 },
  progressRing: { position: 'absolute' },
  counterInner: { alignItems: 'center' },
  countText: { fontSize: 64, fontWeight: '200', letterSpacing: -2 },
  targetText: { fontSize: 14, marginTop: -4 },
  completedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: 12, gap: 6 },
  completedText: { fontSize: 12, fontWeight: '700', color: '#FFF' },
  tapHint: { fontSize: 14, marginBottom: 20 },
  dhikrDisplay: { width: '100%', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  dhikrArabic: { fontSize: 28, color: '#FFF', textAlign: 'center', marginBottom: 8 },
  dhikrTranslation: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' },
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, gap: 10 },
  resetText: { fontSize: 15, fontWeight: '600' },
  progressCard: { borderRadius: 12, padding: 16, marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  progressTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  progressSubtitle: { fontSize: 14 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 6 },
  streakText: { fontSize: 16, fontWeight: '700' },
  progressBarContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressPercentage: { fontSize: 14, fontWeight: '600', width: 40 },
  trackerList: { gap: 10 },
  trackerCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, padding: 14 },
  trackerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIndicator: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  trackerPrayerName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  trackerPrayerArabic: { fontSize: 13 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  statusOptions: { borderRadius: 10, padding: 14, marginTop: 8, marginBottom: 4 },
  statusOptionsTitle: { fontSize: 12, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  statusButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  statusButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1.5, gap: 4 },
  statusButtonText: { fontSize: 11, fontWeight: '600' },
});
