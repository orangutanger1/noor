import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Colors from '@/constants/colors';


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
                />
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
          <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E2DD',
  },
  dotCompleted: {
    backgroundColor: Colors.light.primary,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  connector: {
    width: 24,
    height: 1,
    backgroundColor: '#E5E2DD',
    marginHorizontal: 4,
  },
  connectorCompleted: {
    backgroundColor: Colors.light.primary,
  },
  // Progress bar style (for many steps)
  progressBarContainer: {
    width: '100%',
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 3,
    backgroundColor: '#E5E2DD',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
});
