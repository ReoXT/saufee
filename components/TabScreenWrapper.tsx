import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface TabScreenWrapperProps {
  children: React.ReactNode;
}

export default function TabScreenWrapper({ children }: TabScreenWrapperProps) {
  return (
    <Animated.View
      style={styles.container}
      entering={FadeIn.duration(180).easing(Easing.bezier(0.25, 0.1, 0.25, 1))}
      exiting={FadeOut.duration(150).easing(Easing.bezier(0.25, 0.1, 0.25, 1))}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
