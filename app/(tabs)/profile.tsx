import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import {
  User,
  Clock,
  Circle,
  Heart,
  Book,
  Moon,
  Bell,
  ChevronRight,
  Settings,
  RotateCcw,
  Flame,
  Sparkles,
  Crown,
  Shield,
  FileText,
  Trash2,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors, { shadows } from '@/constants/colors';
import { useTheme } from '@/providers/ThemeProvider';
import { useOnboarding } from '@/providers/OnboardingProvider';
import { useApp } from '@/providers/AppProvider';
import { SubscriptionStatus } from '@/components/subscription';

const formatMemberSince = (dateString: string | null): string => {
  if (!dateString) return 'Member';
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `Member since ${month} ${year}`;
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark, toggleDarkMode } = useTheme();
  const { userProfile, resetOnboarding, onboardingData } = useOnboarding();
  const { prayers, tasbihSessions, duaEntries, quranBookmarks, getPrayerStreak, getTodayTasbihCount, getTotalDhikrCount, deleteAllData } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will reset your onboarding progress and show you the welcome flow again. Your data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetOnboarding();
            router.replace('/(onboarding)/splash');
          },
        },
      ]
    );
  };

  const handleDeleteData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data including prayers, duas, journal entries, Quran bookmarks, and reading history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Second confirmation for extra safety
            Alert.alert(
              'Are you sure?',
              'All your spiritual journey data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteAllData();
                      await resetOnboarding();
                      router.replace('/(onboarding)/splash');
                    } catch (_error) {
                      Alert.alert('Error', 'Failed to delete data. Please try again.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const completedPrayers = prayers.filter(p => p.status === 'on_time' || p.status === 'late').length;
  const totalDhikr = getTotalDhikrCount();
  const todayDhikr = getTodayTasbihCount();
  const activeDuas = duaEntries.filter(d => !d.isAnswered).length;
  const answeredDuas = duaEntries.filter(d => d.isAnswered).length;
  const streak = getPrayerStreak();

  const firstName = userProfile.name ? userProfile.name.split(' ')[0] : 'Muslim';

  const stats = [
    { icon: Clock, label: "Today's Prayers", value: `${completedPrayers}/5`, color: colors.primary },
    { icon: Circle, label: 'Dhikr Today', value: todayDhikr.toString(), color: colors.gold },
    { icon: Heart, label: 'Active Duas', value: activeDuas.toString(), color: '#DC2626' },
    { icon: Book, label: 'Bookmarks', value: quranBookmarks.length.toString(), color: colors.primary },
  ];

  const lifetimeStats = [
    { label: 'Total Dhikr', value: totalDhikr.toLocaleString() },
    { label: 'Duas Made', value: duaEntries.length.toString() },
    { label: 'Duas Answered', value: answeredDuas.toString() },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={[styles.userName, { color: colors.text }]}>
              {userProfile.name || 'Welcome'}
            </Text>
            <Text style={[styles.userSubtitle, { color: colors.textMuted }]}>
              {userProfile.commitmentLevel ? `${userProfile.commitmentLevel.charAt(0).toUpperCase() + userProfile.commitmentLevel.slice(1)} • ` : ''}
              {formatMemberSince(onboardingData.completedAt)}
            </Text>

            {/* Streak Badge */}
            <View style={[styles.streakCard, { backgroundColor: colors.gold + '15' }]}>
              <Flame size={20} color={colors.gold} />
              <View style={styles.streakInfo}>
                <Text style={[styles.streakValue, { color: colors.gold }]}>{streak}</Text>
                <Text style={[styles.streakLabel, { color: colors.gold }]}>Prayers Today</Text>
              </View>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <View key={index} style={[styles.statCard, shadows.sm, { backgroundColor: colors.surface }]}>
                  <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                    <Icon size={18} color={stat.color} />
                  </View>
                  <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>{stat.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Lifetime Stats */}
          <View style={[styles.lifetimeCard, shadows.sm, { backgroundColor: colors.surface }]}>
            <View style={styles.lifetimeHeader}>
              <Sparkles size={18} color={colors.gold} />
              <Text style={[styles.lifetimeTitle, { color: colors.text }]}>Lifetime Journey</Text>
            </View>
            <View style={styles.lifetimeStats}>
              {lifetimeStats.map((stat, index) => (
                <View key={index} style={styles.lifetimeStat}>
                  <Text style={[styles.lifetimeValue, { color: colors.text }]}>{stat.value}</Text>
                  <Text style={[styles.lifetimeLabel, { color: colors.textMuted }]}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Subscription Section */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Subscription</Text>
          <View style={[shadows.sm, { marginBottom: 24 }]}>
            <SubscriptionStatus />
          </View>

          {/* Settings Section */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

          <View style={[styles.settingsCard, shadows.sm, { backgroundColor: colors.surface }]}>
            {/* Dark Mode */}
            <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
                  <Moon size={18} color={colors.text} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={() => {
                  Haptics.selectionAsync();
                  toggleDarkMode();
                }}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Notifications */}
            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => router.push('/modal')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
                  <Bell size={18} color={colors.text} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Notifications</Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Settings */}
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomWidth: 0 }]}
              onPress={() => router.push('/modal')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
                  <Settings size={18} color={colors.text} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>App Settings</Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Legal Section */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Legal</Text>
          <View style={[styles.settingsCard, shadows.sm, { backgroundColor: colors.surface, marginBottom: 20 }]}>
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => Linking.openURL('https://gist.github.com/orangutanger1/0382017a03afac686550bf2e3aeffe72#file-privacypolicy-md')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
                  <Shield size={18} color={colors.text} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Privacy Policy</Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingItem, { borderBottomWidth: 0 }]}
              onPress={() => Linking.openURL('https://gist.github.com/orangutanger1/0382017a03afac686550bf2e3aeffe72#file-termsofservice-md')}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: isDark ? colors.surfaceElevated : '#F0EDE8' }]}>
                  <FileText size={18} color={colors.text} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Terms of Use</Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Account Actions */}
          <TouchableOpacity
            style={[styles.resetButton, { backgroundColor: colors.surface }]}
            onPress={handleResetOnboarding}
          >
            <RotateCcw size={18} color={colors.primary} />
            <Text style={[styles.resetText, { color: colors.primary }]}>View Onboarding Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.surface }]}
            onPress={handleDeleteData}
          >
            <Trash2 size={18} color="#DC2626" />
            <Text style={styles.deleteText}>Delete All Data</Text>
          </TouchableOpacity>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Text style={[styles.appName, { color: colors.textMuted }]}>Noor</Text>
            <Text style={[styles.appVersion, { color: colors.textMuted }]}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  avatarText: { fontSize: 32, fontWeight: '600', color: '#FFFFFF' },
  userName: { fontSize: 24, fontWeight: '600', marginBottom: 4 },
  userSubtitle: { fontSize: 14, marginBottom: 16 },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 12,
  },
  streakInfo: { alignItems: 'center' },
  streakValue: { fontSize: 24, fontWeight: '700' },
  streakLabel: { fontSize: 11, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 24, fontWeight: '600', marginBottom: 4 },
  statLabel: { fontSize: 12, textAlign: 'center' },
  lifetimeCard: { borderRadius: 16, padding: 20, marginBottom: 24 },
  lifetimeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  lifetimeTitle: { fontSize: 16, fontWeight: '600' },
  lifetimeStats: { flexDirection: 'row', justifyContent: 'space-around' },
  lifetimeStat: { alignItems: 'center' },
  lifetimeValue: { fontSize: 28, fontWeight: '300', marginBottom: 4 },
  lifetimeLabel: { fontSize: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  settingsCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  settingIcon: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 16 },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 12,
  },
  resetText: { fontSize: 15, fontWeight: '600' },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
    marginBottom: 24,
  },
  deleteText: { fontSize: 15, fontWeight: '600', color: '#DC2626' },
  appInfo: { alignItems: 'center', paddingVertical: 20 },
  appName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  appVersion: { fontSize: 13 },
});
