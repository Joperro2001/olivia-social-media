
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API base URL from environment variable
    const apiBaseUrl = Deno.env.get('VITE_API_BASE_URL');
    
    if (!apiBaseUrl) {
      throw new Error('VITE_API_BASE_URL environment variable is not set');
    }
    
    // Validate the URL format
    try {
      new URL(apiBaseUrl);
    } catch (e) {
      throw new Error('VITE_API_BASE_URL is not a valid URL');
    }

    console.log(`Successfully fetched config. API Base URL: ${apiBaseUrl}`);

    // Return the configuration data
    return new Response(
      JSON.stringify({
        VITE_API_BASE_URL: apiBaseUrl
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        } 
      }
    );
  } catch (error) {
    console.error(`Error in get-config function: ${error.message}`);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
