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
    debug: true, // Enable debug mode to help diagnose issues
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
  role: 'user' | 'admin';
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
