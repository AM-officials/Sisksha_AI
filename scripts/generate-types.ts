import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://jvcmfxtxxhyqsvymjtau.supabase.co',
  'your-anon-key-here'
)

// The types will be automatically generated when you use the client
export type Database = {
  public: {
    Tables: {
      // Your table definitions will go here
    }
  }
} 