import type { SupabaseClient } from '@supabase/supabase-js';

export async function getVehicles(supabase: SupabaseClient, orgId?: string) {
  let query = supabase
    .from('vehicles')
    .select(`
      *,
      vehicle_docs (
        document_id,
        documents (status)
      )
    `)
    .order('license_plate', { ascending: true });

  if (orgId) {
    query = query.eq('org_id', orgId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getVehicleById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      vehicle_docs (
        id,
        status,
        expiry_date,
        document_id,
        documents (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}
