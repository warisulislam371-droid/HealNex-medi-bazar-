import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twtrtttkdabspfezjjpb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3dHJ0dHRrZGFic3BmZXpqanBiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDY2NjEsImV4cCI6MjA5Nzk4MjY2MX0.4bjre_1mKtSjCzXfIKMudaVr6SDS42CqLe2IQkdH3vQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('app_config').select('*').limit(1);
  if (error) {
    console.error('Error fetching app_config:', error);
  } else {
    console.log('App config structure:', data);
  }
}

test();
