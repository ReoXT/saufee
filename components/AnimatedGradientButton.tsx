import { TouchableOpacity, Text, ViewStyle, TextStyle, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';

interface AnimatedGradientButtonProps {
  onPress: () => void;
  children: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function AnimatedGradientButton({
  onPress,
  children,
  disabled = false,
  style,
  textStyle,
}: AnimatedGradientButtonProps) {
  const scale = useSharedValue(1);
  const [isPressed, setIsPressed] = useState(false);

  // Independent animation values for each circle with different speeds
  // Random starting positions and durations for each button instance to prevent uniform movement
  const [randomOffsets] = useState({
    circle1: Math.random(),
    circle2: Math.random(),
    circle3: Math.random(),
    circle4: Math.random(),
    // Add random duration variations (±2 seconds) for even more uniqueness
    duration1: 22000 + Math.random() * 4000 - 2000,
    duration2: 18000 + Math.random() * 4000 - 2000,
    duration3: 15000 + Math.random() * 4000 - 2000,
    duration4: 12000 + Math.random() * 4000 - 2000,
  });

  const circle1Position = useSharedValue(randomOffsets.circle1);
  const circle2Position = useSharedValue(randomOffsets.circle2);
  const circle3Position = useSharedValue(randomOffsets.circle3);
  const circle4Position = useSharedValue(randomOffsets.circle4);

  // Each circle animates at different speeds for individual, non-uniform movement
  useEffect(() => {
    // Circle 1 - slowest (~22 seconds) with random variation
    circle1Position.value = withRepeat(
      withTiming(1, {
        duration: randomOffsets.duration1,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Circle 2 - medium-slow (~18 seconds) with random variation
    circle2Position.value = withRepeat(
      withTiming(1, {
        duration: randomOffsets.duration2,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Circle 3 - medium-fast (~15 seconds) with random variation
    circle3Position.value = withRepeat(
      withTiming(1, {
        duration: randomOffsets.duration3,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Circle 4 - fastest (~12 seconds) with random variation
    circle4Position.value = withRepeat(
      withTiming(1, {
        duration: randomOffsets.duration4,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  // Create randomly moving circles that bounce unpredictably across entire button
  // Using even integer multiples of PI for seamless looping with no jumpcuts

  // Circle 1 - Large dark orange circle
  const animatedCircle1Style = useAnimatedStyle(() => {
    const t = circle1Position.value;
    // Combine multiple sine/cosine waves with integer frequencies for seamless looping
    const translateX =
      Math.sin(t * Math.PI * 2) * 90 +
      Math.cos(t * Math.PI * 6) * 40 +
      Math.sin(t * Math.PI * 4) * 25;
    const translateY =
      Math.cos(t * Math.PI * 2) * 35 +
      Math.sin(t * Math.PI * 4) * 20 +
      Math.cos(t * Math.PI * 6) * 15;
    const scale = 1 + Math.sin(t * Math.PI * 8) * 0.3;

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
      opacity: 0.6,
    };
  });

  // Circle 2 - Medium bright orange circle
  const animatedCircle2Style = useAnimatedStyle(() => {
    const t = circle2Position.value;
    // Different integer frequency combinations for unpredictable path
    const translateX =
      Math.cos(t * Math.PI * 4) * 80 +
      Math.sin(t * Math.PI * 6) * 45 +
      Math.cos(t * Math.PI * 4) * 30;
    const translateY =
      Math.sin(t * Math.PI * 2) * 40 +
      Math.cos(t * Math.PI * 6) * 25 +
      Math.sin(t * Math.PI * 8) * 18;
    const scale = 1 + Math.cos(t * Math.PI * 8) * 0.35;

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
      opacity: 0.5,
    };
  });

  // Circle 3 - Small light orange circle
  const animatedCircle3Style = useAnimatedStyle(() => {
    const t = circle3Position.value;
    // Yet another set of integer frequencies for maximum unpredictability
    const translateX =
      Math.sin(t * Math.PI * 4) * 100 +
      Math.cos(t * Math.PI * 8) * 50 +
      Math.sin(t * Math.PI * 2) * 35;
    const translateY =
      Math.cos(t * Math.PI * 4) * 38 +
      Math.sin(t * Math.PI * 6) * 28 +
      Math.cos(t * Math.PI * 8) * 22;
    const scale = 1 + Math.sin(t * Math.PI * 10) * 0.4;

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
      opacity: 0.4,
    };
  });

  // Circle 4 - Medium yellow/amber circle for contrast
  const animatedCircle4Style = useAnimatedStyle(() => {
    const t = circle4Position.value;
    // Unique integer frequencies for distinct movement pattern
    const translateX =
      Math.sin(t * Math.PI * 6) * 85 +
      Math.cos(t * Math.PI * 2) * 42 +
      Math.sin(t * Math.PI * 10) * 28;
    const translateY =
      Math.cos(t * Math.PI * 6) * 42 +
      Math.sin(t * Math.PI * 2) * 30 +
      Math.cos(t * Math.PI * 10) * 20;
    const scale = 1 + Math.sin(t * Math.PI * 12) * 0.35;

    return {
      transform: [
        { translateX },
        { translateY },
        { scale },
      ],
      opacity: 0.55,
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Shadow animation for press state
  const shadowStyle = isPressed ? {
    shadowOpacity: 0.5,
    shadowRadius: 16,
  } : {
    shadowOpacity: 0.4,
    shadowRadius: 12,
  };

  const handlePressIn = () => {
    if (disabled) return;
    setIsPressed(true);
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = () => {
    setIsPressed(false);
    scale.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={[animatedButtonStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.95}
        style={[
          {
            borderRadius: 24,
            overflow: 'hidden',
            shadowColor: '#FF6B35',
            shadowOffset: { width: 0, height: 6 },
            ...shadowStyle,
            elevation: 8,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
      >
        {/* Multi-layer animated gradient background */}
        <View style={{ position: 'relative', overflow: 'hidden', borderRadius: 24 }}>
          {/* Base gradient layer */}
          <LinearGradient
            colors={disabled
              ? ['#CCCCCC', '#B8B8B8', '#999999', '#B8B8B8', '#CCCCCC']
              : ['#E64A19', '#FF6B35', '#FFB74D']}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 32,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Animated Circle 1 - Large dark orange */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  zIndex: 1,
                },
                animatedCircle1Style,
              ]}
            >
              <LinearGradient
                colors={disabled
                  ? ['transparent', 'transparent']
                  : ['rgba(230, 74, 25, 0.7)', 'rgba(255, 87, 34, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  borderRadius: 60,
                }}
              />
            </Animated.View>

            {/* Animated Circle 2 - Medium bright orange */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  zIndex: 2,
                },
                animatedCircle2Style,
              ]}
            >
              <LinearGradient
                colors={disabled
                  ? ['transparent', 'transparent']
                  : ['rgba(255, 107, 53, 0.6)', 'rgba(255, 140, 90, 0.3)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  borderRadius: 50,
                }}
              />
            </Animated.View>

            {/* Animated Circle 3 - Small light orange */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  zIndex: 3,
                },
                animatedCircle3Style,
              ]}
            >
              <LinearGradient
                colors={disabled
                  ? ['transparent', 'transparent']
                  : ['rgba(255, 162, 64, 0.7)', 'rgba(255, 183, 77, 0.4)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  borderRadius: 40,
                }}
              />
            </Animated.View>

            {/* Animated Circle 4 - Medium yellow/amber for contrast */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  width: 95,
                  height: 95,
                  borderRadius: 47.5,
                  zIndex: 4,
                },
                animatedCircle4Style,
              ]}
            >
              <LinearGradient
                colors={disabled
                  ? ['transparent', 'transparent']
                  : ['rgba(255, 200, 50, 0.65)', 'rgba(255, 220, 100, 0.35)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  borderRadius: 47.5,
                }}
              />
            </Animated.View>

            {/* Text layer with highest z-index */}
            <Text
              style={[
                {
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '700',
                  fontFamily: 'Inter-Bold',
                  textAlign: 'center',
                  zIndex: 10,
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                },
                textStyle,
              ]}
            >
              {children}
            </Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
