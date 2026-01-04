import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0';

const SYSTEM_PROMPT = `You are an AI scheduling assistant. Parse the user's routine description and create a structured weekly schedule.

User will describe their week in plain English (e.g., "I work 9-5, gym 3 times a week, study evenings").

Output ONLY valid JSON in this exact format:
{
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

Rules:
- Be realistic with time allocations
- Distribute activities evenly across the week
- Include breaks and transitions
- Duration is in minutes
- Use 24-hour time format (HH:MM)
- Days: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- Generate at least 3-5 activities per day
- Consider work-life balance`;

const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

interface Schedule {
  day_of_week: string;
  time_slot: string;
  activity: string;
  duration: number;
}

interface GenerateScheduleRequest {
  brainDump: string;
  userId: string;
}

Deno.serve(async (req) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
      throw new Error('Missing environment variables');
    }

    // Parse request body
    const { brainDump, userId }: GenerateScheduleRequest = await req.json();

    if (!brainDump || !userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing brainDump or userId',
          },
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Call Gemini API
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_PROMPT },
            { text: brainDump },
          ],
        },
      ],
      generationConfig,
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE',
        },
      ],
    });

    const response = await result.response;
    let responseText = response.text();

    // Remove markdown code blocks if present
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Parse JSON response
    let parsedResponse: { title: string; schedules: Schedule[] };
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Unable to generate schedule. Try rephrasing your description.',
          },
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Validate response structure
    if (
      !parsedResponse.title ||
      !Array.isArray(parsedResponse.schedules) ||
      parsedResponse.schedules.length === 0
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_RESPONSE',
            message: 'Generated schedule is incomplete. Please try again with more details.',
          },
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert routine into database
    const { data: routineData, error: routineError } = await supabase
      .from('routines')
      .insert({
        user_id: userId,
        title: parsedResponse.title,
        description: brainDump,
      })
      .select('id')
      .single();

    if (routineError || !routineData) {
      console.error('Failed to save routine:', routineError);
      throw new Error('Failed to save routine to database');
    }

    const routineId = routineData.id;

    // Batch insert schedules
    const schedulesToInsert = parsedResponse.schedules.map((schedule) => ({
      routine_id: routineId,
      day_of_week: schedule.day_of_week,
      time_slot: schedule.time_slot,
      activity: schedule.activity,
      duration: schedule.duration,
    }));

    const { error: schedulesError } = await supabase
      .from('schedules')
      .insert(schedulesToInsert);

    if (schedulesError) {
      console.error('Failed to save schedules:', schedulesError);
      // Rollback routine if schedules fail
      await supabase.from('routines').delete().eq('id', routineId);
      throw new Error('Failed to save schedules to database');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          routineId,
          title: parsedResponse.title,
          schedules: parsedResponse.schedules,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error: any) {
    console.error('Generate schedule error:', error);

    // Handle Gemini API errors
    let errorResponse = {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred. Please try again.',
    };

    if (error.message?.includes('401') || error.message?.includes('authentication')) {
      errorResponse = {
        code: 'API_ERROR',
        message: 'AI service authentication failed. Please contact support.',
      };
    } else if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      errorResponse = {
        code: 'RATE_LIMIT',
        message: 'Too many requests. Please try again in a moment.',
      };
    } else if (error.message?.includes('SAFETY') || error.message?.includes('blocked')) {
      errorResponse = {
        code: 'SAFETY_BLOCKED',
        message: 'Unable to generate schedule. Try rephrasing your description.',
      };
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorResponse,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
