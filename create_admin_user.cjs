// Usage: node create_admin_user.js
// Requires: npm install @supabase/supabase-js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://jvcmfxtxxhyqsvymjtau.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2Y21meHR4eGh5cXN2eW1qdGF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzkwNDAyMSwiZXhwIjoyMDYzNDgwMDIxfQ.dZTBVc0jO3dtx2t7VVeeBS39WiLQv1oRGD0UmAKNZNw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createAdminUser() {
  const email = 'admin@platform.com';
  const password = 'Safeadmin@1';
  const user_metadata = { role: 'superadmin' };

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata,
    email_confirm: true,
  });

  if (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }

  // Optionally, set is_super_admin to true via SQL
  const userId = data.user.id;
  const { error: sqlError } = await supabase.rpc('execute_sql', {
    sql: `UPDATE auth.users SET is_super_admin = true WHERE id = '${userId}';`
  });

  if (sqlError) {
    console.error('User created, but failed to set is_super_admin:', sqlError);
  } else {
    console.log('Superadmin user created successfully!');
  }
}

createAdminUser(); 