-- =====================================================
-- SUPABASE STORAGE BUCKETS
-- =====================================================
-- This file creates storage buckets for user-uploaded content
-- Run this in Supabase SQL Editor after running 01-04 schema files

-- Create avatars bucket for user profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- NOTE: Storage RLS policies are automatically enabled for all storage tables
-- in modern Supabase. They are set up through the Storage dashboard interface.
--
-- STORAGE DASHBOARD CONFIGURATION REQUIRED:
-- 1. Go to Supabase Dashboard → Storage → Policies
-- 2. For bucket 'avatars', create the following policies:
--
-- Policy 1: "Avatar images are publicly accessible"
-- - Allow: SELECT
-- - For: (bucket_id = 'avatars')
--
-- Policy 2: "Users can upload their own avatar"
-- - Allow: INSERT
-- - For: (bucket_id = 'avatars')
-- - With check: (auth.uid()::text = (storage.foldername(name))[1])
--
-- Policy 3: "Users can update their own avatar"
-- - Allow: UPDATE
-- - For: (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
-- - With check: (auth.uid()::text = (storage.foldername(name))[1])
--
-- Policy 4: "Users can delete their own avatar"
-- - Allow: DELETE
-- - For: (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
--
-- FILE CONFIGURATION REQUIRED:
-- 1. Go to Storage → avatars bucket settings
-- 2. Set Max file size: 5 MB
-- 3. Allowed MIME types: image/jpeg, image/png, image/webp
