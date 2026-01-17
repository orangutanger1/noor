import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MapPin,
  Clock,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  CloudSun,
  Navigation,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import Svg, { Circle, Line, G, Text as SvgText, Defs, RadialGradient, Stop, Path } from 'react-native-svg';
import Colors, { shadows } from '@/constants/colors';
import { IslamicStar } from '@/components/IslamicPattern';

const { width } = Dimensions.get('window');

interface PrayerTimeData {
  name: string;
  nameArabic: string;
  time: string;
  icon: React.ReactNode;
  isNext: boolean;
  isPast: boolean;
  accentColor: string;
}

const calculateQiblaDirection = (lat: number, lon: number): number => {
  const kaabaLat = 21.4225 * Math.PI / 180;
  const kaabaLon = 39.8262 * Math.PI / 180;
  const userLat = lat * Math.PI / 180;
  const userLon = lon * Math.PI / 180;

  const dLon = kaabaLon - userLon;
  const x = Math.cos(kaabaLat) * Math.sin(dLon);
  const y = Math.cos(userLat) * Math.sin(kaabaLat) -
            Math.sin(userLat) * Math.cos(kaabaLat) * Math.cos(dLon);

  let bearing = Math.atan2(x, y) * 180 / Math.PI;
  if (bearing < 0) bearing += 360;

  return bearing;
};

const generatePrayerTimes = (): PrayerTimeData[] => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const prayers = [
    { name: 'Fajr', nameArabic: 'الفجر', hour: 5, minute: 23, accentColor: '#F59E0B', iconComponent: Sunrise },
    { name: 'Sunrise', nameArabic: 'الشروق', hour: 6, minute: 48, accentColor: '#FB923C', iconComponent: Sun },
    { name: 'Dhuhr', nameArabic: 'الظهر', hour: 12, minute: 15, accentColor: '#047857', iconComponent: CloudSun },
    { name: 'Asr', nameArabic: 'العصر', hour: 15, minute: 45, accentColor: '#D97706', iconComponent: Sun },
    { name: 'Maghrib', nameArabic: 'المغرب', hour: 18, minute: 32, accentColor: '#EA580C', iconComponent: Sunset },
    { name: 'Isha', nameArabic: 'العشاء', hour: 20, minute: 5, accentColor: '#1E293B', iconComponent: Moon },
  ];

  let foundNext = false;
  return prayers.map(prayer => {
    const prayerTime = prayer.hour * 60 + prayer.minute;
    const isPast = currentTime > prayerTime;
    const isNext = !foundNext && !isPast;
    if (isNext) foundNext = true;

    const IconComponent = prayer.iconComponent;

    return {
      name: prayer.name,
      nameArabic: prayer.nameArabic,
      time: `${prayer.hour.toString().padStart(2, '0')}:${prayer.minute.toString().padStart(2, '0')}`,
      icon: <IconComponent size={22} color={prayer.accentColor} />,
      isNext,
      isPast,
      accentColor: prayer.accentColor,
    };
  });
};

