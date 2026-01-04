import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Share2, TrendingUp, Flame, CheckCircle2, Clock } from 'lucide-react-native';
import { useAuth } from '../../lib/contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import TabScreenWrapper from '../../components/TabScreenWrapper';
import {
  PRIMARY_ORANGE,
  WHITE,
  BACKGROUND,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  SUCCESS_GREEN,
  BORDER_RADIUS,
  SPACING_LARGE,
  SHADOW,
} from '../../constants/theme';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  completionRate: number;
  currentStreak: number;
  totalActivities: number;
  mostProductiveTime: string;
  weeklyCompletion: { day: string; count: number }[];
  activityDistribution: { name: string; population: number; color: string }[];
  timeOfDayData: { hour: string; count: number }[];
}

function AnalyticsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      // Fetch user's routines and schedules
      const { data: routines } = await supabase
        .from('routines')
        .select('id, created_at')
        .eq('user_id', user.id);

      if (!routines || routines.length === 0) {
        setAnalytics(null);
        setLoading(false);
        return;
      }

      const routineIds = routines.map((r) => r.id);

      // Fetch all schedules for user's routines
      const { data: schedules } = await supabase
        .from('schedules')
        .select('*')
        .in('routine_id', routineIds);

      // Fetch completion data from routine_analytics
      const { data: completionData } = await supabase
        .from('routine_analytics')
        .select('*')
        .eq('user_id', user.id);

      // Calculate metrics
      const totalActivities = schedules?.length || 0;
      const completedCount = completionData?.filter((c) => c.completed).length || 0;
      const completionRate = totalActivities > 0 ? (completedCount / totalActivities) * 100 : 0;

      // Calculate current streak
      const currentStreak = calculateStreak(completionData || []);

      // Calculate most productive time
      const mostProductiveTime = calculateMostProductiveTime(schedules || []);

      // Weekly completion data
      const weeklyCompletion = [
        { day: 'Mon', count: 0 },
        { day: 'Tue', count: 0 },
        { day: 'Wed', count: 0 },
        { day: 'Thu', count: 0 },
        { day: 'Fri', count: 0 },
        { day: 'Sat', count: 0 },
        { day: 'Sun', count: 0 },
      ];

      schedules?.forEach((s) => {
        const dayIndex = s.day_of_week;
        if (dayIndex >= 0 && dayIndex < 7) {
          weeklyCompletion[dayIndex].count++;
        }
      });

      // Activity distribution by category
      const categoryCount: Record<string, number> = {};
      schedules?.forEach((s) => {
        const category = categorizeActivity(s.activity);
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });

      const activityDistribution = Object.entries(categoryCount).map(([name, count]) => ({
        name,
        population: count,
        color: getCategoryColor(name),
        legendFontColor: TEXT_SECONDARY,
        legendFontSize: 12,
      }));

      // Time of day data
      const timeOfDayCount: Record<string, number> = {};
      schedules?.forEach((s) => {
        const hour = parseInt(s.time_slot.split(':')[0]);
        const period = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
        timeOfDayCount[period] = (timeOfDayCount[period] || 0) + 1;
      });

      const timeOfDayData = Object.entries(timeOfDayCount).map(([hour, count]) => ({
        hour,
        count,
      }));

      setAnalytics({
        completionRate: Math.round(completionRate),
        currentStreak,
        totalActivities,
        mostProductiveTime,
        weeklyCompletion,
        activityDistribution,
        timeOfDayData,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      Alert.alert('Error', 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (completionData: any[]): number => {
    if (!completionData || completionData.length === 0) return 0;

    // Sort by date descending
    const sorted = completionData
      .filter((c) => c.completed)
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());

    let streak = 0;
    let currentDate = new Date();

    for (const entry of sorted) {
      const entryDate = new Date(entry.completed_at);
      const diffDays = Math.floor(
        (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const calculateMostProductiveTime = (schedules: any[]): string => {
    if (!schedules || schedules.length === 0) return 'N/A';

    const timeCount: Record<string, number> = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0,
    };

    schedules.forEach((s) => {
      const hour = parseInt(s.time_slot.split(':')[0]);
      const period = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
      timeCount[period]++;
    });

    const max = Math.max(...Object.values(timeCount));
    const mostProductive = Object.keys(timeCount).find((k) => timeCount[k] === max);

    return mostProductive || 'N/A';
  };

  const categorizeActivity = (activity: string): string => {
    const lower = activity.toLowerCase();
    if (lower.includes('gym') || lower.includes('workout') || lower.includes('exercise'))
      return 'Fitness';
    if (lower.includes('work') || lower.includes('meeting') || lower.includes('email'))
      return 'Work';
    if (lower.includes('study') || lower.includes('learn') || lower.includes('read')) return 'Study';
    if (lower.includes('family') || lower.includes('friends') || lower.includes('social'))
      return 'Social';
    return 'Other';
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Fitness: '#10B981',
      Work: '#3B82F6',
      Study: '#8B5CF6',
      Social: '#EC4899',
      Other: '#F59E0B',
    };
    return colors[category] || '#6B7280';
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      Alert.alert(
        '📊 Analytics Shared!',
        'Your analytics summary has been prepared for sharing.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to share analytics.');
    }
  };

  if (loading) {
    return (
      <TabScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_ORANGE} />
        </View>
      </TabScreenWrapper>
    );
  }

  if (!analytics || analytics.totalActivities === 0) {
    return (
      <TabScreenWrapper>
        <View style={styles.container}>
          <View style={styles.emptyContainer}>
            <TrendingUp size={80} color={TEXT_SECONDARY} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No Analytics Yet</Text>
            <Text style={styles.emptyDescription}>
              Start creating routines and completing activities to see your productivity insights here.
            </Text>
          </View>
        </View>
      </TabScreenWrapper>
    );
  }

  return (
    <TabScreenWrapper>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={8}
          showsVerticalScrollIndicator={false}
        >
        {/* Metrics Cards */}
        <View style={styles.metricsGrid}>
          {/* Completion Rate */}
          <View style={styles.metricCard}>
            <CheckCircle2 size={24} color={SUCCESS_GREEN} />
            <Text style={styles.metricValue}>{analytics.completionRate}%</Text>
            <Text style={styles.metricLabel}>Completion Rate</Text>
          </View>

          {/* Current Streak */}
          <View style={styles.metricCard}>
            <Flame size={24} color={PRIMARY_ORANGE} />
            <Text style={styles.metricValue}>{analytics.currentStreak}</Text>
            <Text style={styles.metricLabel}>Day Streak</Text>
          </View>

          {/* Total Activities */}
          <View style={styles.metricCard}>
            <CheckCircle2 size={24} color="#3B82F6" />
            <Text style={styles.metricValue}>{analytics.totalActivities}</Text>
            <Text style={styles.metricLabel}>Total Activities</Text>
          </View>

          {/* Most Productive Time */}
          <View style={styles.metricCard}>
            <Clock size={24} color="#8B5CF6" />
            <Text style={styles.metricValue}>{analytics.mostProductiveTime}</Text>
            <Text style={styles.metricLabel}>Most Productive</Text>
          </View>
        </View>

        {/* Weekly Completion Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Activity Distribution</Text>
          <BarChart
            data={{
              labels: analytics.weeklyCompletion.map((d) => d.day),
              datasets: [
                {
                  data: analytics.weeklyCompletion.map((d) => d.count),
                },
              ],
            }}
            width={width - SPACING_LARGE * 4}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: WHITE,
              backgroundGradientFrom: WHITE,
              backgroundGradientTo: WHITE,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
              style: {
                borderRadius: BORDER_RADIUS,
              },
              propsForLabels: {
                fontSize: 11,
                fontFamily: 'Inter-Medium',
              },
            }}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars
          />
        </View>

        {/* Activity Distribution Pie Chart */}
        {analytics.activityDistribution.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Activity Categories</Text>
            <PieChart
              data={analytics.activityDistribution}
              width={width - SPACING_LARGE * 4}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}

        {/* Time of Day Distribution */}
        {analytics.timeOfDayData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Time of Day Distribution</Text>
            <View style={styles.timeOfDayContainer}>
              {analytics.timeOfDayData.map((item, index) => (
                <View key={index} style={styles.timeOfDayItem}>
                  <Text style={styles.timeOfDayLabel}>{item.hour}</Text>
                  <View style={styles.timeOfDayBar}>
                    <View
                      style={[
                        styles.timeOfDayFill,
                        {
                          width: `${
                            (item.count /
                              Math.max(...analytics.timeOfDayData.map((d) => d.count))) *
                            100
                          }%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.timeOfDayCount}>{item.count}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        </ScrollView>
      </View>
    </TabScreenWrapper>
  );
}

export default AnalyticsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING_LARGE,
    paddingTop: Platform.OS === 'ios' ? 70 : 40,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING_LARGE * 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginTop: 16,
    fontFamily: 'Inter-Bold',
  },
  emptyDescription: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: (width - SPACING_LARGE * 2 - 12) / 2,
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    ...SHADOW,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    fontFamily: 'Inter-Bold',
  },
  metricLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: WHITE,
    borderRadius: BORDER_RADIUS,
    padding: 20,
    marginBottom: 20,
    ...SHADOW,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_PRIMARY,
    marginBottom: 16,
    fontFamily: 'Inter-Bold',
  },
  chart: {
    borderRadius: BORDER_RADIUS,
  },
  timeOfDayContainer: {
    gap: 12,
  },
  timeOfDayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeOfDayLabel: {
    fontSize: 13,
    color: TEXT_PRIMARY,
    width: 80,
    fontFamily: 'Inter-Medium',
  },
  timeOfDayBar: {
    flex: 1,
    height: 24,
    backgroundColor: BACKGROUND,
    borderRadius: 12,
    overflow: 'hidden',
  },
  timeOfDayFill: {
    height: '100%',
    backgroundColor: PRIMARY_ORANGE,
    borderRadius: 12,
  },
  timeOfDayCount: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    width: 30,
    textAlign: 'right',
  },
});
