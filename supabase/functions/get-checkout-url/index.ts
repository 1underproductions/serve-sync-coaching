
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the payment link ID from the request - either from query params or body
    const url = new URL(req.url);
    let paymentLinkId = url.searchParams.get("id");
    
    // If not in query params, try to get from body
    if (!paymentLinkId) {
      const body = await req.json();
      paymentLinkId = body.id;
    }

    if (!paymentLinkId) {
      return new Response(JSON.stringify({ error: "Payment link ID is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Initialize Supabase client with Deno runtime
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Attempt to get the payment link data
    const { data: paymentLinkData, error } = await supabaseClient
      .from("payment_links")
      .select("stripe_checkout_id, coach_id, amount, currency, description")
      .eq("id", paymentLinkId)
      .single();

    if (error || !paymentLinkData?.stripe_checkout_id) {
      console.error("Database error:", error);
      return new Response(JSON.stringify({ error: "Payment link not found or invalid" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get the Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(paymentLinkData.stripe_checkout_id);

    if (!session || !session.url) {
      return new Response(JSON.stringify({ error: "Stripe checkout session not found or expired" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
