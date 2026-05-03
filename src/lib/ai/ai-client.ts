import "server-only";
import OpenAI from 'openai';
import { z } from 'zod';
import { ProviderOrchestrator } from './pol-engine';
export type { POLResponse, AIMessage } from './pol-engine';
import { AI_MODELS, getPolConfigs } from './pol-configs';
import { Redis } from '@upstash/redis';

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, "OPENROUTER_API_KEY es requerido"),
  OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  DEEPSEEK_API_KEY: z.string().min(1, "DEEPSEEK_API_KEY es requerido"),
  DEEPSEEK_BASE_URL: z.string().url().default('https://api.deepseek.com/v1'),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY es requerido"),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('https://sc-platform.com')
});

let env: z.infer<typeof envSchema>;

try {
  env = envSchema.parse({
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });
} catch (error: any) {
  if (process.env.NODE_ENV === 'production') {
    console.error("❌ ERROR FATAL: Faltan variables de entorno críticas.");
    throw new Error("Missing AI Environment Variables");
  }
  // Fallback para dev
  env = {
    OPENROUTER_API_KEY: 'placeholder',
    OPENROUTER_BASE_URL: 'https://openrouter.ai/api/v1',
    DEEPSEEK_API_KEY: 'placeholder',
    DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
    GEMINI_API_KEY: 'placeholder',
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXT_PUBLIC_APP_URL: 'https://sc-platform.com'
  };
}

export const polConfigs = getPolConfigs(env);

export class AIClient {
  private orchestrator: ProviderOrchestrator;
  private embeddingClient: OpenAI;
  private redis?: Redis;

