
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
    const response = await supabase.functions.invoke('custom-email', {
      body: { type, email, data }
    });
    
    if (response.error) throw response.error;
    
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
  status: 'pending' | 'contacted' | 'rejected';
  created_at: string;
};

// Utility function to check if a table exists in Supabase
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    console.log(`Checking if table ${tableName} exists...`);
    const { data, error } = await supabase
      .from(tableName)
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

// Utility function to directly test fetching from waitlist_signups
export const fetchWaitlistSignups = async (): Promise<{ data: WaitlistSignup[] | null, error: any }> => {
  try {
    console.log("Directly testing waitlist_signups fetch...");
    const { data, error } = await supabase
      .from('waitlist_signups')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log("Direct waitlist fetch result:", { data, error });
    return { data, error };
  } catch (error) {
    console.error("Exception in direct waitlist fetch:", error);
    return { data: null, error };
  }
};
