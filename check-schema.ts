import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twtrtttkdabspfezjjpb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dHJ0dHRrZGFic3BmZXpqanBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDY2NjEsImV4cCI6MjA5Nzk4MjY2MX0.4bjre_1mKtSjCzXfIKMudaVr6SDS42CqLe2IQkdH3vQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSchema() {
  console.log('Testing connection and schema...');
  
  // Test users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .limit(1);
    
  if (userError) {
    console.error('Users table error:', userError);
  } else {
    console.log('Users table exists! Sample row:', userData);
  }

  // Test categories table
  const { data: catData, error: catError } = await supabase
    .from('categories')
    .select('*')
    .limit(1);

  if (catError) {
    console.error('Categories table error:', catError);
  } else {
    console.log('Categories table exists! Sample row:', catData);
  }
}

testSchema();
