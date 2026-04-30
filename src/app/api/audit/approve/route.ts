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

    // Permission check: Solo admin o gestor pueden aprobar
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, org_id')
      .eq('id', user.id)
      .single() as any; // Cast as any for simplicity in this edge case or define a proper interface if available

    if (!profile || !['admin', 'gestor', 'owner'].includes(profile.role)) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    // 1. Marcar la notificación como leída (Optimistic update on DB)
    const { error: notifError } = await supabase
      .from('notifications')
      .update({ is_read: true, metadata: { status: 'approved', approved_by: user.id } })
      .eq('id', notificationId)
      .eq('org_id', profile.org_id); // Security: Ensure same org

    if (notifError) throw notifError;

    try {
      // 2. Ejecutar la acción según el tipo
      if (type === 'invoice_discrepancy') {
        const { error: updateError } = await supabase
          .from('invoices')
          .update({ 
            status: 'aprobada', 
            metadata: { audit_notes: `Aprobado por ${user.email} vía acción rápida.` } 
          })
          .eq('id', resourceId)
          .eq('org_id', profile.org_id);
        
        if (updateError) throw updateError;

      } else if (type === 'contract_risk') {
        const { error: updateError } = await supabase
          .from('contracts')
          .update({ 
            status: 'active',
            compliance_score: 100,
            metadata: { audit_notes: `Riesgo aceptado por ${user.email}.` }
          })
          .eq('id', resourceId)
          .eq('org_id', profile.org_id);

        if (updateError) throw updateError;
      }

      return NextResponse.json({ success: true });

    } catch (updateErr) {
      // Rollback: Marcar la notificación como NO leída si la acción falló
      await supabase
        .from('notifications')
        .update({ is_read: false, metadata: { error: 'Failed to apply action' } })
        .eq('id', notificationId);
      
      throw updateErr;
    }

  } catch (error: any) {
    console.error('Quick Approval Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
