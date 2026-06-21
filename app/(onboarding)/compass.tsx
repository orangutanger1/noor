import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Navigation, CheckCircle, RotateCcw } from 'lucide-react-native';
import { Magnetometer, Accelerometer } from 'expo-sensors';
import Svg, { Circle, Path, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Coordinates, Qibla } from 'adhan';
import Colors from '@/constants/colors';
import { OnboardingButton, OnboardingProgress } from '@/components/onboarding';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useResponsive } from '@/hooks/useResponsive';

const { width } = Dimensions.get('window');
const COMPASS_SIZE = Math.min(width * 0.7, 280);

const calculateQiblaDirection = (lat: number, lon: number): number => {
  const coordinates = new Coordinates(lat, lon);
  return Qibla(coordinates);
};

export default function CompassCalibrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { locationData } = useOnboarding();
  const { isTablet, contentMaxWidth } = useResponsive();

  const [compassAvailable, setCompassAvailable] = useState(true);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  const lastHeading = useRef(0);
  const totalRotation = useRef(0);
  const accelData = useRef({ x: 0, y: 0, z: -1 });
  const smoothedHeading = useRef(0);
  const isFirstReading = useRef(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (locationData?.latitude && locationData?.longitude) {
      const qibla = calculateQiblaDirection(locationData.latitude, locationData.longitude);
      setQiblaDirection(qibla);
    } else {
      setQiblaDirection(calculateQiblaDirection(40.7128, -74.006));
    }
  }, [locationData]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Pulse animation for calibration hint
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

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

        setCompassAvailable(magAvailable && accelAvailable);

        if (!magAvailable || !accelAvailable) return;

        // Set update intervals (60ms for smooth updates)
        Accelerometer.setUpdateInterval(60);
        Magnetometer.setUpdateInterval(60);

        // Subscribe to accelerometer
        accelSubscription = Accelerometer.addListener((data) => {
          accelData.current = data;
        });

        // Subscribe to magnetometer
        magSubscription = Magnetometer.addListener((data) => {
          const { x: mx, y: my, z: mz } = data;
          const { x: ax, y: ay, z: az } = accelData.current;

          const rawAngle = calculateTiltCompensatedHeading(mx, my, mz, ax, ay, az);

          // Apply exponential smoothing with wrap-around handling
          let angle: number;
          if (isFirstReading.current) {
            smoothedHeading.current = rawAngle;
            isFirstReading.current = false;
            angle = rawAngle;
          } else {
            // Handle wrap-around at 0/360 degrees
            let diff = rawAngle - smoothedHeading.current;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;

            // Exponential smoothing (alpha = 0.15 for smooth movement)
            const alpha = 0.15;
            smoothedHeading.current = (smoothedHeading.current + alpha * diff + 360) % 360;
            angle = smoothedHeading.current;
          }

          setDeviceHeading(angle);

          // Track rotation for calibration
          const diff = angle - lastHeading.current;
          let normalizedDiff = diff;
          if (diff > 180) normalizedDiff = diff - 360;
          if (diff < -180) normalizedDiff = diff + 360;

          totalRotation.current += Math.abs(normalizedDiff);
          lastHeading.current = angle;

          // Consider calibrated after ~720 degrees of total rotation (2 full circles)
          const progress = Math.min(totalRotation.current / 720, 1);
          setCalibrationProgress(progress);

          if (progress >= 1 && !isCalibrated) {
            setIsCalibrated(true);
          }
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
  }, [isCalibrated]);

  const handleContinue = () => {
    router.push('/(onboarding)/experience');
  };

  const compassRotation = -deviceHeading;
  const qiblaAngleFromDevice = (qiblaDirection - deviceHeading + 360) % 360;
  const isPointingAtQibla = qiblaAngleFromDevice < 15 || qiblaAngleFromDevice > 345;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[
          styles.content,
          { maxWidth: contentMaxWidth, alignSelf: isTablet ? 'center' : undefined, width: '100%' },
        ]}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Qibla Compass</Text>
          <Text style={styles.subtitle}>
            {isCalibrated
              ? 'Point the top of your phone toward the Kaaba'
              : 'Rotate your phone in a figure-8 pattern to calibrate'}
          </Text>
        </Animated.View>

        {!compassAvailable ? (
          <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
            <View style={styles.errorIcon}>
              <Navigation size={40} color={Colors.light.primary} />
            </View>
            <Text style={styles.errorTitle}>Compass Unavailable</Text>
            <Text style={styles.errorText}>
              Your device doesn't have a compass sensor. You can still use the app - Qibla direction will be shown in degrees.
            </Text>
          </Animated.View>
        ) : (
          <Animated.View style={[styles.compassWrapper, { opacity: fadeAnim }]}>
            {/* Device direction indicator */}
            <View style={styles.devicePointer}>
              <View style={[
                styles.pointerTriangle,
                isPointingAtQibla && isCalibrated && styles.pointerActive
              ]} />
            </View>

            <Animated.View style={[
              styles.compassOuter,
              !isCalibrated && { transform: [{ scale: pulseAnim }] }
            ]}>
              <Svg width={COMPASS_SIZE} height={COMPASS_SIZE} viewBox="0 0 200 200">
                <Defs>
                  <LinearGradient id="qiblaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor={Colors.light.gold} />
                    <Stop offset="100%" stopColor="#8B6914" />
                  </LinearGradient>
                </Defs>

                {/* Background circle */}
                <Circle cx="100" cy="100" r="95" fill="#FAFAF8" stroke="#E5E2DD" strokeWidth="2" />

                {/* Rotating compass group */}
                <G rotation={compassRotation} origin="100, 100">
                  {/* Degree marks */}
                  {Array.from({ length: 72 }).map((_, i) => {
                    const angle = i * 5;
                    const isMajor = angle % 30 === 0;
                    const length = isMajor ? 12 : 6;
                    const rad = (angle - 90) * (Math.PI / 180);
                    const x1 = 100 + 85 * Math.cos(rad);
                    const y1 = 100 + 85 * Math.sin(rad);
                    const x2 = 100 + (85 - length) * Math.cos(rad);
                    const y2 = 100 + (85 - length) * Math.sin(rad);
                    return (
                      <Path
                        key={i}
                        d={`M ${x1} ${y1} L ${x2} ${y2}`}
                        stroke={isMajor ? '#5C5650' : '#C4C0BA'}
                        strokeWidth={isMajor ? 2 : 1}
                      />
                    );
                  })}

                  {/* Cardinal directions */}
                  {[
                    { label: 'N', angle: 0, color: '#DC2626' },
                    { label: 'E', angle: 90, color: '#5C5650' },
                    { label: 'S', angle: 180, color: '#5C5650' },
                    { label: 'W', angle: 270, color: '#5C5650' },
                  ].map(({ label, angle, color }) => {
                    const rad = (angle - 90) * (Math.PI / 180);
                    const x = 100 + 62 * Math.cos(rad);
                    const y = 100 + 62 * Math.sin(rad) + 5;
                    return (
                      <SvgText
                        key={label}
                        x={x}
                        y={y}
                        fill={color}
                        fontSize={label === 'N' ? 16 : 13}
                        fontWeight={label === 'N' ? 'bold' : '600'}
                        textAnchor="middle"
                      >
                        {label}
                      </SvgText>
                    );
                  })}

                  {/* North indicator */}
                  <Path
                    d="M 100 20 L 94 35 L 100 30 L 106 35 Z"
                    fill="#DC2626"
                  />

                  {/* Qibla indicator (Kaaba) */}
                  <G rotation={qiblaDirection} origin="100, 100">
                    <Path
                      d={`M 100 100 L 100 28`}
                      stroke="url(#qiblaGrad)"
                      strokeWidth="3"
                      strokeDasharray="6,4"
                    />
                    {/* Kaaba icon */}
                    <G rotation={45} origin="100, 22">
                      <Path
                        d="M 92 14 L 108 14 L 108 30 L 92 30 Z"
                        fill={Colors.light.gold}
                        stroke="#8B6914"
                        strokeWidth="1.5"
                      />
                    </G>
                  </G>
                </G>

                {/* Center point */}
                <Circle cx="100" cy="100" r="6" fill={Colors.light.primary} />
                <Circle cx="100" cy="100" r="3" fill="#FFFFFF" />
              </Svg>
            </Animated.View>

            {/* Qibla info below compass */}
            <View style={styles.qiblaInfo}>
              <Text style={styles.qiblaDegree}>{Math.round(qiblaDirection)}°</Text>
              <Text style={styles.qiblaLabel}>from North</Text>
            </View>

            {/* Calibration status */}
            <View style={styles.statusContainer}>
              {isCalibrated ? (
                <View style={styles.calibratedBadge}>
                  <CheckCircle size={18} color="#10B981" />
                  <Text style={styles.calibratedText}>Calibrated</Text>
                </View>
              ) : (
                <View style={styles.calibrationContainer}>
                  <View style={styles.calibrationIcon}>
                    <RotateCcw size={16} color={Colors.light.primary} />
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${calibrationProgress * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                      {Math.round(calibrationProgress * 100)}% calibrated
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: Colors.light.gold }]} />
                <Text style={styles.legendText}>Kaaba (Qibla)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
                <Text style={styles.legendText}>North</Text>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={styles.footer}>
          <OnboardingButton
            title="Continue"
            onPress={handleContinue}
          />
          <OnboardingProgress currentStep={8} totalSteps={18} />
        </View>
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#2D2A26',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#5C5650',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  compassWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devicePointer: {
    marginBottom: 8,
    alignItems: 'center',
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2D2A26',
  },
  pointerActive: {
    borderBottomColor: '#10B981',
  },
  compassOuter: {
    padding: 4,
    borderRadius: COMPASS_SIZE / 2 + 4,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  qiblaInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  qiblaDegree: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.light.gold,
  },
  qiblaLabel: {
    fontSize: 14,
    color: '#5C5650',
    marginTop: 2,
  },
  statusContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  calibratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 20,
  },
  calibratedText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
  },
  calibrationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(139, 115, 85, 0.08)',
    borderRadius: 12,
  },
  calibrationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 115, 85, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E2DD',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#5C5650',
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: '#5C5650',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 115, 85, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D2A26',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 15,
    color: '#5C5650',
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    width: '100%',
    paddingTop: 16,
  },
});
