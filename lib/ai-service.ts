import { supabase } from './supabase';
import {
  GenerateScheduleResult,
  OptimizeScheduleResult,
} from '../types/ai.types';

/**
 * Generate a structured schedule from natural language description
 * Calls Supabase Edge Function to securely use Gemini API
 */
export async function generateSchedule(
  brainDump: string,
  userId: string
): Promise<GenerateScheduleResult> {
  try {
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('generate-schedule', {
      body: {
        brainDump,
        userId,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    // Return the response from the edge function
    return data as GenerateScheduleResult;
  } catch (error: any) {
    console.error('Generate schedule error:', error);

    // Handle network errors
    if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect. Check internet and try again.',
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred. Please try again.',
      },
    };
  }
}

/**
 * Optimize an existing schedule with AI suggestions
 * Calls Supabase Edge Function to securely use Gemini API
 */
export async function optimizeSchedule(
  routineId: string,
  userId: string
): Promise<OptimizeScheduleResult> {
  try {
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('optimize-schedule', {
      body: {
        routineId,
        userId,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      throw error;
    }

    // Return the response from the edge function
    return data as OptimizeScheduleResult;
  } catch (error: any) {
    console.error('Optimize schedule error:', error);

    // Handle network errors
    if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect. Check internet and try again.',
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred. Please try again.',
      },
    };
  }
}

/**
 * Get user's remaining AI generations (unlimited for all users)
 */
export async function getRemainingGenerations(
  userId: string
): Promise<{ remaining: number; total: number }> {
  // All users now have unlimited AI generations
  return { remaining: -1, total: -1 };
}
