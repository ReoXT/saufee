import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { WHITE, SHADOW, BORDER_RADIUS } from '../constants/theme';

export default function SkeletonRoutineCard() {
  const shimmerTranslate = useSharedValue(0);

  useEffect(() => {
    shimmerTranslate.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      true
    );
  }, []);

  const animatedShimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmerTranslate.value * 0.3 + 0.1,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header shimmer */}
        <View style={styles.headerShimmer}>
          <Animated.View style={[styles.shimmerBar, animatedShimmerStyle]} />
          <View style={styles.placeholderBar} />
        </View>

        {/* Date shimmer */}
        <View style={styles.dateShimmer}>
          <Animated.View style={[styles.shimmerBar, animatedShimmerStyle]} />
          <View style={[styles.placeholderBar, styles.smallBar]} />
        </View>

        {/* Activity count shimmer */}
        <View style={styles.activityShimmer}>
          <Animated.View style={[styles.shimmerBar, animatedShimmerStyle]} />
          <View style={[styles.placeholderBar, styles.smallBar]} />
        </View>

        {/* Preview bubbles shimmer */}
        <View style={styles.previewShimmer}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.previewBubbleShimmer}>
              <Animated.View style={[styles.shimmerBar, animatedShimmerStyle]} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
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
    ...SHADOW,
    overflow: 'hidden',
  },
  headerShimmer: {
    marginBottom: 8,
    gap: 8,
  },
  placeholderBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    width: '70%',
  },
  dateShimmer: {
    marginBottom: 12,
    gap: 4,
  },
  activityShimmer: {
    marginBottom: 12,
    gap: 4,
  },
  smallBar: {
    width: '50%',
  },
  previewShimmer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  previewBubbleShimmer: {
    flex: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
});
