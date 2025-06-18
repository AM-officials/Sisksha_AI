
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jvcmfxtxxhyqsvymjtau.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y21meHR4eGh5cXN2eW1qdGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDQwMjEsImV4cCI6MjA2MzQ4MDAyMX0.izfdELtFBW1X-x0KEnHzWqMh3WiGNXZVq-SC18hlHI0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Add function to calculate level based on XP
export const calculateLevel = (xp: number): number => {
  let level = 1;
  let xpThreshold = 100; // XP needed for level 2
  let totalXpRequired = xpThreshold;
  
  while (xp >= totalXpRequired) {
    level++;
    // Increase XP requirement by 1.25x for next level
    xpThreshold = Math.round(xpThreshold * 1.25);
    totalXpRequired += xpThreshold;
  }
  
  return level;
};
