
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
      playerId,
      playerEmail,
      paymentType = "session", // Options: "session", "package", "deposit", "other"
      sendEmail = false,
      packageId,
      isDeposit = false,
      cancellationPolicy = "24_hours", // 24_hours, 48_hours, none
      expiresInHours = 48, // Default to 48 hours expiration
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

    // Calculate expiration timestamp
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Create a payment link in Supabase
    const { data: paymentLink, error } = await supabaseClient
      .from("payment_links")
      .insert({
        coach_id: user?.id || "00000000-0000-0000-0000-000000000000", // Anonymous coach ID if not authenticated
        player_id: playerId || null,
        player_email: playerEmail || null,
        amount,
        currency,
        description,
        session_id: sessionId || null,
        package_id: packageId || null,
        payment_type: paymentType,
        status: "active",
        expires_at: expiresAt.toISOString(),
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
            name: description || `Tennis ${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} Payment`,
            description: isDeposit ? "Deposit payment - non-refundable" : undefined,
          },
          unit_amount: Math.round(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ];
    
    // Add custom metadata based on payment type
    const metadata: Record<string, string> = {
      payment_link_id: paymentLink.id,
      coach_id: user?.id || "",
      is_deposit: isDeposit.toString(),
      cancellation_policy: cancellationPolicy,
      payment_type: paymentType,
      expires_at: expiresAt.toISOString(),
    };
    
    if (sessionId) metadata.session_id = sessionId;
    if (playerId) metadata.player_id = playerId;
    if (packageId) metadata.package_id = packageId;

    // Create Stripe checkout session with expiration
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cancelPath}?payment_link_id=${paymentLink.id}`,
      metadata,
      allow_promotion_codes: true,
      customer_email: playerEmail || undefined,
      expires_at: Math.floor(expiresAt.getTime() / 1000), // Convert to Unix timestamp (seconds)
    });

    // Update payment link with Stripe checkout ID
    await supabaseClient
      .from("payment_links")
      .update({ stripe_checkout_id: checkoutSession.id })
      .eq("id", paymentLink.id);

    // If sendEmail is true and playerEmail is provided, send an email notification
    if (sendEmail && playerEmail) {
      try {
        await supabaseClient.functions.invoke("custom-email", {
          body: {
            type: "payment-link",
            email: playerEmail,
            data: {
              amount: amount,
              currency: currency,
              description: description,
              payment_url: checkoutSession.url,
              coach_name: user?.user_metadata?.full_name || "Your coach",
              expires_in_hours: expiresInHours
            }
          }
        });
      } catch (emailError) {
        console.error("Failed to send payment request email:", emailError);
        // Continue with the response even if email fails
      }
    }

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
