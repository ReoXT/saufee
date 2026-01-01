-- Database Triggers for Saufee
-- Run this after creating the schema and RLS policies

-- =============================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to users_metadata
CREATE TRIGGER update_users_metadata_updated_at
  BEFORE UPDATE ON users_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to routines
CREATE TRIGGER update_routines_updated_at
  BEFORE UPDATE ON routines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply to public_templates
CREATE TRIGGER update_public_templates_updated_at
  BEFORE UPDATE ON public_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TEMPLATE LIKES COUNT TRIGGERS
-- =============================================

-- Function to increment likes_count when a like is added
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE routines
  SET likes_count = likes_count + 1
  WHERE id = NEW.routine_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement likes_count when a like is removed
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE routines
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = OLD.routine_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT to template_likes
CREATE TRIGGER template_likes_insert_trigger
  AFTER INSERT ON template_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_likes_count();

-- Trigger on DELETE from template_likes
CREATE TRIGGER template_likes_delete_trigger
  AFTER DELETE ON template_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_likes_count();

-- =============================================
-- TEMPLATE USES COUNT TRIGGERS
-- =============================================

-- Function to increment uses_count when template is used
CREATE OR REPLACE FUNCTION increment_uses_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE routines
  SET uses_count = uses_count + 1
  WHERE id = NEW.routine_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT to template_uses
CREATE TRIGGER template_uses_insert_trigger
  AFTER INSERT ON template_uses
  FOR EACH ROW
  EXECUTE FUNCTION increment_uses_count();

-- =============================================
-- AUTO-CREATE USER METADATA ON SIGNUP
-- =============================================

-- Function to create user_metadata when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_metadata (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table (requires Supabase auth schema access)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- MONTHLY AI GENERATIONS RESET
-- =============================================

-- Function to reset AI generations for free tier users
CREATE OR REPLACE FUNCTION reset_ai_generations()
RETURNS void AS $$
BEGIN
  UPDATE users_metadata
  SET
    ai_generations_used = 0,
    ai_generations_reset_date = timezone('utc'::text, now())
  WHERE
    subscription_tier = 'free'
    AND ai_generations_reset_date <= timezone('utc'::text, now()) - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- Note: To run this automatically, you need to set up pg_cron extension
-- or call this function from your app/backend periodically.
-- Example with pg_cron (requires extension and proper permissions):
--
-- SELECT cron.schedule(
--   'reset-ai-generations',
--   '0 0 1 * *', -- First day of every month at midnight UTC
--   $$ SELECT reset_ai_generations(); $$
-- );

-- =============================================
-- PREVENT DELETION OF PUBLIC TEMPLATES WITH LIKES/USES
-- =============================================

-- Function to prevent deletion of popular templates
CREATE OR REPLACE FUNCTION prevent_popular_template_deletion()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_public = true AND (OLD.likes_count > 10 OR OLD.uses_count > 5) THEN
    RAISE EXCEPTION 'Cannot delete popular public template. Please unpublish it first.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check before deleting routines
CREATE TRIGGER check_template_deletion
  BEFORE DELETE ON routines
  FOR EACH ROW
  EXECUTE FUNCTION prevent_popular_template_deletion();
