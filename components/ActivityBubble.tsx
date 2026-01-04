import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Bell, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  WHITE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  PRIMARY_ORANGE,
  ERROR_RED,
  SHADOW,
  BORDER_RADIUS,
} from '../constants/theme';

interface ActivityBubbleProps {
  timeSlot: string;
  activity: string;
  duration: number;
  onPress: () => void;
  onDelete: () => void;
  hasNotification?: boolean;
  onNotificationPress?: () => void;
}

export default function ActivityBubble({
  timeSlot,
  activity,
  duration,
  onPress,
  onDelete,
  hasNotification = false,
  onNotificationPress,
}: ActivityBubbleProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (time: string) => {
    // Convert 24h to 12h format
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleNotificationPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNotificationPress?.();
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.deleteContainer,
          {
            transform: [{ translateX: trans }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDelete();
          }}
        >
          <Trash2 size={20} color={WHITE} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(timeSlot)}</Text>
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.activityText} numberOfLines={2}>
            {activity}
          </Text>
          <Text style={styles.durationText}>{formatDuration(duration)}</Text>
        </View>

        <TouchableOpacity
          style={styles.bellContainer}
          onPress={handleNotificationPress}
        >
          <Bell
            size={20}
            color={hasNotification ? PRIMARY_ORANGE : TEXT_SECONDARY}
            fill={hasNotification ? PRIMARY_ORANGE : 'transparent'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    padding: 16,
    marginBottom: 12,
    ...SHADOW,
  },
  timeContainer: {
    marginRight: 12,
    minWidth: 70,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    fontFamily: 'Inter-SemiBold',
  },
  contentContainer: {
    flex: 1,
    marginRight: 12,
  },
  activityText: {
    fontSize: 15,
    fontWeight: '500',
    color: TEXT_PRIMARY,
    marginBottom: 4,
    fontFamily: 'Inter-Medium',
  },
  durationText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  bellContainer: {
    padding: 4,
  },
  deleteContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: ERROR_RED,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    height: '100%',
    borderTopRightRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
  },
});
