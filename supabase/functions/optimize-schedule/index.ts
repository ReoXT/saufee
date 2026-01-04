import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.21.0';

const OPTIMIZATION_SYSTEM_PROMPT = `Analyze this schedule and suggest optimizations for better productivity, work-life balance, and time management.

Provide 3-5 specific, actionable suggestions in JSON:
{
  "suggestions": [
    {
      "title": "Suggestion title",
      "description": "Detailed explanation",
      "impact": "high"
    }
  ]
}

Impact levels:
- high: Major improvement to productivity or well-being
- medium: Moderate improvement
- low: Minor optimization`;

const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

interface OptimizeScheduleRequest {
  routineId: string;
  userId: string;
}

interface Suggestion {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
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
    const { routineId, userId }: OptimizeScheduleRequest = await req.json();

    if (!routineId || !userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Missing routineId or userId',
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

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch existing routine and schedules
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .select('title, description')
      .eq('id', routineId)
      .eq('user_id', userId)
      .single();

    if (routineError || !routine) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Routine not found.',
          },
        }),
        {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const { data: schedules, error: schedulesError } = await supabase
      .from('schedules')
      .select('day_of_week, time_slot, activity, duration')
      .eq('routine_id', routineId)
      .order('day_of_week')
      .order('time_slot');

    if (schedulesError) {
      console.error('Failed to fetch schedules:', schedulesError);
      throw new Error('Failed to fetch schedules');
    }

    // Create optimization prompt
    const promptContent = `Analyze this schedule and suggest optimizations:

Title: ${routine.title}
Description: ${routine.description}

Current schedule:
${JSON.stringify(schedules, null, 2)}`;

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Call Gemini API for optimization
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: OPTIMIZATION_SYSTEM_PROMPT },
            { text: promptContent },
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
    let parsedResponse: { suggestions: Suggestion[] };
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse optimization response:', responseText);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Unable to generate optimization suggestions. Please try again.',
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

    // Validate response
    if (
      !parsedResponse.suggestions ||
      !Array.isArray(parsedResponse.suggestions) ||
      parsedResponse.suggestions.length === 0
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_RESPONSE',
            message: 'No optimization suggestions generated. Please try again.',
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

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedResponse,
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
    console.error('Optimize schedule error:', error);

    // Handle errors
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
        message: 'Unable to generate suggestions. Try rephrasing your description.',
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
