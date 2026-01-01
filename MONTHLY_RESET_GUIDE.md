# Monthly AI Generation Reset - Implementation Guide

This guide shows you how to automatically reset AI generations for free-tier users every month using Supabase Edge Functions.

## Option B: Supabase Edge Function (Recommended for Free Plan)

### What You'll Build
A serverless function that runs automatically on the 1st of each month to reset AI generation counts for all free-tier users.

---

## Step 1: Install Supabase CLI

First, install the Supabase CLI on your computer:

**Windows:**
```bash
npm install -g supabase
```

**Mac/Linux:**
```bash
npm install -g supabase
```

Verify installation:
```bash
supabase --version
```

---

## Step 2: Link Your Project to Supabase

1. Navigate to your project directory:
```bash
cd Saufee
```

2. Login to Supabase:
```bash
supabase login
```
This will open your browser. Follow the instructions to authenticate.

3. Link to your Supabase project:
```bash
supabase link --project-ref your-project-ref
```

**How to find your project-ref:**
- Go to your Supabase dashboard
- Click on "Project Settings" (gear icon)
- Look for "Reference ID" - it's a string like `abcdefghijklmnop`

When prompted, enter your database password (the one you created when setting up the project).

---

## Step 3: Create the Edge Function

1. Create a new Edge Function:
```bash
supabase functions new reset-ai-generations
```

This creates a folder: `supabase/functions/reset-ai-generations/`

2. Open the file `supabase/functions/reset-ai-generations/index.ts` and replace its contents with:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

serve(async (req) => {
  try {
    // Verify this is a scheduled request or has proper authorization
    const authHeader = req.headers.get('Authorization');

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the reset function
    const { data, error } = await supabase.rpc('reset_ai_generations');

    if (error) {
      console.error('Error resetting AI generations:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get count of users that were reset
    const { count } = await supabase
      .from('users_metadata')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_tier', 'free')
      .eq('ai_generations_used', 0);

    console.log(`Successfully reset AI generations for ${count} free-tier users`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Reset AI generations for ${count} free-tier users`,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});
```

---

## Step 4: Deploy the Edge Function

Deploy the function to Supabase:

```bash
supabase functions deploy reset-ai-generations
```

You should see output like:
```
Deploying reset-ai-generations (project ref: abcdefghijklmnop)
Deployed reset-ai-generations
```

---

## Step 5: Set Up Automatic Scheduling

Now you need to schedule this function to run automatically. There are two ways:

### Method A: Using GitHub Actions (Recommended)

1. Create a GitHub repository for your Saufee project (if you haven't already)

2. In your project root, create `.github/workflows/reset-ai-generations.yml`:

```yaml
name: Reset AI Generations Monthly

on:
  schedule:
    # Runs at 00:00 UTC on the 1st of every month
    - cron: '0 0 1 * *'
  workflow_dispatch: # Allows manual triggering for testing

jobs:
  reset:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Edge Function
        run: |
          curl -X POST \
            'https://your-project-ref.supabase.co/functions/v1/reset-ai-generations' \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
```

3. Add your Supabase credentials to GitHub Secrets:
   - Go to your GitHub repository
   - Click **Settings** > **Secrets and variables** > **Actions**
   - Click **New repository secret**
   - Add: `SUPABASE_ANON_KEY` (your anon key from Supabase)

4. Replace `your-project-ref` in the workflow file with your actual project reference ID

5. Commit and push the workflow file to GitHub

### Method B: Using a Cron Job Service (e.g., cron-job.org)

1. Go to https://cron-job.org (or similar service like EasyCron)
2. Create a free account
3. Create a new cron job:
   - **Title**: Reset Saufee AI Generations
   - **URL**: `https://your-project-ref.supabase.co/functions/v1/reset-ai-generations`
   - **Schedule**: `0 0 1 * *` (1st day of month at midnight)
   - **Request Method**: POST
   - **Headers**: Add header `Authorization: Bearer your-supabase-anon-key`
4. Save and enable the job

### Method C: Using Supabase Webhooks + External Scheduler

1. Use a service like Zapier or Make.com
2. Set up a monthly trigger (1st of each month)
3. Configure it to make a POST request to:
   ```
   https://your-project-ref.supabase.co/functions/v1/reset-ai-generations
   ```
   With header: `Authorization: Bearer your-supabase-anon-key`

---

## Step 6: Test the Function

Before waiting a month, test that it works:

### Test from Command Line:

```bash
curl -X POST \
  'https://your-project-ref.supabase.co/functions/v1/reset-ai-generations' \
  -H "Authorization: Bearer your-supabase-anon-key" \
  -H "Content-Type: application/json"
```

Replace:
- `your-project-ref` with your actual project reference ID
- `your-supabase-anon-key` with your actual anon key

### Test from GitHub Actions (if using Method A):

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click on "Reset AI Generations Monthly" workflow
4. Click **Run workflow** > **Run workflow**
5. Check the logs to see if it succeeded

### Expected Response:

```json
{
  "success": true,
  "message": "Reset AI generations for X free-tier users",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

---

## Step 7: Monitor and Verify

### Check Edge Function Logs:

1. Go to your Supabase dashboard
2. Click **Edge Functions** in the sidebar
3. Click on `reset-ai-generations`
4. View **Logs** tab to see execution history

### Verify Resets Are Working:

Run this in Supabase SQL Editor to check when users were last reset:

```sql
SELECT
  display_name,
  subscription_tier,
  ai_generations_used,
  ai_generations_reset_date
FROM users_metadata
WHERE subscription_tier = 'free'
ORDER BY ai_generations_reset_date DESC
LIMIT 10;
```

---

## Troubleshooting

### Error: "Failed to deploy function"
- Make sure Supabase CLI is properly linked: `supabase link --project-ref your-ref`
- Check you're logged in: `supabase login`

### Error: "relation 'users_metadata' does not exist"
- Make sure you ran all the SQL migration files first (01_schema.sql, etc.)

### Error: "function 'reset_ai_generations' does not exist"
- Run `supabase/03_triggers.sql` which creates this function

### Cron job not triggering:
- Verify the cron expression is correct: `0 0 1 * *`
- Check GitHub Actions logs or cron service logs for errors
- Test manually first to ensure the Edge Function works

### Users not being reset:
- Check the `ai_generations_reset_date` - function only resets users whose last reset was over 1 month ago
- Verify users have `subscription_tier = 'free'`

---

## Alternative: Simple Approach Without Edge Functions

If Edge Functions seem too complex, you can also:

1. Create a simple backend API endpoint (Node.js, Python, etc.)
2. Use a cron job to call your own backend
3. Your backend calls Supabase RPC function:

```typescript
// Example with Node.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key
);

async function resetAIGenerations() {
  const { data, error } = await supabase.rpc('reset_ai_generations');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Successfully reset AI generations');
  }
}

// Call this from a cron job or scheduled task
resetAIGenerations();
```

---

## Cost Considerations

- **Edge Functions**: Free tier includes 500,000 invocations/month (way more than needed for monthly resets)
- **GitHub Actions**: Free for public repositories, 2000 minutes/month for private
- **External Cron Services**: Most have free tiers sufficient for monthly tasks

---

## Summary

You now have automatic monthly AI generation resets! The system will:
1. Run on the 1st of every month at midnight UTC
2. Reset `ai_generations_used` to 0 for all free-tier users
3. Update their `ai_generations_reset_date`
4. Log the results for monitoring

Choose the scheduling method that works best for you (GitHub Actions is recommended for simplicity).
