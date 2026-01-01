# Supabase Database Setup Guide

This guide walks you through setting up the Supabase database for Saufee.

## Prerequisites
- A Supabase account (sign up at https://supabase.com)
- Access to the Supabase SQL Editor

## Step 1: Create a New Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Fill in the details:
   - **Name**: Saufee (or your preferred name)
   - **Database Password**: Create a strong password (save this securely)
   - **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be created (takes 1-2 minutes)

## Step 2: Get Your API Credentials

1. Once the project is created, go to **Project Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

4. Open the `.env` file in your project root and replace the placeholders:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
   ```

## Step 3: Run SQL Scripts in Order

Go to the **SQL Editor** in your Supabase dashboard (database icon with "SQL" label in sidebar).

### 3.1 Create Database Schema (Tables)

1. Click "New query" or the "+" button
2. Open the file `supabase/01_schema.sql` in your code editor
3. Copy the entire contents of the file
4. Paste it into the Supabase SQL Editor
5. Click "Run" or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
6. You should see "Success. No rows returned" - this is correct!

**What this does:**
- Creates 7 tables: users_metadata, routines, schedules, routine_analytics, public_templates, template_likes, template_uses
- Sets up proper relationships between tables

### 3.2 Enable Row Level Security (RLS)

1. Create a new query in the SQL Editor
2. Open the file `supabase/02_rls_policies.sql`
3. Copy the entire contents
4. Paste it into the SQL Editor
5. Click "Run"
6. You should see "Success. No rows returned"

**What this does:**
- Enables Row Level Security on all tables
- Creates policies so users can only access their own data
- Allows public access to public templates
- Restricts template publishing to premium users only

### 3.3 Create Database Triggers

1. Create a new query in the SQL Editor
2. Open the file `supabase/03_triggers.sql`
3. Copy the entire contents
4. Paste it into the SQL Editor
5. Click "Run"
6. You should see "Success. No rows returned"

**What this does:**
- Auto-updates timestamps when records are modified
- Auto-increments/decrements like and use counts
- Creates user_metadata automatically when users sign up
- Prevents deletion of popular templates
- Sets up monthly AI generation reset function

### 3.4 Create Performance Indexes

1. Create a new query in the SQL Editor
2. Open the file `supabase/04_indexes.sql`
3. Copy the entire contents
4. Paste it into the SQL Editor
5. Click "Run"
6. You should see "Success. No rows returned"

**What this does:**
- Creates indexes for fast database queries
- Optimizes searches for user routines, public templates, and analytics

## Step 4: Verify Everything is Set Up Correctly

### Check Tables Were Created

1. In Supabase dashboard, go to **Table Editor** (table icon in sidebar)
2. You should see all 7 tables:
   - users_metadata
   - routines
   - schedules
   - routine_analytics
   - public_templates
   - template_likes
   - template_uses

### Check RLS is Enabled

1. Click on any table in the Table Editor
2. Click the "RLS" or "Policies" tab
3. You should see "Row Level Security is enabled" with multiple policies listed

## Step 5: Enable Email Authentication (Optional but Recommended)

1. Go to **Authentication** > **Providers** in the sidebar
2. Find "Email" and make sure it's enabled
3. Configure email settings:
   - Enable "Confirm email" if you want email verification
   - Customize email templates if desired

## Step 6: Test the Connection

Once you've updated your `.env` file with the correct credentials, you can test the connection:

1. Start your Expo app:
   ```bash
   npx expo start
   ```

2. The app should be able to connect to Supabase without errors

## Optional: Set Up Monthly AI Generation Reset (Advanced)

The trigger function `reset_ai_generations()` was created in Step 3.3, but it needs to be scheduled to run automatically.

### Option A: Use pg_cron (Requires Supabase Pro Plan)

1. Go to **Database** > **Extensions**
2. Enable the `pg_cron` extension
3. Go to SQL Editor and run:
   ```sql
   SELECT cron.schedule(
     'reset-ai-generations',
     '0 0 1 * *',  -- First day of every month at midnight UTC
     $$ SELECT reset_ai_generations(); $$
   );
   ```

### Option B: Call from Your Backend/Edge Function

Create a scheduled Edge Function or call the function from your backend on the 1st of each month:
```typescript
const { data, error } = await supabase.rpc('reset_ai_generations');
```

### Option C: Manual Reset (Development)

During development, you can manually reset by running this in SQL Editor:
```sql
SELECT reset_ai_generations();
```

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran `01_schema.sql` first
- Check that the query executed successfully without errors

### Error: "permission denied"
- Make sure you're logged into the correct Supabase project
- Try running the scripts again in order

### Error: "function does not exist"
- Make sure you ran `03_triggers.sql`
- Check that all trigger functions were created successfully

### RLS Policies Not Working
- Verify RLS is enabled on all tables
- Check that you ran `02_rls_policies.sql` completely
- Test with actual authenticated users (RLS only applies to authenticated requests)

## Next Steps

After completing this setup:

1. ✅ Your database is ready to use
2. ✅ Security policies are in place
3. ✅ Performance is optimized
4. Update the other environment variables in `.env`:
   - `EXPO_PUBLIC_ANTHROPIC_API_KEY` (for AI generation)
   - `EXPO_PUBLIC_REVENUECAT_APPLE_KEY` (for iOS payments)
   - `EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY` (for Android payments)

You're now ready to start building the Saufee app features!

## Database Schema Reference

Quick reference for the table structure:

- **users_metadata**: User profiles, subscription info, AI usage limits
- **routines**: User-created routines and templates
- **schedules**: Individual activities within routines
- **routine_analytics**: Completion tracking and statistics
- **public_templates**: Marketplace for shared routines
- **template_likes**: User likes on public templates
- **template_uses**: Tracking template adoption

For detailed TypeScript types, see `types/database.types.ts`.
