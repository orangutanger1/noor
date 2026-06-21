import { useCallback, useMemo } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';
import { useRevenueCat } from '@/providers/RevenueCatProvider';
import type { SubscriptionInfo, SubscriptionPlan, PurchasePackageInfo } from '@/types';

/**
 * Custom hook for subscription management with a simplified API.
 * Provides easy access to subscription status, purchasing, and management.
 */
export function useSubscription() {
  const {
    isProUser,
    isLoading,
    error,
    currentSubscription,
    purchasePackage,
    purchaseProduct,
    restorePurchases,
    fetchCustomerInfo,
    fetchOfferings,
    getManagementURL,
    getExpirationDate,
    willRenew,
    getMonthlyPackage,
    getYearlyPackage,
    getPackages,
  } = useRevenueCat();

  // Get detailed subscription info
  const subscriptionInfo = useMemo((): SubscriptionInfo => {
    const expDate = getExpirationDate();
    const entitlement = currentSubscription;

    // Determine the plan type based on the entitlement's product identifier
    // This is the authoritative source from RevenueCat
    let plan: SubscriptionPlan | null = null;
    const productId = entitlement?.productIdentifier;

    if (productId) {
      const productIdLower = productId.toLowerCase();
      if (productIdLower.includes('yearly') || productIdLower.includes('annual')) {
        plan = 'yearly';
      } else if (productIdLower.includes('monthly')) {
        plan = 'monthly';
      }
    }

    // Get price from offerings based on current plan
    let price: string | undefined;
    const packages = getPackages();
    if (productId && packages.length > 0) {
      const matchingPkg = packages.find(pkg =>
        pkg.product.identifier.toLowerCase() === productId?.toLowerCase()
      );
      if (matchingPkg) {
        price = matchingPkg.product.priceString;
      }
    }

    return {
      isActive: isProUser,
      plan,
      expirationDate: expDate?.toISOString() ?? null,
      willRenew: willRenew(),
      price,
      productIdentifier: productId,
    };
  }, [isProUser, currentSubscription, getExpirationDate, willRenew, getPackages]);

  // Get formatted packages for UI display
  const availablePackages = useMemo((): PurchasePackageInfo[] => {
    const packages = getPackages();
    return packages.map((pkg) => ({
      identifier: pkg.product.identifier,
      price: pkg.product.priceString,
      pricePerMonth: calculateMonthlyPrice(pkg),
      title: pkg.product.title,
      description: pkg.product.description,
      introPrice: pkg.product.introPrice?.priceString,
      introDuration: pkg.product.introPrice?.periodUnit,
    }));
  }, [getPackages]);

  // Purchase monthly subscription
  const purchaseMonthly = useCallback(async () => {
    const pkg = getMonthlyPackage();
    if (!pkg) {
      return { success: false, error: 'Monthly package not available' };
    }
    return purchasePackage(pkg);
  }, [getMonthlyPackage, purchasePackage]);

  // Purchase yearly subscription
  const purchaseYearly = useCallback(async () => {
    const pkg = getYearlyPackage();
    if (!pkg) {
      return { success: false, error: 'Yearly package not available' };
    }
    return purchasePackage(pkg);
  }, [getYearlyPackage, purchasePackage]);

  // Open subscription management (App Store/Play Store)
  const openSubscriptionManagement = useCallback(async () => {
    const managementURL = getManagementURL();

    if (managementURL) {
      try {
        await Linking.openURL(managementURL);
      } catch (_err) {
        openDefaultManagementURL();
      }
    } else {
      openDefaultManagementURL();
    }
  }, [getManagementURL]);

  // Restore purchases with user feedback
  const restoreWithFeedback = useCallback(async () => {
    const result = await restorePurchases();

    if (result.success) {
      Alert.alert(
        'Purchases Restored',
        'Your Noor Pro subscription has been restored successfully!',
        [{ text: 'OK' }]
      );
    } else if (result.error) {
      Alert.alert(
        'Restore Failed',
        result.error,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'No Purchases Found',
        'We couldn\'t find any previous purchases to restore. If you believe this is an error, please contact support.',
        [{ text: 'OK' }]
      );
    }

    return result;
  }, [restorePurchases]);

  // Check if user can access a pro feature
  const canAccessProFeature = useCallback((featureName?: string): boolean => {
    return isProUser;
  }, [isProUser]);

  // Get time remaining for subscription
  const getTimeRemaining = useCallback((): string | null => {
    const expDate = getExpirationDate();
    if (!expDate) return null;

    const now = new Date();
    const diff = expDate.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''} remaining`;
    }
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  }, [getExpirationDate]);

  // Refresh subscription data
  const refresh = useCallback(async () => {
    await Promise.all([fetchCustomerInfo(), fetchOfferings()]);
  }, [fetchCustomerInfo, fetchOfferings]);

  return {
    // Status
    isProUser,
    isLoading,
    error,
    subscriptionInfo,

    // Packages
    availablePackages,
    monthlyPackage: getMonthlyPackage(),
    yearlyPackage: getYearlyPackage(),

    // Actions
    purchaseMonthly,
    purchaseYearly,
    purchasePackage,
    restorePurchases: restoreWithFeedback,
    openSubscriptionManagement,
    refresh,

    // Utilities
    canAccessProFeature,
    getTimeRemaining,
  };
}

// Helper to calculate monthly price for yearly packages
function calculateMonthlyPrice(pkg: PurchasesPackage): string | undefined {
  if (!pkg.product.price) return undefined;

  const identifier = pkg.product.identifier.toLowerCase();
  if (identifier.includes('yearly') || identifier.includes('annual')) {
    const monthlyPrice = pkg.product.price / 12;
    return `${pkg.product.currencyCode} ${monthlyPrice.toFixed(2)}/mo`;
  }
  return undefined;
}

// Helper to open default management URL based on platform
function openDefaultManagementURL() {
  const url = Platform.select({
    ios: 'https://apps.apple.com/account/subscriptions',
    android: 'https://play.google.com/store/account/subscriptions',
    default: '',
  });

  if (url) {
    Linking.openURL(url).catch((_err) => {
      Alert.alert(
        'Unable to Open',
        'Please manage your subscription through the App Store or Google Play Store settings.',
        [{ text: 'OK' }]
      );
    });
  }
}
