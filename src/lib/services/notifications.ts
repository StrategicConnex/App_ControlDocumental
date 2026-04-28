import { createClient } from '@/utils/supabase/server';

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
    const supabase = await createClient();
    
    const { error } = await supabase.from('notifications').insert({
      org_id: payload.orgId,
      user_id: payload.userId,
      type: payload.type,
      severity: payload.severity,
      title: payload.title,
      message: payload.message,
      link: payload.link,
      metadata: payload.metadata
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
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
