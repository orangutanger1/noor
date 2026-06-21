import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Globe, Moon, Info, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { sendTestNotification } from '@/services/notificationService';
import type { AlertButton } from 'react-native';

const CALCULATION_METHODS = [
  'ISNA',
  'Muslim World League',
  'Egyptian General Authority',
  'Umm al-Qura University',
  'University of Islamic Sciences, Karachi',
  'Union Organization islamic de France',
  'Majlis Ugama Islam Singapura',
];

const CALCULATION_METHOD_IDS: { [key: string]: string } = {
  'ISNA': 'isna',
  'Muslim World League': 'mwl',
  'Egyptian General Authority': 'egypt',
  'Umm al-Qura University': 'makkah',
  'University of Islamic Sciences, Karachi': 'karachi',
  'Union Organization islamic de France': 'uoif',
  'Majlis Ugama Islam Singapura': 'singapore',
};

const NOTIFICATION_OPTIONS = [
  'At prayer time',
  '5 minutes before',
  '10 minutes before',
  '15 minutes before',
  '30 minutes before',
];

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showToggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  colors: typeof import('@/constants/colors').default.light;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showToggle,
  toggleValue,
  onToggle,
  colors,
}) => (
  <TouchableOpacity
    style={[styles.settingItem, { borderBottomColor: colors.border }]}
    onPress={showToggle ? undefined : onPress}
    activeOpacity={showToggle ? 1 : 0.7}
  >
    <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>{icon}</View>
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>}
    </View>
    {showToggle ? (
      <Switch
        value={toggleValue}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary + '60' }}
        thumbColor={toggleValue ? colors.primary : colors.textMuted}
      />
    ) : (
      <ChevronRight size={20} color={colors.textMuted} />
    )}
  </TouchableOpacity>
);

export default function ModalScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleDarkMode } = useTheme();
  const { onboardingData, setCalculationMethod: saveCalculationMethod, setNotificationSettings } = useOnboarding();
  
  const getMethodName = (methodId: string) => {
    const entry = Object.entries(CALCULATION_METHOD_IDS).find(([_, id]) => id === methodId);
    return entry ? entry[0] : 'ISNA';
  };
  
  const getTimingLabel = (minutes: number) => {
    if (minutes === 0) return 'At prayer time';
    if (minutes === 5) return '5 minutes before';
    if (minutes === 10) return '10 minutes before';
    if (minutes === 15) return '15 minutes before';
    if (minutes === 30) return '30 minutes before';
    return 'At prayer time';
  };
  
  const [calculationMethod, setCalculationMethod] = useState(() => 
    getMethodName(onboardingData.calculationMethod || 'isna')
  );
  const [notificationTiming, setNotificationTiming] = useState(() => 
    getTimingLabel(onboardingData.notifications?.reminderMinutes ?? 0)
  );

  const showCalculationMethodPicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...CALCULATION_METHODS],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            const method = CALCULATION_METHODS[buttonIndex - 1];
            setCalculationMethod(method);
            const methodId = CALCULATION_METHOD_IDS[method];
            saveCalculationMethod(methodId);
          }
        }
      );
    } else {
      const buttons: AlertButton[] = CALCULATION_METHODS.map((method) => ({
        text: method,
        onPress: () => {
          setCalculationMethod(method);
          const methodId = CALCULATION_METHOD_IDS[method];
          saveCalculationMethod(methodId);
        },
      }));
      buttons.push({ text: 'Cancel', style: 'cancel' });
      Alert.alert('Select Calculation Method', '', buttons);
    }
  };

  const showNotificationPicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...NOTIFICATION_OPTIONS],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            const option = NOTIFICATION_OPTIONS[buttonIndex - 1];
            setNotificationTiming(option);
            updateNotificationSettings(option);
          }
        }
      );
    } else {
      const buttons: AlertButton[] = NOTIFICATION_OPTIONS.map((option) => ({
        text: option,
        onPress: () => {
          setNotificationTiming(option);
          updateNotificationSettings(option);
        },
      }));
      buttons.push({ text: 'Cancel', style: 'cancel' });
      Alert.alert('Select Notification Timing', '', buttons);
    }
  };

  const updateNotificationSettings = async (timing: string) => {
    let minutes = 0;
    if (timing.includes('5 minutes')) minutes = 5;
    else if (timing.includes('10 minutes')) minutes = 10;
    else if (timing.includes('15 minutes')) minutes = 15;
    else if (timing.includes('30 minutes')) minutes = 30;
    
    const newSettings = {
      enabled: true,
      prayers: onboardingData.notifications?.prayers || ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'],
      reminderMinutes: minutes,
    };
    
    // Update local state first for immediate UI feedback
    setNotificationTiming(timing);
    
    // Then save to persistent storage
    setNotificationSettings(newSettings);
  };

  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      Alert.alert(
        'Test Notification Sent',
        'You should see a notification shortly. If not, check your device notification settings.',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Notification Failed',
        'Unable to send test notification. Please check notification permissions in your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.cream }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Customize your Noor experience</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Prayer Settings</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.ivory }]}>
            <SettingItem
              icon={<Bell size={20} color={colors.primary} />}
              title="Notifications"
              subtitle={notificationTiming}
              onPress={showNotificationPicker}
              colors={colors}
            />
            <SettingItem
              icon={<Globe size={20} color={colors.primary} />}
              title="Calculation Method"
              subtitle={calculationMethod}
              onPress={showCalculationMethodPicker}
              colors={colors}
            />
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border, borderBottomWidth: 0 }]}
              onPress={handleTestNotification}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
                <Bell size={20} color={colors.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Test Notification</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textMuted }]}>Send a test notification now</Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Appearance</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.ivory }]}>
            <SettingItem
              icon={<Moon size={20} color={colors.primary} />}
              title="Dark Mode"
              subtitle={isDark ? 'Enabled' : 'Disabled'}
              showToggle
              toggleValue={isDark}
              onToggle={toggleDarkMode}
              colors={colors}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>About</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.ivory }]}>
            <SettingItem
              icon={<Info size={20} color={colors.primary} />}
              title="About Noor"
              subtitle="Version 1.0.0"
              colors={colors}
            />
          </View>
        </View>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>Noor - Illuminate Your Spiritual Path</Text>
          <Text style={[styles.footerArabic, { color: colors.gold }]}>نور - أنر طريقك الروحي</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 14,
    marginBottom: 4,
  },
  footerArabic: {
    fontSize: 16,
  },
});
