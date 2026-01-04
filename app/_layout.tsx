import { useEffect, useState, useRef } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../lib/contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import SaufeeLogo from '../components/SaufeeLogo';
import { PRIMARY_ORANGE, BACKGROUND } from '../constants/theme';
import { requestPermissions } from '../services/notification-service';
import { hasCompletedOnboarding as checkOnboardingStatus } from '../lib/utils/onboarding-helpers';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const notificationListener = useRef<ReturnType<typeof Notifications.addNotificationReceivedListener> | null>(null);
  const responseListener = useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null>(null);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
          'Inter-Black': require('../assets/fonts/Inter-Black.ttf'),
        });
      } catch (e) {
        console.warn('Error loading fonts:', e);
      } finally {
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  // Check if user has completed onboarding
  useEffect(() => {
    if (user) {
      loadOnboardingStatus();
    } else {
      // Reset onboarding status when user logs out
      setHasCompletedOnboarding(null);
    }
  }, [user]);

  const loadOnboardingStatus = async () => {
    const completed = await checkOnboardingStatus();
    setHasCompletedOnboarding(completed);
  };

  // Re-check onboarding status when navigating to tabs
  useEffect(() => {
    if (segments[0] === '(tabs)' && user) {
      loadOnboardingStatus();
    }
  }, [segments, user]);

  // Request notification permissions on app start
  useEffect(() => {
    if (user) {
      requestPermissions().then((granted) => {
        if (granted) {
          console.log('Notification permissions granted');
        } else {
          console.log('Notification permissions denied');
        }
      });
    }
  }, [user]);

  // Set up notification listeners
  useEffect(() => {
    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Listener for user tapping on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;

      if (data.type === 'activity_reminder' && data.activityId) {
        // Navigate to the routine containing this activity
        // We'll need to fetch the routine ID from the schedule
        console.log('User tapped activity reminder:', data.activityId);
        // TODO: Navigate to routine detail screen
      } else if (data.type === 'daily_digest') {
        // Navigate to home/routines screen
        router.push('/(tabs)');
      } else if (data.type === 'completion_reminder') {
        // Navigate to analytics or home screen
        router.push('/(tabs)/analytics');
      }
    });

    return () => {
      // Unsubscribe from notification listeners
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (loading || !fontsLoaded || hasCompletedOnboarding === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // User is authenticated and in auth screens
      if (!hasCompletedOnboarding && !inOnboarding) {
        // First-time user, redirect to onboarding
        router.replace('/onboarding');
      } else if (hasCompletedOnboarding) {
        // Returning user, redirect to home
        router.replace('/(tabs)');
      }
    } else if (user && !hasCompletedOnboarding && !inOnboarding && !inTabs) {
      // Authenticated user who hasn't completed onboarding and not on onboarding/tabs screen
      router.replace('/onboarding');
    }
  }, [user, segments, loading, fontsLoaded, hasCompletedOnboarding]);

  useEffect(() => {
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync();

      // Show custom splash for 1.5 seconds
      setTimeout(() => {
        setShowSplash(false);
      }, 1500);
    }
  }, [fontsLoaded, loading]);

  if (loading || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BACKGROUND }}>
        <ActivityIndicator size="large" color={PRIMARY_ORANGE} />
      </View>
    );
  }

  if (showSplash) {
    return (
      <Animated.View
        style={styles.splashContainer}
        exiting={FadeOut.duration(400)}
      >
        <Animated.View entering={FadeIn.duration(600).delay(200)}>
          <SaufeeLogo size={100} />
        </Animated.View>
      </Animated.View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="routine/[id]" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
