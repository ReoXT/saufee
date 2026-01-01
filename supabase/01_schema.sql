-- Saufee Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Metadata Table
-- Stores additional user information beyond auth.users
CREATE TABLE users_metadata (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users UNIQUE NOT NULL,
  subscription_tier text CHECK (subscription_tier IN ('free', 'premium')) DEFAULT 'free',
  subscription_status text CHECK (subscription_status IN ('active', 'canceled', 'expired')) DEFAULT 'active',
  ai_generations_used integer DEFAULT 0,
  ai_generations_reset_date timestamp with time zone DEFAULT timezone('utc'::text, now()),
  display_name text,
  avatar_url text,
  notifications_settings jsonb DEFAULT '{"enabled": false, "advance_minutes": 15, "daily_digest": false, "daily_digest_time": "08:00", "completion_reminder": false, "completion_time": "21:00"}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Routines Table
-- Stores user-created routines and public templates
CREATE TABLE routines (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  is_template boolean DEFAULT false,
  is_public boolean DEFAULT false,
  category text,
  likes_count integer DEFAULT 0,
  uses_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Schedules Table
-- Stores individual scheduled activities for each routine
CREATE TABLE schedules (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id uuid REFERENCES routines ON DELETE CASCADE NOT NULL,
  day_of_week text NOT NULL,
  time_slot text NOT NULL,
  activity text NOT NULL,
  duration integer,
  notification_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Routine Analytics Table
-- Tracks completion rates and activity metrics
CREATE TABLE routine_analytics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id uuid REFERENCES routines ON DELETE CASCADE NOT NULL,
  completion_rate decimal,
  total_activities integer DEFAULT 0,
  completed_activities integer DEFAULT 0,
  date date NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Public Templates Table
-- Metadata for routines that are published as public templates
CREATE TABLE public_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id uuid REFERENCES routines UNIQUE NOT NULL,
  creator_id uuid REFERENCES auth.users NOT NULL,
  creator_display_name text,
  featured boolean DEFAULT false,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Template Likes Table
-- Tracks which users liked which templates
CREATE TABLE template_likes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users NOT NULL,
  routine_id uuid REFERENCES routines NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, routine_id)
);

-- Template Uses Table
-- Tracks when users copy/use templates
CREATE TABLE template_uses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users NOT NULL,
  routine_id uuid REFERENCES routines NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Comments Table (Optional - for future template feedback)
-- CREATE TABLE template_comments (
--   id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
--   routine_id uuid REFERENCES routines ON DELETE CASCADE NOT NULL,
--   user_id uuid REFERENCES auth.users NOT NULL,
--   comment text NOT NULL,
--   created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
-- );
