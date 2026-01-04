import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAuth } from '../../lib/contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { generateSchedule } from '../../lib/ai-service';
import SaufeeLogo from '../../components/SaufeeLogo';
import TabScreenWrapper from '../../components/TabScreenWrapper';
import AnimatedGradientButton from '../../components/AnimatedGradientButton';
import {
  PRIMARY_ORANGE,
  WHITE,
  BACKGROUND,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  SHADOW,
  BORDER_RADIUS,
  SPACING_LARGE,
  SPACING_MEDIUM,
  SUCCESS_GREEN,
  ERROR_RED,
} from '../../constants/theme';

const PLACEHOLDER_TEXT = `Describe your routine in plain English...

For example: I work 9-5 on weekdays, gym Monday/Wednesday/Friday at 6pm, study every evening from 7-9pm, family time on weekends`;

export default function BrainDumpScreen() {
  const { user } = useAuth();
  const inputRef = useRef<TextInput>(null);

  const [brainDump, setBrainDump] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animation values
  const screenOpacity = useSharedValue(0);
  const inputScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  // Screen fade-in animation with smoother easing
  useEffect(() => {
    screenOpacity.value = withTiming(1, {
      duration: 350,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, []);

  // Optimized pulse animation for loading state
  useEffect(() => {
    if (loading) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.08, {
            duration: 500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
          withTiming(1, {
            duration: 500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, {
        duration: 150,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [loading]);


  const animatedScreenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const animatedInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
    borderColor: isFocused ? PRIMARY_ORANGE : 'transparent',
    borderWidth: isFocused ? 2 : 0,
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleInputFocus = () => {
    setIsFocused(true);
    inputScale.value = withSpring(1.01, {
      damping: 14,
      stiffness: 140,
      mass: 0.4,
    });
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    inputScale.value = withSpring(1, {
      damping: 14,
      stiffness: 140,
      mass: 0.4,
    });
  };

  const handleGenerateSchedule = async () => {
    // Check if input is empty
    if (!brainDump.trim()) {
      Alert.alert(
        'Empty Description',
        'Please describe your routine before generating a schedule.',
        [{ text: 'OK' }]
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    // Check if user is logged in
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to generate a schedule.');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await generateSchedule(brainDump.trim(), user.id);

      if (result.success && result.data) {
        // Success!
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Clear input
        setBrainDump('');

        // Navigate to the generated routine
        router.push(`/routine/${result.data.routineId}`);
      } else if (result.error) {
        // Handle specific error cases
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Generation Failed', result.error.message, [
          { text: 'Try Again' },
        ]);
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Error',
        'Something went wrong. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
      console.error('Generate schedule error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TabScreenWrapper>
      <Animated.View style={[styles.container, animatedScreenStyle]}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header with Logo */}
            <Animated.View
              entering={FadeIn.duration(250).delay(50).easing(Easing.bezier(0.25, 0.1, 0.25, 1))}
              style={styles.header}
            >
              <SaufeeLogo size={60} />
            </Animated.View>

            {/* Brain Dump Input */}
            <Animated.View
              entering={FadeIn.duration(250).delay(100).easing(Easing.bezier(0.25, 0.1, 0.25, 1))}
              style={[styles.inputWrapper, animatedInputStyle]}
            >
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder={PLACEHOLDER_TEXT}
                placeholderTextColor={TEXT_SECONDARY}
                value={brainDump}
                onChangeText={setBrainDump}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                editable={!loading}
                accessibilityLabel="Routine description input"
                accessibilityHint="Describe your weekly routine in plain English"
              />
            </Animated.View>

            {/* Generate Button */}
            <Animated.View
              entering={FadeIn.duration(250).delay(150).easing(Easing.bezier(0.25, 0.1, 0.25, 1))}
              style={styles.buttonContainer}
            >
              {loading ? (
                <Animated.View style={[styles.loadingContainer, animatedPulseStyle]}>
                  <View style={styles.loadingCircle}>
                    <ActivityIndicator size="large" color={WHITE} />
                  </View>
                  <Text style={styles.loadingText}>Generating your schedule...</Text>
                </Animated.View>
              ) : (
                <AnimatedGradientButton
                  onPress={handleGenerateSchedule}
                  disabled={loading}
                  style={styles.generateButton}
                >
                  Generate Schedule
                </AnimatedGradientButton>
              )}
            </Animated.View>

            {/* Helpful tip */}
            <Animated.View
              entering={FadeIn.duration(250).delay(200).easing(Easing.bezier(0.25, 0.1, 0.25, 1))}
              style={styles.tipContainer}
            >
              <Text style={styles.tipText}>
                Tip: Include specific times, days, and activities for best results
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </TabScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING_LARGE,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  usageContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  usageBubble: {
    backgroundColor: PRIMARY_ORANGE,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  usageText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '500',
  },
  remainingText: {
    color: TEXT_SECONDARY,
    fontSize: 12,
    marginTop: 6,
  },
  premiumBadge: {
    marginTop: 16,
    backgroundColor: SUCCESS_GREEN,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  premiumText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: '600',
  },
  inputWrapper: {
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    ...SHADOW,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  input: {
    padding: 20,
    fontSize: 16,
    color: TEXT_PRIMARY,
    minHeight: 200,
    fontFamily: 'Inter-Medium',
    lineHeight: 24,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  generateButton: {
    height: 56,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...SHADOW,
  },
  loadingText: {
    color: PRIMARY_ORANGE,
    fontSize: 14,
    fontWeight: '500',
  },
  tipContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tipText: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
