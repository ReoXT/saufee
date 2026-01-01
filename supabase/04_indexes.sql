-- Database Indexes for Performance Optimization
-- Run this after creating the schema

-- =============================================
-- PRIMARY INDEXES FOR FOREIGN KEY LOOKUPS
-- =============================================

-- Index on users_metadata for user lookups
CREATE INDEX idx_users_metadata_user_id ON users_metadata(user_id);

-- Index on routines for user's routines
CREATE INDEX idx_routines_user_id ON routines(user_id);

-- Index for finding public routines
CREATE INDEX idx_routines_is_public ON routines(is_public) WHERE is_public = true;

-- Index for template routines
CREATE INDEX idx_routines_is_template ON routines(is_template) WHERE is_template = true;

-- Index for routines by category
CREATE INDEX idx_routines_category ON routines(category) WHERE category IS NOT NULL;

-- Composite index for public templates by category
CREATE INDEX idx_routines_public_category ON routines(is_public, category)
WHERE is_public = true AND category IS NOT NULL;

-- Index on schedules for routine lookups
CREATE INDEX idx_schedules_routine_id ON schedules(routine_id);

-- Index for schedules by day of week
CREATE INDEX idx_schedules_day_of_week ON schedules(day_of_week);

-- Composite index for schedules by routine and day
CREATE INDEX idx_schedules_routine_day ON schedules(routine_id, day_of_week);

-- Index on routine_analytics for routine lookups
CREATE INDEX idx_routine_analytics_routine_id ON routine_analytics(routine_id);

-- Index for analytics by date
CREATE INDEX idx_routine_analytics_date ON routine_analytics(date DESC);

-- Composite index for analytics by routine and date
CREATE INDEX idx_routine_analytics_routine_date ON routine_analytics(routine_id, date DESC);

-- Index on public_templates for routine lookups
CREATE INDEX idx_public_templates_routine_id ON public_templates(routine_id);

-- Index for featured templates
CREATE INDEX idx_public_templates_featured ON public_templates(featured) WHERE featured = true;

-- Index for verified templates
CREATE INDEX idx_public_templates_verified ON public_templates(verified) WHERE verified = true;

-- Index on template_likes for user lookups
CREATE INDEX idx_template_likes_user_id ON template_likes(user_id);

-- Index on template_likes for routine lookups
CREATE INDEX idx_template_likes_routine_id ON template_likes(routine_id);

-- Index on template_uses for user lookups
CREATE INDEX idx_template_uses_user_id ON template_uses(user_id);

-- Index on template_uses for routine lookups
CREATE INDEX idx_template_uses_routine_id ON template_uses(routine_id);

-- =============================================
-- INDEXES FOR SORTING AND RANKING
-- =============================================

-- Index for sorting routines by likes_count (descending)
CREATE INDEX idx_routines_likes_count ON routines(likes_count DESC)
WHERE is_public = true;

-- Index for sorting routines by uses_count (descending)
CREATE INDEX idx_routines_uses_count ON routines(uses_count DESC)
WHERE is_public = true;

-- Index for sorting routines by creation date (descending)
CREATE INDEX idx_routines_created_at ON routines(created_at DESC);

-- Composite index for popular public templates
CREATE INDEX idx_routines_public_popularity ON routines(is_public, likes_count DESC, uses_count DESC)
WHERE is_public = true;

-- =============================================
-- INDEXES FOR SUBSCRIPTION QUERIES
-- =============================================

-- Index for finding free tier users
CREATE INDEX idx_users_metadata_subscription_tier ON users_metadata(subscription_tier);

-- Index for finding users whose AI generations need reset
CREATE INDEX idx_users_metadata_reset_date ON users_metadata(ai_generations_reset_date)
WHERE subscription_tier = 'free';

-- =============================================
-- FULL-TEXT SEARCH INDEXES (Optional - for search functionality)
-- =============================================

-- Create GIN index for full-text search on routine titles and descriptions
-- Uncomment if you plan to implement search functionality

-- CREATE INDEX idx_routines_search ON routines
-- USING GIN (to_tsvector('english', title || ' ' || description))
-- WHERE is_public = true;

-- =============================================
-- ANALYZE TABLES FOR QUERY PLANNER
-- =============================================

-- Update statistics for the query planner
ANALYZE users_metadata;
ANALYZE routines;
ANALYZE schedules;
ANALYZE routine_analytics;
ANALYZE public_templates;
ANALYZE template_likes;
ANALYZE template_uses;
