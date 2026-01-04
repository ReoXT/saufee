import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated as RNAnimated,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, ZoomIn, useAnimatedStyle, withRepeat, withTiming, useSharedValue } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Sparkles, CheckCircle, Calendar, Zap, Crown } from 'lucide-react-native';

import SaufeeLogo from '../components/SaufeeLogo';
import AnimatedGradientButton from '../components/AnimatedGradientButton';
import { completeOnboarding } from '../lib/utils/onboarding-helpers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PRIMARY_ORANGE = '#FF6B35';
const WHITE = '#FFFFFF';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

interface OnboardingScreen {
  id: string;
  title: string;
  description: string;
  illustration: 'chaos-to-clarity' | 'ai-powered' | 'premium';
}

const SCREENS: OnboardingScreen[] = [
  {
    id: '1',
    title: 'Transform Chaos into Clarity',
    description: 'Brain dump your tasks in plain English and let AI organize your perfect routine',
    illustration: 'chaos-to-clarity',
  },
  {
    id: '2',
    title: 'AI-Powered Schedules',
    description: 'Our smart AI understands natural language and creates realistic, personalized schedules tailored to your life',
    illustration: 'ai-powered',
  },
  {
    id: '3',
    title: 'Unlock Your Full Potential',
    description: '',
    illustration: 'premium',
  },
];

const PREMIUM_FEATURES = [
  'Unlimited AI generations',
  'Smart schedule optimization',
  'Analytics & insights',
  'Export & calendar sync',
  'Custom notifications',
  'Share your templates',
];

// Animated illustration components
const ChaosToClarity = () => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 1500 }), -1, true);
    translateY.value = withRepeat(withTiming(-20, { duration: 2000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.illustrationContainer}>
      <Animated.View style={[styles.illustrationCard, animatedStyle]}>
        <Calendar size={64} color={PRIMARY_ORANGE} />
        <Text style={styles.illustrationText}>Organized Schedule</Text>
      </Animated.View>
      <View style={styles.flowArrow}>
        <Zap size={32} color={PRIMARY_ORANGE} />
      </View>
      <View style={styles.chaosText}>
        <Text style={styles.chaosTextContent}>
          "Morning gym, team meeting at 2pm, grocery shopping, call mom..."
        </Text>
      </View>
    </View>
  );
};

