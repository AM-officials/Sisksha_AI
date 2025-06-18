import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to ensure materials bucket exists
export const ensureMaterialsBucket = async () => {
  try {
    // First check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    // Check if materials bucket exists
    const materialsBucket = buckets.find(bucket => bucket.name === 'materials');
    
    if (!materialsBucket) {
      console.log('Materials bucket not found, attempting to create it...');
      
      // Try to create the bucket
      const { data, error } = await supabase.storage.createBucket('materials', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (error) {
        console.error('Error creating materials bucket:', error);
        return false;
      }
      
      console.log('Materials bucket created successfully');
      
      // Add policies to the bucket
      // Note: This might require higher privileges depending on your Supabase setup
      try {
        await supabase.rpc('create_storage_policy', {
          bucket_id: 'materials',
          policy_name: 'Allow public read access',
          definition: 'bucket_id = \'materials\''
        });
      } catch (policyError) {
        console.error('Error creating bucket policy:', policyError);
        // Continue even if policy creation fails, as it might require manual setup
      }
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error ensuring materials bucket exists:', err);
    return false;
  }
} 