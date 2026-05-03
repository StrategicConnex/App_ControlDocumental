import { aiClient, POLResponse } from './ai-client';
import { createClient } from '@/utils/supabase/server';
import { vectorizerService, HybridSearchResult } from './vectorizer';

export interface QARequest {
  question: string;
  orgId: string;
  documentIds?: string[];
}

export interface QAResponse {
  answer: string;
  sources: Array<{ id: string; title: string }>;
  provider: string;
  model: string;
  tokensUsed: number;
}

/**
 * Advanced Q&A Engine with RAG (Semantic Search).
 */
export async function askQuestion(request: QARequest): Promise<QAResponse> {
  const supabase = await createClient();

  // 1. Hybrid Search (Vector + Text)
  const startTimeSearch = Date.now();
  const chunks: HybridSearchResult[] = await vectorizerService.searchSimilarChunks(
    request.question, 
    request.orgId,
    7,
    0.3 // Threshold mínimo de similitud
  );
  const latencySearch = Date.now() - startTimeSearch;

  if (!chunks || chunks.length === 0) {
    return {
      answer: 'No encontré información relevante en los documentos oficiales para responder esta pregunta.',
      sources: [],
      provider: 'none',
      model: 'none',
      tokensUsed: 0
    };
  }

  // 2. Lightweight Reranking (Metadata & Relevance)
  const queryLower = request.question.toLowerCase();
  const rankedChunks = chunks.map(chunk => {
    let boost = 0;
    const title = chunk.metadata?.title?.toLowerCase() || '';
    const category = chunk.metadata?.category?.toLowerCase() || '';
    
    // Boost si el título o categoría están mencionados explícitamente
    if (title && queryLower.includes(title)) boost += 0.15;
    if (category && queryLower.includes(category)) boost += 0.05;
    
    return { ...chunk, finalScore: chunk.similarity + boost };
  }).sort((a, b) => b.finalScore - a.finalScore).slice(0, 5);

  // 3. Build context and sources from enriched chunks
  const sourcesMap = new Map<string, { id: string; title: string }>();
  const context = rankedChunks.map((chunk, i) => {
    const title = chunk.metadata?.title || 'Documento';
    const docId = chunk.document_id;
    
    if (docId && !sourcesMap.has(docId)) {
      sourcesMap.set(docId, { id: docId, title });
    }
    
    return `[Fuente ${i + 1}: ${title}] (Categoría: ${chunk.metadata?.category || 'General'})\n${chunk.content}`;
  }).join('\n\n---\n\n');

  const docs = Array.from(sourcesMap.values());

  // 4. Query AI using Unified Client
  const startTimeAI = Date.now();
  const aiResponse = await aiClient.chat([
    {
      role: 'system',
      content: `Eres el Asistente de Cumplimiento de Strategic Connex.
Tu objetivo es responder preguntas basándote EXCLUSIVAMENTE en el contexto proporcionado.

REGLAS CRÍTICAS:
1. Si la información no está en el contexto, di: "Lo siento, no tengo registros oficiales sobre eso."
2. Debes CITAR siempre la fuente usando la nomenclatura [Fuente X] al final de cada afirmación relevante.
3. Prioriza la precisión técnica (ej. códigos, fechas, RUTs).
4. Mantén un tono profesional y directo.`
    },
    {
      role: 'user',
      content: `Contexto de documentos oficiales:\n${context}\n\nPregunta: ${request.question}`
    }
  ], request.orgId);
  const latencyAI = Date.now() - startTimeAI;

  // 5. Log in qa_logs
  await supabase.from('qa_logs').insert({
    org_id: request.orgId,
    question: request.question,
    answer: aiResponse.content,
    tokens_used: aiResponse.usage.total_tokens,
    documents_used: docs.map(d => d.id),
    provider_used: aiResponse.providerId
  });

  return {
    answer: aiResponse.content,
    sources: docs.map(d => ({ id: d.id, title: d.title })),
    provider: aiResponse.providerId,
    model: aiResponse.model,
    tokensUsed: aiResponse.usage.total_tokens
  };
}
