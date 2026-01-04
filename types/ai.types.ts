export interface Schedule {
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  time_slot: string; // HH:MM format
  activity: string;
  duration: number; // in minutes
}

export interface RoutineResponse {
  routineId: string;
  title: string;
  schedules: Schedule[];
}

export interface OptimizationSuggestion {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface OptimizationResponse {
  suggestions: OptimizationSuggestion[];
}

export interface GenerateScheduleResult {
  success: boolean;
  data?: RoutineResponse;
  error?: {
    code: string;
    message: string;
  };
}

export interface OptimizeScheduleResult {
  success: boolean;
  data?: OptimizationResponse;
  error?: {
    code: string;
    message: string;
  };
}
