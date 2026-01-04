import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Home,
  Calendar,
  BarChart3,
  Grid,
  Settings,
} from 'lucide-react-native';
import {
  PRIMARY_ORANGE,
  WHITE,
  TEXT_SECONDARY,
  SHADOW,
} from '../constants/theme';

const LAST_TAB_KEY = 'SAUFEE_LAST_TAB';

const ICONS = {
  index: Home,
  routines: Calendar,
  analytics: BarChart3,
  templates: Grid,
  settings: Settings,
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const indicatorPosition = useSharedValue(0);
  const tabWidth = 100 / state.routes.length; // Percentage

  // Save last active tab
  useEffect(() => {
    AsyncStorage.setItem(LAST_TAB_KEY, state.index.toString()).catch(() => {});
  }, [state.index]);

  // Animate indicator to current tab with high-performance spring
  useEffect(() => {
    indicatorPosition.value = withSpring(state.index * tabWidth, {
      damping: 15,
      stiffness: 120,
      mass: 0.5,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    });
  }, [state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: `${indicatorPosition.value}%`,
  }));

  const handleTabPress = (route: any, index: number, isFocused: boolean) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate(route.name);
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated indicator line */}
      <Animated.View style={[styles.indicator, indicatorStyle, { width: `${tabWidth}%` }]}>
        <View style={styles.indicatorLine} />
      </Animated.View>

      {/* Tab buttons */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;
        const IconComponent = ICONS[route.name as keyof typeof ICONS];

        return (
          <TabButton
            key={route.key}
            route={route}
            index={index}
            isFocused={isFocused}
            IconComponent={IconComponent}
            label={label as string}
            onPress={() => handleTabPress(route, index, isFocused)}
          />
        );
      })}
    </View>
  );
}

interface TabButtonProps {
  route: any;
  index: number;
  isFocused: boolean;
  IconComponent: any;
  label: string;
  onPress: () => void;
}

export function TabButton({
  isFocused,
  IconComponent,
  label,
  onPress,
}: TabButtonProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isFocused ? 1.1 : 1, {
      damping: 12,
      stiffness: 150,
      mass: 0.3,
      overshootClamping: false,
      restDisplacementThreshold: 0.001,
      restSpeedThreshold: 0.001,
    });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = isFocused ? PRIMARY_ORANGE : TEXT_SECONDARY;
  const labelColor = isFocused ? PRIMARY_ORANGE : TEXT_SECONDARY;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tab}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <IconComponent size={24} color={iconColor} strokeWidth={2} />
      </Animated.View>

      <Text
        style={[
          styles.label,
          { color: labelColor },
          isFocused && styles.labelFocused,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    height: 70,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
    ...SHADOW,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    alignItems: 'center',
  },
  indicatorLine: {
    width: 40,
    height: 3,
    backgroundColor: PRIMARY_ORANGE,
    borderRadius: 2,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter-Medium',
  },
  labelFocused: {
    fontFamily: 'Inter-Bold',
  },
  proBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: PRIMARY_ORANGE,
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 24,
    alignItems: 'center',
  },
  proText: {
    color: WHITE,
    fontSize: 8,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
  },
  lockIcon: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 2,
  },
});
