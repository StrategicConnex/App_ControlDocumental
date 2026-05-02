import { createAdminClient } from '@/utils/supabase/admin';

export interface NotificationPayload {
  orgId: string;
  userId?: string;
  type: 'audit_alert' | 'system' | 'document_expiry' | 'approval_request';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  link?: string;
  metadata?: any;
}

/**
 * Service for managing organizational and user notifications.
 */
export const notificationService = {
  /**
   * Envía una notificación a la base de datos.
   */
  async send(payload: NotificationPayload) {
    const supabase = createAdminClient();
    
    const { error } = await supabase.from('notifications').insert({
      org_id: payload.orgId,
      user_id: payload.userId ?? null,
      type: payload.type,
      severity: payload.severity,
      title: payload.title,
      message: payload.message,
      link: payload.link ?? null,
      metadata: payload.metadata ?? null
    });

    if (error) {
      console.error('Error enviando notificación:', error);
      throw error;
    }
  },

  /**
   * Obtiene notificaciones no leídas de la organización.
   */
  async getUnread(orgId: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Procesa vencimientos próximos y genera alertas automáticas.
   * @param orgId Opcional. Si se provee, solo procesa para esa organización.
   */
  async processExpirations(orgId?: string) {
    const supabase = createAdminClient();
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const thirtyDaysIso = thirtyDaysFromNow.toISOString();

    // 1. Verificar vencimientos de Flota
    let vehicleQuery = supabase
      .from('vehicle_docs')
      .select('*, vehicles(license_plate, brand, model), documents(title)')
      .lte('expiry_date', thirtyDaysIso)
      .gt('expiry_date', today.toISOString())
      .eq('status', 'active');

    if (orgId) {
      vehicleQuery = vehicleQuery.eq('org_id', orgId);
    }

    const { data: expiringVehicles } = await vehicleQuery;

    if (expiringVehicles) {
      for (const doc of expiringVehicles) {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', doc.org_id)
          .eq('type', 'document_expiry')
          .contains('metadata', { doc_id: doc.id })
          .gte('created_at', new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString());

        if (count && count > 0) continue;

        const daysLeft = Math.ceil((new Date(doc.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const vehicleInfo = (doc.vehicles as any);
        
        await this.send({
          orgId: doc.org_id,
          type: 'document_expiry',
          severity: daysLeft <= 7 ? 'critical' : 'warning',
          title: `Vencimiento de Documento - ${vehicleInfo.license_plate}`,
          message: `El documento "${(doc.documents as any).title}" del vehículo ${vehicleInfo.brand} ${vehicleInfo.model} vence en ${daysLeft} días (${doc.expiry_date}).`,
          link: `/vehicles/${doc.vehicle_id}`,
          metadata: { vehicle_id: doc.vehicle_id, doc_id: doc.id }
        });
      }
    }

    // 2. Verificar vencimientos de Personal
    let personnelQuery = supabase
      .from('personnel_docs')
      .select('*, personnel(first_name, last_name), documents(title)')
      .lte('expiry_date', thirtyDaysIso)
      .gt('expiry_date', today.toISOString())
      .eq('status', 'active');

    if (orgId) {
      personnelQuery = personnelQuery.eq('org_id', orgId);
    }

    const { data: expiringPersonnel } = await personnelQuery;

    if (expiringPersonnel) {
      for (const doc of expiringPersonnel) {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', doc.org_id)
          .eq('type', 'document_expiry')
          .contains('metadata', { doc_id: doc.id })
          .gte('created_at', new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString());

        if (count && count > 0) continue;

        const daysLeft = Math.ceil((new Date(doc.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const personInfo = (doc.personnel as any);

        await this.send({
          orgId: doc.org_id,
          type: 'document_expiry',
          severity: daysLeft <= 7 ? 'critical' : 'warning',
          title: `Vencimiento de Documento - ${personInfo.first_name} ${personInfo.last_name}`,
          message: `El documento "${(doc.documents as any).title}" de ${personInfo.first_name} ${personInfo.last_name} vence en ${daysLeft} días (${doc.expiry_date}).`,
          link: `/personnel/${doc.personnel_id}`,
          metadata: { personnel_id: doc.personnel_id, doc_id: doc.id }
        });
      }
    }

    return { 
      vehiclesProcessed: expiringVehicles?.length || 0, 
      personnelProcessed: expiringPersonnel?.length || 0 
    };
  }

};
