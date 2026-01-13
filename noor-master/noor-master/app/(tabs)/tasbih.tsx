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
import { RotateCcw, Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import Colors from '@/constants/colors';
import { tasbihPresets } from '@/mocks/islamic-content';
import { useApp } from '@/providers/AppProvider';

const { width } = Dimensions.get('window');
const COUNTER_SIZE = width * 0.7;

export default function TasbihScreen() {
  const insets = useSafeAreaInsets();
  const { saveTasbihSession, getTodayTasbihCount } = useApp();
  const [count, setCount] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(tasbihPresets[0]);
  const [showPresets, setShowPresets] = useState(false);
  const [customTarget] = useState(99);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const target = selectedPreset.id === '6' ? customTarget : selectedPreset.target;
  const progress = Math.min(count / target, 1);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const handleCount = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setCount(prev => {
      const newCount = prev + 1;
      if (newCount === target) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 500,
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
  }, [count, target, selectedPreset.id, saveTasbihSession]);

  const selectPreset = (preset: typeof tasbihPresets[0]) => {
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
  };

  const circumference = 2 * Math.PI * (COUNTER_SIZE / 2 - 20);

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primaryDark, Colors.light.primary, Colors.light.cream]}
        locations={[0, 0.35, 1]}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tasbih</Text>
          <Text style={styles.headerArabic}>التسبيح</Text>
          <Text style={styles.todayCount}>Today: {getTodayTasbihCount()} dhikr</Text>
        </View>

        <TouchableOpacity 
          style={styles.presetSelector}
          onPress={() => setShowPresets(!showPresets)}
          activeOpacity={0.8}
        >
          <View>
            <Text style={styles.presetName}>{selectedPreset.name}</Text>
            <Text style={styles.presetArabic}>{selectedPreset.arabic || selectedPreset.nameArabic}</Text>
          </View>
          {showPresets ? (
            <ChevronUp size={24} color={Colors.light.primary} />
          ) : (
            <ChevronDown size={24} color={Colors.light.primary} />
          )}
        </TouchableOpacity>

        {showPresets && (
          <View style={styles.presetList}>
            {tasbihPresets.map(preset => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetItem,
                  selectedPreset.id === preset.id && styles.presetItemSelected,
                ]}
                onPress={() => selectPreset(preset)}
              >
                <View style={styles.presetItemLeft}>
                  <Text style={[
                    styles.presetItemName,
                    selectedPreset.id === preset.id && styles.presetItemNameSelected,
                  ]}>
                    {preset.name}
                  </Text>
                  <Text style={styles.presetItemArabic}>{preset.nameArabic}</Text>
                </View>
                <View style={styles.presetItemRight}>
                  <Text style={styles.presetItemTarget}>{preset.target}x</Text>
                  {selectedPreset.id === preset.id && (
                    <Check size={18} color={Colors.light.primary} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.counterSection}>
          <Animated.View style={[styles.glowRing, { opacity: glowOpacity }]} />
          
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleCount}
            testID="tasbih-counter"
          >
            <Animated.View style={[styles.counterContainer, { transform: [{ scale: scaleAnim }] }]}>
              <Svg width={COUNTER_SIZE} height={COUNTER_SIZE} style={styles.progressRing}>
                <Circle
                  cx={COUNTER_SIZE / 2}
                  cy={COUNTER_SIZE / 2}
                  r={COUNTER_SIZE / 2 - 20}
                  stroke={Colors.light.border}
                  strokeWidth={8}
                  fill="transparent"
                />
                <AnimatedCircle
                  cx={COUNTER_SIZE / 2}
                  cy={COUNTER_SIZE / 2}
                  r={COUNTER_SIZE / 2 - 20}
                  stroke={count >= target ? Colors.light.gold : Colors.light.primary}
                  strokeWidth={8}
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  rotation="-90"
                  origin={`${COUNTER_SIZE / 2}, ${COUNTER_SIZE / 2}`}
                />
              </Svg>
              
              <View style={styles.counterInner}>
                <Text style={styles.countText}>{count}</Text>
                <Text style={styles.targetText}>of {target}</Text>
                {count >= target && (
                  <View style={styles.completedBadge}>
                    <Check size={14} color={Colors.light.ivory} />
                    <Text style={styles.completedText}>Complete</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          </TouchableOpacity>

          <Text style={styles.tapHint}>Tap to count</Text>
        </View>

        <View style={styles.dhikrDisplay}>
          <Text style={styles.dhikrArabic}>
            {selectedPreset.arabic || selectedPreset.nameArabic}
          </Text>
          {selectedPreset.id !== '6' && (
            <Text style={styles.dhikrTranslation}>{selectedPreset.name}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          activeOpacity={0.8}
          testID="reset-button"
        >
          <RotateCcw size={20} color={Colors.light.primary} />
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
    backgroundColor: Colors.light.cream,
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
    fontSize: 28,
    fontWeight: '700',
    color: Colors.light.ivory,
    marginBottom: 4,
  },
  headerArabic: {
    fontSize: 18,
    color: Colors.light.goldSoft,
    marginBottom: 8,
  },
  todayCount: {
    fontSize: 14,
    color: Colors.light.goldSoft,
    opacity: 0.8,
  },
  presetSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.ivory,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
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
  presetList: {
    backgroundColor: Colors.light.ivory,
    borderRadius: 16,
    marginTop: 12,
    width: '100%',
    overflow: 'hidden',
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  presetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  presetItemSelected: {
    backgroundColor: Colors.light.primary + '10',
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
    color: Colors.light.primary,
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
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: '500',
  },
  counterSection: {
    alignItems: 'center',
    marginVertical: 32,
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
    backgroundColor: Colors.light.ivory,
    borderRadius: COUNTER_SIZE / 2,
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  progressRing: {
    position: 'absolute',
  },
  counterInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 72,
    fontWeight: '200',
    color: Colors.light.text,
  },
  targetText: {
    fontSize: 16,
    color: Colors.light.textMuted,
    marginTop: -8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    gap: 6,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.ivory,
  },
  tapHint: {
    fontSize: 14,
    color: Colors.light.textMuted,
    marginTop: 16,
  },
  dhikrDisplay: {
    backgroundColor: Colors.light.primaryDark,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  dhikrArabic: {
    fontSize: 32,
    color: Colors.light.ivory,
    textAlign: 'center',
    lineHeight: 48,
  },
  dhikrTranslation: {
    fontSize: 14,
    color: Colors.light.goldSoft,
    marginTop: 8,
    fontStyle: 'italic',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.ivory,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 10,
    shadowColor: Colors.light.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  resetText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});
