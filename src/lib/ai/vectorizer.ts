import { aiClient } from './ai-client';
import { createClient } from '@/utils/supabase/server';

export interface VectorizationResult {
  totalChunks: number;
  success: boolean;
  error?: string;
}

/**
 * Service for document vectorization and storage in pgvector.
 */
export class VectorizerService {
  /**
   * Procesa una versión de documento, la divide en fragmentos y genera embeddings.
   */
  async vectorizeDocumentVersion(versionId: string, content: string, orgId: string): Promise<VectorizationResult> {
    try {
      const supabase = await createClient();

      // 1. Dividir contenido en chunks (Fragmentos de ~1000 caracteres con solapamiento)
      const chunks = this.chunkText(content, 1000, 200);
      
      console.log(`Vectorizando ${chunks.length} fragmentos para la versión ${versionId}`);

      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        
        // 2. Generar embedding usando AIClient
        const embedding = await aiClient.generateEmbedding(chunkText);

        // 3. Guardar en document_chunks
        const { error: insertError } = await supabase.from('document_chunks').insert({
          version_id: versionId,
          org_id: orgId,
          content: chunkText,
          embedding: embedding,
          chunk_index: i,
          metadata: { length: chunkText.length }
        });

        if (insertError) throw insertError;
      }

      return { totalChunks: chunks.length, success: true };
    } catch (error: any) {
      console.error(`Error en vectorizeDocumentVersion:`, error.message);
      return { totalChunks: 0, success: false, error: error.message };
    }
  }

  /**
   * Algoritmo de chunking con solapamiento (overlap) para mantener contexto.
   */
  private chunkText(text: string, size: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      let end = start + size;
      
      // Intentar no cortar palabras a la mitad
      if (end < text.length) {
        const lastSpace = text.lastIndexOf(' ', end);
        if (lastSpace > start) {
          end = lastSpace;
        }
      }

      chunks.push(text.substring(start, end).trim());
      start = end - overlap;
      if (start < 0) start = 0;
      if (start >= text.length || end >= text.length) break;
    }

    return chunks;
  }

  /**
   * Busca fragmentos semánticamente similares a una consulta.
   */
  async searchSimilarChunks(query: string, orgId: string, limit: number = 5) {
    const supabase = await createClient();
    
    // 1. Generar embedding para la consulta
    const queryEmbedding = await aiClient.generateEmbedding(query);

    // 2. Ejecutar búsqueda vectorial en Supabase usando la función RPC match_document_chunks
    // Nota: Esta función debe estar definida en PostgreSQL (la incluiremos en la migración)
    const { data, error } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: limit,
      p_org_id: orgId
    });

    if (error) throw error;
    return data;
  }
}

export const vectorizerService = new VectorizerService();
