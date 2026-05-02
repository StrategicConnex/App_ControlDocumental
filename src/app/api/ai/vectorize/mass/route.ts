import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { vectorizerService } from '@/lib/ai/vectorizer';

/**
 * Endpoint for mass vectorization of documents.
 * Finds the latest versions of documents that haven't been vectorized yet.
 */
export async function POST(req: NextRequest) {
  try {
    const { orgId, force = false } = await req.json();
    if (!orgId) return NextResponse.json({ error: 'orgId es requerido' }, { status: 400 });

    const supabase = await createClient();

    // 1. Fetch latest versions of documents in the org
    const { data: versions, error: vError } = await supabase
      .from('document_versions')
      .select(`
        id,
        content_extracted,
        documents!inner (
          id,
          org_id,
          title
        )
      `)
      .eq('documents.org_id', orgId);

    if (vError) throw vError;

    // 2. Process versions
    const processedCount = { success: 0, failed: 0, skipped: 0 };
    
    for (const version of versions || []) {
      const docId = Array.isArray(version.documents) ? version.documents[0]?.id : (version.documents as any)?.id;
      if (!docId) continue;

      // Check if chunks already exist
      const { count } = await supabase
        .from('document_chunks')
        .select('*', { count: 'exact', head: true })
        .eq('version_id', version.id);

      // If force is true, we delete existing chunks first
      if (force && count && count > 0) {
        await supabase.from('document_chunks').delete().eq('version_id', version.id);
      }

      // Process if no chunks (or deleted) and we have content
      if ((force || (count === 0)) && version.content_extracted) {
        // Vectorize!
        const result = await vectorizerService.vectorizeDocumentVersion(
          version.id, 
          docId,
          version.content_extracted, 
          orgId
        );

        if (result.success) processedCount.success++;
        else processedCount.failed++;
      } else {
        processedCount.skipped++;
      }
    }

    return NextResponse.json({
      message: 'Proceso de vectorización completado',
      stats: processedCount
    });

  } catch (error: any) {
    console.error('Error en mass-vectorization:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