export default function PrayerScreen() {
  const insets = useSafeAreaInsets();
  const [, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName] = useState('Loading...');
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeData[]>([]);
  const [timeToNext, setTimeToNext] = useState('');

  // Animations
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(20)).current;
  const nextCardOpacity = useRef(new Animated.Value(0)).current;
  const nextCardScale = useRef(new Animated.Value(0.95)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;
  const listTranslate = useRef(new Animated.Value(30)).current;
  const qiblaOpacity = useRef(new Animated.Value(0)).current;
  const compassRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setPrayerTimes(generatePrayerTimes());
    getLocation();

    // Orchestrated entrance animation
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headerTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(nextCardOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(nextCardScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(listOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(listTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(qiblaOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

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
    const interval = setInterval(() => {
      setPrayerTimes(generatePrayerTimes());
      updateTimeToNext();
    }, 60000);
    updateTimeToNext();
    return () => clearInterval(interval);
  }, [updateTimeToNext]);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('Location access denied');
        setLocation({ latitude: 40.7128, longitude: -74.0060 });
        setQiblaDirection(calculateQiblaDirection(40.7128, -74.0060));
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      const qibla = calculateQiblaDirection(loc.coords.latitude, loc.coords.longitude);
      setQiblaDirection(qibla);

      // Animate compass rotation
      Animated.spring(compassRotation, {
        toValue: qibla,
        friction: 10,
        tension: 20,
        useNativeDriver: true,
      }).start();

      const [address] = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (address) {
        setLocationName(`${address.city || address.region}, ${address.country}`);
      }
    } catch (error) {
      console.log('Location error:', error);
      setLocationName('Unable to get location');
      setLocation({ latitude: 40.7128, longitude: -74.0060 });
      setQiblaDirection(calculateQiblaDirection(40.7128, -74.0060));
    }
  };

  const QiblaCompass = () => {
    const compassSize = width * 0.55;
    const center = compassSize / 2;
    const radius = center - 24;

    return (
      <View style={styles.compassContainer}>
        <Svg width={compassSize} height={compassSize} viewBox={`0 0 ${compassSize} ${compassSize}`}>
          <Defs>
            <RadialGradient id="compassBg" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
              <Stop offset="100%" stopColor="#F5F0E6" stopOpacity={1} />
            </RadialGradient>
            <RadialGradient id="compassGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#D97706" stopOpacity={0.15} />
              <Stop offset="100%" stopColor="#D97706" stopOpacity={0} />
            </RadialGradient>
          </Defs>

          {/* Background glow */}
          <Circle cx={center} cy={center} r={radius + 12} fill="url(#compassGlow)" />

          {/* Main compass circle */}
          <Circle cx={center} cy={center} r={radius} fill="url(#compassBg)" />

          {/* Outer decorative ring */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={Colors.light.border}
            strokeWidth={2}
          />

          {/* Inner dashed circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius - 20}
            fill="none"
            stroke={Colors.light.gold}
            strokeWidth={1}
            strokeDasharray="6 4"
            opacity={0.4}
          />

          {/* Cardinal directions */}
          {[
            { dir: 'N', angle: 0, highlight: true },
            { dir: 'E', angle: 90, highlight: false },
            { dir: 'S', angle: 180, highlight: false },
            { dir: 'W', angle: 270, highlight: false },
          ].map(({ dir, angle, highlight }) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            const x = center + (radius - 40) * Math.cos(rad);
            const y = center + (radius - 40) * Math.sin(rad);
            return (
              <SvgText
                key={dir}
                x={x}
                y={y + 5}
                fill={highlight ? Colors.light.primary : Colors.light.textMuted}
                fontSize={highlight ? 16 : 13}
                fontWeight={highlight ? 'bold' : '500'}
                textAnchor="middle"
              >
                {dir}
              </SvgText>
            );
          })}

          {/* Degree markers */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = i * 10;
            const rad = ((angle - 90) * Math.PI) / 180;
            const isCardinal = angle % 90 === 0;
            const length = isCardinal ? 10 : 5;
            const x1 = center + (radius - 4) * Math.cos(rad);
            const y1 = center + (radius - 4) * Math.sin(rad);
            const x2 = center + (radius - 4 - length) * Math.cos(rad);
            const y2 = center + (radius - 4 - length) * Math.sin(rad);
            return (
              <Line
                key={angle}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isCardinal ? Colors.light.textSecondary : Colors.light.border}
                strokeWidth={isCardinal ? 2 : 1}
              />
            );
          })}

          {/* Qibla direction pointer */}
          <G rotation={qiblaDirection} origin={`${center}, ${center}`}>
            {/* Pointer body */}
            <Path
              d={`M ${center} ${center - radius + 32}
                  L ${center - 8} ${center - 20}
                  L ${center} ${center - 30}
                  L ${center + 8} ${center - 20} Z`}
              fill={Colors.light.primary}
            />
            {/* Pointer stem */}
            <Line
              x1={center}
              y1={center - 30}
              x2={center}
              y2={center + 10}
              stroke={Colors.light.primary}
              strokeWidth={3}
              strokeLinecap="round"
            />
            {/* Kaaba indicator */}
            <G>
              <Circle cx={center} cy={center - radius + 32} r={10} fill={Colors.light.primaryDark} />
              <Path
                d={`M ${center - 5} ${center - radius + 30}
                    L ${center + 5} ${center - radius + 30}
                    L ${center + 5} ${center - radius + 38}
                    L ${center - 5} ${center - radius + 38} Z`}
                fill="#1F1B15"
              />
            </G>
          </G>

          {/* Center decoration */}
          <Circle cx={center} cy={center} r={8} fill={Colors.light.gold} />
          <Circle cx={center} cy={center} r={4} fill={Colors.light.surface} />
        </Svg>

        <View style={styles.qiblaInfo}>
          <View style={styles.qiblaBadge}>
            <Navigation size={14} color={Colors.light.primary} style={{ transform: [{ rotate: '45deg' }] }} />
            <Text style={styles.qiblaLabel}>Qibla</Text>
          </View>
          <Text style={styles.qiblaDegree}>{Math.round(qiblaDirection)}°</Text>
        </View>
      </View>
    );
  };

  const nextPrayer = prayerTimes.find(p => p.isNext);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#047857', '#065F46', '#022C22', '#FAF8F3']}
        locations={[0, 0.12, 0.28, 0.65]}
        style={StyleSheet.absoluteFill}
      />

      {/* Pattern overlay */}
      <View style={styles.patternOverlay}>
        <IslamicStar size={100} color="#FDE68A" opacity={0.04} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            { opacity: headerOpacity, transform: [{ translateY: headerTranslate }] },
          ]}
        >
          <View style={styles.locationRow}>
            <View style={styles.locationBadge}>
              <MapPin size={14} color={Colors.light.goldSoft} />
              <Text style={styles.locationText}>{locationName}</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Prayer Times</Text>
          <Text style={styles.headerArabic}>أوقات الصلاة</Text>
        </Animated.View>

        {/* Next Prayer Card */}
        {nextPrayer && (
          <Animated.View
            style={[
              styles.nextPrayerCard,
              shadows.xl,
              { opacity: nextCardOpacity, transform: [{ scale: nextCardScale }] },
            ]}
          >
            <LinearGradient
              colors={['#FFFFFF', '#FDFCF9']}
              style={styles.nextPrayerGradient}
            >
              <View style={styles.nextPrayerHeader}>
                <View style={[styles.nextPrayerIconContainer, { backgroundColor: nextPrayer.accentColor + '15' }]}>
                  {nextPrayer.icon}
                </View>
                <View style={styles.nextBadge}>
                  <Text style={styles.nextLabel}>NEXT</Text>
                </View>
              </View>

              <Text style={styles.nextPrayerName}>{nextPrayer.name}</Text>
              <Text style={styles.nextPrayerArabic}>{nextPrayer.nameArabic}</Text>

              <Text style={styles.nextPrayerTime}>{nextPrayer.time}</Text>

              <View style={styles.countdownContainer}>
                <Clock size={14} color={Colors.light.gold} />
                <Text style={styles.countdownText}>{timeToNext} remaining</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Prayer Times List */}
        <Animated.View
          style={[
            styles.prayerList,
            shadows.lg,
            { opacity: listOpacity, transform: [{ translateY: listTranslate }] },
          ]}
        >
          {prayerTimes.map((prayer, index) => (
            <View
              key={prayer.name}
              style={[
                styles.prayerItem,
                prayer.isNext && styles.prayerItemNext,
                index === prayerTimes.length - 1 && styles.prayerItemLast,
              ]}
            >
              <View style={styles.prayerLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: prayer.accentColor + '12' },
                    prayer.isPast && styles.iconContainerPast,
                  ]}
                >
                  {prayer.icon}
                </View>
                <View>
                  <Text
                    style={[
                      styles.prayerName,
                      prayer.isPast && styles.prayerNamePast,
                      prayer.isNext && styles.prayerNameNext,
                    ]}
                  >
                    {prayer.name}
                  </Text>
                  <Text style={styles.prayerNameArabic}>{prayer.nameArabic}</Text>
                </View>
              </View>
              <View style={styles.prayerRight}>
                <Text
                  style={[
                    styles.prayerTime,
                    prayer.isNext && styles.prayerTimeNext,
                    prayer.isPast && styles.prayerTimePast,
                  ]}
                >
                  {prayer.time}
                </Text>
                {prayer.isNext && (
                  <View style={styles.activeDot} />
                )}
              </View>
            </View>
          ))}
        </Animated.View>

        {/* Qibla Section */}
        <Animated.View style={[styles.qiblaSection, shadows.lg, { opacity: qiblaOpacity }]}>
          <View style={styles.qiblaSectionHeader}>
            <Text style={styles.sectionTitle}>Qibla Direction</Text>
            <Text style={styles.sectionSubtitle}>Face this direction for prayer</Text>
          </View>
          <QiblaCompass />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  patternOverlay: {
    position: 'absolute',
    top: 40,
    right: -30,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  locationRow: {
    marginBottom: 12,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  locationText: {
    fontSize: 13,
    color: Colors.light.goldSoft,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FDFCF9',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerArabic: {
    fontSize: 18,
    color: Colors.light.goldSoft,
    opacity: 0.9,
  },
  nextPrayerCard: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
  },
  nextPrayerGradient: {
    padding: 28,
    alignItems: 'center',
  },
  nextPrayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  nextPrayerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBadge: {
    backgroundColor: Colors.light.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  nextLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  nextPrayerName: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.light.text,
  },
  nextPrayerArabic: {
    fontSize: 16,
    color: Colors.light.textMuted,
    marginBottom: 8,
  },
  nextPrayerTime: {
    fontSize: 56,
    fontWeight: '200',
    color: Colors.light.text,
    letterSpacing: -2,
    marginBottom: 16,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.goldMuted,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  countdownText: {
    fontSize: 14,
    color: Colors.light.textGold,
    fontWeight: '600',
  },
  prayerList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  prayerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  prayerItemNext: {
    backgroundColor: Colors.light.goldMuted + '40',
  },
  prayerItemLast: {
    borderBottomWidth: 0,
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerPast: {
    opacity: 0.5,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  prayerNamePast: {
    color: Colors.light.textMuted,
  },
  prayerNameNext: {
    color: Colors.light.text,
  },
  prayerNameArabic: {
    fontSize: 13,
    color: Colors.light.textMuted,
  },
  prayerRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.light.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  prayerTimeNext: {
    fontWeight: '700',
    color: Colors.light.text,
  },
  prayerTimePast: {
    color: Colors.light.textMuted,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.gold,
  },
  qiblaSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
  },
  qiblaSectionHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.light.textMuted,
  },
  compassContainer: {
    alignItems: 'center',
  },
  qiblaInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  qiblaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.surfaceSubdued,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  qiblaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: 0.5,
  },
  qiblaDegree: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.light.text,
    letterSpacing: -1,
  },
});
