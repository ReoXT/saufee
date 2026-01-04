import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function SkeletonTemplateCard() {
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSkeleton} />
        <View style={styles.categorySkeleton} />
      </View>

      {/* Creator */}
      <View style={styles.creatorSkeleton} />

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <View style={[styles.descriptionLine, { width: '100%' }]} />
        <View style={[styles.descriptionLine, { width: '60%' }]} />
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statSkeleton} />
        <View style={styles.statSkeleton} />
      </View>

      {/* Button */}
      <View style={styles.buttonSkeleton} />

      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.0)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleSkeleton: {
    width: 150,
    height: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  categorySkeleton: {
    width: 70,
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
  },
  creatorSkeleton: {
    width: 100,
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 12,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionLine: {
    height: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 6,
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statSkeleton: {
    width: 60,
    height: 16,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginRight: 16,
  },
  buttonSkeleton: {
    width: '100%',
    height: 48,
    backgroundColor: '#E5E7EB',
    borderRadius: 24,
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
