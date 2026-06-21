import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Crown,
  X,
  Calendar,
  RefreshCw,
  ExternalLink,
  Check,
  Sparkles,
  XCircle,
} from 'lucide-react-native';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaywall } from '@/hooks/usePaywall';
import { useTheme } from '@/providers/ThemeProvider';

interface SubscriptionManageModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SubscriptionManageModal({
  visible,
  onClose,
}: SubscriptionManageModalProps) {
  const { colors } = useTheme();
  const {
    subscriptionInfo,
    availablePackages,
    getTimeRemaining,
    openSubscriptionManagement,
    refresh,
    isLoading,
  } = useSubscription();
  const { presentPaywallForPlanChange, isPresenting: isPaywallPresenting } = usePaywall();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const timeRemaining = getTimeRemaining();

  const handleChangePlan = useCallback(async () => {
    const result = await presentPaywallForPlanChange();
    if (result.purchased || result.restored) {
      // Add a small delay to allow the backend to process the change
      await new Promise(resolve => setTimeout(resolve, 500));
      // Refresh to get the updated subscription info
      await refresh();

      Alert.alert(
        'Plan Updated',
        result.purchased
          ? 'Your subscription plan has been changed successfully!'
          : 'Your purchases have been restored successfully!',
        [{ text: 'OK', onPress: onClose }]
      );
    }
  }, [presentPaywallForPlanChange, refresh, onClose]);

  const handleManageInStore = useCallback(async () => {
    await openSubscriptionManagement();
  }, [openSubscriptionManagement]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  const formatExpirationDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPlanDisplayName = (plan: string | null): string => {
    switch (plan) {
      case 'monthly':
        return 'Noor Pro Monthly';
      case 'yearly':
        return 'Noor Pro Annual';
      default:
        return 'Noor Pro';
    }
  };

  const getOtherPlanInfo = () => {
    const currentPlan = subscriptionInfo.plan;
    if (currentPlan === 'monthly') {
      const yearlyPkg = availablePackages.find(pkg =>
        pkg.identifier.toLowerCase().includes('yearly') ||
        pkg.identifier.toLowerCase().includes('annual')
      );
      if (yearlyPkg) {
        return {
          name: 'Annual',
          price: yearlyPkg.price,
          savings: yearlyPkg.pricePerMonth ? `Save with ${yearlyPkg.pricePerMonth}` : 'Save ~17%',
        };
      }
    } else if (currentPlan === 'yearly') {
      const monthlyPkg = availablePackages.find(pkg =>
        pkg.identifier.toLowerCase().includes('monthly')
      );
      if (monthlyPkg) {
        return {
          name: 'Monthly',
          price: monthlyPkg.price,
          savings: 'More flexibility',
        };
      }
    }
    return null;
  };

  const otherPlanInfo = getOtherPlanInfo();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.ivory }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.text + '10' }]}>
          <View style={styles.headerLeft}>
            <Crown size={24} color={colors.gold} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Your Subscription
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.text + '10' }]}
            onPress={onClose}
          >
            <X size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Plan Card */}
          <View style={[styles.planCard, { backgroundColor: colors.cream }]}>
            <View style={styles.planCardHeader}>
              <View style={[styles.activeBadge, { backgroundColor: colors.gold + '20' }]}>
                <Sparkles size={14} color={colors.gold} />
                <Text style={[styles.activeBadgeText, { color: colors.gold }]}>
                  Active
                </Text>
              </View>
              {(isLoading || isRefreshing) && (
                <ActivityIndicator size="small" color={colors.primary} />
              )}
            </View>

            <Text style={[styles.planName, { color: colors.text }]}>
              {getPlanDisplayName(subscriptionInfo.plan)}
            </Text>

            {subscriptionInfo.price && (
              <Text style={[styles.planPrice, { color: colors.primary }]}>
                {subscriptionInfo.price}
                <Text style={[styles.planPeriod, { color: colors.text + '60' }]}>
                  {subscriptionInfo.plan === 'monthly' ? '/month' : '/year'}
                </Text>
              </Text>
            )}

            <View style={styles.planDetails}>
              <View style={styles.planDetailRow}>
                <Calendar size={16} color={colors.text + '80'} />
                <Text style={[styles.planDetailLabel, { color: colors.text + '80' }]}>
                  {subscriptionInfo.willRenew ? 'Renews' : 'Expires'}
                </Text>
                <Text style={[styles.planDetailValue, { color: colors.text }]}>
                  {formatExpirationDate(subscriptionInfo.expirationDate)}
                </Text>
              </View>

              {timeRemaining && (
                <View style={styles.planDetailRow}>
                  <RefreshCw size={16} color={colors.text + '80'} />
                  <Text style={[styles.planDetailLabel, { color: colors.text + '80' }]}>
                    Status
                  </Text>
                  <Text style={[styles.planDetailValue, { color: colors.text }]}>
                    {timeRemaining}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Switch Plan Option */}
          {otherPlanInfo && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Switch Plan
              </Text>
              <TouchableOpacity
                style={[styles.switchPlanCard, { backgroundColor: colors.cream, borderColor: colors.gold + '40' }]}
                onPress={handleChangePlan}
                disabled={isPaywallPresenting}
              >
                <View style={styles.switchPlanContent}>
                  <Text style={[styles.switchPlanName, { color: colors.text }]}>
                    {otherPlanInfo.name}
                  </Text>
                  <Text style={[styles.switchPlanPrice, { color: colors.primary }]}>
                    {otherPlanInfo.price}
                  </Text>
                  <Text style={[styles.switchPlanSavings, { color: colors.gold }]}>
                    {otherPlanInfo.savings}
                  </Text>
                </View>
                <View style={[styles.switchButton, { backgroundColor: colors.gold }]}>
                  {isPaywallPresenting ? (
                    <ActivityIndicator size="small" color={colors.ivory} />
                  ) : (
                    <Text style={[styles.switchButtonText, { color: colors.ivory }]}>
                      Switch
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Pro Benefits */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Your Benefits
            </Text>
            <View style={[styles.benefitsCard, { backgroundColor: colors.cream }]}>
              {PRO_BENEFITS.map((benefit, index) => (
                <View key={index} style={styles.benefitRow}>
                  <View style={[styles.benefitIcon, { backgroundColor: '#22C55E20' }]}>
                    <Check size={14} color="#22C55E" />
                  </View>
                  <Text style={[styles.benefitText, { color: colors.text }]}>
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Actions
            </Text>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: colors.cream }]}
                onPress={handleRefresh}
                disabled={isRefreshing}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <RefreshCw
                    size={20}
                    color={colors.primary}
                    style={isRefreshing ? { opacity: 0.5 } : undefined}
                  />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={[styles.quickActionText, { color: colors.text }]}>
                    {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
                  </Text>
                  <Text style={[styles.quickActionSubtext, { color: colors.text + '60' }]}>
                    Sync your subscription
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: colors.cream }]}
                onPress={handleManageInStore}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: colors.gold + '15' }]}>
                  <ExternalLink size={20} color={colors.gold} />
                </View>
                <View style={styles.quickActionContent}>
                  <Text style={[styles.quickActionText, { color: colors.text }]}>
                    Manage in App Store
                  </Text>
                  <Text style={[styles.quickActionSubtext, { color: colors.text + '60' }]}>
                    Billing & payment method
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Cancel Subscription */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}
              onPress={handleManageInStore}
            >
              <XCircle size={20} color="#DC2626" />
              <View style={styles.cancelButtonContent}>
                <Text style={[styles.cancelButtonText, { color: '#DC2626' }]}>
                  Cancel Subscription
                </Text>
                <Text style={[styles.cancelButtonSubtext, { color: '#DC2626' + '99' }]}>
                  Opens App Store to manage cancellation
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer Note */}
          <Text style={[styles.footerNote, { color: colors.text + '50' }]}>
            Cancellations take effect at the end of your current billing period. You'll continue to have access to Pro features until {formatExpirationDate(subscriptionInfo.expirationDate)}.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const PRO_BENEFITS = [
  'Unlimited prayer tracking history',
  'Advanced Quran features',
  'Custom dua collections',
  'Personalized insights',
  'Priority support',
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  planCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: '400',
  },
  planDetails: {
    gap: 12,
  },
  planDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planDetailLabel: {
    fontSize: 14,
    flex: 1,
  },
  planDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  switchPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
  },
  switchPlanContent: {
    flex: 1,
  },
  switchPlanName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  switchPlanPrice: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  switchPlanSavings: {
    fontSize: 12,
    fontWeight: '500',
  },
  switchButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  benefitsCard: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
  quickActions: {
    gap: 12,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 14,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  quickActionSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
  },
  cancelButtonContent: {
    flex: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButtonSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  footerNote: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
