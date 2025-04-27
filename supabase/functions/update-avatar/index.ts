
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }

  try {
    console.log("Update avatar function called");
    
    // Get and validate auth token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse request body
    const { avatarUrl } = await req.json();
    
    if (!avatarUrl) {
      console.error("No avatar URL provided");
      return new Response(
        JSON.stringify({ error: 'No avatar URL provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Configuration
    const supabaseUrl = 'https://cugwtwpgccpcjeumrkxf.supabase.co'
    const supabaseKey = req.headers.get('apikey') || Deno.env.get('SUPABASE_ANON_KEY') 
    
    if (!supabaseKey) {
      console.error("No API key provided");
      return new Response(
        JSON.stringify({ error: 'API key required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    
    // ===== MANUAL AUTH VALIDATION =====
    // Validate the user's JWT manually by calling the auth API endpoint
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: authHeader,
        apikey: supabaseKey,
      },
    })

    const user = await authResponse.json()

    if (!authResponse.ok) {
      console.error("Auth validation failed:", user);
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: user.msg }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`User authenticated: ${user.id}`);
    
    // Get service role key from environment variables
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')
    if (!serviceRoleKey) {
      console.error("No service role key available");
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    
    // Create service role client for database operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    
    // Update the avatar directly using the service role client
    const { error } = await adminClient
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', user.id)
    
    if (error) {
      console.error('Avatar update error:', error);
      return new Response(
        JSON.stringify({ error: 'Update failed', details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Avatar updated successfully for user ${user.id}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Avatar updated successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
