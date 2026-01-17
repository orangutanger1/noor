import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const progress = (currentStep / (totalSteps - 1)) * 100;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress,
      friction: 10,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // For 6 or fewer steps, use dots. For more, use progress bar
  const useDots = totalSteps <= 6;

  if (useDots) {
    return (
      <View style={styles.container}>
        <View style={styles.dotsTrack}>
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            const isLast = index === totalSteps - 1;

            return (
              <React.Fragment key={index}>
                <View
                  style={[
                    styles.dot,
                    isCompleted && styles.dotCompleted,
                    isActive && styles.dotActive,
                  ]}
                >
                  {isActive && <View style={styles.dotActivePulse} />}
                  {isActive && <View style={styles.dotActiveInner} />}
                  {isCompleted && <View style={styles.dotCompletedInner} />}
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.connector,
                      isCompleted && styles.connectorCompleted,
                    ]}
                  />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  }

  // Progress bar for many steps
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]}>
            {/* Animated glow at the end of progress */}
            <View style={styles.progressGlow} />
          </Animated.View>
        </View>
        <View style={styles.progressTextRow}>
          <Text style={styles.progressText}>
            {currentStep + 1} of {totalSteps}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  // Dots style (for fewer steps)
  dotsTrack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: Colors.light.gold,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotCompletedInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  dotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.gold,
  },
  dotActiveInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.gold,
  },
  dotActivePulse: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.gold,
    opacity: 0.15,
  },
  connector: {
    width: 28,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 4,
    borderRadius: 1,
  },
  connectorCompleted: {
    backgroundColor: Colors.light.gold,
    opacity: 0.5,
  },
  // Progress bar style (for many steps)
  progressBarContainer: {
    width: SCREEN_WIDTH - 80,
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.light.gold,
    borderRadius: 2,
    position: 'relative',
  },
  progressGlow: {
    position: 'absolute',
    right: 0,
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.goldSoft,
    opacity: 0.8,
  },
  progressTextRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
