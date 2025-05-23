// Follow Deno best practices for imports
import { serve } from "npm:@supabase/functions-js@2.1.5";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://localhost:5173',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

const UNDETECTABLE_AI_KEY = Deno.env.get('UNDETECTABLE_AI_KEY');

if (!UNDETECTABLE_AI_KEY) {
  throw new Error('Missing UNDETECTABLE_AI_KEY environment variable');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { 
          status: 400,
          headers: corsHeaders
        }
      );
    }

    const response = await fetch('https://api.undetectable.ai/v2/humanize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${UNDETECTABLE_AI_KEY}`
      },
      body: JSON.stringify({
        text,
        mode: 'creative',
        tone: 'neutral'
      })
    });

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { headers: corsHeaders }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
});