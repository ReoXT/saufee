-- Row Level Security (RLS) Policies
-- Run this after creating the schema to enable security

-- Enable RLS on all tables
ALTER TABLE users_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_uses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS_METADATA POLICIES
-- =============================================

-- Users can read their own metadata
CREATE POLICY "Users can view own metadata"
  ON users_metadata
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own metadata (on signup)
CREATE POLICY "Users can insert own metadata"
  ON users_metadata
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own metadata
CREATE POLICY "Users can update own metadata"
  ON users_metadata
  FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- ROUTINES POLICIES
-- =============================================

-- Users can view their own routines
CREATE POLICY "Users can view own routines"
  ON routines
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view public routines
CREATE POLICY "Anyone can view public routines"
  ON routines
  FOR SELECT
  USING (is_public = true);

-- Users can insert their own routines
CREATE POLICY "Users can insert own routines"
  ON routines
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own routines
CREATE POLICY "Users can update own routines"
  ON routines
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own routines
CREATE POLICY "Users can delete own routines"
  ON routines
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- SCHEDULES POLICIES
-- =============================================

-- Users can view schedules for their own routines
CREATE POLICY "Users can view own schedules"
  ON schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = schedules.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Users can view schedules for public routines
CREATE POLICY "Anyone can view public routine schedules"
  ON schedules
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = schedules.routine_id
      AND routines.is_public = true
    )
  );

-- Users can insert schedules for their own routines
CREATE POLICY "Users can insert schedules for own routines"
  ON schedules
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = schedules.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Users can update schedules for their own routines
CREATE POLICY "Users can update schedules for own routines"
  ON schedules
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = schedules.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Users can delete schedules for their own routines
CREATE POLICY "Users can delete schedules for own routines"
  ON schedules
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = schedules.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- =============================================
-- ROUTINE_ANALYTICS POLICIES
-- =============================================

-- Users can view analytics for their own routines
CREATE POLICY "Users can view own routine analytics"
  ON routine_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_analytics.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Users can insert analytics for their own routines
CREATE POLICY "Users can insert analytics for own routines"
  ON routine_analytics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_analytics.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Users can update analytics for their own routines
CREATE POLICY "Users can update analytics for own routines"
  ON routine_analytics
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_analytics.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Users can delete analytics for their own routines
CREATE POLICY "Users can delete analytics for own routines"
  ON routine_analytics
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = routine_analytics.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- =============================================
-- PUBLIC_TEMPLATES POLICIES
-- =============================================

-- Everyone can view public templates
CREATE POLICY "Anyone can view public templates"
  ON public_templates
  FOR SELECT
  USING (true);

-- Only premium users can publish templates
CREATE POLICY "Premium users can insert public templates"
  ON public_templates
  FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id
    AND EXISTS (
      SELECT 1 FROM users_metadata
      WHERE users_metadata.user_id = auth.uid()
      AND users_metadata.subscription_tier = 'premium'
    )
  );

-- Template creators can update their templates
CREATE POLICY "Creators can update own templates"
  ON public_templates
  FOR UPDATE
  USING (auth.uid() = creator_id);

-- Template creators can delete their templates
CREATE POLICY "Creators can delete own templates"
  ON public_templates
  FOR DELETE
  USING (auth.uid() = creator_id);

-- =============================================
-- TEMPLATE_LIKES POLICIES
-- =============================================

-- Users can view all likes
CREATE POLICY "Anyone can view template likes"
  ON template_likes
  FOR SELECT
  USING (true);

-- Authenticated users can like templates
CREATE POLICY "Authenticated users can like templates"
  ON template_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only unlike their own likes
CREATE POLICY "Users can delete own likes"
  ON template_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- TEMPLATE_USES POLICIES
-- =============================================

-- Users can view their own template uses
CREATE POLICY "Users can view own template uses"
  ON template_uses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Template creators can view uses of their templates
CREATE POLICY "Creators can view template uses"
  ON template_uses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = template_uses.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Authenticated users can record template uses
CREATE POLICY "Authenticated users can record template uses"
  ON template_uses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