const AIPowered = () => {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withRepeat(withTiming(1.2, { duration: 1500 }), -1, true);
    rotate.value = withRepeat(withTiming(360, { duration: 3000 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <View style={styles.illustrationContainer}>
      <View style={styles.aiGlow}>
        <Animated.View style={animatedStyle}>
          <Sparkles size={80} color={PRIMARY_ORANGE} fill={PRIMARY_ORANGE} />
        </Animated.View>
      </View>
      <View style={styles.schedulePreview}>
        <View style={styles.scheduleItem}>
          <View style={styles.scheduleTime} />
          <View style={styles.scheduleBar} />
        </View>
        <View style={styles.scheduleItem}>
          <View style={styles.scheduleTime} />
          <View style={styles.scheduleBar} />
        </View>
        <View style={styles.scheduleItem}>
          <View style={styles.scheduleTime} />
          <View style={styles.scheduleBar} />
        </View>
      </View>
    </View>
  );
};

const PremiumIllustration = () => {
  const shine = useSharedValue(-100);

  React.useEffect(() => {
    shine.value = withRepeat(withTiming(100, { duration: 2000 }), -1, false);
  }, []);

  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shine.value }],
  }));

  return (
    <View style={styles.illustrationContainer}>
      <View style={styles.premiumBadge}>
        <Crown size={80} color={PRIMARY_ORANGE} fill={PRIMARY_ORANGE} />
        <Animated.View style={[styles.shine, shineStyle]} />
      </View>
    </View>
  );
};

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new RNAnimated.Value(0)).current;

  const handleNext = async () => {
    if (currentIndex < SCREENS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Skip to premium pitch (screen 3)
    flatListRef.current?.scrollToIndex({ index: 2 });
  };

  const handleStartFreeTrial = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleContinueFree = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const openTerms = () => {
    Linking.openURL('https://saufee.com/terms');
  };

  const openPrivacy = () => {
    Linking.openURL('https://saufee.com/privacy');
  };

  const renderIllustration = (type: OnboardingScreen['illustration']) => {
    switch (type) {
      case 'chaos-to-clarity':
        return <ChaosToClarity />;
      case 'ai-powered':
        return <AIPowered />;
      case 'premium':
        return <PremiumIllustration />;
    }
  };

  const renderScreen = ({ item, index }: { item: OnboardingScreen; index: number }) => {
    const isLastScreen = index === SCREENS.length - 1;

    return (
      <View style={styles.screen}>
        {/* Skip button (only on first 2 screens) */}
        {!isLastScreen && (
          <Animated.View entering={FadeIn.delay(300)} style={styles.skipContainer}>
            <TouchableOpacity onPress={handleSkip} activeOpacity={0.7}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Top section */}
          {index === 0 && (
            <Animated.View entering={FadeInDown.delay(100)} style={styles.logoContainer}>
              <SaufeeLogo size={80} />
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={[styles.title, isLastScreen && styles.titleOrange]}>
              {item.title}
            </Text>
          </Animated.View>

          {item.description ? (
            <Animated.View entering={FadeInDown.delay(300)}>
              <Text style={styles.description}>{item.description}</Text>
            </Animated.View>
          ) : null}

          {/* Illustration */}
          <Animated.View entering={ZoomIn.delay(400)} style={styles.illustrationWrapper}>
            {renderIllustration(item.illustration)}
          </Animated.View>

          {/* Premium features list (screen 3 only) */}
          {isLastScreen && (
            <Animated.View entering={FadeInDown.delay(500)} style={styles.featuresContainer}>
              {PREMIUM_FEATURES.map((feature, idx) => (
                <Animated.View
                  key={feature}
                  entering={FadeInDown.delay(600 + idx * 50)}
                  style={styles.featureItem}
                >
                  <CheckCircle size={20} color={PRIMARY_ORANGE} />
                  <Text style={styles.featureText}>{feature}</Text>
                </Animated.View>
              ))}
            </Animated.View>
          )}
        </View>

        {/* Bottom section */}
        <View style={styles.bottom}>
          {isLastScreen ? (
            <Animated.View entering={FadeInDown.delay(900)} style={styles.finalButtons}>
              <AnimatedGradientButton
                onPress={handleStartFreeTrial}
                style={styles.primaryButton}
              >
                Start Free Trial
              </AnimatedGradientButton>
              <TouchableOpacity onPress={handleContinueFree} activeOpacity={0.7}>
                <Text style={styles.secondaryButton}>Continue with Free</Text>
              </TouchableOpacity>
              <View style={styles.legalLinks}>
                <TouchableOpacity onPress={openTerms} activeOpacity={0.7}>
                  <Text style={styles.legalText}>Terms</Text>
                </TouchableOpacity>
                <Text style={styles.legalSeparator}> • </Text>
                <TouchableOpacity onPress={openPrivacy} activeOpacity={0.7}>
                  <Text style={styles.legalText}>Privacy</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.delay(700)} style={styles.nextButton}>
              <AnimatedGradientButton onPress={handleNext}>
                Next
              </AnimatedGradientButton>
            </Animated.View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SCREENS}
        renderItem={renderScreen}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={RNAnimated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
        bounces={false}
        decelerationRate="fast"
      />

      {/* Page indicators */}
      <View style={styles.pagination}>
        {SCREENS.map((_, index) => {
          const inputRange = [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 10, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <RNAnimated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  height: dotWidth,
                  opacity,
                  backgroundColor: index === currentIndex ? PRIMARY_ORANGE : TEXT_SECONDARY,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    paddingTop: 60,
    paddingBottom: 100,
  },
  skipContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    fontFamily: 'Inter-Medium',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  titleOrange: {
    color: PRIMARY_ORANGE,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  illustrationWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Chaos to Clarity illustration
  illustrationCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  illustrationText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: TEXT_PRIMARY,
  },
  flowArrow: {
    marginVertical: 16,
  },
  chaosText: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    maxWidth: 300,
  },
  chaosTextContent: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // AI Powered illustration
  aiGlow: {
    marginBottom: 30,
    shadowColor: PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  schedulePreview: {
    width: 260,
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduleTime: {
    width: 40,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginRight: 12,
  },
  scheduleBar: {
    flex: 1,
    height: 24,
    backgroundColor: PRIMARY_ORANGE,
    borderRadius: 8,
    opacity: 0.8,
  },
  // Premium illustration
  premiumBadge: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_ORANGE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 50,
  },
  // Premium features
  featuresContainer: {
    width: '100%',
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: TEXT_PRIMARY,
    marginLeft: 12,
  },
  // Bottom section
  bottom: {
    paddingHorizontal: 30,
    paddingBottom: 20,
  },
  nextButton: {
    width: '100%',
  },
  finalButtons: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    marginBottom: 16,
  },
  secondaryButton: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
    paddingVertical: 12,
  },
  legalLinks: {
    flexDirection: 'row',
    marginTop: 20,
  },
  legalText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: TEXT_SECONDARY,
  },
  legalSeparator: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  // Pagination
  pagination: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    borderRadius: 5,
    marginHorizontal: 4,
  },
});
