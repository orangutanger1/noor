import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import type { CustomerInfo, PurchasesError } from 'react-native-purchases';
import { useSubscription } from '@/hooks/useSubscription';
import { useTheme } from '@/providers/ThemeProvider';

interface PaywallScreenProps {
  onDismiss?: () => void;
  onPurchaseCompleted?: () => void;
  onRestoreCompleted?: () => void;
}

/**
 * Embedded Paywall component using RevenueCat UI.
 * This component renders the paywall inline in your screen.
 */
export function PaywallScreen({
  onDismiss,
  onPurchaseCompleted,
  onRestoreCompleted,
}: PaywallScreenProps) {
  const { isLoading, error, refresh } = useSubscription();
  const { colors } = useTheme();

  const handlePurchaseStarted = useCallback(() => {
    // Purchase initiated
  }, []);

  const handlePurchaseCompleted = useCallback(
    ({ customerInfo: _customerInfo }: { customerInfo: CustomerInfo }) => {
      onPurchaseCompleted?.();
    },
    [onPurchaseCompleted]
  );

  const handlePurchaseError = useCallback(({ error: _error }: { error: PurchasesError }) => {
    Alert.alert(
      'Purchase Error',
      'There was an error processing your purchase. Please try again.',
      [{ text: 'OK' }]
    );
  }, []);

  const handlePurchaseCancelled = useCallback(() => {
    // Purchase cancelled by user
  }, []);

  const handleRestoreStarted = useCallback(() => {
    // Restore initiated
  }, []);

  const handleRestoreCompleted = useCallback(
    ({ customerInfo: _customerInfo }: { customerInfo: CustomerInfo }) => {
      onRestoreCompleted?.();
    },
    [onRestoreCompleted]
  );

  const handleRestoreError = useCallback(({ error: _error }: { error: PurchasesError }) => {
    Alert.alert(
      'Restore Error',
      'There was an error restoring your purchases. Please try again.',
      [{ text: 'OK' }]
    );
  }, []);

  const handleDismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.cream }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading subscription options...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.cream }]}>
        <Text style={[styles.errorText, { color: colors.missed || '#FF6B6B' }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={refresh}
        >
          <Text style={[styles.retryButtonText, { color: colors.ivory }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RevenueCatUI.Paywall
        onPurchaseStarted={handlePurchaseStarted}
        onPurchaseCompleted={handlePurchaseCompleted}
        onPurchaseError={handlePurchaseError}
        onPurchaseCancelled={handlePurchaseCancelled}
        onRestoreStarted={handleRestoreStarted}
        onRestoreCompleted={handleRestoreCompleted}
        onRestoreError={handleRestoreError}
        onDismiss={handleDismiss}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
