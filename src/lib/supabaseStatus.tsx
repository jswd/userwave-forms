
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// No longer needed as we're using hardcoded credentials
export const isSupabaseConfigured = (): boolean => {
  return true;
};

// React component to display a warning when Supabase is not configured
export function SupabaseWarning() {
  // We're no longer using environment variables, so we can return null
  return null;
}
