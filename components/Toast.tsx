import { useEffect } from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { WHITE, PRIMARY_ORANGE, ERROR_RED, TEXT_SECONDARY } from '../constants/theme';

interface ToastProps {
  visible: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
  onDismiss: () => void;
}

const { width } = Dimensions.get('window');

export default function Toast({
  visible,
  type,
  message,
  duration = 2000,
  onDismiss,
}: ToastProps) {
  const translateY = useSharedValue(-100);

  useEffect(() => {
    if (visible) {
      // Slide in
      translateY.value = withSpring(20, {
        damping: 15,
        stiffness: 150,
      });

      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 }, () => {
          runOnJS(onDismiss)();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      translateY.value = withTiming(-100, { duration: 300 });
    }
  }, [visible, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY < 0) {
        translateY.value = 20 + event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY < -30) {
        // Swipe up to dismiss
        translateY.value = withTiming(-100, { duration: 300 }, () => {
          runOnJS(onDismiss)();
        });
      } else {
        // Snap back
        translateY.value = withSpring(20);
      }
    });

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return PRIMARY_ORANGE;
      case 'error':
        return ERROR_RED;
      case 'info':
        return TEXT_SECONDARY;
      default:
        return PRIMARY_ORANGE;
    }
  };

  if (!visible) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: getBackgroundColor() },
          animatedStyle,
        ]}
      >
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    width: width - 40,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    fontSize: 15,
    fontFamily: 'Inter-Medium',
    color: WHITE,
    textAlign: 'center',
  },
});
