import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Pressable,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Calendar, Trash2 } from 'lucide-react-native';
import { Routine, Schedule } from '../types/database.types';
import {
  PRIMARY_ORANGE,
  WHITE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  ERROR_RED,
  SHADOW,
  BORDER_RADIUS,
} from '../constants/theme';

interface RoutineCardProps {
  routine: Routine;
  schedules?: Schedule[];
  onPress: (routineId: string) => void;
  onDelete: (routineId: string) => void;
  onShare?: (routineId: string) => void;
  onDuplicate?: (routineId: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  work: '#3B82F6',
  fitness: '#10B981',
  study: '#8B5CF6',
  balanced: '#F59E0B',
  lifestyle: '#EC4899',
  personal: '#8B7355',
};

export default function RoutineCard({
  routine,
  schedules = [],
  onPress,
  onDelete,
  onShare,
  onDuplicate,
}: RoutineCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const scale = useSharedValue(1);

  const categoryColor = routine.category
    ? CATEGORY_COLORS[routine.category.toLowerCase()] || PRIMARY_ORANGE
    : PRIMARY_ORANGE;

  const formattedDate = formatDate(routine.created_at);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withTiming(0.98, { duration: 100 }, () => {
      scale.value = withTiming(1, { duration: 100 });
    });
    onPress(routine.id);
  };

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Routine?',
      `This will permanently delete "${routine.title}" and all its activities. This cannot be undone.`,
      [
        {
          text: 'Cancel',
          onPress: () => swipeableRef.current?.close(),
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            swipeableRef.current?.close();
            onDelete(routine.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderRightActions = () => (
    <Pressable
      onPress={handleDelete}
      style={styles.deleteAction}
    >
      <Trash2 size={24} color={WHITE} />
    </Pressable>
  );

  return (
    <Animated.View entering={FadeIn} style={[styles.container, animatedStyle]}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        onSwipeableOpen={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          {/* Header with title and category */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {routine.title}
            </Text>
            {routine.category && (
              <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                <Text style={styles.categoryText}>{routine.category}</Text>
              </View>
            )}
          </View>

          {/* Created date */}
          <Text style={styles.date}>{formattedDate}</Text>

          {/* Activity count */}
          <View style={styles.footer}>
            <Calendar size={16} color={TEXT_SECONDARY} />
            <Text style={styles.activityCount}>
              {schedules.length} {schedules.length === 1 ? 'activity' : 'activities'}
            </Text>
          </View>

          {/* Optional: Thumbnail preview of first 3 activities */}
          {schedules.length > 0 && (
            <View style={styles.preview}>
              {schedules.slice(0, 3).map((schedule, idx) => (
                <View key={`${schedule.id}-${idx}`} style={styles.previewBubble}>
                  <Text style={styles.previewText} numberOfLines={1}>
                    {schedule.activity}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Created today';
  if (diffDays === 1) return 'Created yesterday';
  if (diffDays < 7) return `Created ${diffDays} days ago`;
  if (diffDays < 30) return `Created ${Math.floor(diffDays / 7)} weeks ago`;
  return `Created ${Math.floor(diffDays / 30)} months ago`;
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    flex: 1,
    marginRight: 12,
    fontFamily: 'Inter-SemiBold',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 12,
    fontFamily: 'Inter-Medium',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityCount: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontFamily: 'Inter-Medium',
  },
  preview: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  previewBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: '48%',
  },
  previewText: {
    fontSize: 12,
    color: TEXT_PRIMARY,
    fontFamily: 'Inter-Medium',
  },
  deleteAction: {
    backgroundColor: ERROR_RED,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: BORDER_RADIUS,
  },
});
