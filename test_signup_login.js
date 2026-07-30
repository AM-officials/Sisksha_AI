import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jvcmfxtxxhyqsvymjtau.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y21meHR4eGh5cXN2eW1qdGF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDQwMjEsImV4cCI6MjA2MzQ4MDAyMX0.izfdELtFBW1X-x0KEnHzWqMh3WiGNXZVq-SC18hlHI0');

async function testSignupAndFix() {
  const email = `teststudent_${Date.now()}@example.com`;
  const password = 'password123';
  
  // 1. Signup
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role: 'student', full_name: 'Test Student' }
    }
  });
  console.log("Signup role (hijacked by trigger?):", signupData?.user?.user_metadata?.role);

  // 2. Fix the role using updateUser
  const { data: updateData, error: updateError } = await supabase.auth.updateUser({
    data: { role: 'student' }
  });
  console.log("Update error:", updateError?.message);
  console.log("Updated role:", updateData?.user?.user_metadata?.role);

  // 3. Login to verify
  const { data: loginData } = await supabase.auth.signInWithPassword({ email, password });
  console.log("Final Login role:", loginData?.user?.user_metadata?.role);
}

testSignupAndFix();
