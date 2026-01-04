import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Calendar } from 'lucide-react-native';
import AnimatedGradientButton from './AnimatedGradientButton';
import {
  PRIMARY_ORANGE,
  WHITE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from '../constants/theme';

interface EmptyRoutinesProps {
  onCreatePress: () => void;
}

export default function EmptyRoutines({ onCreatePress }: EmptyRoutinesProps) {
  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBorder}>
            <Calendar size={60} color={PRIMARY_ORANGE} strokeWidth={1.5} />
          </View>
        </View>

        <Text style={styles.title}>No Routines Yet</Text>
        <Text style={styles.description}>
          Start by creating your first routine from the home screen
        </Text>

        <AnimatedGradientButton
          onPress={onCreatePress}
          style={styles.button}
        >
          Create Routine
        </AnimatedGradientButton>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: WHITE,
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    marginBottom: 8,
  },
  iconBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: PRIMARY_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    fontFamily: 'Inter-Bold',
  },
  description: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter-Medium',
  },
  button: {
    marginTop: 12,
  },
});
