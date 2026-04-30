import type { SupabaseClient } from '@supabase/supabase-js';

export async function getPersonnel(supabase: SupabaseClient, orgId?: string) {
  let query = supabase
    .from('personnel')
    .select(`
      *,
      personnel_docs (
        document_id,
        documents (status)
      )
    `)
    .order('last_name', { ascending: true });

  if (orgId) {
    query = query.eq('org_id', orgId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPersonnelById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('personnel')
    .select(`
      *,
      personnel_docs (
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
