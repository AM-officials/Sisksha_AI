// create_superadmin.mjs
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jvcmfxtxxhyqsvymjtau.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y21meHR4eGh5cXN2eW1qdGF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkwNDAyMSwiZXhwIjoyMDYzNDgwMDIxfQ.dZTBVc0jO3dtx2t7VVeeBS39WiLQv1oRGD0UmAKNZNw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createSuperAdmin() {
  const email = 'admin@platform.com';
  const password = 'Safeadmin@1';
  const user_metadata = { role: 'superadmin' };

  // Delete user if exists
  const { data: existing, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(existing.id);
    if (deleteError) {
      console.error('Failed to delete existing user:', deleteError);
      return;
    }
    console.log('Deleted existing user.');
  }

  // Create new user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata,
    email_confirm: true,
  });

  if (error) {
    console.error('Error creating user:', error);
    return;
  }

  console.log('Superadmin user created successfully!');
}

createSuperAdmin();