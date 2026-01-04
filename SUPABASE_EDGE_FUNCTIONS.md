# Supabase Edge Functions Setup Guide

This guide explains how to set up and deploy the Supabase Edge Functions for the Saufee app, which securely handle Google Gemini AI API calls.

## Overview

The app uses two edge functions to handle AI operations:
- `generate-schedule`: Generates a weekly schedule from natural language descriptions (using `gemini-1.5-flash`)
- `optimize-schedule`: Provides AI-powered optimization suggestions for existing schedules (using `gemini-1.5-flash`)

These edge functions ensure that the Google Gemini API key is **never exposed** to the client application.

## Prerequisites

1. [Supabase CLI](https://supabase.com/docs/guides/cli) installed
2. [Deno](https://deno.land/) installed (required for local testing)
3. Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
4. Supabase project credentials

## Setup Instructions

### Step 1: Install Supabase CLI

If you haven't already installed the Supabase CLI:

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or use npm
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication.

### Step 3: Link Your Project

Navigate to your project directory and link it to your Supabase project:

```bash
cd Saufee
supabase link --project-ref zqgjytltolcqmyoyolvj
```

You'll be prompted for your database password.

### Step 4: Set Supabase Secrets

Set the Google Gemini API key as a secret in Supabase:

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here
```

**Important**: Replace `your_gemini_api_key_here` with your actual Google Gemini API key.

To verify secrets are set:

```bash
supabase secrets list
```

### Step 5: Deploy Edge Functions

Deploy both edge functions to Supabase:

```bash
# Deploy generate-schedule function
supabase functions deploy generate-schedule

# Deploy optimize-schedule function
supabase functions deploy optimize-schedule
```

To deploy all functions at once:

```bash
supabase functions deploy
```

### Step 6: Verify Deployment

Check that your functions are deployed:

```bash
supabase functions list
```

You should see both `generate-schedule` and `optimize-schedule` listed.

## Local Testing (Optional)

To test edge functions locally before deploying:

### Step 1: Create Local .env File

Create a `.env` file in `supabase/functions/.env`:

```bash
SUPABASE_URL=https://zqgjytltolcqmyoyolvj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

**Never commit this file to version control!**

### Step 2: Serve Functions Locally

```bash
supabase functions serve generate-schedule --env-file supabase/functions/.env
```

Or serve all functions:

```bash
supabase functions serve --env-file supabase/functions/.env
```

### Step 3: Test with curl

Test the generate-schedule function:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-schedule' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"brainDump":"I work 9-5 on weekdays, gym 3 times a week","userId":"test-user-id"}'
```

Test the optimize-schedule function:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/optimize-schedule' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"routineId":"test-routine-id","userId":"test-user-id"}'
```

## Function Details

### generate-schedule

**Endpoint**: `https://zqgjytltolcqmyoyolvj.supabase.co/functions/v1/generate-schedule`

**Request Body**:
```json
{
  "brainDump": "I work 9-5, gym 3 times a week, study evenings",
  "userId": "user-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "routineId": "routine-uuid",
    "title": "Generated routine title",
    "schedules": [
      {
        "day_of_week": "Monday",
        "time_slot": "09:00",
        "activity": "Work",
        "duration": 480
      }
    ]
  }
}
```

### optimize-schedule

**Endpoint**: `https://zqgjytltolcqmyoyolvj.supabase.co/functions/v1/optimize-schedule`

**Request Body**:
```json
{
  "routineId": "routine-uuid",
  "userId": "user-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "title": "Suggestion title",
        "description": "Detailed explanation",
        "impact": "high"
      }
    ]
  }
}
```

## Updating Functions

When you make changes to the edge functions:

1. Test locally first (optional but recommended)
2. Deploy the updated function:

```bash
supabase functions deploy generate-schedule
# or
supabase functions deploy optimize-schedule
```

## Monitoring and Logs

View function logs:

```bash
# View logs for a specific function
supabase functions logs generate-schedule

# Follow logs in real-time
supabase functions logs generate-schedule --follow
```

## Troubleshooting

### Error: "Missing environment variables"

Make sure you've set the GEMINI_API_KEY secret:

```bash
supabase secrets set GEMINI_API_KEY=your_key_here
```

### Error: "Function not found"

Ensure the function is deployed:

```bash
supabase functions deploy generate-schedule
```

### Error: Network/Connection Issues

1. Check your Supabase project is active
2. Verify your anon key is correct in the client
3. Check function logs for detailed error messages

### Rate Limiting

If you hit Gemini API rate limits, the functions will return a `RATE_LIMIT` error. Consider implementing:
- Request throttling on the client side
- Caching frequent requests
- Upgrading your Gemini API quota

## Security Notes

✅ **Secure Setup (Current)**:
- API key stored in Supabase secrets
- Never exposed to client code
- Only accessible by edge functions

❌ **Insecure Setup (Old)**:
- API key in client environment variables
- Exposed in bundled JavaScript
- Visible to anyone inspecting the app

## Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Deno Documentation](https://deno.land/manual)
