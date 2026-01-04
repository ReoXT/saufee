import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Search, TrendingUp, Clock, Filter } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/contexts/AuthContext';
import TemplateCard from '../../components/TemplateCard';
import TabScreenWrapper from '../../components/TabScreenWrapper';
import {
  PRIMARY_ORANGE,
  WHITE,
  BACKGROUND,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  BORDER_RADIUS,
  SPACING_LARGE,
  SHADOW,
} from '../../constants/theme';

interface CommunityTemplate {
  id: string;
  routine_id: string;
  title: string;
  category: string;
  description: string;
  creator_display_name: string;
  likes_count: number;
  uses_count: number;
  created_at: string;
  is_liked?: boolean;
}

const OFFICIAL_TEMPLATES = [
  {
    id: 'official-1',
    title: 'Busy Professional',
    category: 'work',
    description:
      '9-5 workday with morning routine, gym sessions 3x/week, family time in evenings, and weekend relaxation',
    likes_count: 0,
    uses_count: 0,
  },
  {
    id: 'official-2',
    title: 'Student Life',
    category: 'study',
    description:
      'Morning classes, afternoon study sessions, evening social activities, balanced sleep schedule',
    likes_count: 0,
    uses_count: 0,
  },
  {
    id: 'official-3',
    title: 'Fitness Focus',
    category: 'fitness',
    description:
      'Daily workouts at 6am, meal prep on Sundays, active recovery sessions, proper rest days',
    likes_count: 0,
    uses_count: 0,
  },
  {
    id: 'official-4',
    title: 'Balanced Lifestyle',
    category: 'balanced',
    description:
      'Work 9-5, gym 3x/week, hobbies on weekends, social time, self-care routines, 8-hour sleep',
    likes_count: 0,
    uses_count: 0,
  },
  {
    id: 'official-5',
    title: 'Entrepreneur Grind',
    category: 'work',
    description:
      'Early morning deep work, networking lunch, content creation, evening learning, strategic planning',
    likes_count: 0,
    uses_count: 0,
  },
];

const FILTER_OPTIONS = [
  { id: 'popular', label: 'Most Popular', icon: TrendingUp },
  { id: 'recent', label: 'Recently Added', icon: Clock },
];

const CATEGORY_FILTERS = ['All', 'Work', 'Fitness', 'Study', 'Balanced', 'Lifestyle'];

