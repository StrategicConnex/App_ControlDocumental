import OpenAI from 'openai';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-207e809433304fd7aff5914aa313785e';
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';

export const deepseekClient = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: DEEPSEEK_BASE_URL,
});

export interface DeepSeekResponse {
  content: string;
  usage: { 
    prompt_tokens: number; 
    completion_tokens: number; 
    total_tokens: number 
  };
}

/**
 * Performs a Q&A query against document context using DeepSeek.
 */
export async function queryDocuments(question: string, documentsContext: string): Promise<DeepSeekResponse> {
  const completion = await deepseekClient.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { 
        role: 'system', 
        content: 'Eres un asistente experto en gestión documental para el sector Oil & Gas. Tu misión es ayudar a los usuarios a navegar normativas ISO, contratos y documentos técnicos. Responde basándote EXCLUSIVAMENTE en los documentos proporcionados. Si la respuesta no está en el contexto, indícalo amablemente.' 
      },
      { 
        role: 'user', 
        content: `Documentos de referencia:\n${documentsContext}\n\nPregunta del usuario: ${question}` 
      }
    ],
    temperature: 0.1, // Baja temperatura para mayor precisión factual
    max_tokens: 2000,
  });

  return {
    content: completion.choices[0]?.message?.content || '',
    usage: {
      prompt_tokens: completion.usage?.prompt_tokens || 0,
      completion_tokens: completion.usage?.completion_tokens || 0,
      total_tokens: completion.usage?.total_tokens || 0,
    }
  };
}

/**
 * Generates a concise summary for a specific document.
 */
export async function generateDocumentSummary(documentContent: string, documentTitle: string): Promise<string> {
  const completion = await deepseekClient.chat.completions.create({
    model: 'deepseek-chat',
    messages: [
      { 
        role: 'system', 
        content: 'Genera un resumen ejecutivo del siguiente documento para un Gerente de Compliance. Enfócate en fechas críticas, obligaciones contractuales, responsables y riesgos potenciales.' 
      },
      { 
        role: 'user', 
        content: `Documento: ${documentTitle}\n\nContenido:\n${documentContent.substring(0, 10000)}` 
      }
    ],
    temperature: 0.3,
    max_tokens: 600,
  });
  
  return completion.choices[0]?.message?.content || '';
}
