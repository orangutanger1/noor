import React, { useRef, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  View,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface OnboardingButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function OnboardingButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: OnboardingButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    if (!disabled && !loading && !isProcessing) {
      setIsProcessing(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
      // Prevent double-clicks for 500ms
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  if (variant === 'text') {
    return (
      <TouchableOpacity
        style={[styles.textButton, style]}
        onPress={handlePress}
        disabled={disabled || loading || isProcessing}
        activeOpacity={0.6}
      >
        <Text style={[styles.textButtonText, disabled && styles.textButtonDisabled]}>
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <TouchableOpacity
          style={[styles.secondaryButton, (disabled || isProcessing) && styles.disabledButton]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading || isProcessing}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color={Colors.light.primary} />
          ) : (
            <Text style={styles.secondaryButtonText}>{title}</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading || isProcessing}
        activeOpacity={0.9}
        style={[styles.primaryButton, (disabled || isProcessing) && styles.disabledButton]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.primaryButtonText}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#047857',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E2DD',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    letterSpacing: 0.3,
  },
  textButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  textButtonText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  textButtonDisabled: {
    opacity: 0.5,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
