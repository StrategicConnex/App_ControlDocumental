import { SupabaseClient } from '@supabase/supabase-js';

export async function getBudgets(supabase: SupabaseClient, orgId?: string) {
  let query = supabase
    .from('budgets')
    .select(`*`)
    .order('created_at', { ascending: false });

  if (orgId) {
    query = query.eq('org_id', orgId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getBudgetById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      budget_items (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateBudgetStatus(supabase: SupabaseClient, id: string, status: string) {
  const { data, error } = await supabase
    .from('budgets')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
