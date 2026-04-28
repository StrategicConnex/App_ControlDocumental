import { aiClient, AIResponse } from './ai-client';
import { createClient } from '@/utils/supabase/server';
import { vectorizerService } from './vectorizer';

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

  // 1. Semantic Search using pgvector
  const relevantChunks = await vectorizerService.searchSimilarChunks(
    request.question, 
    request.orgId,
    5
  );

  if (!relevantChunks || relevantChunks.length === 0) {
    return {
      answer: 'No encontré fragmentos de documentos semánticamente relevantes para responder esta pregunta.',
      sources: [],
      provider: 'none',
      model: 'none',
      tokensUsed: 0
    };
  }

  // 2. Fetch document titles for sources
  const versionIds = [...new Set(relevantChunks.map((c: { version_id: string }) => c.version_id))];
  const { data: versions } = await supabase
    .from('document_versions')
    .select('id, documents(id, title)')
    .in('id', versionIds);

  const sourceMap = new Map();
  const uniqueDocsMap = new Map();
  versions?.forEach((v: any) => {
    const docData = v.documents;
    const doc = Array.isArray(docData) ? docData[0] : docData;
    if (doc) {
      sourceMap.set(v.id, { id: doc.id, title: doc.title });
      uniqueDocsMap.set(doc.id, doc);
    }
  });

  const docs = Array.from(uniqueDocsMap.values());

  // 3. Build context from semantic chunks
  const context = relevantChunks.map((chunk: { version_id: string; content: string }) => {
    const source = sourceMap.get(chunk.version_id);
    return `[Fuente: ${source?.title || 'Documento Desconocido'}]\n${chunk.content}`;
  }).join('\n\n---\n\n');

  // 4. Query AI using Unified Client
  const aiResponse = await aiClient.chat([
    {
      role: 'system',
      content: `Eres un asistente experto en gestión documental para el sector Oil & Gas.
      Responde preguntas basándote EXCLUSIVAMENTE en los documentos proporcionados.
      Si la respuesta no está en los documentos, indica: "No se encontró información en los documentos disponibles".
      Sé conciso, preciso y cita el documento de origen.`
    },
    {
      role: 'user',
      content: `Documentos disponibles:\n${context}\n\nPregunta: ${request.question}`
    }
  ], request.orgId);

  // 5. Log in qa_logs
  await supabase.from('qa_logs').insert({
    org_id: request.orgId,
    question: request.question,
    answer: aiResponse.content,
    tokens_used: aiResponse.usage.total_tokens,
    documents_used: docs.map(d => d.id),
    provider_used: aiResponse.provider
  });

  return {
    answer: aiResponse.content,
    sources: docs.map(d => ({ id: d.id, title: d.title })),
    provider: aiResponse.provider,
    model: aiResponse.model,
    tokensUsed: aiResponse.usage.total_tokens
  };
}
