
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Use the credentials from your Supabase project
const supabaseUrl = "https://fgrliliqewdqblbbswsn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncmxpbGlxZXdkcWJsYmJzd3NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI2NjE5MzUsImV4cCI6MjA1ODIzNzkzNX0.oFwMZT4UX1zMlAibGvNQIuzWkRjpb0lKtU8FHwq_qKE";

// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Type exports
export type User = Database['public']['Tables']['users']['Row'];
export type Form = Database['public']['Tables']['forms']['Row'];
export type LoginLog = Database['public']['Tables']['login_logs']['Row'];
