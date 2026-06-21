import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PrayerNotificationSettings {
  enabled: boolean;
  prayers: string[];
  reminderMinutes: number;
}

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }
    
    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('prayer-times', {
        name: 'Prayer Times',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C8A876',
        sound: 'default',
      });
    }
    
    return true;
  } catch (_error) {
    return false;
  }
}

/**
 * Parse time string (HH:MM) and subtract reminder minutes
 */
function getNotificationTime(timeString: string, reminderMinutes: number): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const notificationDate = new Date();
  notificationDate.setHours(hours);
  notificationDate.setMinutes(minutes - reminderMinutes);
  notificationDate.setSeconds(0);
  notificationDate.setMilliseconds(0);
  
  // If the time has passed today, schedule for tomorrow
  if (notificationDate.getTime() < Date.now()) {
    notificationDate.setDate(notificationDate.getDate() + 1);
  }
  
  return notificationDate;
}

/**
 * Get prayer display name in Arabic
 */
function getPrayerNameArabic(prayer: string): string {
  const names: { [key: string]: string } = {
    fajr: 'الفجر',
    dhuhr: 'الظهر',
    asr: 'العصر',
    maghrib: 'المغرب',
    isha: 'العشاء',
  };
  return names[prayer] || prayer;
}

/**
 * Schedule all prayer notifications for today
 */
export async function schedulePrayerNotifications(
  prayerTimes: PrayerTimes,
  settings: PrayerNotificationSettings
): Promise<void> {
  try {
    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    if (!settings.enabled) {
      return;
    }
    
    // Request permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('No notification permission, cannot schedule notifications');
      return;
    }
    
    const scheduledCount = [];
    
    // Schedule notifications for each enabled prayer
    for (const prayer of settings.prayers) {
      // Skip sunrise as it's not a prayer time
      if (prayer === 'sunrise' || !prayerTimes[prayer as keyof PrayerTimes]) {
        continue;
      }
      
      const prayerTime = prayerTimes[prayer as keyof PrayerTimes];
      const notificationTime = getNotificationTime(prayerTime, settings.reminderMinutes);
      
      // Only schedule if the time is in the future
      if (notificationTime.getTime() > Date.now()) {
        const prayerNameArabic = getPrayerNameArabic(prayer);
        const timingText = settings.reminderMinutes === 0 
          ? 'now' 
          : `in ${settings.reminderMinutes} minutes`;
        
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${prayer.charAt(0).toUpperCase() + prayer.slice(1)} Prayer Time`,
            body: `${prayerNameArabic} prayer is ${timingText}`,
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.HIGH,
            categoryIdentifier: 'prayer-reminder',
            data: { prayer, time: prayerTime },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: notificationTime,
            channelId: Platform.OS === 'android' ? 'prayer-times' : undefined,
          },
        });
        
        scheduledCount.push({ prayer, time: prayerTime, notificationId });
      }
    }
  } catch (_error) {
    // Failed to schedule notifications
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (_error) {
    // Failed to cancel notifications
  }
}

/**
 * Get all currently scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (_error) {
    return [];
  }
}

/**
 * Send a test notification immediately
 */
export async function sendTestNotification(): Promise<boolean> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('No notification permission');
      return false;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Prayer Notification',
        body: 'Your prayer notifications are working correctly! \u2705',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { test: true },
      },
      trigger: null, // Send immediately
    });

    return true;
  } catch (_error) {
    return false;
  }
}
