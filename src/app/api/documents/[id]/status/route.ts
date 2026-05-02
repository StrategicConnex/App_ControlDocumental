import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['borrador', 'revision', 'aprobado', 'vencido', 'por_vencer'] as const;

/**
 * PATCH /api/documents/[id]/status
 * Updates a document's status with RBAC checks.
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status } = await req.json();

        if (!status || !VALID_STATUSES.includes(status)) {
            return NextResponse.json(
                { error: `Estado inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}` },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        // Get user profile for RBAC and org filtering
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, org_id')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 403 });
        }

        // Only admin, gestor, or owner can change document status
        if (!['admin', 'gestor', 'owner'].includes(profile.role)) {
            return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
        }

        if (!profile.org_id) {
            return NextResponse.json({ error: 'Organización no encontrada' }, { status: 403 });
        }

        // Update document status (scoped to org for security)
        const { error: updateError } = await supabase
            .from('documents')
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('org_id', profile.org_id);

        if (updateError) {
            console.error('Error updating document status:', updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, status });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido';
        console.error('Document status update error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}