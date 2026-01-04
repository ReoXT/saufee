import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';
import AnimatedGradientButton from './AnimatedGradientButton';
import {
  PRIMARY_ORANGE,
  WHITE,
  BACKGROUND,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  BORDER_RADIUS,
  SPACING_MEDIUM,
  SPACING_LARGE,
} from '../constants/theme';
import {
  scheduleDailyDigest,
  scheduleCompletionReminder,
  cancelDailyDigest,
  cancelCompletionReminder,
  scheduleActivityNotification,
  cancelAllNotifications,
} from '../services/notification-service';

interface NotificationSettingsProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  activityId?: string;
  activityName?: string;
  dayOfWeek?: number;
  timeSlot?: string;
}

interface NotificationPreferences {
  enabled: boolean;
  advance_minutes: number;
  apply_to_all: boolean;
  daily_digest: boolean;
  daily_digest_time: string;
  completion_reminder: boolean;
  completion_time: string;
}

const ADVANCE_OPTIONS = [
  { label: '5 minutes', value: 5 },
  { label: '10 minutes', value: 10 },
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '60 minutes', value: 60 },
];

export default function NotificationSettings({
  visible,
  onClose,
  userId,
  activityId,
  activityName,
  dayOfWeek,
  timeSlot,
}: NotificationSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
    advance_minutes: 15,
    apply_to_all: false,
    daily_digest: false,
    daily_digest_time: '08:00',
    completion_reminder: false,
    completion_time: '21:00',
  });

  useEffect(() => {
    if (visible) {
      loadPreferences();
    }
  }, [visible, userId]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('users_metadata')
        .select('notifications_settings')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data?.notifications_settings) {
        setPreferences(data.notifications_settings as NotificationPreferences);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAdvanceMinutesChange = (value: number) => {
    Haptics.selectionAsync();
    setPreferences((prev) => ({ ...prev, advance_minutes: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Update preferences in database
      const { error: updateError } = await supabase
        .from('users_metadata')
        .update({ notifications_settings: preferences })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Handle daily digest
      if (preferences.daily_digest) {
        await scheduleDailyDigest(preferences.daily_digest_time);
      } else {
        await cancelDailyDigest();
      }

      // Handle completion reminder
      if (preferences.completion_reminder) {
        await scheduleCompletionReminder(preferences.completion_time);
      } else {
        await cancelCompletionReminder();
      }

      // Handle apply to all activities
      if (preferences.enabled && preferences.apply_to_all) {
        // Fetch all user's schedules
        const { data: schedules, error: schedulesError } = await supabase
          .from('schedules')
          .select('id, activity, day_of_week, time_slot, routine_id')
          .eq('routine_id', await getUserRoutineIds(userId));

        if (schedulesError) throw schedulesError;

        if (schedules) {
          // Schedule notifications for all activities
          for (const schedule of schedules) {
            const notificationId = await scheduleActivityNotification(
              schedule.id,
              schedule.activity,
              schedule.day_of_week,
              schedule.time_slot,
              preferences.advance_minutes
            );

            if (notificationId) {
              // Update schedule with notification ID
              await supabase
                .from('schedules')
                .update({ notification_id: notificationId })
                .eq('id', schedule.id);
            }
          }
        }
      } else if (!preferences.enabled) {
        // Cancel all activity notifications
        await cancelAllNotifications();

        // Clear notification IDs from database
        await supabase
          .from('schedules')
          .update({ notification_id: null })
          .eq('routine_id', await getUserRoutineIds(userId));
      }

      // Handle single activity notification (if activityId provided)
      if (activityId && activityName && dayOfWeek !== undefined && timeSlot) {
        if (preferences.enabled) {
          const notificationId = await scheduleActivityNotification(
            activityId,
            activityName,
            dayOfWeek,
            timeSlot,
            preferences.advance_minutes
          );

          if (notificationId) {
            await supabase
              .from('schedules')
              .update({ notification_id: notificationId })
              .eq('id', activityId);
          }
        } else {
          // Cancel this specific notification
          const { data: schedule } = await supabase
            .from('schedules')
            .select('notification_id')
            .eq('id', activityId)
            .single();

          if (schedule?.notification_id) {
            await cancelAllNotifications();
            await supabase
              .from('schedules')
              .update({ notification_id: null })
              .eq('id', activityId);
          }
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Notification settings saved!');
      onClose();
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to save notification settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserRoutineIds = async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase
      .from('routines')
      .select('id')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map((r) => r.id) || [];
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={TEXT_PRIMARY} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Activity Reminders Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity Reminders</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Enable Reminders</Text>
                <Text style={styles.settingDescription}>
                  Get notified before activities start
                </Text>
              </View>
              <View style={styles.settingControl}>
                <Switch
                  value={preferences.enabled}
                  onValueChange={() => handleToggle('enabled')}
                  trackColor={{ false: '#D1D5DB', true: PRIMARY_ORANGE }}
                  thumbColor={WHITE}
                />
              </View>
            </View>

            {preferences.enabled && (
              <>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>Remind me</Text>
                </View>
                <View style={styles.pickerContainer}>
                  {ADVANCE_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.pickerOption,
                        preferences.advance_minutes === option.value &&
                          styles.pickerOptionActive,
                      ]}
                      onPress={() => handleAdvanceMinutesChange(option.value)}
                    >
                      <Text
                        style={[
                          styles.pickerOptionText,
                          preferences.advance_minutes === option.value &&
                            styles.pickerOptionTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Apply to all activities</Text>
                    <Text style={styles.settingDescription}>
                      Enable reminders for all existing activities
                    </Text>
                  </View>
                  <View style={styles.settingControl}>
                    <Switch
                      value={preferences.apply_to_all}
                      onValueChange={() => handleToggle('apply_to_all')}
                      trackColor={{ false: '#D1D5DB', true: PRIMARY_ORANGE }}
                      thumbColor={WHITE}
                    />
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Daily Digest Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Daily Digest</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Morning Summary</Text>
                <Text style={styles.settingDescription}>
                  Get your day's schedule every morning
                </Text>
              </View>
              <View style={styles.settingControl}>
                <Switch
                  value={preferences.daily_digest}
                  onValueChange={() => handleToggle('daily_digest')}
                  trackColor={{ false: '#D1D5DB', true: PRIMARY_ORANGE }}
                  thumbColor={WHITE}
                />
              </View>
            </View>

            {preferences.daily_digest && (
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>Time: {preferences.daily_digest_time}</Text>
              </View>
            )}
          </View>

          {/* Completion Reminders Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completion Reminders</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>End of Day Check-in</Text>
                <Text style={styles.settingDescription}>
                  Review and complete your daily activities
                </Text>
              </View>
              <View style={styles.settingControl}>
                <Switch
                  value={preferences.completion_reminder}
                  onValueChange={() => handleToggle('completion_reminder')}
                  trackColor={{ false: '#D1D5DB', true: PRIMARY_ORANGE }}
                  thumbColor={WHITE}
                />
              </View>
            </View>

            {preferences.completion_reminder && (
              <View style={styles.timeRow}>
                <Text style={styles.timeLabel}>Time: {preferences.completion_time}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <AnimatedGradientButton
            onPress={handleSave}
            disabled={loading}
            style={styles.saveButton}
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </AnimatedGradientButton>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING_LARGE,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: SPACING_MEDIUM,
    backgroundColor: PRIMARY_ORANGE,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: WHITE,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING_LARGE,
    paddingTop: SPACING_LARGE,
  },
  section: {
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    padding: SPACING_MEDIUM,
    marginBottom: SPACING_MEDIUM,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: TEXT_PRIMARY,
    marginBottom: SPACING_MEDIUM,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING_MEDIUM,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING_MEDIUM,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockIcon: {
    marginRight: 8,
  },
  pickerContainer: {
    marginBottom: SPACING_MEDIUM,
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: SPACING_MEDIUM,
    borderRadius: 8,
    backgroundColor: BACKGROUND,
    marginBottom: 8,
  },
  pickerOptionActive: {
    backgroundColor: PRIMARY_ORANGE,
  },
  pickerOptionText: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: TEXT_PRIMARY,
  },
  pickerOptionTextActive: {
    fontFamily: 'Inter-Bold',
    color: WHITE,
  },
  timeRow: {
    paddingVertical: SPACING_MEDIUM,
  },
  timeLabel: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
  },
  footer: {
    padding: SPACING_LARGE,
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    height: 56,
  },
});
