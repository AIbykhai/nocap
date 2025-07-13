import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  // Define CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // Allow all origins (use your app’s origin in production)
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204, // No Content, standard for preflight
      headers: corsHeaders,
    });
  }

  // Handle DELETE request (we’ll add logic here in Step 2)
  try {
    const { userId } = await req.json();
    return new Response(JSON.stringify({ message: `User ${userId} deleted successfully.` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});