
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if Supabase credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  
  // Display a more user-friendly error in the UI
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; text-align: center; padding: 20px;">
        <h1 style="color: #e11d48; margin-bottom: 16px;">Configuration Error</h1>
        <p style="max-width: 500px; margin-bottom: 24px;">
          Supabase credentials are missing. To fix this issue, you need to set the following environment variables:
        </p>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; font-family: monospace; text-align: left; margin-bottom: 24px; max-width: 500px;">
          <div><strong>VITE_SUPABASE_URL</strong> - Your Supabase project URL</div>
          <div><strong>VITE_SUPABASE_ANON_KEY</strong> - Your Supabase anonymous key</div>
        </div>
        <p style="max-width: 500px;">
          These can be found in your Supabase project dashboard under Project Settings > API.
        </p>
      </div>
    `;
  }
}

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type User = Database['public']['Tables']['users']['Row'];
export type Form = Database['public']['Tables']['forms']['Row'];
export type LoginLog = Database['public']['Tables']['login_logs']['Row'];
