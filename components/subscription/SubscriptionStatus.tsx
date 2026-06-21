import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Crown, Settings, RefreshCw } from 'lucide-react-native';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaywall } from '@/hooks/usePaywall';
import { useTheme } from '@/providers/ThemeProvider';
import { SubscriptionManageModal } from './SubscriptionManageModal';

interface SubscriptionStatusProps {
  showManageButton?: boolean;
  showUpgradeButton?: boolean;
  compact?: boolean;
}

/**
 * Component to display current subscription status.
 * Shows different UI based on whether user is pro or not.
 */
export function SubscriptionStatus({
  showManageButton = true,
  showUpgradeButton = true,
  compact = false,
}: SubscriptionStatusProps) {
  const { colors } = useTheme();
  const {
    isProUser,
    subscriptionInfo,
    getTimeRemaining,
    restorePurchases,
    isLoading,
  } = useSubscription();
  const { presentPaywall, isPresenting: isPaywallPresenting } = usePaywall();
  const [isManageModalVisible, setIsManageModalVisible] = useState(false);

  const handleManageSubscription = useCallback(() => {
    setIsManageModalVisible(true);
  }, []);

  const handleUpgrade = useCallback(async () => {
    await presentPaywall();
  }, [presentPaywall]);

  const handleRestore = useCallback(async () => {
    await restorePurchases();
  }, [restorePurchases]);

  const timeRemaining = getTimeRemaining();

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: colors.cream }]}>
        <View style={styles.compactContent}>
          <Crown
            size={20}
            color={isProUser ? colors.gold : colors.text + '60'}
          />
          <Text
            style={[
              styles.compactText,
              { color: isProUser ? colors.gold : colors.text + '99' },
            ]}
          >
            {isProUser ? 'Noor Pro' : 'Free'}
          </Text>
        </View>
        {!isProUser && showUpgradeButton && (
          <TouchableOpacity
            onPress={handleUpgrade}
            disabled={isPaywallPresenting}
            style={[styles.compactUpgradeButton, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.compactUpgradeText, { color: colors.ivory }]}>
              Upgrade
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      {/* Status Header */}
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isProUser ? colors.gold + '20' : colors.text + '10' },
          ]}
        >
          <Crown
            size={28}
            color={isProUser ? colors.gold : colors.text + '60'}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            {isProUser ? 'Noor Pro' : 'Free Plan'}
          </Text>
          {isProUser && subscriptionInfo.plan && (
            <Text style={[styles.planText, { color: colors.text + '99' }]}>
              {getPlanDisplayName(subscriptionInfo.plan)}
              {subscriptionInfo.price && ` - ${subscriptionInfo.price}`}
            </Text>
          )}
          {isProUser && timeRemaining && (
            <Text style={[styles.timeText, { color: colors.text + '80' }]}>
              {timeRemaining}
              {subscriptionInfo.willRenew ? ' (auto-renews)' : ' (cancels)'}
            </Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {isProUser && showManageButton && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.primary }]}
              onPress={handleManageSubscription}
            >
              <Settings size={18} color={colors.primary} />
              <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                Manage
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.text + '40' }]}
              onPress={handleRestore}
              disabled={isLoading}
            >
              <RefreshCw size={18} color={colors.text + '80'} />
              <Text style={[styles.actionButtonText, { color: colors.text + '80' }]}>
                Restore
              </Text>
            </TouchableOpacity>
          </>
        )}

        {!isProUser && (
          <>
            {showUpgradeButton && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                onPress={handleUpgrade}
                disabled={isPaywallPresenting || isLoading}
              >
                <Crown size={18} color={colors.ivory} />
                <Text style={[styles.primaryButtonText, { color: colors.ivory }]}>
                  {isPaywallPresenting ? 'Loading...' : 'Upgrade to Pro'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.text + '40' }]}
              onPress={handleRestore}
              disabled={isLoading}
            >
              <RefreshCw size={18} color={colors.text + '80'} />
              <Text style={[styles.actionButtonText, { color: colors.text + '80' }]}>
                Restore
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Pro Benefits */}
      {!isProUser && (
        <View style={[styles.benefitsContainer, { borderTopColor: colors.text + '10' }]}>
          <Text style={[styles.benefitsTitle, { color: colors.text + '99' }]}>
            Pro benefits include:
          </Text>
          <View style={styles.benefitsList}>
            {PRO_BENEFITS.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Text style={[styles.benefitBullet, { color: colors.gold }]}>
                  ✦
                </Text>
                <Text style={[styles.benefitText, { color: colors.text + '99' }]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Subscription Management Modal */}
      <SubscriptionManageModal
        visible={isManageModalVisible}
        onClose={() => setIsManageModalVisible(false)}
      />
    </View>
  );
}

const PRO_BENEFITS = [
  'Unlimited prayer tracking history',
  'Advanced Quran features',
  'Custom dua collections',
  'Personalized insights',
  'Priority support',
];

function getPlanDisplayName(plan: string): string {
  switch (plan) {
    case 'monthly':
      return 'Monthly';
    case 'yearly':
      return 'Yearly';
    default:
      return plan;
  }
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  planText: {
    fontSize: 14,
    marginBottom: 2,
  },
  timeText: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  benefitsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  benefitsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  benefitsList: {
    gap: 6,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitBullet: {
    fontSize: 12,
  },
  benefitText: {
    fontSize: 13,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactText: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactUpgradeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  compactUpgradeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
