const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkProviders() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data, error } = await supabase.from('ai_call_logs').select('provider');
  if (error) {
    console.error("Error:", error.message);
    return;
  }
  
  const uniqueProviders = [...new Set(data.map(d => d.provider))];
  console.log("Unique providers in logs:", uniqueProviders);
}

checkProviders();
