import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Crown, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePaywall } from '@/hooks/usePaywall';
import { useTheme } from '@/providers/ThemeProvider';

interface ProFeatureGateProps {
  children: React.ReactNode;
  featureName?: string;
  showUpgradePrompt?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Component to gate pro features.
 * Shows children if user is pro, otherwise shows upgrade prompt or fallback.
 */
export function ProFeatureGate({
  children,
  featureName = 'this feature',
  showUpgradePrompt = true,
  fallback,
}: ProFeatureGateProps) {
  const { isProUser, presentPaywall, isPresenting } = usePaywall();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleUpgrade = useCallback(async () => {
    const result = await presentPaywall();

    if (result.error) {
      Alert.alert('Error', result.error);
    }
  }, [presentPaywall]);

  if (isProUser) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      <TouchableOpacity
        style={[styles.closeButton, { top: insets.top + 12 }]}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <X size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={[styles.iconContainer, { backgroundColor: colors.gold + '20' }]}>
        <Crown size={32} color={colors.gold} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        Noor Pro Feature
      </Text>
      <Text style={[styles.description, { color: colors.text + '99' }]}>
        Upgrade to Noor Pro to access {featureName}.
      </Text>
      <TouchableOpacity
        style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
        onPress={handleUpgrade}
        disabled={isPresenting}
      >
        <Crown size={18} color={colors.ivory} />
        <Text style={[styles.upgradeButtonText, { color: colors.ivory }]}>
          {isPresenting ? 'Loading...' : 'Upgrade to Pro'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * HOC to wrap any component with pro feature gating.
 */
export function withProFeatureGate<P extends object>(
  Component: React.ComponentType<P>,
  featureName?: string
) {
  return function WrappedComponent(props: P) {
    return (
      <ProFeatureGate featureName={featureName}>
        <Component {...props} />
      </ProFeatureGate>
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
