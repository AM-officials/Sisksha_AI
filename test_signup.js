import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testSignup() {
  const { data, error } = await supabase.auth.signUp({
    email: 'teststudent_2026_x1@example.com',
    password: 'password123',
    options: {
      data: {
        role: 'student',
        full_name: 'Test Student'
      }
    }
  });
  console.log("Signup error:", error);
  console.log("Signup data:", data.user ? data.user.user_metadata : 'No user');
}

testSignup();
