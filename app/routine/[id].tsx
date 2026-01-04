import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Edit3, Plus, Lock, Sparkles, Calendar, Share2 } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/contexts/AuthContext';
import { optimizeSchedule } from '../../lib/ai-service';
import ActivityBubble from '../../components/ActivityBubble';
import AnimatedGradientButton from '../../components/AnimatedGradientButton';
import NotificationSettings from '../../components/NotificationSettings';
import {
  PRIMARY_ORANGE,
  WHITE,
  BACKGROUND,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  SHADOW,
  BORDER_RADIUS,
  SPACING_LARGE,
} from '../../constants/theme';

interface Schedule {
  id: string;
  day_of_week: string;
  time_slot: string;
  activity: string;
  duration: number;
  notification_id?: string;
}

interface Routine {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

const DAYS_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [editTitleModal, setEditTitleModal] = useState(false);
  const [editActivityModal, setEditActivityModal] = useState(false);
  const [addActivityModal, setAddActivityModal] = useState(false);
  const [optimizationModal, setOptimizationModal] = useState(false);
  const [shareTemplateModal, setShareTemplateModal] = useState(false);
  const [notificationModal, setNotificationModal] = useState(false);

  // Notification states
  const [selectedActivityForNotification, setSelectedActivityForNotification] = useState<Schedule | null>(null);

  // Edit states
  const [editedTitle, setEditedTitle] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<Schedule | null>(null);
  const [editedActivityName, setEditedActivityName] = useState('');
  const [editedTime, setEditedTime] = useState('');
  const [editedDuration, setEditedDuration] = useState('');

