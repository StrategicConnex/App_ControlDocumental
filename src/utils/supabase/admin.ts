"use server";

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

/**
 * Admin client that bypasses RLS using the Service Role Key.
 * USE WITH EXTREME CAUTION. Only for administrative tasks.
 */
export const createAdminClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};
