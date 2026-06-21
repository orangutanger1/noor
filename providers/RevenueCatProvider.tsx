import { Platform } from 'react-native';
import Constants from 'expo-constants';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useRef } from 'react';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  PurchasesError,
} from 'react-native-purchases';

// RevenueCat API Key - Apple App Store key
const REVENUECAT_API_KEY = 'appl_amDoWJHMvknzVomGYXFnVPVoxsJ';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Entitlement identifier for Noor Pro
export const NOOR_PRO_ENTITLEMENT = 'Noor Pro';

// Product identifiers
export const PRODUCT_IDS = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
} as const;

export type ProductId = typeof PRODUCT_IDS[keyof typeof PRODUCT_IDS];

export interface SubscriptionState {
  isProUser: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOffering | null;
  isLoading: boolean;
  error: string | null;
}

export interface PurchaseResult {
  success: boolean;
  customerInfo?: CustomerInfo;
  error?: string;
  cancelled?: boolean;
}

export const [RevenueCatProvider, useRevenueCat] = createContextHook(() => {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationAttempted = useRef(false);

  // Check if user has Noor Pro entitlement
  const isProUser = customerInfo?.entitlements.active[NOOR_PRO_ENTITLEMENT]?.isActive ?? false;

  // Get current subscription details
  const currentSubscription = customerInfo?.entitlements.active[NOOR_PRO_ENTITLEMENT] ?? null;

  // Initialize RevenueCat SDK
  useEffect(() => {
    if (initializationAttempted.current) return;
    initializationAttempted.current = true;

    const initRevenueCat = async () => {
      try {
        // Skip RevenueCat initialization in Expo Go
        if (isExpoGo) {
          setIsInitialized(false);
          setIsLoading(false);
          return;
        }

        // Enable debug logging in development
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        // Configure RevenueCat with API key
        // Note: In production, you should use platform-specific keys
        await Purchases.configure({
          apiKey: REVENUECAT_API_KEY,
        });

        setIsInitialized(true);

        // Fetch initial customer info and offerings
        await Promise.all([
          fetchCustomerInfo(),
          fetchOfferings(),
        ]);
      } catch (_err) {
        setError('Failed to initialize subscription service');
      } finally {
        setIsLoading(false);
      }
    };

    initRevenueCat();

    // Set up listener for customer info updates (skip in Expo Go)
    if (!isExpoGo) {
      const listener = (info: CustomerInfo) => {
        setCustomerInfo(info);
      };
      Purchases.addCustomerInfoUpdateListener(listener);

      return () => {
        Purchases.removeCustomerInfoUpdateListener(listener);
      };
    }
  }, []);

  // Fetch customer info
  const fetchCustomerInfo = useCallback(async (): Promise<CustomerInfo | null> => {
    // Return null in Expo Go
    if (isExpoGo) {
      return null;
    }

    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      setError(null);
      return info;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customer info';
      setError(errorMessage);
      return null;
    }
  }, []);

  // Fetch available offerings
  const fetchOfferings = useCallback(async (): Promise<PurchasesOffering | null> => {
    // Return null in Expo Go
    if (isExpoGo) {
      return null;
    }

    try {
      const offeringsResult = await Purchases.getOfferings();
      const currentOffering = offeringsResult.current;
      setOfferings(currentOffering);
      setError(null);
      return currentOffering;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch offerings';
      setError(errorMessage);
      return null;
    }
  }, []);

  // Purchase a package
  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
    // Mock purchase in Expo Go
    if (isExpoGo) {
      return {
        success: false,
        error: 'Purchases are not available in Expo Go. Please build a standalone app to test purchases.',
      };
    }

    try {
      setIsLoading(true);
      setError(null);

      const { customerInfo: newCustomerInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(newCustomerInfo);

      // Check if purchase granted the entitlement
      const isNowPro = newCustomerInfo.entitlements.active[NOOR_PRO_ENTITLEMENT]?.isActive ?? false;

      return {
        success: isNowPro,
        customerInfo: newCustomerInfo,
      };
    } catch (err) {
      const purchaseError = err as PurchasesError;

      // Handle user cancellation separately
      if (purchaseError.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return {
          success: false,
          cancelled: true,
        };
      }

      // Handle other errors
      const errorMessage = getErrorMessage(purchaseError);
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Purchase by product identifier
  const purchaseProduct = useCallback(async (productId: ProductId): Promise<PurchaseResult> => {
    if (!offerings) {
      return {
        success: false,
        error: 'No offerings available. Please try again later.',
      };
    }

    // Find the package with the matching product
    const pkg = offerings.availablePackages.find(
      (p) => p.product.identifier === productId
    );

    if (!pkg) {
      return {
        success: false,
        error: `Product ${productId} not found in current offering.`,
      };
    }

    return purchasePackage(pkg);
  }, [offerings, purchasePackage]);

  // Restore purchases
  const restorePurchases = useCallback(async (): Promise<PurchaseResult> => {
    // Mock restore in Expo Go
    if (isExpoGo) {
      return {
        success: false,
        error: 'Purchases are not available in Expo Go. Please build a standalone app to test purchases.',
      };
    }

    try {
      setIsLoading(true);
      setError(null);

      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);

      const isNowPro = info.entitlements.active[NOOR_PRO_ENTITLEMENT]?.isActive ?? false;

      return {
        success: isNowPro,
        customerInfo: info,
      };
    } catch (err) {
      const purchaseError = err as PurchasesError;
      const errorMessage = getErrorMessage(purchaseError);
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Identify user (for logged-in users)
  const identifyUser = useCallback(async (userId: string): Promise<boolean> => {
    // Skip in Expo Go
    if (isExpoGo) {
      return false;
    }

    try {
      const { customerInfo: info } = await Purchases.logIn(userId);
      setCustomerInfo(info);
      return true;
    } catch (_err) {
      return false;
    }
  }, []);

  // Log out user (revert to anonymous)
  const logOutUser = useCallback(async (): Promise<boolean> => {
    // Skip in Expo Go
    if (isExpoGo) {
      return false;
    }

    try {
      const info = await Purchases.logOut();
      setCustomerInfo(info);
      return true;
    } catch (_err) {
      return false;
    }
  }, []);

  // Get subscription management URL
  const getManagementURL = useCallback((): string | null => {
    return customerInfo?.managementURL ?? null;
  }, [customerInfo]);

  // Check if a specific entitlement is active
  const hasEntitlement = useCallback((entitlementId: string): boolean => {
    return customerInfo?.entitlements.active[entitlementId]?.isActive ?? false;
  }, [customerInfo]);

  // Get expiration date for Noor Pro
  const getExpirationDate = useCallback((): Date | null => {
    const entitlement = customerInfo?.entitlements.active[NOOR_PRO_ENTITLEMENT];
    if (!entitlement?.expirationDate) return null;
    return new Date(entitlement.expirationDate);
  }, [customerInfo]);

  // Check if subscription will renew
  const willRenew = useCallback((): boolean => {
    const entitlement = customerInfo?.entitlements.active[NOOR_PRO_ENTITLEMENT];
    return entitlement?.willRenew ?? false;
  }, [customerInfo]);

  // Get available packages for display
  const getPackages = useCallback((): PurchasesPackage[] => {
    return offerings?.availablePackages ?? [];
  }, [offerings]);

  // Get monthly package
  const getMonthlyPackage = useCallback((): PurchasesPackage | null => {
    return offerings?.monthly ?? null;
  }, [offerings]);

  // Get yearly/annual package
  const getYearlyPackage = useCallback((): PurchasesPackage | null => {
    return offerings?.annual ?? null;
  }, [offerings]);

  return {
    // State
    customerInfo,
    offerings,
    isLoading,
    error,
    isInitialized,
    isProUser,
    currentSubscription,

    // Actions
    fetchCustomerInfo,
    fetchOfferings,
    purchasePackage,
    purchaseProduct,
    restorePurchases,
    identifyUser,
    logOutUser,

    // Utilities
    getManagementURL,
    hasEntitlement,
    getExpirationDate,
    willRenew,
    getPackages,
    getMonthlyPackage,
    getYearlyPackage,
  };
});

// Helper function to get user-friendly error messages
function getErrorMessage(error: PurchasesError): string {
  switch (error.code) {
    case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
      return 'Purchase was cancelled.';
    case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
      return 'Purchases are not allowed on this device.';
    case PURCHASES_ERROR_CODE.PURCHASE_INVALID_ERROR:
      return 'The purchase was invalid. Please try again.';
    case PURCHASES_ERROR_CODE.PRODUCT_NOT_AVAILABLE_FOR_PURCHASE_ERROR:
      return 'This product is not available for purchase.';
    case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
      return 'You already own this product.';
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
      return 'Network error. Please check your connection and try again.';
    case PURCHASES_ERROR_CODE.RECEIPT_ALREADY_IN_USE_ERROR:
      return 'This purchase is already associated with another account.';
    case PURCHASES_ERROR_CODE.INVALID_CREDENTIALS_ERROR:
      return 'Invalid credentials. Please sign in again.';
    case PURCHASES_ERROR_CODE.UNEXPECTED_BACKEND_RESPONSE_ERROR:
      return 'Unexpected server response. Please try again later.';
    case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
      return 'There was a problem with the app store. Please try again later.';
    case PURCHASES_ERROR_CODE.CONFIGURATION_ERROR:
      return 'Configuration error. Please contact support.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
}