  // Add activity states
  const [newDay, setNewDay] = useState('Monday');
  const [newTime, setNewTime] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newDuration, setNewDuration] = useState('');

  // Optimization
  const [optimizing, setOptimizing] = useState(false);
  const [optimizations, setOptimizations] = useState<any[]>([]);

  // Share Template
  const [templateCategory, setTemplateCategory] = useState('balanced');
  const [templateDescription, setTemplateDescription] = useState('');
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRoutine();
    }
  }, [id]);

  const fetchRoutine = async () => {
    try {
      setLoading(true);

      // Fetch routine
      const { data: routineData, error: routineError } = await supabase
        .from('routines')
        .select('*')
        .eq('id', id)
        .single();

      if (routineError) throw routineError;
      setRoutine(routineData);
      setEditedTitle(routineData.title);

      // Fetch schedules
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('schedules')
        .select('*')
        .eq('routine_id', id)
        .order('time_slot');

      if (schedulesError) throw schedulesError;
      setSchedules(schedulesData || []);
    } catch (error) {
      console.error('Error fetching routine:', error);
      Alert.alert('Error', 'Failed to load routine', [
        { text: 'Go Back', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRoutine();
    setRefreshing(false);
  };

  const handleUpdateTitle = async () => {
    if (!editedTitle.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    try {
      const { error } = await supabase
        .from('routines')
        .update({ title: editedTitle.trim() })
        .eq('id', id);

      if (error) throw error;

      setRoutine((prev) => (prev ? { ...prev, title: editedTitle.trim() } : null));
      setEditTitleModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating title:', error);
      Alert.alert('Error', 'Failed to update title');
    }
  };

  const handleEditActivity = (activity: Schedule) => {
    setSelectedActivity(activity);
    setEditedActivityName(activity.activity);
    setEditedTime(activity.time_slot);
    setEditedDuration(activity.duration.toString());
    setEditActivityModal(true);
  };

  const handleUpdateActivity = async () => {
    if (!selectedActivity) return;
    if (!editedActivityName.trim() || !editedTime || !editedDuration) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    const duration = parseInt(editedDuration);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Error', 'Duration must be a positive number');
      return;
    }

    try {
      const { error } = await supabase
        .from('schedules')
        .update({
          activity: editedActivityName.trim(),
          time_slot: editedTime,
          duration,
        })
        .eq('id', selectedActivity.id);

      if (error) throw error;

      setSchedules((prev) =>
        prev.map((s) =>
          s.id === selectedActivity.id
            ? {
                ...s,
                activity: editedActivityName.trim(),
                time_slot: editedTime,
                duration,
              }
            : s
        )
      );
      setEditActivityModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating activity:', error);
      Alert.alert('Error', 'Failed to update activity');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('schedules')
                .delete()
                .eq('id', activityId);

              if (error) throw error;

              setSchedules((prev) => prev.filter((s) => s.id !== activityId));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert('Error', 'Failed to delete activity');
            }
          },
        },
      ]
    );
  };

  const handleAddActivity = async () => {
    if (!newActivity.trim() || !newTime || !newDuration) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    const duration = parseInt(newDuration);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Error', 'Duration must be a positive number');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert({
          routine_id: id,
          day_of_week: newDay,
          time_slot: newTime,
          activity: newActivity.trim(),
          duration,
        })
        .select()
        .single();

      if (error) throw error;

      setSchedules((prev) => [...prev, data]);
      setAddActivityModal(false);
      setNewActivity('');
      setNewTime('');
      setNewDuration('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding activity:', error);
      Alert.alert('Error', 'Failed to add activity');
    }
  };

  const handleOptimize = async () => {
    if (!user?.id) return;

    setOptimizing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await optimizeSchedule(id, user.id);

      if (result.success && result.data) {
        setOptimizations(result.data.suggestions);
        setOptimizationModal(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(
          'Optimization Failed',
          result.error?.message || 'Failed to optimize schedule'
        );
      }
    } catch (error: any) {
      console.error('Optimization error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setOptimizing(false);
    }
  };

  const handleNotificationPress = (schedule: Schedule) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedActivityForNotification(schedule);
    setNotificationModal(true);
  };

  const handleShareTemplate = () => {
    if (!routine) return;

    setTemplateDescription(routine.description || '');
    setShareTemplateModal(true);
  };

  const handlePublishTemplate = async () => {
    if (!user?.id || !routine) return;

    setSharing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Get user's display name
      const { data: userData } = await supabase
        .from('users_metadata')
        .select('display_name')
        .eq('user_id', user.id)
        .single();

      const displayName = userData?.display_name || user.email?.split('@')[0] || 'Anonymous';

      // Update routine to be public
      const { error: routineError } = await supabase
        .from('routines')
        .update({
          is_public: true,
          description: templateDescription.trim() || routine.description,
        })
        .eq('id', id);

      if (routineError) throw routineError;

      // Insert into public_templates
      const { error: templateError } = await supabase
        .from('public_templates')
        .insert({
          routine_id: id,
          creator_id: user.id,
          creator_display_name: displayName,
          category: templateCategory,
        });

      if (templateError) throw templateError;

      // Update local state
      setRoutine((prev) =>
        prev
          ? {
              ...prev,
              is_public: true,
              description: templateDescription.trim() || prev.description,
            }
          : null
      );

      setShareTemplateModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        '🎉 Template Published!',
        'Your routine is now live in the community templates!',
        [{ text: 'Awesome!' }]
      );
    } catch (error: any) {
      console.error('Error publishing template:', error);

      // Check if already published
      if (error.code === '23505') {
        Alert.alert('Already Published', 'This routine is already shared as a template.');
      } else {
        Alert.alert('Error', 'Failed to publish template. Please try again.');
      }
    } finally {
      setSharing(false);
    }
  };

  const getSchedulesByDay = () => {
    const grouped: Record<string, Schedule[]> = {};
    DAYS_ORDER.forEach((day) => {
      grouped[day] = schedules.filter((s) => s.day_of_week === day);
    });
    return grouped;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_ORANGE} />
        <Text style={styles.loadingText}>Loading routine...</Text>
      </View>
    );
  }

  if (!routine) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Routine not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const schedulesByDay = getSchedulesByDay();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <ChevronLeft size={24} color={PRIMARY_ORANGE} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.titleContainer}
          onPress={() => setEditTitleModal(true)}
        >
          <Text style={styles.title} numberOfLines={1}>
            {routine.title}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setEditTitleModal(true)}
        >
          <Edit3 size={20} color={PRIMARY_ORANGE} />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {/* Optimize Button */}
        <AnimatedGradientButton
          onPress={handleOptimize}
          disabled={optimizing}
          style={styles.actionButton}
        >
          {optimizing ? 'Optimizing...' : <><Sparkles size={16} color={WHITE} /> Optimize</>}
        </AnimatedGradientButton>

        {/* Share Template Button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareTemplate}
        >
          <Share2 size={16} color={PRIMARY_ORANGE} />
          <Text style={styles.shareButtonText}>
            Share
          </Text>
        </TouchableOpacity>
      </View>

      {/* Schedule */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={PRIMARY_ORANGE}
            colors={[PRIMARY_ORANGE]}
          />
        }
      >
        {DAYS_ORDER.map((day, dayIndex) => {
          const daySchedules = schedulesByDay[day];
          if (daySchedules.length === 0) return null;

          return (
            <Animated.View
              key={day}
              entering={FadeInDown.delay(dayIndex * 50)}
              style={styles.dayContainer}
            >
              <Text style={styles.dayTitle}>{day}</Text>
              {daySchedules.map((schedule, index) => (
                <Animated.View
                  key={schedule.id}
                  entering={FadeInDown.delay(dayIndex * 50 + index * 25)}
                >
                  <ActivityBubble
                    timeSlot={schedule.time_slot}
                    activity={schedule.activity}
                    duration={schedule.duration}
                    onPress={() => handleEditActivity(schedule)}
                    onDelete={() => handleDeleteActivity(schedule.id)}
                    hasNotification={!!schedule.notification_id}
                    onNotificationPress={() => handleNotificationPress(schedule)}
                  />
                </Animated.View>
              ))}
            </Animated.View>
          );
        })}

        {schedules.length === 0 && (
          <Animated.View entering={FadeIn} style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No activities scheduled yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first activity
            </Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setAddActivityModal(true);
        }}
      >
        <Plus size={28} color={WHITE} />
      </TouchableOpacity>

      {/* Edit Title Modal */}
      <Modal
        visible={editTitleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setEditTitleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Routine Title</Text>
            <TextInput
              style={styles.input}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Routine title"
              placeholderTextColor={TEXT_SECONDARY}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setEditTitleModal(false);
                  setEditedTitle(routine.title);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateTitle}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Activity Modal */}
      <Modal
        visible={editActivityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setEditActivityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Activity</Text>
            <TextInput
              style={styles.input}
              value={editedActivityName}
              onChangeText={setEditedActivityName}
              placeholder="Activity name"
              placeholderTextColor={TEXT_SECONDARY}
            />
            <TextInput
              style={styles.input}
              value={editedTime}
              onChangeText={setEditedTime}
              placeholder="Time (HH:MM)"
              placeholderTextColor={TEXT_SECONDARY}
            />
            <TextInput
              style={styles.input}
              value={editedDuration}
              onChangeText={setEditedDuration}
              placeholder="Duration (minutes)"
              placeholderTextColor={TEXT_SECONDARY}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditActivityModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateActivity}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Activity Modal */}
      <Modal
        visible={addActivityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setAddActivityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Activity</Text>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Day:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {DAYS_ORDER.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayChip,
                      newDay === day && styles.dayChipSelected,
                    ]}
                    onPress={() => setNewDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        newDay === day && styles.dayChipTextSelected,
                      ]}
                    >
                      {day.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TextInput
              style={styles.input}
              value={newActivity}
              onChangeText={setNewActivity}
              placeholder="Activity name"
              placeholderTextColor={TEXT_SECONDARY}
            />
            <TextInput
              style={styles.input}
              value={newTime}
              onChangeText={setNewTime}
              placeholder="Time (HH:MM, e.g., 09:00)"
              placeholderTextColor={TEXT_SECONDARY}
            />
            <TextInput
              style={styles.input}
              value={newDuration}
              onChangeText={setNewDuration}
              placeholder="Duration (minutes)"
              placeholderTextColor={TEXT_SECONDARY}
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setAddActivityModal(false);
                  setNewActivity('');
                  setNewTime('');
                  setNewDuration('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddActivity}
              >
                <Text style={styles.saveButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Optimization Modal */}
      <Modal
        visible={optimizationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setOptimizationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.optimizationModalContent]}>
            <Text style={styles.modalTitle}>Optimization Suggestions</Text>
            <ScrollView style={styles.optimizationList}>
              {optimizations.map((suggestion, index) => (
                <View key={index} style={styles.suggestionCard}>
                  <View style={styles.suggestionHeader}>
                    <Text style={styles.suggestionText}>{suggestion.suggestion}</Text>
                    <View
                      style={[
                        styles.impactBadge,
                        suggestion.impact === 'high' && styles.impactHigh,
                        suggestion.impact === 'medium' && styles.impactMedium,
                        suggestion.impact === 'low' && styles.impactLow,
                      ]}
                    >
                      <Text style={styles.impactText}>
                        {suggestion.impact.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { width: '100%' }]}
              onPress={() => setOptimizationModal(false)}
            >
              <Text style={styles.saveButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Share Template Modal */}
      <Modal
        visible={shareTemplateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShareTemplateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share as Template</Text>
            <Text style={styles.modalSubtitle}>
              Share your routine with the Saufee community
            </Text>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Category:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['work', 'fitness', 'study', 'balanced', 'lifestyle'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      templateCategory === cat && styles.categoryChipSelected,
                    ]}
                    onPress={() => setTemplateCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        templateCategory === cat && styles.categoryChipTextSelected,
                      ]}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TextInput
              style={[styles.input, styles.descriptionInput]}
              value={templateDescription}
              onChangeText={setTemplateDescription}
              placeholder="Add a description (optional)"
              placeholderTextColor={TEXT_SECONDARY}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShareTemplateModal(false)}
                disabled={sharing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handlePublishTemplate}
                disabled={sharing}
              >
                <Text style={styles.saveButtonText}>
                  {sharing ? 'Publishing...' : 'Publish'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notification Settings Modal */}
      {selectedActivityForNotification && user && (
        <NotificationSettings
          visible={notificationModal}
          onClose={() => {
            setNotificationModal(false);
            setSelectedActivityForNotification(null);
            fetchData(); // Refresh to show updated notification status
          }}
          userId={user.id}
          activityId={selectedActivityForNotification.id}
          activityName={selectedActivityForNotification.activity}
          dayOfWeek={DAYS_ORDER.indexOf(selectedActivityForNotification.day_of_week)}
          timeSlot={selectedActivityForNotification.time_slot}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND,
  },
  loadingText: {
    marginTop: 12,
    color: TEXT_SECONDARY,
    fontSize: 14,
  },
  errorText: {
    color: TEXT_SECONDARY,
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: PRIMARY_ORANGE,
    borderRadius: BORDER_RADIUS,
  },
  backButtonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_LARGE,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: WHITE,
    ...SHADOW,
  },
  headerButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    fontFamily: 'Inter-Bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING_LARGE,
    paddingVertical: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
  },
  premiumButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    padding: 14,
    gap: 8,
    ...SHADOW,
  },
  premiumButtonText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '500',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 6,
    ...SHADOW,
  },
  shareButtonText: {
    color: PRIMARY_ORANGE,
    fontSize: 13,
    fontWeight: '600',
  },
  shareButtonTextLocked: {
    color: TEXT_SECONDARY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING_LARGE,
    paddingBottom: 100,
  },
  dayContainer: {
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIMARY_ORANGE,
    marginBottom: 12,
    fontFamily: 'Inter-SemiBold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW,
    shadowOpacity: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  optimizationModalContent: {
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 20,
    fontFamily: 'Inter-Bold',
  },
  input: {
    backgroundColor: BACKGROUND,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: TEXT_PRIMARY,
    marginBottom: 12,
    fontFamily: 'Inter-Medium',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: BACKGROUND,
    borderRadius: 20,
    marginRight: 8,
  },
  dayChipSelected: {
    backgroundColor: PRIMARY_ORANGE,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  dayChipTextSelected: {
    color: WHITE,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: BACKGROUND,
  },
  cancelButtonText: {
    color: TEXT_SECONDARY,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: PRIMARY_ORANGE,
  },
  saveButtonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: '600',
  },
  optimizationList: {
    maxHeight: 400,
    marginBottom: 16,
  },
  suggestionCard: {
    backgroundColor: BACKGROUND,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: TEXT_PRIMARY,
    lineHeight: 20,
    marginRight: 12,
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  impactHigh: {
    backgroundColor: '#EF4444',
  },
  impactMedium: {
    backgroundColor: '#F59E0B',
  },
  impactLow: {
    backgroundColor: '#10B981',
  },
  impactText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: WHITE,
  },
  modalSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 20,
    marginTop: -12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: BACKGROUND,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: PRIMARY_ORANGE,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  categoryChipTextSelected: {
    color: WHITE,
  },
  descriptionInput: {
    minHeight: 80,
  },
});
