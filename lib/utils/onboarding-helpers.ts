import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'HAS_COMPLETED_ONBOARDING';

/**
 * Check if user has completed onboarding
 * @returns Promise<boolean> - true if onboarding completed, false otherwise
 */
export const hasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Mark onboarding as completed
 * @returns Promise<void>
 */
export const completeOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch (error) {
    console.error('Error saving onboarding status:', error);
    throw error;
  }
};

/**
 * Reset onboarding status (for testing purposes)
 * @returns Promise<void>
 */
export const resetOnboarding = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  } catch (error) {
    console.error('Error resetting onboarding status:', error);
    throw error;
  }
};
