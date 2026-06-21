import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import Constants from 'expo-constants';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useRevenueCat, NOOR_PRO_ENTITLEMENT } from '@/providers/RevenueCatProvider';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

export interface PaywallResult {
  success: boolean;
  purchased: boolean;
  restored: boolean;
  cancelled: boolean;
  error?: string;
}

/**
 * Custom hook for presenting RevenueCat paywalls.
 * Provides methods to show paywalls and handle results.
 */
export function usePaywall() {
  const { isProUser, fetchCustomerInfo } = useRevenueCat();
  const [isPresenting, setIsPresenting] = useState(false);

  /**
   * Present the default paywall.
   * This shows the paywall configured in RevenueCat dashboard.
   */
  const presentPaywall = useCallback(async (): Promise<PaywallResult> => {
    // Show alert in Expo Go since RevenueCat UI doesn't work there
    if (isExpoGo) {
      Alert.alert(
        'Development Mode',
        'In-app purchases and paywalls are not available in Expo Go. Please build a development or production app to test purchases.',
        [{ text: 'OK' }]
      );
      return {
        success: false,
        purchased: false,
        restored: false,
        cancelled: false,
        error: 'Paywall not available in Expo Go',
      };
    }

    if (isPresenting) {
      return {
        success: false,
        purchased: false,
        restored: false,
        cancelled: false,
        error: 'Paywall is already being presented',
      };
    }

    setIsPresenting(true);

    try {
      const result = await RevenueCatUI.presentPaywall();

      // Refresh customer info after paywall interaction
      // Add a small delay to ensure the backend has processed any changes
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchCustomerInfo();

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
          return {
            success: true,
            purchased: true,
            restored: false,
            cancelled: false,
          };
        case PAYWALL_RESULT.RESTORED:
          return {
            success: true,
            purchased: false,
            restored: true,
            cancelled: false,
          };
        case PAYWALL_RESULT.CANCELLED:
          return {
            success: false,
            purchased: false,
            restored: false,
            cancelled: true,
          };
        case PAYWALL_RESULT.ERROR:
          return {
            success: false,
            purchased: false,
            restored: false,
            cancelled: false,
            error: 'An error occurred while processing your purchase',
          };
        default:
          return {
            success: false,
            purchased: false,
            restored: false,
            cancelled: false,
          };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to present paywall';
      return {
        success: false,
        purchased: false,
        restored: false,
        cancelled: false,
        error: errorMessage,
      };
    } finally {
      setIsPresenting(false);
    }
  }, [isPresenting, fetchCustomerInfo]);

  /**
   * Present paywall only if user doesn't have Noor Pro entitlement.
   * Useful for gating features - won't show paywall to existing subscribers.
   */
  const presentPaywallIfNeeded = useCallback(async (): Promise<PaywallResult> => {
    // If already a pro user, no need to show paywall
    if (isProUser) {
      return {
        success: true,
        purchased: false,
        restored: false,
        cancelled: false,
      };
    }

    // Show alert in Expo Go since RevenueCat UI doesn't work there
    if (isExpoGo) {
      Alert.alert(
        'Development Mode',
        'In-app purchases and paywalls are not available in Expo Go. Please build a development or production app to test purchases.',
        [{ text: 'OK' }]
      );
      return {
        success: false,
        purchased: false,
        restored: false,
        cancelled: false,
        error: 'Paywall not available in Expo Go',
      };
    }

    if (isPresenting) {
      return {
        success: false,
        purchased: false,
        restored: false,
        cancelled: false,
        error: 'Paywall is already being presented',
      };
    }

    setIsPresenting(true);

    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: NOOR_PRO_ENTITLEMENT,
      });

      // Refresh customer info after paywall interaction
      // Add a small delay to ensure the backend has processed any changes
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchCustomerInfo();

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
          return {
            success: true,
            purchased: true,
            restored: false,
            cancelled: false,
          };
        case PAYWALL_RESULT.RESTORED:
          return {
            success: true,
            purchased: false,
            restored: true,
            cancelled: false,
          };
        case PAYWALL_RESULT.CANCELLED:
          return {
            success: false,
            purchased: false,
            restored: false,
            cancelled: true,
          };
        case PAYWALL_RESULT.NOT_PRESENTED:
          // User already has entitlement
          return {
            success: true,
            purchased: false,
            restored: false,
            cancelled: false,
          };
        case PAYWALL_RESULT.ERROR:
          return {
            success: false,
            purchased: false,
            restored: false,
            cancelled: false,
            error: 'An error occurred while processing your purchase',
          };
        default:
          return {
            success: false,
            purchased: false,
            restored: false,
            cancelled: false,
          };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to present paywall';
      return {
        success: false,
        purchased: false,
        restored: false,
        cancelled: false,
        error: errorMessage,
      };
    } finally {
      setIsPresenting(false);
    }
  }, [isProUser, isPresenting, fetchCustomerInfo]);

  /**
   * Gate a feature behind the paywall.
   * If user is not pro, presents the paywall.
   * Returns true if user has access (either already pro or just purchased).
   */
  const gateFeature = useCallback(async (): Promise<boolean> => {
    if (isProUser) {
      return true;
    }

    const result = await presentPaywallIfNeeded();
    return result.success;
  }, [isProUser, presentPaywallIfNeeded]);

  /**
   * Present the paywall for plan changes (upgrade/downgrade).
   * Unlike presentPaywallIfNeeded, this works for existing subscribers
   * who want to change their subscription plan.
   */
  const presentPaywallForPlanChange = useCallback(async (): Promise<PaywallResult> => {
    // Show alert in Expo Go since RevenueCat UI doesn't work there
    if (isExpoGo) {
      Alert.alert(
        'Development Mode',
        'In-app purchases and paywalls are not available in Expo Go. Please build a development or production app to test purchases.',
        [{ text: 'OK' }]
      );
      return {
        success: false,
        purchased: false,
        restored: false,
        cancelled: false,
        error: 'Paywall not available in Expo Go',
      };
    }

    if (isPresenting) {
      return {
        success: false,
        purchased: false,
        restored: false,
        cancelled: false,
        error: 'Paywall is already being presented',
      };
    }

    setIsPresenting(true);

    try {
      // Use presentPaywall (not presentPaywallIfNeeded) to allow plan changes
      const result = await RevenueCatUI.presentPaywall();

      // Refresh customer info after paywall interaction
      // Add a small delay to ensure the backend has processed the change
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchCustomerInfo();

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
          return {
            success: true,
            purchased: true,
            restored: false,
            cancelled: false,
          };
        case PAYWALL_RESULT.RESTORED:
          return {
            success: true,
            purchased: false,
            restored: true,
            cancelled: false,
          };
        case PAYWALL_RESULT.CANCELLED:
          return {
            success: false,
            purchased: false,
            restored: false,
            cancelled: true,
          };
        case PAYWALL_RESULT.ERROR:
          return {
            success: false,
            purchased: false,
            restored: false,
            cancelled: false,
            error: 'An error occurred while processing your plan change',
          };
        default:
          return {
            success: false,
            purchased: false,
            restored: false,
            cancelled: false,
          };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to present paywall';
      return {
        success: false,
        purchased: false,
        restored: false,
        cancelled: false,
        error: errorMessage,
      };
    } finally {
      setIsPresenting(false);
    }
  }, [isPresenting, fetchCustomerInfo]);

  return {
    presentPaywall,
    presentPaywallIfNeeded,
    presentPaywallForPlanChange,
    gateFeature,
    isPresenting,
    isProUser,
  };
}
