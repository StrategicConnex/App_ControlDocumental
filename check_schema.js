const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: raw, error: rawError } = await supabase.from('organizations').select('id').limit(1);
  if (rawError) {
    console.error("Error fetching organizations:", rawError.message);
  } else {
    console.log("Organizations ID sample:", raw?.[0]?.id);
    console.log("Type seems to be:", typeof raw?.[0]?.id);
  }

  const { data: logs, error: logError } = await supabase.from('ai_call_logs').select('*').limit(1);
  if (logError) {
    console.error("Error fetching ai_call_logs:", logError.message);
  } else {
    console.log("ai_call_logs sample:", logs?.[0]);
  }
}

checkSchema();
