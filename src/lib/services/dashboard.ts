import type { SupabaseClient } from '@supabase/supabase-js';
import { getDocuments } from './documents';
import { getPersonnel } from './personnel';
import { getVehicles } from './vehicles';

export type AlertItem = {
  id: string;
  type: 'document' | 'personnel' | 'vehicle' | 'notification';
  title: string;
  status: string;
  link: string;
  priority?: 'high' | 'medium' | 'low' | undefined;
  notificationId?: string | undefined;
  resourceId?: string | undefined;
  actionType?: string | undefined;
};

export async function getDashboardAlerts(supabase: SupabaseClient, orgId?: string): Promise<AlertItem[]> {
  const [docsData, personnelData, vehiclesData, notificationsData] = await Promise.all([
    getDocuments(supabase).catch(() => []),
    getPersonnel(supabase).catch(() => []),
    getVehicles(supabase).catch(() => []),
    orgId ? supabase.from('notifications').select('*').eq('org_id', orgId).eq('is_read', false).limit(20).then(res => res.data || []) : Promise.resolve([])
  ]);

  const alerts: AlertItem[] = [];

  // 1. Notifications
  notificationsData.forEach(n => {
    // Cast metadata to a more specific type to avoid Json access errors
    const metadata = n.metadata as { resourceId?: string; actionType?: string } | null;
    let link = '#';
    if (metadata?.resourceId) {
      if (metadata.actionType?.includes('invoice')) link = `/billing/invoices/${metadata.resourceId}`;
      else if (metadata.actionType?.includes('contract')) link = `/contracts/${metadata.resourceId}`;
      else link = `/documents/${metadata.resourceId}`;
    }

    alerts.push({
      id: `notif-${n.id}`,
      type: 'notification',
      title: n.title || 'Notificación',
      status: n.severity || 'info',
      link: link,
      priority: n.severity === 'critical' ? 'high' : 'medium',
      notificationId: n.id,
      resourceId: metadata?.resourceId,
      actionType: metadata?.actionType
    });
  });

  // 2. Document Alerts
  docsData.forEach(d => { 
    if (d.status === 'por_vencer' || d.status === 'vencido') 
      alerts.push({ 
        id: `doc-${d.id}`, 
        type: 'document', 
        title: d.title, 
        status: d.status, 
        link: `/documents/${d.id}`, 
        priority: d.status === 'vencido' ? 'high' : 'medium' 
      }); 
  });

  // 3. Personnel Alerts
  personnelData.forEach(p => { 
    if (p.status === 'por_vencer' || p.status === 'vencido' || p.status === 'bloqueado') 
      alerts.push({ 
        id: `per-${p.id}`, 
        type: 'personnel', 
        title: `${p.first_name} ${p.last_name}`, 
        status: p.status, 
        link: `/personnel/${p.id}`, 
        priority: (p.status === 'vencido' || p.status === 'bloqueado') ? 'high' : 'medium' 
      }); 
  });

  // 4. Vehicle Alerts
  vehiclesData.forEach(v => { 
    if (v.status === 'por_vencer' || v.status === 'vencido' || v.status === 'bloqueado') 
      alerts.push({ 
        id: `veh-${v.id}`, 
        type: 'vehicle', 
        title: `${v.license_plate} - ${v.brand}`, 
        status: v.status, 
        link: `/vehicles/${v.id}`, 
        priority: (v.status === 'vencido' || v.status === 'bloqueado') ? 'high' : 'medium' 
      }); 
  });

  return alerts.sort((a, b) => (b.priority === 'high' ? 1 : 0) - (a.priority === 'high' ? 1 : 0));
}
