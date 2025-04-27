
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
    console.log("File upload function called");
    
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

    // Parse form data with file
    const formData = await req.formData();
    const file = formData.get('file');
    const bucketName = formData.get('bucket') as string || 'avatars';
    
    if (!file || !(file instanceof File)) {
      console.error("No file in request");
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
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
    
    // Create service role client for storage operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).slice(2)}-${Date.now()}.${fileExt}`
    
    console.log(`Uploading file to bucket: ${bucketName}, filename: ${fileName}`);
    
    // Upload directly to storage bucket using the admin client
    const { data, error } = await adminClient
      .storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error);
      return new Response(
        JSON.stringify({ error: 'Upload failed', details: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get the public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`
    
    console.log(`Upload successful, public URL: ${publicUrl}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        url: publicUrl
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