export default function TemplatesScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'official' | 'community'>('official');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [communityTemplates, setCommunityTemplates] = useState<CommunityTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    if (activeTab === 'community') {
      fetchCommunityTemplates();
      subscribeToTemplates();
    }
  }, [activeTab, sortBy, categoryFilter]);

  const fetchCommunityTemplates = async (loadMore = false) => {
    if (loading) return;

    try {
      setLoading(true);
      const currentPage = loadMore ? page + 1 : 0;

      let query = supabase
        .from('public_templates')
        .select(
          `
          id,
          routine_id,
          creator_display_name,
          routines!inner(
            title,
            description
          ),
          category,
          likes_count,
          uses_count,
          created_at
        `
        )
        .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

      // Apply category filter
      if (categoryFilter !== 'All') {
        query = query.eq('category', categoryFilter.toLowerCase());
      }

      // Apply sorting
      if (sortBy === 'popular') {
        query = query.order('likes_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data
      const templates: CommunityTemplate[] =
        data?.map((item: any) => ({
          id: item.id,
          routine_id: item.routine_id,
          title: item.routines.title,
          description: item.routines.description,
          category: item.category,
          creator_display_name: item.creator_display_name,
          likes_count: item.likes_count,
          uses_count: item.uses_count,
          created_at: item.created_at,
        })) || [];

      // Check if user has liked these templates
      if (user) {
        const { data: likes } = await supabase
          .from('template_likes')
          .select('template_id')
          .eq('user_id', user.id)
          .in(
            'template_id',
            templates.map((t) => t.id)
          );

        const likedIds = new Set(likes?.map((l) => l.template_id));
        templates.forEach((t) => {
          t.is_liked = likedIds.has(t.id);
        });
      }

      if (loadMore) {
        setCommunityTemplates([...communityTemplates, ...templates]);
        setPage(currentPage);
      } else {
        setCommunityTemplates(templates);
        setPage(0);
      }

      setHasMore(templates.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching templates:', error);
      Alert.alert('Error', 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToTemplates = () => {
    const channel = supabase
      .channel('public_templates_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'public_templates',
        },
        (payload) => {
          console.log('Template change:', payload);
          fetchCommunityTemplates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCommunityTemplates();
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && activeTab === 'community') {
      fetchCommunityTemplates(true);
    }
  };

  const handleLikeTemplate = async (templateId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to like templates');
      return;
    }

    try {
      const template = communityTemplates.find((t) => t.id === templateId);
      if (!template) return;

      if (template.is_liked) {
        // Unlike
        await supabase
          .from('template_likes')
          .delete()
          .eq('template_id', templateId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase.from('template_likes').insert({
          template_id: templateId,
          user_id: user.id,
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleUseTemplate = async (template: any) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to use templates');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // For official templates, just navigate to home with pre-filled text
    if (template.id.startsWith('official-')) {
      router.push({
        pathname: '/',
        params: { preFillText: template.description },
      });
      return;
    }

    // For community templates, copy the routine
    try {
      // Fetch full routine and schedules
      const { data: routine, error: routineError } = await supabase
        .from('routines')
        .select('*')
        .eq('id', template.routine_id)
        .single();

      if (routineError) throw routineError;

      const { data: schedules, error: schedulesError } = await supabase
        .from('schedules')
        .select('*')
        .eq('routine_id', template.routine_id);

      if (schedulesError) throw schedulesError;

      // Create new routine for user
      const { data: newRoutine, error: newRoutineError } = await supabase
        .from('routines')
        .insert({
          user_id: user.id,
          title: routine.title,
          description: routine.description,
        })
        .select()
        .single();

      if (newRoutineError) throw newRoutineError;

      // Copy schedules
      const newSchedules = schedules.map((s) => ({
        routine_id: newRoutine.id,
        day_of_week: s.day_of_week,
        time_slot: s.time_slot,
        activity: s.activity,
        duration: s.duration,
      }));

      const { error: schedulesInsertError } = await supabase
        .from('schedules')
        .insert(newSchedules);

      if (schedulesInsertError) throw schedulesInsertError;

      // Track usage
      await supabase.from('template_uses').insert({
        template_id: template.id,
        user_id: user.id,
      });

      // Show success
      Alert.alert(
        'Template Added!',
        'This routine has been added to your routines.',
        [
          { text: 'View Routine', onPress: () => router.push(`/routine/${newRoutine.id}`) },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      console.error('Error using template:', error);
      Alert.alert('Error', 'Failed to add template to your routines');
    }
  };

  const filteredTemplates =
    activeTab === 'official'
      ? OFFICIAL_TEMPLATES.filter(
          (t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : communityTemplates.filter(
          (t) =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.creator_display_name.toLowerCase().includes(searchQuery.toLowerCase())
        );

  return (
    <TabScreenWrapper>
      <View style={styles.container}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'official' && styles.tabActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('official');
          }}
        >
          <Text
            style={[styles.tabText, activeTab === 'official' && styles.tabTextActive]}
          >
            Official
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'community' && styles.tabActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('community');
          }}
        >
          <Text
            style={[styles.tabText, activeTab === 'community' && styles.tabTextActive]}
          >
            Community
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={TEXT_SECONDARY} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search templates..."
            placeholderTextColor={TEXT_SECONDARY}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters (Community only) */}
      {activeTab === 'community' && (
        <View style={styles.filtersContainer}>
          {/* Sort Filters */}
          <View style={styles.sortFilters}>
            {FILTER_OPTIONS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterChip,
                  sortBy === filter.id && styles.filterChipActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSortBy(filter.id as 'popular' | 'recent');
                }}
              >
                <filter.icon
                  size={16}
                  color={sortBy === filter.id ? WHITE : TEXT_SECONDARY}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    sortBy === filter.id && styles.filterChipTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryFilters}
          >
            {CATEGORY_FILTERS.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  categoryFilter === category && styles.categoryChipActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCategoryFilter(category);
                }}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    categoryFilter === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Templates List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={PRIMARY_ORANGE}
            colors={[PRIMARY_ORANGE]}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={8}
      >
        {filteredTemplates.map((template, index) => (
          <Animated.View
            key={template.id}
            entering={FadeInDown.duration(350)
              .delay(index * 60)
              .springify()
              .damping(14)
              .stiffness(130)}
          >
            <TemplateCard
              template={template}
              onUse={() => handleUseTemplate(template)}
              onLike={() => handleLikeTemplate(template.id)}
              showCreator={activeTab === 'community'}
            />
          </Animated.View>
        ))}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_ORANGE} />
          </View>
        )}

        {filteredTemplates.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No templates found</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'official'
                ? 'Try adjusting your search'
                : 'Be the first to share a template!'}
            </Text>
          </View>
        )}
        </ScrollView>
      </View>
    </TabScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    marginHorizontal: SPACING_LARGE,
    marginTop: Platform.OS === 'ios' ? 70 : 40,
    marginBottom: 12,
    padding: 4,
    borderRadius: BORDER_RADIUS,
    ...SHADOW,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: PRIMARY_ORANGE,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  tabTextActive: {
    color: WHITE,
  },
  searchContainer: {
    paddingHorizontal: SPACING_LARGE,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT_PRIMARY,
    fontFamily: 'Inter-Medium',
  },
  filtersContainer: {
    paddingHorizontal: SPACING_LARGE,
    marginBottom: 16,
  },
  sortFilters: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    ...SHADOW,
  },
  filterChipActive: {
    backgroundColor: PRIMARY_ORANGE,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  filterChipTextActive: {
    color: WHITE,
  },
  categoryFilters: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: WHITE,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: PRIMARY_ORANGE,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  categoryChipTextActive: {
    color: WHITE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING_LARGE,
    paddingBottom: 100,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
});
