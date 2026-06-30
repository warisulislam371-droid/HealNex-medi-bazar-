import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from Vite environment variables or fall back to the user's provided database credentials
const metaEnv = (import.meta as any).env || {};

const rawUrl = metaEnv.VITE_SUPABASE_URL || metaEnv.SUPABASE_URL || 'https://twtrtttkdabspfezjjpb.supabase.co';
// Strip trailing /rest/v1/ from URL to conform with Supabase client requirements
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').trim();

const supabaseAnonKey = (metaEnv.VITE_SUPABASE_ANON_KEY || metaEnv.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dHJ0dHRrZGFic3BmZXpqanBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDY2NjEsImV4cCI6MjA5Nzk4MjY2MX0.4bjre_1mKtSjCzXfIKMudaVr6SDS42CqLe2IQkdH3vQ').trim();

// Validate if real Supabase credentials are provided
export const isSupabaseConfigured = !!(
  cleanUrl &&
  cleanUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'placeholder'
);

// Initialize Supabase Client
export const supabase = createClient(cleanUrl, supabaseAnonKey);


