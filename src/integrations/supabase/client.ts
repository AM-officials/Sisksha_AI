
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nsxbpxlsjbkphhfkiosq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zeGJweGxzamJrcGhoZmtpb3NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTQwOTIsImV4cCI6MjA3NjM3MDA5Mn0.51Dz4XikSLaV9ALx4GrhzPeGH3-o6o4DJKQrrDPub88";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    // Stop the client from retrying indefinitely when offline / project is paused
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout
      return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timeout));
    },
  },
});

// Utility: check if Supabase is reachable
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, { signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  }
};

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
