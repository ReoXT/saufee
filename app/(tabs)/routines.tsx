import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAuth } from '../../lib/contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import RoutineCard from '../../components/RoutineCard';
import EmptyRoutines from '../../components/EmptyRoutines';
import SkeletonRoutineCard from '../../components/SkeletonRoutineCard';
import AnimatedGradientButton from '../../components/AnimatedGradientButton';
import TabScreenWrapper from '../../components/TabScreenWrapper';
import Toast from '../../components/Toast';
import { Routine, Schedule } from '../../types/database.types';
import {
  PRIMARY_ORANGE,
  WHITE,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  BACKGROUND,
  BORDER_RADIUS,
  SPACING_LARGE,
  SPACING_MEDIUM,
} from '../../constants/theme';
import { Search, X, Plus } from 'lucide-react-native';

interface RoutineWithSchedules extends Routine {
  schedules: Schedule[];
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'work', label: 'Work' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'study', label: 'Study' },
  { id: 'personal', label: 'Personal' },
];

export default function RoutinesScreen() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<RoutineWithSchedules[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  // Fetch routines from Supabase
  const fetchRoutines = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      // Fetch routines
      const { data: routinesData, error: routinesError } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_template', false)
        .order('created_at', { ascending: false });

      if (routinesError) throw routinesError;

      if (routinesData) {
        // Fetch schedules for each routine
        const routinesWithSchedules = await Promise.all(
          routinesData.map(async (routine) => {
            const { data: schedules, error: schedulesError } = await supabase
              .from('schedules')
              .select('*')
              .eq('routine_id', routine.id);

            if (schedulesError) console.error('Error fetching schedules:', schedulesError);

            return {
              ...routine,
              schedules: schedules || [],
            };
          })
        );

        setRoutines(routinesWithSchedules);
      }
    } catch (error) {
      console.error('Error fetching routines:', error);
      showToast('Failed to load routines', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial fetch
  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  // Filter routines based on search and category
  const filteredRoutines = useMemo(() => {
    return routines.filter((routine) => {
      const matchesSearch =
        routine.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (routine.description &&
          routine.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'all' ||
        (routine.category && routine.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [routines, searchQuery, selectedCategory]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRoutines();
    setRefreshing(false);
  };

  const handleRoutinePress = (routineId: string) => {
    router.push(`/routine/${routineId}`);
  };

  const handleDeleteRoutine = async (routineId: string) => {
    try {
      // Delete all schedules first (due to foreign key constraint)
      const { error: schedulesError } = await supabase
        .from('schedules')
        .delete()
        .eq('routine_id', routineId);

      if (schedulesError) throw schedulesError;

      // Delete the routine
      const { error: routineError } = await supabase
        .from('routines')
        .delete()
        .eq('id', routineId);

      if (routineError) throw routineError;

      // Update local state with animation
      setRoutines((prev) =>
        prev.filter((r) => r.id !== routineId)
      );

      showToast('Routine deleted', 'success');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error deleting routine:', error);
      showToast('Failed to delete routine', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleCreateNew = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/');
  };

  const renderSkeletons = () => (
    <View>
      {[0, 1, 2].map((i) => (
        <SkeletonRoutineCard key={`skeleton-${i}`} />
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <EmptyRoutines onCreatePress={handleCreateNew} />
  );

  const renderRoutineItem = ({ item, index }: { item: RoutineWithSchedules; index: number }) => (
    <Animated.View
      entering={FadeInDown.duration(300)
        .delay(index * 40)
        .springify()
        .damping(15)
        .stiffness(120)}
    >
      <RoutineCard
        routine={item}
        schedules={item.schedules}
        onPress={handleRoutinePress}
        onDelete={handleDeleteRoutine}
      />
    </Animated.View>
  );

  const renderHeader = () => (
    <Animated.View
      entering={FadeIn.duration(300).springify().damping(14).stiffness(120)}
      style={styles.header}
    >
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={20} color={TEXT_SECONDARY} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search routines..."
          placeholderTextColor={TEXT_SECONDARY}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="never"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={18} color={TEXT_SECONDARY} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filters */}
      <View style={styles.filtersContainer}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterChip,
              selectedCategory === category.id && styles.filterChipActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(category.id);
            }}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === category.id && styles.filterTextActive,
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderNoResults = () => (
    <View style={styles.noResults}>
      <Text style={styles.noResultsText}>No routines found</Text>
      <Text style={styles.noResultsSubtext}>Try adjusting your search or filters</Text>
    </View>
  );

  // Show loading state
  if (loading && routines.length === 0) {
    return (
      <TabScreenWrapper>
        <View style={styles.container}>
          {renderHeader()}
          {renderSkeletons()}
        </View>
      </TabScreenWrapper>
    );
  }

  // Show empty state
  if (routines.length === 0) {
    return (
      <TabScreenWrapper>
        <View style={styles.container}>
          <EmptyRoutines onCreatePress={handleCreateNew} />
        </View>
      </TabScreenWrapper>
    );
  }

  return (
    <TabScreenWrapper>
      <View style={styles.container}>
        <FlatList
          data={filteredRoutines}
          renderItem={renderRoutineItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderNoResults}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={PRIMARY_ORANGE}
              colors={[PRIMARY_ORANGE]}
            />
          }
          contentContainerStyle={styles.flatListContent}
          scrollEventThrottle={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          initialNumToRender={6}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          showsVerticalScrollIndicator={false}
        />

        {/* Floating Action Button */}
        <View style={styles.fab}>
          <Pressable
            onPress={handleCreateNew}
            style={({ pressed }) => [
              styles.fabButton,
              pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
            ]}
          >
            <Plus size={28} color={WHITE} strokeWidth={3} />
          </Pressable>
        </View>

        {/* Toast Notification */}
        <Toast
          visible={toastVisible}
          type={toastType}
          message={toastMessage}
          onDismiss={() => setToastVisible(false)}
        />
      </View>
    </TabScreenWrapper>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
  },
  flatListContent: {
    paddingTop: 0,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: SPACING_LARGE,
    paddingTop: Platform.OS === 'ios' ? 70 : 40,
    paddingBottom: SPACING_MEDIUM,
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BACKGROUND,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: SPACING_MEDIUM,
    marginBottom: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT_PRIMARY,
    fontFamily: 'Inter-Medium',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: SPACING_MEDIUM,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: PRIMARY_ORANGE,
    borderColor: PRIMARY_ORANGE,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    fontFamily: 'Inter-Medium',
  },
  filterTextActive: {
    color: WHITE,
  },
  noResults: {
    paddingHorizontal: SPACING_LARGE,
    paddingVertical: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginBottom: 8,
    fontFamily: 'Inter-Medium',
  },
  noResultsSubtext: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontFamily: 'Inter-Medium',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: PRIMARY_ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});
