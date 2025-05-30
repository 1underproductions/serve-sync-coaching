import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Environment configuration
export const environments = {
  development: {
    url: 'https://cugwtwpgccpcjeumrkxf.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Z3d0d3BnY2NwY2pldW1ya3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjA1MDEsImV4cCI6MjA1ODkzNjUwMX0.DjWV3Jt7OcVaJh4QYQ8NsBpPtrI1m8FJ5O3n-SHhMrk'
  },
  staging: {
    url: import.meta.env.VITE_SUPABASE_URL_STAGING || 'https://cugwtwpgccpcjeumrkxf.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_STAGING || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Z3d0d3BnY2NwY2pldW1ya3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjA1MDEsImV4cCI6MjA1ODkzNjUwMX0.DjWV3Jt7OcVaJh4QYQ8NsBpPtrI1m8FJ5O3n-SHhMrk'
  },
  production: {
    url: import.meta.env.VITE_SUPABASE_URL_PRODUCTION || 'https://cugwtwpgccpcjeumrkxf.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY_PRODUCTION || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Z3d0d3BnY2NwY2pldW1ya3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjA1MDEsImV4cCI6MjA1ODkzNjUwMX0.DjWV3Jt7OcVaJh4QYQ8NsBpPtrI1m8FJ5O3n-SHhMrk'
  }
};

// Determine current environment
const getCurrentEnvironment = () => {
  const envFromVar = import.meta.env.VITE_APP_ENV || 'development';
  
  // For local development with explicit env selection
  if (['development', 'staging', 'production'].includes(envFromVar)) {
    return envFromVar as 'development' | 'staging' | 'production';
  }
  
  // Default to development
  return 'development';
};

const environment = getCurrentEnvironment();
console.log(`Running in ${environment} environment`);

// Get environment-specific configuration
const { url: supabaseUrl, anonKey: supabaseAnonKey } = environments[environment];

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    debug: true, // Keep debug mode enabled to help diagnose issues
    detectSessionInUrl: true // Enable session detection in URL
  }
});

// Custom email function to handle our enhanced email templates
export const sendCustomEmail = async (type: string, email: string, data: any) => {
  try {
    // Get the current app URL - use the actual window location rather than localhost
    const appUrl = window.location.origin;
    console.log(`Current app URL: ${appUrl}`);
    console.log(`Sending ${type} email with data:`, data);
    
    // Update the redirect URL to point to our auth callback handler
    if (type === 'signup' || type === 'confirmation') {
      data.redirect_to = data.redirect_to || `${appUrl}/auth/callback`;
    } else if (data.redirect_to) {
      // If it's a relative path, make it absolute using the current app URL
      if (data.redirect_to.startsWith('/')) {
        data.redirect_to = `${appUrl}${data.redirect_to}`;
      } 
      // If it includes localhost, replace with the current origin
      else if (data.redirect_to.includes('localhost')) {
        data.redirect_to = data.redirect_to.replace(/https?:\/\/localhost:[0-9]+/g, appUrl);
      }
      // Make sure we're using an absolute URL
      else if (!data.redirect_to.startsWith('http')) {
        data.redirect_to = `${appUrl}${data.redirect_to.startsWith('/') ? '' : '/'}${data.redirect_to}`;
      }
    }
    
    // Try to get a session token if not already provided
    if (!data.token) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          data.token = sessionData.session.access_token;
          console.log("Added session token to email data");
        }
      } catch (e) {
        console.error("Error getting session token:", e);
      }
    }
    
    console.log(`Sending ${type} email with final data:`, {
      email,
      hasToken: !!data.token,
      redirect_to: data.redirect_to
    });
    
    // ALWAYS use custom email function with verified tennexis.com domain
    // No fallback to native OTP to ensure verified domain is used
    console.log("Using ONLY custom email function with verified tennexis.com domain");
    
    const response = await supabase.functions.invoke('custom-email', {
      body: { type, email, data },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log("Custom email function complete response:", response);
    
    if (response.error) {
      console.error("Error from custom-email function:", response.error);
      throw response.error;
    }
    
    console.log("Custom email function response data:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error sending custom email:", error);
    throw error;
  }
};

