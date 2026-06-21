import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PaywallScreen } from '@/components/subscription';
import { useTheme } from '@/providers/ThemeProvider';

/**
 * Dedicated Paywall screen route.
 * Navigate to this screen to show the paywall.
 */
export default function PaywallRoute() {
  const router = useRouter();
  const { colors } = useTheme();

  const handleDismiss = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [router]);

  const handlePurchaseCompleted = useCallback(() => {
    // Navigate back after successful purchase
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [router]);

  const handleRestoreCompleted = useCallback(() => {
    // Navigate back after successful restore
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PaywallScreen
        onDismiss={handleDismiss}
        onPurchaseCompleted={handlePurchaseCompleted}
        onRestoreCompleted={handleRestoreCompleted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
