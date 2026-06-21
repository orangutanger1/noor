import { useCallback, useState } from 'react';
import RevenueCatUI from 'react-native-purchases-ui';
import { useRevenueCat } from '@/providers/RevenueCatProvider';

export interface CustomerCenterResult {
  success: boolean;
  error?: string;
}

/**
 * Custom hook for presenting the RevenueCat Customer Center.
 * Customer Center provides a self-service UI for users to:
 * - View their subscription status
 * - Request cancellation
 * - Restore purchases
 * - Request refunds (iOS only)
 * - Change plans (iOS only)
 */
export function useCustomerCenter() {
  const { isProUser, fetchCustomerInfo } = useRevenueCat();
  const [isPresenting, setIsPresenting] = useState(false);

  /**
   * Present the Customer Center.
   * This should be used when users want to manage their subscription.
   * The Customer Center is configured in the RevenueCat dashboard.
   */
  const presentCustomerCenter = useCallback(async (): Promise<CustomerCenterResult> => {
    if (isPresenting) {
      return {
        success: false,
        error: 'Customer Center is already being presented',
      };
    }

    setIsPresenting(true);

    try {
      await RevenueCatUI.presentCustomerCenter();

      // Refresh customer info after Customer Center interaction
      // User might have cancelled, restored, or changed their subscription
      // Add a small delay to ensure the backend has processed any changes
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchCustomerInfo();

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to present Customer Center';
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsPresenting(false);
    }
  }, [isPresenting, fetchCustomerInfo]);

  /**
   * Check if Customer Center should be shown.
   * Generally, you want to show Customer Center to users who have
   * an active subscription or have had one in the past.
   */
  const shouldShowCustomerCenter = useCallback((): boolean => {
    // Show Customer Center if user is a pro user
    // You might also want to show it for users who had subscriptions in the past
    return isProUser;
  }, [isProUser]);

  return {
    presentCustomerCenter,
    shouldShowCustomerCenter,
    isPresenting,
    isProUser,
  };
}
