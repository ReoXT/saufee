import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Heart, Users } from 'lucide-react-native';
import AnimatedGradientButton from './AnimatedGradientButton';
import {
  WHITE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  PRIMARY_ORANGE,
  SHADOW,
  BORDER_RADIUS,
} from '../constants/theme';

interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    category: string;
    description?: string;
    creator_display_name?: string;
    likes_count: number;
    uses_count: number;
    is_liked?: boolean;
  };
  onUse: () => void;
  onLike: () => void;
  showCreator?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  work: '#3B82F6',
  fitness: '#10B981',
  study: '#8B5CF6',
  balanced: '#F59E0B',
  lifestyle: '#EC4899',
};

export default function TemplateCard({
  template,
  onUse,
  onLike,
  showCreator = true,
}: TemplateCardProps) {
  const [isLiked, setIsLiked] = useState(template.is_liked || false);
  const [likesCount, setLikesCount] = useState(template.likes_count);
  const heartScale = useSharedValue(1);

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    // Animate heart
    heartScale.value = withSpring(1.2, {}, () => {
      heartScale.value = withSpring(1);
    });

    // Call parent handler
    onLike();
  };

  const handleUse = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onUse();
  };

  const categoryColor = CATEGORY_COLORS[template.category] || PRIMARY_ORANGE;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title} numberOfLines={2}>
            {template.title}
          </Text>
          {showCreator && template.creator_display_name && (
            <Text style={styles.creator}>by @{template.creator_display_name}</Text>
          )}
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>
            {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
          </Text>
        </View>
      </View>

      {/* Description */}
      {template.description && (
        <Text style={styles.description} numberOfLines={2}>
          {template.description}
        </Text>
      )}

      {/* Stats and Actions */}
      <View style={styles.footer}>
        <View style={styles.stats}>
          {/* Like Button */}
          <TouchableOpacity style={styles.statButton} onPress={handleLike}>
            <Animated.View style={animatedHeartStyle}>
              <Heart
                size={20}
                color={isLiked ? PRIMARY_ORANGE : TEXT_SECONDARY}
                fill={isLiked ? PRIMARY_ORANGE : 'transparent'}
              />
            </Animated.View>
            <Text style={[styles.statText, isLiked && styles.statTextActive]}>
              {likesCount}
            </Text>
          </TouchableOpacity>

          {/* Uses Count */}
          <View style={styles.statButton}>
            <Users size={20} color={TEXT_SECONDARY} />
            <Text style={styles.statText}>{template.uses_count}</Text>
          </View>
        </View>

        {/* Use Button */}
        <AnimatedGradientButton
          onPress={handleUse}
          style={styles.useButton}
          textStyle={styles.useButtonText}
        >
          Use Template
        </AnimatedGradientButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 4,
    fontFamily: 'Inter-Bold',
  },
  creator: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontFamily: 'Inter-Medium',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: WHITE,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  statTextActive: {
    color: PRIMARY_ORANGE,
  },
  useButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 'auto',
  },
  useButtonText: {
    fontSize: 14,
  },
});
