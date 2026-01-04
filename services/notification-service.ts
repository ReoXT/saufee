import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_IDS_KEY = '@saufee_notification_ids';
const DAILY_DIGEST_ID_KEY = '@saufee_daily_digest_id';
const COMPLETION_REMINDER_ID_KEY = '@saufee_completion_reminder_id';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions from the user
 * Handles iOS vs Android differences
 */
export async function requestPermissions(): Promise<boolean> {
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

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('saufee-reminders', {
        name: 'Activity Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B35',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule a notification for a specific activity
 * @param activityId - Unique ID for the activity
 * @param activityName - Name of the activity to display
 * @param dayOfWeek - Day of week (0 = Sunday, 1 = Monday, etc.)
 * @param scheduledTime - Time in HH:MM format (e.g., "09:00")
 * @param advanceMinutes - How many minutes before to send notification
 * @returns Notification ID string
 */
export async function scheduleActivityNotification(
  activityId: string,
  activityName: string,
  dayOfWeek: number,
  scheduledTime: string,
  advanceMinutes: number = 15
): Promise<string | null> {
  try {
    // Parse scheduled time
    const [hours, minutes] = scheduledTime.split(':').map(Number);

    // Calculate notification time
    let notificationHour = hours;
    let notificationMinute = minutes - advanceMinutes;

    if (notificationMinute < 0) {
      notificationMinute += 60;
      notificationHour -= 1;
    }

    if (notificationHour < 0) {
      notificationHour += 24;
    }

    // Schedule weekly repeating notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `🔔 ${activityName} Coming Up`,
        body: `Starting in ${advanceMinutes} minutes at ${scheduledTime}`,
        sound: 'default',
        data: { activityId, type: 'activity_reminder' },
        badge: 1,
      },
      trigger: {
        channelId: Platform.OS === 'android' ? 'saufee-reminders' : undefined,
        weekday: dayOfWeek === 0 ? 7 : dayOfWeek, // expo-notifications uses 1-7 (Monday-Sunday)
        hour: notificationHour,
        minute: notificationMinute,
        repeats: true,
      },
    });

    // Store notification ID mapping
    await storeNotificationId(activityId, notificationId);

    return notificationId;
  } catch (error) {
    console.error('Error scheduling activity notification:', error);
    return null;
  }
}

/**
 * Cancel a specific activity notification
 * @param notificationId - The notification ID to cancel
 */
export async function cancelActivityNotification(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem(NOTIFICATION_IDS_KEY);
    await AsyncStorage.removeItem(DAILY_DIGEST_ID_KEY);
    await AsyncStorage.removeItem(COMPLETION_REMINDER_ID_KEY);
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Schedule daily digest notification
 * @param time - Time in HH:MM format (e.g., "08:00")
 * @returns Notification ID string
 */
export async function scheduleDailyDigest(time: string): Promise<string | null> {
  try {
    // Cancel existing daily digest if any
    const existingId = await AsyncStorage.getItem(DAILY_DIGEST_ID_KEY);
    if (existingId) {
      await cancelActivityNotification(existingId);
    }

    const [hours, minutes] = time.split(':').map(Number);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Good Morning! 🌅',
        body: "Here's your schedule for today",
        sound: 'default',
        data: { type: 'daily_digest' },
        badge: 1,
      },
      trigger: {
        channelId: Platform.OS === 'android' ? 'saufee-reminders' : undefined,
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });

    await AsyncStorage.setItem(DAILY_DIGEST_ID_KEY, notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling daily digest:', error);
    return null;
  }
}

/**
 * Cancel daily digest notification
 */
export async function cancelDailyDigest(): Promise<void> {
  try {
    const existingId = await AsyncStorage.getItem(DAILY_DIGEST_ID_KEY);
    if (existingId) {
      await cancelActivityNotification(existingId);
      await AsyncStorage.removeItem(DAILY_DIGEST_ID_KEY);
    }
  } catch (error) {
    console.error('Error canceling daily digest:', error);
  }
}

/**
 * Schedule end-of-day completion reminder
 * @param time - Time in HH:MM format (e.g., "21:00")
 * @returns Notification ID string
 */
export async function scheduleCompletionReminder(time: string): Promise<string | null> {
  try {
    // Cancel existing completion reminder if any
    const existingId = await AsyncStorage.getItem(COMPLETION_REMINDER_ID_KEY);
    if (existingId) {
      await cancelActivityNotification(existingId);
    }

    const [hours, minutes] = time.split(':').map(Number);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Day Review Time 🌙',
        body: 'Review and complete your daily activities',
        sound: 'default',
        data: { type: 'completion_reminder' },
        badge: 1,
      },
      trigger: {
        channelId: Platform.OS === 'android' ? 'saufee-reminders' : undefined,
        hour: hours,
        minute: minutes,
        repeats: true,
      },
    });

    await AsyncStorage.setItem(COMPLETION_REMINDER_ID_KEY, notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling completion reminder:', error);
    return null;
  }
}

/**
 * Cancel completion reminder notification
 */
export async function cancelCompletionReminder(): Promise<void> {
  try {
    const existingId = await AsyncStorage.getItem(COMPLETION_REMINDER_ID_KEY);
    if (existingId) {
      await cancelActivityNotification(existingId);
      await AsyncStorage.removeItem(COMPLETION_REMINDER_ID_KEY);
    }
  } catch (error) {
    console.error('Error canceling completion reminder:', error);
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Store notification ID mapping for an activity
 */
async function storeNotificationId(activityId: string, notificationId: string): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    const mappings = existing ? JSON.parse(existing) : {};
    mappings[activityId] = notificationId;
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error('Error storing notification ID:', error);
  }
}

/**
 * Get notification ID for an activity
 */
export async function getNotificationId(activityId: string): Promise<string | null> {
  try {
    const existing = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    if (!existing) return null;
    const mappings = JSON.parse(existing);
    return mappings[activityId] || null;
  } catch (error) {
    console.error('Error getting notification ID:', error);
    return null;
  }
}

/**
 * Remove notification ID mapping for an activity
 */
export async function removeNotificationId(activityId: string): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem(NOTIFICATION_IDS_KEY);
    if (!existing) return;
    const mappings = JSON.parse(existing);
    delete mappings[activityId];
    await AsyncStorage.setItem(NOTIFICATION_IDS_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error('Error removing notification ID:', error);
  }
}
