import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * API for One-Click Approvals from notifications.
 */
export async function POST(req: NextRequest) {
  try {
    const { notificationId, resourceId, type } = await req.json();

    if (!notificationId || !resourceId || !type) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    // 1. Marcar la notificación como leída y procesada
    await supabase
      .from('notifications')
      .update({ is_read: true, metadata: { status: 'approved' } })
      .eq('id', notificationId);

    // 2. Ejecutar la acción según el tipo
    if (type === 'invoice_discrepancy') {
      // Por ejemplo, aprobar la factura a pesar de la discrepancia menor
      await supabase
        .from('invoices')
        .update({ status: 'aprobado', audit_notes: 'Aprobado mediante acción rápida de notificación.' })
        .eq('id', resourceId);
    } else if (type === 'contract_risk') {
      // Por ejemplo, marcar el contrato como "aceptado con observaciones"
      await supabase
        .from('contracts')
        .update({ status: 'aceptado', audit_score: 100 }) // "Fuerzo" la aceptación
        .eq('id', resourceId);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Quick Approval Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
