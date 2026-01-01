// TypeScript types for Saufee database schema
// Auto-generated types should match Supabase tables exactly

export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired';

export interface NotificationSettings {
  enabled: boolean;
  advance_minutes: number;
  daily_digest: boolean;
  daily_digest_time: string;
  completion_reminder: boolean;
  completion_time: string;
}

export interface UserMetadata {
  id: string;
  user_id: string;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  ai_generations_used: number;
  ai_generations_reset_date: string;
  display_name: string | null;
  avatar_url: string | null;
  notifications_settings: NotificationSettings;
  created_at: string;
  updated_at: string;
}

export interface Routine {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_template: boolean;
  is_public: boolean;
  category: string | null;
  likes_count: number;
  uses_count: number;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  routine_id: string;
  day_of_week: string;
  time_slot: string;
  activity: string;
  duration: number | null;
  notification_id: string | null;
  created_at: string;
}

export interface RoutineAnalytics {
  id: string;
  routine_id: string;
  completion_rate: number | null;
  total_activities: number;
  completed_activities: number;
  date: string;
  created_at: string;
}

export interface PublicTemplate {
  id: string;
  routine_id: string;
  creator_id: string;
  creator_display_name: string | null;
  featured: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateLike {
  id: string;
  user_id: string;
  routine_id: string;
  created_at: string;
}

export interface TemplateUse {
  id: string;
  user_id: string;
  routine_id: string;
  created_at: string;
}

// =============================================
// INSERT TYPES (for creating new records)
// =============================================

export type UserMetadataInsert = Omit<
  UserMetadata,
  'id' | 'created_at' | 'updated_at' | 'ai_generations_used' | 'ai_generations_reset_date' | 'subscription_tier' | 'subscription_status'
> & {
  id?: string;
  subscription_tier?: SubscriptionTier;
  subscription_status?: SubscriptionStatus;
  ai_generations_used?: number;
  ai_generations_reset_date?: string;
  notifications_settings?: NotificationSettings;
};

export type RoutineInsert = Omit<
  Routine,
  'id' | 'created_at' | 'updated_at' | 'likes_count' | 'uses_count' | 'is_template' | 'is_public'
> & {
  id?: string;
  is_template?: boolean;
  is_public?: boolean;
  category?: string | null;
};

export type ScheduleInsert = Omit<Schedule, 'id' | 'created_at'> & {
  id?: string;
  duration?: number | null;
  notification_id?: string | null;
};

export type RoutineAnalyticsInsert = Omit<
  RoutineAnalytics,
  'id' | 'created_at' | 'total_activities' | 'completed_activities'
> & {
  id?: string;
  total_activities?: number;
  completed_activities?: number;
  completion_rate?: number | null;
};

export type PublicTemplateInsert = Omit<
  PublicTemplate,
  'id' | 'created_at' | 'updated_at' | 'featured' | 'verified'
> & {
  id?: string;
  creator_display_name?: string | null;
  featured?: boolean;
  verified?: boolean;
};

export type TemplateLikeInsert = Omit<TemplateLike, 'id' | 'created_at'> & {
  id?: string;
};

export type TemplateUseInsert = Omit<TemplateUse, 'id' | 'created_at'> & {
  id?: string;
};

// =============================================
// UPDATE TYPES (for updating existing records)
// =============================================

export type UserMetadataUpdate = Partial<
  Omit<UserMetadata, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>;

export type RoutineUpdate = Partial<
  Omit<Routine, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>;

export type ScheduleUpdate = Partial<Omit<Schedule, 'id' | 'routine_id' | 'created_at'>>;

export type RoutineAnalyticsUpdate = Partial<
  Omit<RoutineAnalytics, 'id' | 'routine_id' | 'created_at'>
>;

export type PublicTemplateUpdate = Partial<
  Omit<PublicTemplate, 'id' | 'routine_id' | 'creator_id' | 'created_at' | 'updated_at'>
>;

// =============================================
// JOIN TYPES (for queries with related data)
// =============================================

export interface RoutineWithSchedules extends Routine {
  schedules: Schedule[];
}

export interface RoutineWithAnalytics extends Routine {
  analytics: RoutineAnalytics[];
}

export interface PublicTemplateWithRoutine extends PublicTemplate {
  routine: Routine;
  schedules?: Schedule[];
}

export interface RoutineWithTemplateInfo extends Routine {
  public_template?: PublicTemplate;
  user_liked?: boolean;
  schedules?: Schedule[];
}

// =============================================
// DATABASE TYPE (for Supabase client)
// =============================================

export interface Database {
  public: {
    Tables: {
      users_metadata: {
        Row: UserMetadata;
        Insert: UserMetadataInsert;
        Update: UserMetadataUpdate;
      };
      routines: {
        Row: Routine;
        Insert: RoutineInsert;
        Update: RoutineUpdate;
      };
      schedules: {
        Row: Schedule;
        Insert: ScheduleInsert;
        Update: ScheduleUpdate;
      };
      routine_analytics: {
        Row: RoutineAnalytics;
        Insert: RoutineAnalyticsInsert;
        Update: RoutineAnalyticsUpdate;
      };
      public_templates: {
        Row: PublicTemplate;
        Insert: PublicTemplateInsert;
        Update: PublicTemplateUpdate;
      };
      template_likes: {
        Row: TemplateLike;
        Insert: TemplateLikeInsert;
        Update: never;
      };
      template_uses: {
        Row: TemplateUse;
        Insert: TemplateUseInsert;
        Update: never;
      };
    };
  };
}
