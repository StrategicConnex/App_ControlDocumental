import type { SupabaseClient } from '@supabase/supabase-js';
import { getComplianceMetrics } from './search';

export interface ScheduledReport {
  id: string;
  name: string;
  cron_expression: string;
  format: 'pdf' | 'excel' | 'csv';
  filters: any;
  recipients: string[];
  last_sent_at?: string;
  is_active: boolean;
}

/**
 * Lists all active scheduled reports for an organization.
 */
export async function getScheduledReports(supabase: SupabaseClient, orgId: string): Promise<ScheduledReport[]> {
  const { data, error } = await supabase
    .from('scheduled_reports')
    .select('*')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Triggers a report generation by queuing it in the webhook_queue.
 * This simulates the background process that would run via cron.
 */
export async function triggerReportNow(supabase: SupabaseClient, report: ScheduledReport, orgId: string) {
  // 1. Get current compliance metrics for the report payload
  const metrics = await getComplianceMetrics(supabase);

  // 2. Prepare the payload (RNF-31 requirements)
  const payload = {
    report_name: report.name,
    generated_at: new Date().toISOString(),
    metrics: metrics,
    recipients: report.recipients,
    format: report.format
  };

  // 3. Insert into webhook_queue (Centralized async delivery)
  const { error } = await supabase
    .from('webhook_queue')
    .insert({
      org_id: orgId,
      event_type: 'report.generated',
      payload: payload,
      target_url: 'https://api.strategic-connex.com/v1/deliver-report', // Placeholder for internal delivery service
      status: 'pending'
    });

  if (error) throw error;

  // 4. Update last_sent_at
  await supabase
    .from('scheduled_reports')
    .update({ last_sent_at: new Date().toISOString() })
    .eq('id', report.id);

  return { success: true, message: 'Reporte encolado para distribución' };
}

/**
 * Creates a new scheduled report.
 */
export async function createScheduledReport(
  supabase: SupabaseClient, 
  report: Omit<ScheduledReport, 'id' | 'last_sent_at' | 'is_active'>,
  orgId: string
) {
  const { data, error } = await supabase
    .from('scheduled_reports')
    .insert({
      ...report,
      org_id: orgId,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