// Database types
export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  years_experience?: number;
  hourly_rate?: number;
  role: 'user' | 'admin' | 'tennexis_admin';
  created_at: string;
  updated_at: string;
};

export type Session = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  price?: number;
  players: string[]; // Array of player IDs
  created_at: string;
  updated_at: string;
};

export type Player = {
  id: string;
  user_id: string; // Coach ID
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  skill_level?: string;
  goals?: string[];
  created_at: string;
  updated_at: string;
  avatar_url?: string;
};

export type Payment = {
  id: string;
  user_id: string;
  amount: number;
  status: 'succeeded' | 'pending' | 'failed';
  payment_method: string;
  created_at: string;
  description: string;
  session_id?: string; // Optional reference to a session
  stripe_payment_id?: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  plan: string;
  current_period_end: string;
  created_at: string;
  stripe_subscription_id: string;
};

export type Package = {
  id: string;
  name: string;
  sessions: number;
  price: number;
  description: string;
  discount: number;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type PackageData = {
  id: string;
  name: string;
  sessions: number;
  price: number;
  description: string;
  discount: number;
};

// Define WaitlistSignup type to ensure consistency
export type WaitlistSignup = {
  id: string;
  email: string;
  full_name: string;
  years_experience: number | null;
  message: string | null;
  status: string; // Using string type for status to handle any value from DB
  created_at: string;
};

// Utility function to check if a table exists in Supabase
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    console.log(`Checking if table ${tableName} exists...`);
    // Use type assertion to tell TypeScript this is a valid table
    const { data, error } = await supabase
      .from(tableName as any)
      .select('id')
      .limit(1);
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    console.log(`Table ${tableName} exists and returned:`, data);
    return true;
  } catch (error) {
    console.error(`Exception checking if table ${tableName} exists:`, error);
    return false;
  }
};

// Utility function to create a test waitlist entry for development
export const createTestWaitlistEntry = async (): Promise<{ success: boolean, data?: any, error?: any }> => {
  try {
    console.log("Creating test waitlist entry...");
    
    const testEntry = {
      full_name: "Test Coach",
      email: `test.coach.${Date.now()}@example.com`, // Add timestamp to avoid duplicates
      years_experience: 5,
      message: "This is a test coach entry for development purposes.",
      status: "pending"
    };
    
    const { data, error } = await supabase
      .from('waitlist_signups')
      .insert(testEntry)
      .select();
    
    if (error) {
      console.error("Error creating test waitlist entry:", error);
      return { success: false, error };
    }
    
    console.log("Successfully created test waitlist entry:", data);
    return { success: true, data };
    
  } catch (error) {
    console.error("Exception creating test waitlist entry:", error);
    return { success: false, error };
  }
};

// Utility function to directly test fetching from waitlist_signups
export const fetchWaitlistSignups = async (): Promise<{ data: WaitlistSignup[] | null, error: any }> => {
  try {
    console.log("Directly testing waitlist_signups fetch...");
    const { data, error } = await supabase
      .from('waitlist_signups')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log("Direct waitlist fetch result:", { data, error });
    
    // If no data exists and this is a development environment, let's add a test entry
    if (Array.isArray(data) && data.length === 0 && getCurrentEnvironment() === 'development') {
      console.log("No waitlist entries found, adding a test entry for development...");
      try {
        const testEntry = {
          full_name: "Test Coach",
          email: "test.coach@example.com",
          years_experience: 5,
          message: "This is a test coach entry for development purposes.",
          status: "pending"
        };
        
        const { data: insertData, error: insertError } = await supabase
          .from('waitlist_signups')
          .insert(testEntry)
          .select();
        
        if (insertError) {
          console.error("Error inserting test waitlist entry:", insertError);
        } else {
          console.log("Successfully added test waitlist entry:", insertData);
          return { data: insertData as WaitlistSignup[], error: null };
        }
      } catch (insertExc) {
        console.error("Exception adding test waitlist entry:", insertExc);
      }
    }
    
    return { data, error };
  } catch (error) {
    console.error("Exception in direct waitlist fetch:", error);
    return { data: null, error };
  }
};
