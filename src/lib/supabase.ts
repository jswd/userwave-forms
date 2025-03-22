
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get environment variables with fallbacks to prevent runtime errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if credentials are missing and log a helpful error message
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// Create the Supabase client with the available credentials
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type User = Database['public']['Tables']['users']['Row'];
export type Form = Database['public']['Tables']['forms']['Row'];
export type LoginLog = Database['public']['Tables']['login_logs']['Row'];
