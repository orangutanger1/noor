import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RotateCcw, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import Colors, { shadows } from '@/constants/colors';
import { tasbihPresets } from '@/mocks/islamic-content';
import { useApp } from '@/providers/AppProvider';
import { IslamicStar, CrescentStar } from '@/components/IslamicPattern';

const { width } = Dimensions.get('window');
const COUNTER_SIZE = width * 0.72;

export default function TasbihScreen() {
  const insets = useSafeAreaInsets();
  const { saveTasbihSession, getTodayTasbihCount } = useApp();
  const [count, setCount] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(tasbihPresets[0]);
  const [showPresets, setShowPresets] = useState(false);
  const [customTarget] = useState(99);

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(20)).current;
  const counterOpacity = useRef(new Animated.Value(0)).current;
  const counterScale = useRef(new Animated.Value(0.9)).current;

  const target = selectedPreset.id === '6' ? customTarget : selectedPreset.target;
  const progress = Math.min(count / target, 1);

  useEffect(() => {
    // Entrance animations
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(headerTranslate, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(counterOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(counterScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      ]),
    ]).start();

    // Subtle breathing animation for the counter
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    breathingAnimation.start();

    return () => breathingAnimation.stop();
  }, []);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress,
      friction: 10,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleCount = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Tap feedback animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setCount(prev => {
      const newCount = prev + 1;
      if (newCount === target) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Completion glow animation
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 300,
            useNativeDriver: false,
          }),
        ]).start();

        saveTasbihSession({
          presetId: selectedPreset.id,
          count: newCount,
          target,
          date: new Date().toISOString().split('T')[0],
          completed: true,
        });
      }
      return newCount;
    });
  }, [target, selectedPreset.id, saveTasbihSession, scaleAnim, glowAnim]);

  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (count > 0 && count < target) {
      saveTasbihSession({
        presetId: selectedPreset.id,
        count,
        target,
        date: new Date().toISOString().split('T')[0],
        completed: false,
      });
    }
    setCount(0);
    glowAnim.setValue(0);
  }, [count, target, selectedPreset.id, saveTasbihSession, glowAnim]);

  const selectPreset = (preset: typeof tasbihPresets[0]) => {
    Haptics.selectionAsync();
    if (count > 0) {
      saveTasbihSession({
        presetId: selectedPreset.id,
        count,
        target,
        date: new Date().toISOString().split('T')[0],
        completed: count >= target,
      });
    }
    setSelectedPreset(preset);
    setCount(0);
    setShowPresets(false);
    glowAnim.setValue(0);
  };

  const circumference = 2 * Math.PI * (COUNTER_SIZE / 2 - 24);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const isCompleted = count >= target;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#022C22', '#047857', '#065F46', '#FAF8F3']}
        locations={[0, 0.15, 0.35, 1]}
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
          <CrescentStar size={28} color="#FDE68A" opacity={0.7} />
          <Text style={styles.headerTitle}>Tasbih</Text>
          <Text style={styles.headerArabic}>التسبيح</Text>
          <View style={styles.todayBadge}>
            <Sparkles size={12} color={Colors.light.gold} />
            <Text style={styles.todayCount}>{getTodayTasbihCount()} today</Text>
          </View>
        </Animated.View>

        {/* Preset Selector */}
        <TouchableOpacity
          style={[styles.presetSelector, shadows.md]}
          onPress={() => setShowPresets(!showPresets)}
          activeOpacity={0.9}
        >
          <View style={styles.presetInfo}>
            <Text style={styles.presetName}>{selectedPreset.name}</Text>
            <Text style={styles.presetArabic}>{selectedPreset.arabic || selectedPreset.nameArabic}</Text>
          </View>
          <View style={styles.presetMeta}>
            <Text style={styles.presetTarget}>{selectedPreset.target}x</Text>
            {showPresets ? (
              <ChevronUp size={20} color={Colors.light.textMuted} />
            ) : (
              <ChevronDown size={20} color={Colors.light.textMuted} />
            )}
          </View>
        </TouchableOpacity>

        {/* Preset List */}
        {showPresets && (
          <Animated.View style={[styles.presetList, shadows.lg]}>
            {tasbihPresets.map((preset, index) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetItem,
                  selectedPreset.id === preset.id && styles.presetItemSelected,
                  index === tasbihPresets.length - 1 && styles.presetItemLast,
                ]}
                onPress={() => selectPreset(preset)}
                activeOpacity={0.7}
              >
                <View style={styles.presetItemLeft}>
                  <Text
                    style={[
                      styles.presetItemName,
                      selectedPreset.id === preset.id && styles.presetItemNameSelected,
                    ]}
                  >
                    {preset.name}
                  </Text>
                  <Text style={styles.presetItemArabic}>{preset.nameArabic}</Text>
                </View>
                <View style={styles.presetItemRight}>
                  <Text style={styles.presetItemTarget}>{preset.target}x</Text>
                  {selectedPreset.id === preset.id && (
                    <View style={styles.checkCircle}>
                      <Check size={12} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* Counter Section */}
        <Animated.View
          style={[
            styles.counterSection,
            { opacity: counterOpacity, transform: [{ scale: counterScale }] },
          ]}
        >
          {/* Glow ring for completion */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              },
            ]}
          />

          <TouchableOpacity
            activeOpacity={1}
            onPress={handleCount}
            testID="tasbih-counter"
          >
            <Animated.View
              style={[
                styles.counterContainer,
                shadows.xl,
                { transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] },
              ]}
            >
              <Svg width={COUNTER_SIZE} height={COUNTER_SIZE} style={styles.progressRing}>
                <Defs>
                  <RadialGradient id="counterBg" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={1} />
                    <Stop offset="100%" stopColor="#FDFCF9" stopOpacity={1} />
                  </RadialGradient>
                </Defs>

                {/* Background circle */}
                <Circle
                  cx={COUNTER_SIZE / 2}
                  cy={COUNTER_SIZE / 2}
                  r={COUNTER_SIZE / 2 - 24}
                  fill="url(#counterBg)"
                />

                {/* Track circle */}
                <Circle
                  cx={COUNTER_SIZE / 2}
                  cy={COUNTER_SIZE / 2}
                  r={COUNTER_SIZE / 2 - 24}
                  stroke={Colors.light.borderLight}
                  strokeWidth={10}
                  fill="none"
                />

                {/* Progress circle */}
                <AnimatedCircle
                  cx={COUNTER_SIZE / 2}
                  cy={COUNTER_SIZE / 2}
                  r={COUNTER_SIZE / 2 - 24}
                  stroke={isCompleted ? Colors.light.gold : Colors.light.primary}
                  strokeWidth={10}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  rotation="-90"
                  origin={`${COUNTER_SIZE / 2}, ${COUNTER_SIZE / 2}`}
                />

                {/* Inner decorative ring */}
                <Circle
                  cx={COUNTER_SIZE / 2}
                  cy={COUNTER_SIZE / 2}
                  r={COUNTER_SIZE / 2 - 50}
                  stroke={Colors.light.border}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  fill="none"
                  opacity={0.4}
                />
              </Svg>

              <View style={styles.counterInner}>
                <Text style={[styles.countText, isCompleted && styles.countTextCompleted]}>
                  {count}
                </Text>
                <Text style={styles.targetText}>of {target}</Text>
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    <Text style={styles.completedText}>Complete</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          </TouchableOpacity>

          <Text style={styles.tapHint}>Tap to count</Text>
        </Animated.View>

        {/* Dhikr Display */}
        <View style={[styles.dhikrDisplay, shadows.lg]}>
          <LinearGradient
            colors={['#022C22', '#065F46']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dhikrGradient}
          >
            <View style={styles.dhikrPattern}>
              <IslamicStar size={60} color="#FDE68A" opacity={0.08} />
            </View>
            <Text style={styles.dhikrArabic}>
              {selectedPreset.arabic || selectedPreset.nameArabic}
            </Text>
            {selectedPreset.id !== '6' && (
              <Text style={styles.dhikrTranslation}>{selectedPreset.name}</Text>
            )}
          </LinearGradient>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={[styles.resetButton, shadows.sm]}
          onPress={handleReset}
          activeOpacity={0.8}
          testID="reset-button"
        >
          <RotateCcw size={18} color={Colors.light.primary} />
          <Text style={styles.resetText}>Reset Counter</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  patternOverlay: {
    position: 'absolute',
    top: 50,
    right: -30,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FDFCF9',
    marginTop: 8,
    letterSpacing: -0.5,
  },
  headerArabic: {
    fontSize: 18,
    color: Colors.light.goldSoft,
    marginBottom: 12,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  todayCount: {
    fontSize: 13,
    color: Colors.light.goldSoft,
    fontWeight: '500',
  },
  presetSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  presetArabic: {
    fontSize: 16,
    color: Colors.light.textMuted,
  },
  presetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  presetTarget: {
    fontSize: 14,
    color: Colors.light.gold,
    fontWeight: '700',
  },
  presetList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 12,
    width: '100%',
    overflow: 'hidden',
  },
  presetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  presetItemSelected: {
    backgroundColor: Colors.light.goldMuted + '40',
  },
  presetItemLast: {
    borderBottomWidth: 0,
  },
  presetItemLeft: {
    flex: 1,
  },
  presetItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 2,
  },
  presetItemNameSelected: {
    color: Colors.light.textGold,
    fontWeight: '600',
  },
  presetItemArabic: {
    fontSize: 14,
    color: Colors.light.textMuted,
  },
  presetItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  presetItemTarget: {
    fontSize: 13,
    color: Colors.light.textMuted,
    fontWeight: '500',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterSection: {
    alignItems: 'center',
    marginVertical: 36,
  },
  glowRing: {
    position: 'absolute',
    width: COUNTER_SIZE + 40,
    height: COUNTER_SIZE + 40,
    borderRadius: (COUNTER_SIZE + 40) / 2,
    backgroundColor: Colors.light.gold,
  },
  counterContainer: {
    width: COUNTER_SIZE,
    height: COUNTER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: COUNTER_SIZE / 2,
  },
  progressRing: {
    position: 'absolute',
  },
  counterInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 80,
    fontWeight: '200',
    color: Colors.light.text,
    letterSpacing: -3,
  },
  countTextCompleted: {
    color: Colors.light.gold,
  },
  targetText: {
    fontSize: 16,
    color: Colors.light.textMuted,
    marginTop: -8,
    fontWeight: '400',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    gap: 6,
  },
  completedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  tapHint: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 20,
    fontWeight: '400',
  },
  dhikrDisplay: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  dhikrGradient: {
    padding: 28,
    alignItems: 'center',
    position: 'relative',
  },
  dhikrPattern: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  dhikrArabic: {
    fontSize: 34,
    color: '#FDFCF9',
    textAlign: 'center',
    lineHeight: 52,
    fontWeight: '400',
  },
  dhikrTranslation: {
    fontSize: 14,
    color: Colors.light.goldSoft,
    marginTop: 12,
    fontStyle: 'italic',
    fontWeight: '400',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 20,
    gap: 10,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
