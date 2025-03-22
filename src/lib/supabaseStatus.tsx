
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// React component to display a warning when Supabase is not configured
export function SupabaseWarning() {
  const [showWarning, setShowWarning] = useState(false);
  
  useEffect(() => {
    // Only show the warning after a short delay to avoid flash on pages that don't need Supabase
    const timer = setTimeout(() => {
      setShowWarning(!isSupabaseConfigured());
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!showWarning) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Supabase Configuration Missing</AlertTitle>
      <AlertDescription>
        <p>This application requires Supabase credentials to function properly.</p>
        <p className="mt-2">Please set the following environment variables:</p>
        <ul className="list-disc ml-6 mt-1">
          <li>VITE_SUPABASE_URL</li>
          <li>VITE_SUPABASE_ANON_KEY</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
}