  constructor() {
    this.orchestrator = new ProviderOrchestrator(polConfigs);
    this.embeddingClient = new OpenAI({
      apiKey: env.OPENROUTER_API_KEY,
      baseURL: env.OPENROUTER_BASE_URL
    });

    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      this.redis = new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      });
    }
  }

  /**
   * Genera embeddings usando el modelo optimizado de OpenRouter/OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.embeddingClient.embeddings.create({
        model: 'openai/text-embedding-3-small',
        input: text.replace(/\n/g, ' '),
      });
      return response.data[0]?.embedding || [];
    } catch (error) {
      console.error('Error generando embedding:', error);
      throw error;
    }
  }

  /**
   * Chat unificado con Orquestación POL y Circuit Breaker Global
   */
  async chat(
    messages: AIMessage[],
    orgId: string,
    options: { strategy?: 'cost' | 'latency' | 'balanced'; json?: boolean } = {}
  ): Promise<POLResponse> {
    const startTime = Date.now();
    
    // 1. Check Circuit Breaker global si Redis está activo
    if (this.redis) {
      const isBlocked = await this.redis.get('ai_global_block');
      if (isBlocked) throw new Error("AI Service is temporarily suspended due to high failure rate.");
    }

    try {
      const result = await this.orchestrator.chat(messages, {
        strategy: options.strategy || 'balanced',
        response_format: options.json ? { type: 'json_object' } : { type: 'text' }
      });

      // 2. Log exitoso y reset de fallos en Redis si aplica
      await this.logAICall(orgId, result.providerId, result.model, true, result.latency, undefined, result.usage);
      
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      await this.logAICall(orgId, 'orchestrator', 'n/a', false, duration, error.message);
      
      // 3. Update Circuit Breaker en caso de error crítico
      if (this.redis) {
        const failures = await this.redis.incr('ai_consecutive_failures');
        if (failures > 10) {
          await this.redis.setex('ai_global_block', 300, 'true'); // Bloqueo de 5 min
          console.error("🚨 CIRCUIT BREAKER ACTIVADO: Servicio de IA suspendido globalmente.");
        }
      }
      
      throw error;
    }
  }

  /**
   * Realiza una búsqueda híbrida (Semántica + Keywords) en el motor RAG
   */
  async searchHybrid(query: string, orgId: string, options: { limit?: number; threshold?: number } = {}) {
    try {
      const embedding = await this.generateEmbedding(query);
      const { createAdminClient } = await import('@/utils/supabase/admin');
      const supabase = await createAdminClient();

      const { data, error } = await supabase.rpc('match_document_chunks_hybrid', {
        query_embedding: embedding as any,
        query_text: query,
        match_threshold: options.threshold || 0.5,
        match_count: options.limit || 5,
        p_org_id: orgId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in Hybrid Search:', error);
      throw error;
    }
  }

  /**
   * Clasifica un documento basado en su contenido
   */
  async classifyDocument(content: string, orgId: string) {
    const prompt = `Analiza el siguiente contenido de un documento y clasifícalo en una de estas categorías: 
    CONTRATO, FACTURA, ORDEN_COMPRA, CERTIFICADO, OTRO.
    Responde solo en formato JSON: { "category": "VALOR", "confidence": 0.XX, "reason": "..." }
    
    Contenido: ${content.substring(0, 4000)}`;

    const response = await this.chat([{ role: 'user', content: prompt }], orgId, { json: true, strategy: 'cost' });
    return JSON.parse(response.content);
  }

  /**
   * Valida una factura contra una orden de compra (Auditoría Cruzada)
   */
  async auditInvoiceAgainstPO(invoiceId: string, poId: string, orgId: string) {
    try {
      const { createAdminClient } = await import('@/utils/supabase/admin');
      const supabase = await createAdminClient();

      // 1. Recuperar datos de factura y PO
      const [{ data: invoice }, { data: po }] = await Promise.all([
        (supabase.from('invoices' as any) as any).select('*, documents(title)').eq('id', invoiceId).single(),
        (supabase.from('purchase_orders' as any) as any).select('*').eq('id', poId).single()
      ]);

      if (!invoice || !po) throw new Error("Datos de factura o PO no encontrados");

      // 2. Ejecutar validación con IA
      const prompt = `Actúa como un auditor senior de Oil & Gas. Compara los datos de la FACTURA contra la ORDEN DE COMPRA.
      Factura (${invoice.documents?.title}): ${JSON.stringify(invoice.metadata)}
      Orden de Compra: ${JSON.stringify(po)}
      
      Busca discrepancias en montos, ítems o proveedores.
      Responde estrictamente en JSON: { "isValid": boolean, "score": 0-100, "discrepancies": [...], "notes": "..." }`;

      const response = await this.chat([{ role: 'user', content: prompt }], orgId, { json: true, strategy: 'balanced' });
      const auditResult = JSON.parse(response.content);

      // 3. Persistir resultado en la base de datos
      await (supabase.from('invoices' as any) as any).update({
        ai_validation_score: auditResult.score,
        ai_discrepancy_notes: auditResult.notes,
        status: auditResult.isValid ? 'validated' : 'flagged',
        metadata: { ...invoice.metadata, audit_details: auditResult }
      }).eq('id', invoiceId);

      return auditResult;
    } catch (error) {
      console.error('Error in Invoice Auditing:', error);
      throw error;
    }
  }

  /**
   * Diagnóstico de salud del sistema de IA
   */
  async checkHealth() {
    try {
      const startTime = Date.now();
      let redisStatus = 'disconnected';
      
      if (this.redis) {
        const ping = await this.redis.ping();
        redisStatus = ping === 'PONG' ? 'connected' : 'error';
      }

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        latency_ms: Date.now() - startTime,
        circuit_breaker: redisStatus,
        providers: {
          gemini: 'available',
          deepseek: 'available',
          openrouter: 'standby'
        }
      };
    } catch (error) {
      console.error('AI Health Check failed:', error);
      return {
        status: 'degraded',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async logAICall(orgId: string, provider: string, model: string, success: boolean, time: number, error?: string, usage?: any) {
    try {
      const { createAdminClient } = await import('@/utils/supabase/admin');
      const supabase = await createAdminClient();
      await supabase.from('ai_call_logs').insert({
        org_id: orgId,
        endpoint: 'chat',
        provider,
        model,
        success,
        response_time_ms: time,
        error_message: error || null,
        prompt_tokens: usage?.prompt_tokens,
        completion_tokens: usage?.completion_tokens,
        total_tokens: usage?.total_tokens
      });
      
      if (success && this.redis) {
        await this.redis.set('ai_consecutive_failures', 0);
      }
    } catch (e) {
      console.error('Logging failed:', e);
    }
  }
}

export const aiClient = new AIClient();
