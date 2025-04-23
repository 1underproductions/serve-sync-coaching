
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json'
};

type TicketPayload = {
  userId: string;
  title: string;
  description: string;
  category: string;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Missing Supabase environment variables" }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the ticket data from the request body
    const payload = await req.json() as TicketPayload;
    
    if (!payload.userId || !payload.title || !payload.description) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    console.log("Creating ticket for user:", payload.userId);
    
    // Insert the support ticket using the service role
    // This bypasses RLS policies and avoids the recursion
    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: payload.userId,
        title: payload.title,
        description: payload.description,
        category: payload.category || "support",
        status: "open"
      })
      .select('id');
      
    if (error) {
      console.error("Error creating support ticket:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: corsHeaders }
      );
    }
    
    console.log("Ticket created successfully:", data);
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: corsHeaders }
    );
    
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
