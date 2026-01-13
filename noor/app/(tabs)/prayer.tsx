import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
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
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import Svg, { Circle, Line, G, Text as SvgText } from 'react-native-svg';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface PrayerTimeData {
  name: string;
  nameArabic: string;
  time: string;
  icon: React.ReactNode;
  isNext: boolean;
  isPast: boolean;
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
    { name: 'Fajr', nameArabic: 'الفجر', hour: 5, minute: 23, icon: <Sunrise size={22} color={Colors.light.gold} /> },
    { name: 'Sunrise', nameArabic: 'الشروق', hour: 6, minute: 48, icon: <Sun size={22} color={Colors.light.warning} /> },
    { name: 'Dhuhr', nameArabic: 'الظهر', hour: 12, minute: 15, icon: <CloudSun size={22} color={Colors.light.primary} /> },
    { name: 'Asr', nameArabic: 'العصر', hour: 15, minute: 45, icon: <Sun size={22} color={Colors.light.gold} /> },
    { name: 'Maghrib', nameArabic: 'المغرب', hour: 18, minute: 32, icon: <Sunset size={22} color={Colors.light.warning} /> },
    { name: 'Isha', nameArabic: 'العشاء', hour: 20, minute: 5, icon: <Moon size={22} color={Colors.light.primaryDark} /> },
  ];

  let foundNext = false;
  return prayers.map(prayer => {
    const prayerTime = prayer.hour * 60 + prayer.minute;
    const isPast = currentTime > prayerTime;
    const isNext = !foundNext && !isPast;
    if (isNext) foundNext = true;

    return {
      name: prayer.name,
      nameArabic: prayer.nameArabic,
      time: `${prayer.hour.toString().padStart(2, '0')}:${prayer.minute.toString().padStart(2, '0')}`,
      icon: prayer.icon,
      isNext,
      isPast,
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
  

  useEffect(() => {
    setPrayerTimes(generatePrayerTimes());
    getLocation();
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
    const compassSize = width * 0.6;
    const center = compassSize / 2;
    const radius = center - 20;

    return (
      <View style={styles.compassContainer}>
        <Svg width={compassSize} height={compassSize} viewBox={`0 0 ${compassSize} ${compassSize}`}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={Colors.light.border}
            strokeWidth={2}
          />
          <Circle
            cx={center}
            cy={center}
            r={radius - 15}
            fill="transparent"
            stroke={Colors.light.gold}
            strokeWidth={1}
            strokeDasharray="4 4"
            opacity={0.5}
          />
          
          {['N', 'E', 'S', 'W'].map((dir, i) => {
            const angle = (i * 90 - 90) * Math.PI / 180;
            const x = center + (radius - 35) * Math.cos(angle);
            const y = center + (radius - 35) * Math.sin(angle);
            return (
              <SvgText
                key={dir}
                x={x}
                y={y + 5}
                fill={dir === 'N' ? Colors.light.primary : Colors.light.textMuted}
                fontSize={14}
                fontWeight={dir === 'N' ? 'bold' : 'normal'}
                textAnchor="middle"
              >
                {dir}
              </SvgText>
            );
          })}
          
          <G rotation={qiblaDirection} origin={`${center}, ${center}`}>
            <Line
              x1={center}
              y1={center - radius + 30}
              x2={center}
              y2={center}
              stroke={Colors.light.primary}
              strokeWidth={3}
              strokeLinecap="round"
            />
            <Circle
              cx={center}
              cy={center - radius + 30}
              r={8}
              fill={Colors.light.primary}
            />
          </G>
          
          <Circle cx={center} cy={center} r={6} fill={Colors.light.gold} />
        </Svg>
        
        <View style={styles.qiblaInfo}>
          <Text style={styles.qiblaLabel}>Qibla Direction</Text>
          <Text style={styles.qiblaDegree}>{Math.round(qiblaDirection)}°</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.primaryDark, Colors.light.cream]}
        locations={[0, 0.25, 0.6]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.locationRow}>
            <MapPin size={16} color={Colors.light.goldSoft} />
            <Text style={styles.locationText}>{locationName}</Text>
          </View>
          <Text style={styles.headerTitle}>Prayer Times</Text>
          <Text style={styles.headerArabic}>أوقات الصلاة</Text>
        </View>

        {prayerTimes.find(p => p.isNext) && (
          <View style={styles.nextPrayerCard}>
            <Text style={styles.nextLabel}>NEXT PRAYER</Text>
            <Text style={styles.nextPrayerName}>
              {prayerTimes.find(p => p.isNext)?.name}
            </Text>
            <Text style={styles.nextPrayerTime}>
              {prayerTimes.find(p => p.isNext)?.time}
            </Text>
            <View style={styles.countdownContainer}>
              <Clock size={16} color={Colors.light.gold} />
              <Text style={styles.countdownText}>{timeToNext} remaining</Text>
            </View>
          </View>
        )}

        <View style={styles.prayerList}>
          {prayerTimes.map((prayer, index) => (
            <View
              key={prayer.name}
              style={[
                styles.prayerItem,
                prayer.isNext && styles.prayerItemNext,
                prayer.isPast && styles.prayerItemPast,
              ]}
            >
              <View style={styles.prayerLeft}>
                <View style={[
                  styles.iconContainer,
                  prayer.isNext && styles.iconContainerNext,
                ]}>
                  {prayer.icon}
                </View>
                <View>
                  <Text style={[
                    styles.prayerName,
                    prayer.isPast && styles.prayerNamePast,
                  ]}>
                    {prayer.name}
                  </Text>
                  <Text style={styles.prayerNameArabic}>{prayer.nameArabic}</Text>
                </View>
              </View>
              <View style={styles.prayerRight}>
                <Text style={[
                  styles.prayerTime,
                  prayer.isNext && styles.prayerTimeNext,
                  prayer.isPast && styles.prayerTimePast,
                ]}>
                  {prayer.time}
                </Text>
                {prayer.isNext && (
                  <View style={styles.nextBadge}>
                    <Text style={styles.nextBadgeText}>NEXT</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.qiblaSection}>
          <Text style={styles.sectionTitle}>Qibla Compass</Text>
          <Text style={styles.sectionSubtitle}>Face this direction for prayer</Text>
          <QiblaCompass />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.cream,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: Colors.light.goldSoft,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.ivory,
    marginBottom: 4,
  },
  headerArabic: {
    fontSize: 18,
    color: Colors.light.goldSoft,
    opacity: 0.9,
  },
  nextPrayerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  nextLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.gold,
    letterSpacing: 2,
    marginBottom: 8,
  },
  nextPrayerName: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  nextPrayerTime: {
    fontSize: 48,
    fontWeight: '300',
    color: Colors.light.text,
    marginBottom: 12,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.light.cream,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  countdownText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  prayerList: {
    backgroundColor: Colors.light.ivory,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  prayerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  prayerItemNext: {
    backgroundColor: Colors.light.primary + '10',
  },
  prayerItemPast: {
    opacity: 0.6,
  },
  prayerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerNext: {
    backgroundColor: Colors.light.primary + '20',
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
  prayerNameArabic: {
    fontSize: 13,
    color: Colors.light.textMuted,
  },
  prayerRight: {
    alignItems: 'flex-end',
  },
  prayerTime: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  prayerTimeNext: {
    color: Colors.light.primary,
  },
  prayerTimePast: {
    color: Colors.light.textMuted,
  },
  nextBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  nextBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.ivory,
    letterSpacing: 1,
  },
  qiblaSection: {
    alignItems: 'center',
    backgroundColor: Colors.light.ivory,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginBottom: 20,
  },
  compassContainer: {
    alignItems: 'center',
  },
  qiblaInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  qiblaLabel: {
    fontSize: 13,
    color: Colors.light.textMuted,
    marginBottom: 4,
  },
  qiblaDegree: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});
