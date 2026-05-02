import { aiClient } from './ai-client';
import { createClient } from '@/utils/supabase/server';

export interface VectorizationResult {
  totalChunks: number;
  success: boolean;
  error?: string;
}

export interface HybridSearchResult {
  id: string;
  document_id: string;
  version_id: string;
  content: string;
  metadata: {
    title?: string;
    category?: string;
    [key: string]: any;
  };
  similarity: number;
  text_rank: number;
}

/**
 * Service for document vectorization and storage in pgvector.
 */
export class VectorizerService {
  /**
   * Procesa una versión de documento, la divide en fragmentos y genera embeddings.
   */
  async vectorizeDocumentVersion(
    versionId: string,
    documentId: string,
    content: string,
    orgId: string,
    supabaseClient?: any
  ): Promise<VectorizationResult> {
    try {
      const supabase = supabaseClient || await createClient();

      // 0. Obtener metadatos del documento para enriquecimiento
      const { data: docData } = await supabase
        .from('documents')
        .select('title, category, metadata')
        .eq('id', documentId)
        .single();

      const enrichmentMetadata = {
        title: docData?.title,
        category: docData?.category,
        ...(docData?.metadata as any || {})
      };

      // 1. Dividir contenido en chunks (Fragmentos de ~1000 caracteres con solapamiento)
      const chunks = this.chunkText(content, 1000, 200);

      if (chunks.length === 0) return { totalChunks: 0, success: true };

      console.log(`Vectorizando ${chunks.length} fragmentos para la versión ${versionId}`);

      // 2. Generar embeddings en lotes (evita límites de rate limit y timeouts)
      const batchSize = 20;
      const allEmbeddings: number[][] = [];

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const batchRes = await this.retry(() => aiClient.generateEmbeddingsBatch(batch));
        allEmbeddings.push(...batchRes);
      }

      // 3. Preparar inserción masiva enriquecida
      const chunksToInsert = chunks.map((chunk, i) => ({
        version_id: versionId,
        document_id: documentId,
        org_id: orgId,
        content: chunk,
        embedding: `[${(allEmbeddings[i] as number[]).join(',')}]`,
        chunk_index: i,
        metadata: enrichmentMetadata
      }));

      // 4. Guardar en document_chunks (Inserción masiva única)
      const { error: insertError } = await (supabase.from('document_chunks') as any).insert(chunksToInsert);

      if (insertError) throw insertError;

      return { totalChunks: chunks.length, success: true };
    } catch (error: any) {
      console.error(`Error en vectorizeDocumentVersion:`, error.message);
      return { totalChunks: 0, success: false, error: error.message };
    }
  }

  /**
   * Algoritmo de chunking recursivo que prioriza límites de párrafos y líneas.
   */
  private chunkText(text: string, maxSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    const paragraphs = text.split(/\n\n+/);

    let currentChunk = "";

    for (const paragraph of paragraphs) {
      // Si el párrafo cabe en el chunk actual, lo añadimos
      if ((currentChunk.length + paragraph.length) <= maxSize) {
        currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
      } else {
        // Si no cabe, guardamos el chunk actual si existe
        if (currentChunk) {
          chunks.push(currentChunk.trim());

          // Aplicar solapamiento (overlap): tomamos el final del chunk anterior
          const lastWords = currentChunk.split(' ').slice(-Math.floor(overlap / 10)).join(' ');
          currentChunk = lastWords + "\n\n" + paragraph;
        } else {
          // Si el párrafo solo ya es más grande que maxSize, hay que fragmentarlo
          if (paragraph.length > maxSize) {
            const fragments = this.splitBySeparator(paragraph, "\n", maxSize, overlap);
            chunks.push(...fragments);
            currentChunk = "";
          } else {
            currentChunk = paragraph;
          }
        }
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  }

  /**
   * Divide un texto largo usando un separador (ej. salto de línea o espacio).
   */
  private splitBySeparator(text: string, separator: string, maxSize: number, overlap: number): string[] {
    const parts = text.split(separator);
    const result: string[] = [];
    let current = "";

    for (const part of parts) {
      if ((current.length + part.length) <= maxSize) {
        current += (current ? separator : "") + part;
      } else {
        if (current) result.push(current.trim());
        current = part;
      }
    }
    if (current) result.push(current.trim());
    return result;
  }

  /**
   * Busca fragmentos semánticamente similares a una consulta.
   */
  /**
   * Busca fragmentos semánticamente similares a una consulta.
   */
  async searchSimilarChunks(
    query: string,
    orgId: string,
    limit: number = 5,
    matchThreshold: number = 0.4
  ): Promise<HybridSearchResult[]> {
    const supabase = await createClient();

    // 1. Generar embedding para la consulta
    const queryEmbedding = await aiClient.generateEmbedding(query);

    // 2. Ejecutar búsqueda híbrida en Supabase
    const { data, error } = await supabase.rpc('match_document_chunks_hybrid', {
      query_embedding: `[${queryEmbedding.join(',')}]`,
      query_text: query,
      match_threshold: matchThreshold,
      match_count: limit,
      p_org_id: orgId
    });

    if (error) throw error;
    return data as HybridSearchResult[];
  }

  /**
   * Lógica de reintento exponencial.
   */
  private async retry<T>(fn: () => Promise<T>, retries: number = 3): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      await new Promise(resolve => setTimeout(resolve, (4 - retries) * 1000));
      return this.retry(fn, retries - 1);
    }
  }
}

export const vectorizerService = new VectorizerService();
