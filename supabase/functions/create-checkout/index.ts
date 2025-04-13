
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
    const {
      amount,
      description,
      currency = "USD",
      successPath = "/payment-success",
      cancelPath = "/payment-canceled",
      sessionId,
      isDeposit = false,
      cancellationPolicy = "24_hours", // 24_hours, 48_hours, none
    } = await req.json();

    // Validate required fields
    if (!amount) {
      return new Response(
        JSON.stringify({ error: "Amount is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
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

    // Get user information if authenticated
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Origin for success and cancel URLs
    const origin = req.headers.get("origin") || "http://localhost:5173";

    // Create a payment link in Supabase
    const { data: paymentLink, error } = await supabaseClient
      .from("payment_links")
      .insert({
        coach_id: user?.id || "00000000-0000-0000-0000-000000000000", // Anonymous coach ID if not authenticated
        amount,
        currency,
        description,
        session_id: sessionId || null,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating payment link:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create payment link" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare line items for Stripe
    const lineItems = [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: description || "Tennis Coaching",
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ];

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cancelPath}`,
      metadata: {
        payment_link_id: paymentLink.id,
        session_id: sessionId || null,
        coach_id: user?.id || null,
        is_deposit: isDeposit.toString(),
        cancellation_policy: cancellationPolicy,
      },
      allow_promotion_codes: true,
    });

    // Update payment link with Stripe checkout ID
    await supabaseClient
      .from("payment_links")
      .update({ stripe_checkout_id: checkoutSession.id })
      .eq("id", paymentLink.id);

    // Return the checkout URL
    return new Response(
      JSON.stringify({
        url: checkoutSession.url,
        id: paymentLink.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
