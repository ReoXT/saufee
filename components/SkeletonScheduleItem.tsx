import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const PRIMARY_ORANGE = '#FF6B35';

export default function SkeletonScheduleItem() {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      shimmer.value,
      [0, 1],
      [0.3, 0.6]
    ),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.timeContainer}>
        <View style={styles.timeSkeleton} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.activitySkeleton} />
        <View style={styles.durationSkeleton} />
        <Animated.View style={[styles.shimmer, animatedStyle]}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.0)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  timeContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  timeSkeleton: {
    width: 50,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  activitySkeleton: {
    width: '70%',
    height: 18,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
  },
  durationSkeleton: {
    width: '40%',
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    flex: 1,
    width: '100%',
  },
});
