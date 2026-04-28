import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * API for Bulk Approvals from notifications.
 */
export async function POST(req: NextRequest) {
  try {
    const { notifications } = await req.json(); // Array of { id, metadata }

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return NextResponse.json({ error: 'Lista de notificaciones requerida' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const notificationIds = notifications.map(n => n.id);
    
    // 1. Marcar todas las notificaciones como leídas
    await supabase
      .from('notifications')
      .update({ is_read: true, metadata: { status: 'bulk_approved' } })
      .in('id', notificationIds);

    // 2. Procesar cada aprobación por tipo
    for (const n of notifications) {
      const { resourceId, actionType } = n.metadata;
      
      if (actionType === 'invoice_discrepancy') {
        await supabase
          .from('invoices')
          .update({ status: 'aprobado', audit_notes: 'Aprobación masiva desde panel de control.' })
          .eq('id', resourceId);
      } else if (actionType === 'contract_risk') {
        await supabase
          .from('contracts')
          .update({ status: 'aceptado', audit_score: 100 })
          .eq('id', resourceId);
      }
    }

    return NextResponse.json({ success: true, processedCount: notifications.length });

  } catch (error: any) {
    console.error('Bulk Approval Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
