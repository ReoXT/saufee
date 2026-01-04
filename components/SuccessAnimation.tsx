import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { CheckCircle, Sparkles } from 'lucide-react-native';

const PRIMARY_ORANGE = '#FF6B35';
const WHITE = '#FFFFFF';

interface SuccessAnimationProps {
  visible: boolean;
  type: 'schedule' | 'premium';
  message: string;
  onComplete: () => void;
  duration?: number;
}

export default function SuccessAnimation({
  visible,
  type,
  message,
  onComplete,
  duration = 2500,
}: SuccessAnimationProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);
  const confettiScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Icon animation
      scale.value = withSpring(1, {
        damping: 10,
        stiffness: 100,
      });
      opacity.value = withTiming(1, { duration: 300 });

      // Confetti/sparkles animation
      confettiOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) })
      );
      confettiScale.value = withSequence(
        withTiming(1.5, { duration: 600, easing: Easing.out(Easing.ease) }),
        withTiming(2, { duration: 400 })
      );

      // Auto-dismiss
      const timeout = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 400 }, () => {
          runOnJS(onComplete)();
        });
      }, duration);

      return () => clearTimeout(timeout);
    } else {
      scale.value = 0;
      opacity.value = 0;
      confettiOpacity.value = 0;
      confettiScale.value = 0;
    }
  }, [visible]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
    transform: [{ scale: confettiScale.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, containerStyle]}>
        <View style={styles.content}>
          {/* Confetti/Sparkles background */}
          <Animated.View style={[styles.confettiContainer, confettiStyle]}>
            {type === 'schedule' ? (
              <View style={styles.confetti}>
                {[...Array(12)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.confettiPiece,
                      {
                        transform: [
                          { rotate: `${i * 30}deg` },
                          { translateY: -80 },
                        ],
                      },
                    ]}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.sparkles}>
                {[...Array(8)].map((_, i) => (
                  <Sparkles
                    key={i}
                    size={40}
                    color={PRIMARY_ORANGE}
                    fill={PRIMARY_ORANGE}
                    style={{
                      position: 'absolute',
                      transform: [
                        { rotate: `${i * 45}deg` },
                        { translateY: -60 },
                      ],
                    }}
                  />
                ))}
              </View>
            )}
          </Animated.View>

          {/* Icon */}
          <Animated.View style={[styles.iconContainer, iconStyle]}>
            <CheckCircle size={80} color={PRIMARY_ORANGE} fill={PRIMARY_ORANGE} />
          </Animated.View>

          {/* Message */}
          <Animated.Text style={[styles.message, iconStyle]}>
            {message}
          </Animated.Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 16,
    backgroundColor: PRIMARY_ORANGE,
    borderRadius: 4,
  },
  sparkles: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
    shadowColor: PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  message: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: WHITE,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
