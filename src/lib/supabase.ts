
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type User = Database['public']['Tables']['users']['Row'];
export type Form = Database['public']['Tables']['forms']['Row'];
export type LoginLog = Database['public']['Tables']['login_logs']['Row'];
