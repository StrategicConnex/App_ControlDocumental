import { deepseekClient } from './deepseek-client';
import type { SupabaseClient } from '@supabase/supabase-js';

import { z } from 'zod';

export const ClassificationResultSchema = z.object({
  category: z.enum(['iso', 'contrato', 'factura', 'tecnico', 'legal', 'otros']),
  confidence: z.number(),
  extractedMetadata: z.object({
    title: z.string().optional(),
    code: z.string().optional(),
    expiryDate: z.string().optional(),
    responsible: z.string().optional(),
    amount: z.number().optional(),
    currency: z.string().optional(),
  }).catchall(z.any()),
  keyTerms: z.array(z.string()),
  summary: z.string()
});

export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;

/**
 * Uses DeepSeek to classify a document and extract key metadata.
 */
export async function classifyDocument(documentContent: string, documentName?: string): Promise<ClassificationResult> {
  const completion = await deepseekClient.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { 
        role: 'system', 
        content: `Eres un experto en clasificación de documentos para la industria Oil & Gas. 
        Analiza el contenido y devuelve un objeto JSON con:
        - category: una de ['iso', 'contrato', 'factura', 'tecnico', 'legal', 'otros']
        - confidence: 0-100
        - extractedMetadata: objeto con datos detectados (fechas en ISO, montos, etc)
        - keyTerms: array de 5-10 etiquetas
        - summary: resumen de 2 frases.
        RESPONDE ÚNICAMENTE CON EL JSON.` 
      },
      { 
        role: 'user', 
        content: `Documento: ${documentName || 'Sin nombre'}\n\nContenido:\n${documentContent.substring(0, 8000)}` 
      }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });

  const rawContent = completion.choices[0]?.message?.content || '{}';
  return ClassificationResultSchema.parse(JSON.parse(rawContent));
}

/**
 * Process a document version: Extract text, classify, and update document metadata.
 */
export async function autoProcessDocument(
  supabase: SupabaseClient, 
  documentId: string, 
  versionId: string
) {
  // 1. Fetch version info
  const { data: version, error: vError } = await supabase
    .from('document_versions')
    .select('storage_path')
    .eq('id', versionId)
    .single();

  if (vError || !version) throw new Error('No se pudo encontrar la versión del documento');

  // 2. Download from storage
  const { data: fileBlob, error: sError } = await supabase.storage
    .from('documents')
    .download(version.storage_path);

  if (sError || !fileBlob) throw new Error('No se pudo descargar el archivo de Storage');

  // 3. Extract text (Simplified for this MVP, in production use OCR or PDF parsers)
  const text = await fileBlob.text();
  
  // 4. Classify with IA
  const classification = await classifyDocument(text);
  
  // 5. Update Document metadata
  const { error: uError } = await supabase
    .from('documents')
    .update({
      category: classification.category,
      status: classification.category === 'iso' ? 'revision' : 'borrador',
      updated_at: new Date().toISOString()
    })
    .eq('id', documentId);

  if (uError) throw uError;

  // 6. Optional: Store chunks for semantic search
  // (Implementation details for RAG would go here)

  return classification;
}
