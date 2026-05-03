# 📋 Plan de Alineación Código-Documentación Maestra — Actualizado
## SC Platform — Sistema de Gestión Documental Enterprise
**Arquitectura de IA Confirmada:** Google Gemini (Primario) → DeepSeek (Backup) → OpenRouter (Failover) → Anthropic Claude (Adicional)

**Versión:** 1.1  
**Fecha:** 3 de mayo de 2026  
**Estado:** Actualizado con arquitectura POL real

---

## 1. 🧠 Arquitectura de IA Confirmada (POL v2.0)

### 1.1 Provider Orchestration Layer Real

```
┌─────────────────────────────────────────────────────────────┐
│                    AI PROVIDERS (External)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Google     │  │   DeepSeek   │  │  OpenRouter  │      │
│  │   Gemini     │  │              │  │  (Gateway)   │      │
│  │  (Primario)  │  │   (Backup)   │  │  (Failover)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │              │
│         └─────────────────┴─────────────────┘              │
│                           │                                │
│                    ┌──────┴──────┐                        │
│                    │  Anthropic  │                        │
│                    │   Claude    │                        │
│                    │  (Adicional)│                        │
│                    └─────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Estrategia de Ruteo Actualizada

| Prioridad | Provider | Modelo | Rol | Gatillo de Selección |
|-----------|----------|--------|-----|---------------------|
| **1** | Google Gemini | `gemini-3-flash` / `gemini-1.5-pro` | **Primario** | Costo bajo + ventana de contexto grande |
| **2** | DeepSeek | `deepseek-chat` | **Backup** | Equilibrio performance/costo |
| **3** | OpenRouter | `openai/gpt-4-turbo` / `anthropic/claude-3-sonnet` | **Failover Final** | Acceso a modelos premium cuando otros fallan |
| **4** | Anthropic Claude | `claude-3-sonnet` / `claude-3-opus` | **Adicional** | Tareas que requieren precisión extrema |

### 1.3 Algoritmo de Scoring POL (Confirmado)

```typescript
// Extraído de lib/ai/pol-engine.ts (línea 327)
interface ProviderScore {
  latency: number;      // Normalizado a base 3s (30% peso)
  cost: number;         // Normalizado a base $0.02/1k tokens (70% peso)
  errorRate: number;    // Fallos consecutivos
  consecutiveFailures: number; // Circuit breaker: 5 → DOWN
}

// Penalización exponencial
const penalty = Math.pow(1 + errorRate, 5);

// Score final
const score = (latencyNormalized * 0.3) + (costNormalized * 0.7) - penalty;
```

### 1.4 Configuración de Variables de Entorno

```env
# ============================================
# AI PROVIDERS — SC Platform POL v2.0
# ============================================

# Google Gemini (Primario)
GOOGLE_API_KEY=AIzaSy...
GEMINI_MODEL_PRIMARY=gemini-3-flash
GEMINI_MODEL_ADVANCED=gemini-1.5-pro

# DeepSeek (Backup)
DEEPSEEK_API_KEY=sk-207e809433304fd7aff5914aa313785e
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# OpenRouter (Failover Gateway)
OPENROUTER_API_KEY=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
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL_GPT4=openai/gpt-4-turbo
OPENROUTER_MODEL_SONNET=anthropic/claude-3-sonnet

# Anthropic Claude (Adicional)
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL_SONNET=claude-3-sonnet-20240229
ANTHROPIC_MODEL_OPUS=claude-3-opus-20240229

# Configuración POL
POL_STRATEGY=balanced        # cost | latency | balanced
POL_HEALTH_CHECK_INTERVAL=30000  # 30s
POL_CACHE_TTL=3600           # 1 hora
POL_MAX_RETRIES=3
POL_CIRCUIT_BREAKER_THRESHOLD=5
```

---

## 2. 🔍 Análisis de Brechas de IA

### 2.1 Estado Actual del POL (vs Documentación)

| Componente | Estado Real | Documentación | Brecha |
|------------|-------------|---------------|--------|
| `pol-engine.ts` | ✅ Implementado (380 líneas) | SRS §16 | Alineado |
| `pol-configs.ts` | ✅ Configurado | SRS §16.2 | Alineado |
| `ai-client.ts` | ❌ No existe (usa pol-engine directo) | `Mejoras1.md` §7.1 | **Nuevo archivo requerido** |
| `ai_call_logs` | ✅ Tabla existe | SRS §16.3 | Alineado |
| Health Check | ✅ `performHealthCheck()` | SRS §16.3 | Alineado |
| Cache de respuestas | ✅ 1h TTL | SRS §16.1 | Alineado |
| Failover automático | ✅ Circuit breaker | SRS §16.1 | Alineado |

### 2.2 Brechas Específicas de IA

| ID | Brecha | Impacto | Fase |
|----|--------|---------|------|
| **IA-01** | No hay `ai-client.ts` unificado (wrapper sobre POL) | Código duplicado en servicios | Fase 2 |
| **IA-02** | Motor Q&A con RAG no implementado | Feature roadmap pendiente | Fase 4 |
| **IA-03** | Validación de facturas con IA no implementada | Feature roadmap pendiente | Fase 4 |
| **IA-04** | Clasificación automática no implementada | Feature roadmap pendiente | Fase 4 |
| **IA-05** | `qa-engine.ts` existe pero no integrado con RAG | Parcialmente implementado | Fase 4 |
| **IA-06** | `documentClassifier.ts` existe pero no usa POL dual | Usa DeepSeek directo | Fase 4 |
| **IA-07** | `contract-validator.ts` usa POL pero sin fallback explícito | Mejora de resiliencia | Fase 2 |
| **IA-08** | `invoice-validator.ts` usa POL pero sin fallback explícito | Mejora de resiliencia | Fase 2 |

---

## 3. 🛠️ Plan Detallado por Tarea (Actualizado con IA Real)

### FASE 2: CORE DMS + IA Base (Semanas 3-4)

---

#### **IA-01: Crear `ai-client.ts` — Wrapper Unificado sobre POL**

**Estado actual:** Servicios llaman a `pol-engine.ts` directamente  
**Documentación:** `Mejoras1.md` §7.1 (cliente dual OpenRouter + DeepSeek)

**Arquitectura objetivo:**
```
Servicios (contract-validator, invoice-validator, qa-engine)
    ↓
ai-client.ts (Wrapper Unificado)
    ↓
pol-engine.ts (Orquestador existente)
    ↓
┌─────────┬──────────┬────────────┬───────────┐
↓         ↓          ↓            ↓
Gemini   DeepSeek   OpenRouter   Claude
```

**Acciones de codificación:**

1. **Crear `lib/ai/ai-client.ts`:**
   ```typescript
   /**
    * AI Client Unificado — Wrapper sobre POL
    * Provee interfaz simplificada con fallback automático
    * Mantiene compatibilidad con pol-engine.ts existente
    */
   import { polEngine } from './pol-engine';
   import { createClient } from '@/lib/supabase/server';

   export type AIModel = 
     | 'gemini-flash' 
     | 'gemini-pro' 
     | 'deepseek-chat' 
     | 'openrouter-gpt4' 
     | 'openrouter-sonnet' 
     | 'claude-sonnet' 
     | 'claude-opus';

   export type AIProvider = 'google' | 'deepseek' | 'openrouter' | 'anthropic';

   export interface AIRequest {
     messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
     model?: AIModel;
     temperature?: number;
     maxTokens?: number;
     responseFormat?: 'text' | 'json_object';
     orgId?: string; // Para logging y RLS
   }

   export interface AIResponse {
     content: string;
     provider: AIProvider;
     model: string;
     usage: {
       promptTokens: number;
       completionTokens: number;
       totalTokens: number;
     };
     responseTimeMs: number;
     cached?: boolean;
   }

   export class AIClient {
     private strategy: 'cost' | 'latency' | 'balanced';

     constructor(strategy: 'cost' | 'latency' | 'balanced' = 'balanced') {
       this.strategy = strategy;
     }

     /**
      * Envía mensaje a través del POL con fallback automático
      */
     async chat(request: AIRequest): Promise<AIResponse> {
       const startTime = Date.now();

       try {
         // 1. Usar POL para seleccionar mejor provider
         const provider = await polEngine.selectProvider({
           strategy: this.strategy,
           requireJson: request.responseFormat === 'json_object'
         });

         // 2. Enviar solicitud
         const result = await this.executeWithProvider(provider, request);

         // 3. Log exitoso
         await this.logCall({
           ...request,
           provider: result.provider,
           model: result.model,
           success: true,
           responseTimeMs: Date.now() - startTime
         });

         return result;

       } catch (error) {
         // 4. Fallback secuencial si POL falla
         return this.fallbackExecution(request, error, startTime);
       }
     }

     private async executeWithProvider(
       provider: AIProvider, 
       request: AIRequest
     ): Promise<AIResponse> {
       switch (provider) {
         case 'google':
           return this.callGemini(request);
         case 'deepseek':
           return this.callDeepSeek(request);
         case 'openrouter':
           return this.callOpenRouter(request);
         case 'anthropic':
           return this.callAnthropic(request);
         default:
           throw new Error(`Provider no soportado: ${provider}`);
       }
     }

     private async callGemini(request: AIRequest): Promise<AIResponse> {
       const { GoogleGenAI } = await import('@google/genai');
       const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY! });

       const model = request.model?.includes('pro') 
         ? process.env.GEMINI_MODEL_ADVANCED! 
         : process.env.GEMINI_MODEL_PRIMARY!;

       const result = await genAI.models.generateContent({
         model,
         contents: request.messages.map(m => ({
           role: m.role === 'assistant' ? 'model' : m.role,
           parts: [{ text: m.content }]
         })),
         generationConfig: {
           temperature: request.temperature ?? 0.1,
           maxOutputTokens: request.maxTokens ?? 2000,
           responseMimeType: request.responseFormat === 'json_object' 
             ? 'application/json' 
             : 'text/plain'
         }
       });

       return {
         content: result.text ?? '',
         provider: 'google',
         model,
         usage: {
           promptTokens: result.usageMetadata?.promptTokenCount ?? 0,
           completionTokens: result.usageMetadata?.candidatesTokenCount ?? 0,
           totalTokens: result.usageMetadata?.totalTokenCount ?? 0
         },
         responseTimeMs: 0 // Calculado en capa superior
       };
     }

     private async callDeepSeek(request: AIRequest): Promise<AIResponse> {
       const OpenAI = (await import('openai')).default;
       const client = new OpenAI({
         apiKey: process.env.DEEPSEEK_API_KEY,
         baseURL: process.env.DEEPSEEK_BASE_URL
       });

       const completion = await client.chat.completions.create({
         model: process.env.DEEPSEEK_MODEL!,
         messages: request.messages as any,
         temperature: request.temperature ?? 0.1,
         max_tokens: request.maxTokens ?? 2000,
         response_format: request.responseFormat === 'json_object' 
           ? { type: 'json_object' } 
           : undefined
       });

       return {
         content: completion.choices[0]?.message?.content ?? '',
         provider: 'deepseek',
         model: process.env.DEEPSEEK_MODEL!,
         usage: {
           promptTokens: completion.usage?.prompt_tokens ?? 0,
           completionTokens: completion.usage?.completion_tokens ?? 0,
           totalTokens: completion.usage?.total_tokens ?? 0
         },
         responseTimeMs: 0
       };
     }

     private async callOpenRouter(request: AIRequest): Promise<AIResponse> {
       const OpenAI = (await import('openai')).default;
       const client = new OpenAI({
         apiKey: process.env.OPENROUTER_API_KEY,
         baseURL: process.env.OPENROUTER_BASE_URL,
         defaultHeaders: {
           'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://sc-platform.com',
           'X-Title': 'SC Platform'
         }
       });

       const model = request.model?.includes('sonnet')
         ? process.env.OPENROUTER_MODEL_SONNET!
         : process.env.OPENROUTER_MODEL_GPT4!;

       const completion = await client.chat.completions.create({
         model,
         messages: request.messages as any,
         temperature: request.temperature ?? 0.1,
         max_tokens: request.maxTokens ?? 2000
       });

       return {
         content: completion.choices[0]?.message?.content ?? '',
         provider: 'openrouter',
         model,
         usage: {
           promptTokens: completion.usage?.prompt_tokens ?? 0,
           completionTokens: completion.usage?.completion_tokens ?? 0,
           totalTokens: completion.usage?.total_tokens ?? 0
         },
         responseTimeMs: 0
       };
     }

     private async callAnthropic(request: AIRequest): Promise<AIResponse> {
       const Anthropic = (await import('@anthropic-ai/sdk')).default;
       const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

       const model = request.model?.includes('opus')
         ? process.env.ANTHROPIC_MODEL_OPUS!
         : process.env.ANTHROPIC_MODEL_SONNET!;

       const message = await client.messages.create({
         model,
         max_tokens: request.maxTokens ?? 2000,
         temperature: request.temperature ?? 0.1,
         system: request.messages.find(m => m.role === 'system')?.content,
         messages: request.messages
           .filter(m => m.role !== 'system')
           .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
       });

       return {
         content: message.content[0]?.type === 'text' ? message.content[0].text : '',
         provider: 'anthropic',
         model,
         usage: {
           promptTokens: message.usage?.input_tokens ?? 0,
           completionTokens: message.usage?.output_tokens ?? 0,
           totalTokens: (message.usage?.input_tokens ?? 0) + (message.usage?.output_tokens ?? 0)
         },
         responseTimeMs: 0
       };
     }

     /**
      * Fallback secuencial: Gemini → DeepSeek → OpenRouter → Claude
      */
     private async fallbackExecution(
       request: AIRequest, 
       originalError: any,
       startTime: number
     ): Promise<AIResponse> {
       const fallbackChain: AIProvider[] = ['deepseek', 'openrouter', 'anthropic', 'google'];

       for (const provider of fallbackChain) {
         try {
           console.warn(`[AIClient] Fallback a ${provider} tras error:`, originalError.message);
           const result = await this.executeWithProvider(provider, request);

           await this.logCall({
             ...request,
             provider,
             model: result.model,
             success: true,
             responseTimeMs: Date.now() - startTime,
             isFallback: true
           });

           return { ...result, responseTimeMs: Date.now() - startTime };
         } catch (error) {
           console.error(`[AIClient] Fallback ${provider} falló:`, error);
           continue;
         }
       }

       throw new Error('Todos los providers de IA fallaron');
     }

     private async logCall(data: any): Promise<void> {
       try {
         const supabase = await createClient();
         await supabase.from('ai_call_logs').insert({
           org_id: data.orgId,
           provider: data.provider,
           model: data.model,
           endpoint: data.endpoint || 'chat',
           prompt_tokens: data.usage?.promptTokens,
           completion_tokens: data.usage?.completionTokens,
           total_tokens: data.usage?.totalTokens,
           response_time_ms: data.responseTimeMs,
           success: data.success,
           is_fallback: data.isFallback ?? false,
           error_message: data.error?.message,
           created_at: new Date().toISOString()
         });
       } catch (logError) {
         console.error('[AIClient] Error al logear:', logError);
       }
     }

     /**
      * Health check de todos los providers
      */
     async checkHealth(): Promise<Record<AIProvider, boolean>> {
       const results = { google: false, deepseek: false, openrouter: false, anthropic: false };

       // Verificar cada provider con ping ligero
       await Promise.all([
         this.callGemini({ messages: [{ role: 'user', content: 'ping' }], maxTokens: 1 })
           .then(() => results.google = true).catch(() => {}),
         this.callDeepSeek({ messages: [{ role: 'user', content: 'ping' }], maxTokens: 1 })
           .then(() => results.deepseek = true).catch(() => {}),
         this.callOpenRouter({ messages: [{ role: 'user', content: 'ping' }], maxTokens: 1 })
           .then(() => results.openrouter = true).catch(() => {}),
         this.callAnthropic({ messages: [{ role: 'user', content: 'ping' }], maxTokens: 1 })
           .then(() => results.anthropic = true).catch(() => {})
       ]);

       return results;
     }
   }

   // Singleton export
   export const aiClient = new AIClient();
   ```

2. **Refactorizar servicios existentes para usar `aiClient`:**
   - `contract-validator.ts`: Reemplazar llamada directa a POL
   - `invoice-validator.ts`: Reemplazar llamada directa a POL
   - `documentClassifier.ts`: Reemplazar DeepSeek directo
   - `qa-engine.ts`: Integrar con RAG + aiClient

3. **Actualizar `pol-engine.ts`:**
   - Exponer método `selectProvider()` para que `aiClient` lo use
   - Mantener backward compatibility

**Pruebas requeridas:**
- Test: cada provider responde correctamente
- Test: fallback automático cuando Gemini falla
- Test: health check retorna estado real
- Test: logging en `ai_call_logs` con provider correcto
- Test: circuit breaker funciona (5 fallos → DOWN)

**Actualización de documentación:**
- Actualizar SRS §16 con arquitectura real de 4 providers
- Documentar `ai-client.ts` en `lib/ai/README.md`
- Actualizar `.env.example` con todas las keys

**Estimación:** 3-4 días  
**Criterios de aceptación:**
- [ ] `aiClient.chat()` funciona con los 4 providers
- [ ] Fallback automático: Gemini → DeepSeek → OpenRouter → Claude
- [ ] Health check en `/api/ai/health` retorna estado de los 4
- [ ] Logs identifican provider usado en cada llamada
- [ ] Circuit breaker desactiva provider tras 5 fallos

---

#### **IA-07/08: Refactorizar Validadores para usar `aiClient` con Fallback**

**Estado actual:** `contract-validator.ts` e `invoice-validator.ts` usan POL directo  
**Objetivo:** Usar `aiClient` con fallback explícito y mejor manejo de errores

**Acciones de codificación:**

1. **Refactorizar `lib/ai/contract-validator.ts`:**
   ```typescript
   import { aiClient } from './ai-client';

   export async function validateContract(contractId: string, orgId: string) {
     // ... obtener datos del contrato ...

     const response = await aiClient.chat({
       messages: [
         { role: 'system', content: 'Valida contratos Oil & Gas. Responde en JSON.' },
         { role: 'user', content: prompt }
       ],
       temperature: 0.1,
       maxTokens: 1500,
       responseFormat: 'json_object',
       orgId
     });

     // Validar con Zod
     const result = contractValidationSchema.parse(JSON.parse(response.content));

     // Registrar provider usado para auditoría
     console.log(`[ContractValidator] Provider usado: ${response.provider}/${response.model}`);

     return result;
   }
   ```

2. **Refactorizar `lib/ai/invoice-validator.ts`:**
   - Misma estructura que contract-validator
   - Agregar comparación con PO y contrato

**Pruebas requeridas:**
- Test: validación exitosa con cada provider
- Test: fallback cuando provider primario falla
- Test: schema Zod valida respuesta correctamente
- Test: notificación generada si score < 60

**Estimación:** 1-2 días  
**Criterios de aceptación:**
- [ ] Validadores usan `aiClient` en lugar de POL directo
- [ ] Fallback funciona en validación real
- [ ] Schema Zod protege contra respuestas malformadas

---

### FASE 4: IA AVANZADA (Semanas 7-9) — Actualizado con 4 Providers

---

#### **IA-02: Implementar Motor Q&A con RAG (4 Providers)**

**Estado actual:** `qa-engine.ts` existe pero sin integración RAG completa  
**Documentación:** `Mejoras.md` §7.1, `Mejoras1.md` §8.1

**Arquitectura del Q&A Engine:**
```
Pregunta Usuario
    ↓
[1] Generar embedding de la pregunta (Gemini embeddings)
    ↓
[2] Búsqueda vectorial en document_chunks (pgvector)
    ↓
[3] Construir contexto con top-10 chunks
    ↓
[4] Llamar aiClient.chat() con contexto
    ↓
[5] POL selecciona: Gemini → DeepSeek → OpenRouter → Claude
    ↓
Respuesta + Fuentes
```

**Acciones de codificación:**

1. **Completar `lib/ai/qa-engine.ts`:**
   ```typescript
   import { aiClient } from './ai-client';
   import { createClient } from '@/lib/supabase/server';

   export interface QARequest {
     question: string;
     orgId: string;
     documentIds?: string[]; // Filtrar por documentos específicos
     maxChunks?: number;     // Default: 10
   }

   export interface QAResponse {
     answer: string;
     sources: Array<{
       documentId: string;
       documentTitle: string;
       chunkIndex: number;
       relevance: number;
     }>;
     provider: string;
     model: string;
     tokensUsed: number;
     responseTimeMs: number;
   }

   export async function askQuestion(request: QARequest): Promise<QAResponse> {
     const startTime = Date.now();
     const supabase = await createClient();

     // 1. Generar embedding de la pregunta
     const { data: embeddingData } = await supabase.functions.invoke('generate-embedding', {
       body: { text: request.question }
     });

     // 2. Buscar chunks relevantes (búsqueda híbrida)
     let query = supabase
       .rpc('match_document_chunks_hybrid', {
         query_embedding: embeddingData.embedding,
         match_threshold: 0.7,
         match_count: request.maxChunks ?? 10,
         org_id: request.orgId
       });

     if (request.documentIds?.length) {
       // Filtrar por documentos específicos
       query = query.in('document_id', request.documentIds);
     }

     const { data: chunks, error } = await query;

     if (error || !chunks?.length) {
       return {
         answer: 'No se encontraron documentos relevantes para responder tu pregunta.',
         sources: [],
         provider: 'none',
         model: 'none',
         tokensUsed: 0,
         responseTimeMs: Date.now() - startTime
       };
     }

     // 3. Construir contexto enriquecido
     const context = chunks.map((chunk, idx) => 
       `[Documento: ${chunk.document_title} | Chunk: ${chunk.chunk_index}]
${chunk.content.substring(0, 1500)}`
     ).join('

---

');

     // 4. Llamar a IA a través de aiClient (con fallback automático)
     const aiResponse = await aiClient.chat({
       messages: [
         {
           role: 'system',
           content: `Eres un asistente experto en gestión documental para Oil & Gas.
Responde basándote EXCLUSIVAMENTE en los documentos proporcionados.
Si la información no está en los documentos, indica: "No se encontró información en los documentos disponibles".
Sé conciso, preciso y cita el documento de origen entre corchetes [Documento: Título].`
         },
         {
           role: 'user',
           content: `Documentos disponibles:
${context}

Pregunta: ${request.question}`
         }
       ],
       temperature: 0.1,
       maxTokens: 2000,
       orgId: request.orgId
     });

     // 5. Extraer fuentes citadas
     const sources = chunks.slice(0, 3).map(chunk => ({
       documentId: chunk.document_id,
       documentTitle: chunk.document_title,
       chunkIndex: chunk.chunk_index,
       relevance: chunk.similarity
     }));

     // 6. Registrar en qa_logs
     await supabase.from('qa_logs').insert({
       org_id: request.orgId,
       question: request.question,
       answer: aiResponse.content,
       tokens_used: aiResponse.usage.totalTokens,
       documents_used: sources.map(s => s.documentId),
       provider_used: aiResponse.provider,
       model_used: aiResponse.model,
       response_time_ms: Date.now() - startTime,
       created_at: new Date().toISOString()
     });

     return {
       answer: aiResponse.content,
       sources,
       provider: aiResponse.provider,
       model: aiResponse.model,
       tokensUsed: aiResponse.usage.totalTokens,
       responseTimeMs: Date.now() - startTime
     };
   }
   ```

2. **Crear endpoint `app/api/ai/ask/route.ts`:**
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';
   import { askQuestion } from '@/lib/ai/qa-engine';
   import { createClient } from '@/lib/supabase/server';

   export async function POST(req: NextRequest) {
     try {
       const { question, documentIds, orgId } = await req.json();

       if (!question || !orgId) {
         return NextResponse.json(
           { error: 'Se requiere question y orgId' },
           { status: 400 }
         );
       }

       // Verificar autenticación y pertenencia a org
       const supabase = await createClient();
       const { data: { user } } = await supabase.auth.getUser();
       const { data: profile } = await supabase
         .from('profiles')
         .select('org_id, role')
         .eq('id', user!.id)
         .single();

       if (profile?.org_id !== orgId) {
         return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
       }

       const result = await askQuestion({ question, orgId, documentIds });

       return NextResponse.json({
         success: true,
         answer: result.answer,
         sources: result.sources,
         provider: result.provider,
         model: result.model,
         tokensUsed: result.tokensUsed,
         responseTimeMs: result.responseTimeMs
       });

     } catch (error) {
       console.error('[API/ai/ask] Error:', error);
       return NextResponse.json(
         { error: 'Error interno del servidor' },
         { status: 500 }
       );
     }
   }
   ```

3. **Crear componente `components/ai/AIAssistant.tsx`:**
   - Chat flotante con indicador de provider usado
   - Mostrar fuentes con links a documentos
   - Indicador de "pensando..." con provider activo

**Pruebas requeridas:**
- Test: pregunta con respuesta en documentos (cada provider)
- Test: pregunta sin respuesta relevante
- Test: fallback cuando Gemini no disponible
- Test: filtrado por documentIds
- Test: RLS (usuario no ve documentos de otra org)
- Test: tiempo de respuesta < 3 segundos

**Estimación:** 5-7 días  
**Criterios de aceptación:**
- [ ] Respuesta basada exclusivamente en documentos de la org
- [ ] Fuentes citadas con links funcionales
- [ ] Fallback entre 4 providers funciona
- [ ] Tiempo < 3s (P95)
- [ ] Indicador visual de provider usado

---

#### **IA-03: Implementar Validación Automática de Facturas (4 Providers)**

**Estado actual:** No implementado  
**Documentación:** `Mejoras.md` §7.2, `Mejoras1.md` §8.2

**Acciones de codificación:**

1. **Verificar/crear tabla `purchase_orders`:**
   ```sql
   CREATE TABLE IF NOT EXISTS purchase_orders (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     org_id UUID REFERENCES organizations(id),
     po_number TEXT NOT NULL,
     supplier_name TEXT,
     total_amount DECIMAL(15,2),
     items JSONB,
     contract_id UUID REFERENCES contracts(id),
     source_system TEXT DEFAULT 'manual',
     imported_at TIMESTAMPTZ DEFAULT NOW(),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Crear `lib/services/invoiceValidationService.ts`:**
   ```typescript
   import { aiClient } from '@/lib/ai/ai-client';
   import { createClient } from '@/lib/supabase/server';
   import { z } from 'zod';

   const ValidationResultSchema = z.object({
     isValid: z.boolean(),
     confidence: z.number().min(0).max(100),
     discrepancies: z.array(z.object({
       type: z.enum(['price', 'quantity', 'total', 'contract_term', 'missing_po', 'duplicate']),
       description: z.string(),
       expected: z.string(),
       actual: z.string(),
       severity: z.enum(['high', 'medium', 'low'])
     })),
     recommendations: z.array(z.string()),
     validatedAmount: z.number(),
     providerUsed: z.string().optional()
   });

   export type ValidationResult = z.infer<typeof ValidationResultSchema>;

   export async function validateInvoice(invoiceId: string): Promise<ValidationResult> {
     const supabase = await createClient();
     const startTime = Date.now();

     // 1. Obtener factura con items
     const { data: invoice } = await supabase
       .from('invoices')
       .select(`*, invoice_items(*)`)
       .eq('id', invoiceId)
       .single();

     if (!invoice) throw new Error('Factura no encontrada');

     // 2. Obtener PO asociada
     const { data: po } = await supabase
       .from('purchase_orders')
       .select('*')
       .eq('po_number', invoice.po_number)
       .eq('org_id', invoice.org_id)
       .single();

     // 3. Obtener contrato asociado
     const { data: contract } = await supabase
       .from('contracts')
       .select('*, documents(title)')
       .eq('id', invoice.contract_id)
       .single();

     // 4. Construir prompt enriquecido
     const prompt = `
Analiza la siguiente factura y valídala contra la Orden de Compra (PO) y el contrato asociado.

FACTURA #${invoice.invoice_number}:
- Monto total: $${invoice.amount}
- Fecha: ${invoice.invoice_date}
- Proveedor: ${invoice.supplier_name}
- Items: ${JSON.stringify(invoice.invoice_items, null, 2)}

${po ? `ORDEN DE COMPRA #${po.po_number}:
- Monto total: $${po.total_amount}
- Fecha: ${po.issue_date}
- Items: ${JSON.stringify(po.items, null, 2)}` : 'NO SE ENCONTRÓ ORDEN DE COMPRA'}

${contract ? `CONTRATO #${contract.contract_number}:
- Contraparte: ${contract.counterparty}
- Vigencia: ${contract.start_date} a ${contract.end_date}
- Valor total: $${contract.contract_value}
- Términos clave: ${contract.key_terms || 'No especificados'}` : 'NO HAY CONTRATO ASOCIADO'}

Identifica discrepancias en:
1. Precios unitarios vs PO
2. Cantidades vs PO
3. Cálculos de totales (precio × cantidad)
4. Condiciones contractuales (vigencia, penalidades)
5. Facturas duplicadas
6. PO faltante

Responde ÚNICAMENTE en formato JSON válido:
{
  "isValid": boolean,
  "confidence": number (0-100),
  "discrepancies": [
    {
      "type": "price|quantity|total|contract_term|missing_po|duplicate",
      "description": "string",
      "expected": "string",
      "actual": "string",
      "severity": "high|medium|low"
    }
  ],
  "recommendations": ["string"],
  "validatedAmount": number
}`;

     // 5. Llamar a IA con aiClient (fallback automático entre 4 providers)
     const aiResponse = await aiClient.chat({
       messages: [
         {
           role: 'system',
           content: 'Eres un experto en validación de facturas para el sector Oil & Gas. Responde SOLO con el JSON solicitado, sin texto adicional ni markdown.'
         },
         { role: 'user', content: prompt }
       ],
       temperature: 0.1,
       maxTokens: 2000,
       responseFormat: 'json_object',
       orgId: invoice.org_id
     });

     // 6. Parsear y validar con Zod
     let result: ValidationResult;
     try {
       const parsed = JSON.parse(aiResponse.content);
       result = ValidationResultSchema.parse(parsed);
       result.providerUsed = `${aiResponse.provider}/${aiResponse.model}`;
     } catch (parseError) {
       console.error('[InvoiceValidation] Error parseando respuesta IA:', parseError);
       console.error('[InvoiceValidation] Respuesta cruda:', aiResponse.content);
       throw new Error('La IA retornó una respuesta inválida');
     }

     // 7. Guardar resultado en factura
     await supabase
       .from('invoices')
       .update({
         validation_result: result,
         status: result.isValid ? 'aprobada' : 'observada',
         validated_at: new Date().toISOString(),
         validated_by_provider: result.providerUsed
       })
       .eq('id', invoiceId);

     // 8. Generar notificación si hay discrepancias graves
     if (result.discrepancies.some(d => d.severity === 'high')) {
       await supabase.from('notifications').insert({
         org_id: invoice.org_id,
         type: 'audit_alert',
         severity: 'critical',
         title: 'Factura con discrepancias graves',
         message: `La factura #${invoice.invoice_number} presenta ${result.discrepancies.filter(d => d.severity === 'high').length} discrepancias de alta severidad.`,
         link: `/invoices/${invoiceId}`,
         created_at: new Date().toISOString()
       });
     }

     // 9. Log de llamada IA
     await supabase.from('ai_call_logs').insert({
       org_id: invoice.org_id,
       endpoint: 'invoice_validation',
       provider: aiResponse.provider,
       model: aiResponse.model,
       prompt_tokens: aiResponse.usage.promptTokens,
       completion_tokens: aiResponse.usage.completionTokens,
       total_tokens: aiResponse.usage.totalTokens,
       response_time_ms: Date.now() - startTime,
       success: true
     });

     return result;
   }
   ```

3. **Crear endpoint `app/api/invoices/validate/route.ts`**
4. **Crear componente `components/invoices/InvoiceValidator.tsx`**
   - Mostrar provider usado para la validación
   - Badge de confianza
   - Lista de discrepancias con severidad
   - Botón "Revalidar con otro provider" (opción avanzada)

**Pruebas requeridas:**
- Test: factura válida (sin discrepancias) — cada provider
- Test: factura con discrepancias de precio
- Test: factura sin PO asociada
- Test: factura duplicada
- Test: precisión > 95% con dataset de 50 facturas reales
- Test: fallback cuando provider falla

**Estimación:** 4-5 días  
**Criterios de aceptación:**
- [ ] Detecta discrepancias de precio/cantidad/total
- [ ] Precisión > 95% en dataset de prueba
- [ ] Notificación automática para severidad alta
- [ ] Provider usado visible en UI
- [ ] Tiempo < 10s

---

#### **IA-04: Implementar Clasificación Automática de Documentos (4 Providers)**

**Estado actual:** `documentClassifier.ts` existe pero usa DeepSeek directo  
**Documentación:** `Mejoras.md` §7.3, `Mejoras1.md` §8.3

**Acciones de codificación:**

1. **Refactorizar `lib/ai/documentClassifier.ts`:**
   ```typescript
   import { aiClient } from './ai-client';
   import { createClient } from '@/lib/supabase/server';
   import { z } from 'zod';

   const ClassificationSchema = z.object({
     category: z.enum([
       'iso', 'legajo', 'presupuesto', 'contrato', 
       'personal', 'vehiculo', 'factura', 'informe_tecnico',
       'certificacion', 'poliza', 'otro'
     ]),
     subcategory: z.string().optional(),
     confidence: z.number().min(0).max(100),
     extractedMetadata: z.object({
       title: z.string().optional(),
       issueDate: z.string().optional(),
       expiryDate: z.string().optional(),
       responsible: z.string().optional(),
       counterparty: z.string().optional(),
       documentNumber: z.string().optional(),
       supplier: z.string().optional(),
       totalAmount: z.number().optional(),
       currency: z.string().optional()
     }),
     keyTerms: z.array(z.string()),
     summary: z.string(),
     suggestedTags: z.array(z.string())
   });

   export type DocumentClassification = z.infer<typeof ClassificationSchema>;

   export async function classifyDocument(
     content: string,
     fileName?: string,
     orgId?: string
   ): Promise<DocumentClassification> {
     const prompt = `Analiza el siguiente documento y clasifícalo según su tipo y contenido.

Nombre del archivo: ${fileName || 'desconocido'}
Longitud del contenido: ${content.length} caracteres

Contenido (primeros 8000 caracteres):
${content.substring(0, 8000)}

Responde ÚNICAMENTE en formato JSON válido:
{
  "category": "iso|legajo|presupuesto|contrato|personal|vehiculo|factura|informe_tecnico|certificacion|poliza|otro",
  "subcategory": "subtipo específico si aplica",
  "confidence": 0-100,
  "extractedMetadata": {
    "title": "título sugerido o null",
    "issueDate": "YYYY-MM-DD o null",
    "expiryDate": "YYYY-MM-DD o null",
    "responsible": "nombre del responsable o null",
    "counterparty": "contraparte o null",
    "documentNumber": "número de documento o null",
    "supplier": "proveedor o null",
    "totalAmount": numero o null,
    "currency": "moneda o null"
  },
  "keyTerms": ["término1", "término2"],
  "summary": "resumen ejecutivo en 2-3 oraciones",
  "suggestedTags": ["tag1", "tag2"]
}`;

     const aiResponse = await aiClient.chat({
       messages: [
         {
           role: 'system',
           content: 'Eres un clasificador experto de documentos empresariales para el sector Oil & Gas. Responde SOLO con el JSON solicitado, sin explicaciones adicionales.'
         },
         { role: 'user', content: prompt }
       ],
       temperature: 0.2,
      maxTokens: 1500,
       responseFormat: 'json_object',
       orgId
     });

     try {
       const parsed = JSON.parse(aiResponse.content);
       return ClassificationSchema.parse(parsed);
     } catch (error) {
       console.error('[DocumentClassifier] Error parseando:', error);
       console.error('[DocumentClassifier] Respuesta cruda:', aiResponse.content);
       throw new Error('Clasificación fallida');
     }
   }

   export async function autoTagDocument(documentId: string, versionId: string): Promise<void> {
     const supabase = await createClient();

     // 1. Obtener contenido del documento
     const { data: version } = await supabase
       .from('document_versions')
       .select('storage_path, content_extracted')
       .eq('id', versionId)
       .single();

     let text = version?.content_extracted;

     // Si no hay contenido extraído, descargar archivo
     if (!text && version?.storage_path) {
       const { data: fileData } = await supabase.storage
         .from('documents')
         .download(version.storage_path);

       // Extraer texto según tipo de archivo
       text = await extractTextFromFile(fileData);

       // Guardar contenido extraído para futuras consultas
       await supabase
         .from('document_versions')
         .update({ content_extracted: text })
         .eq('id', versionId);
     }

     if (!text) throw new Error('No se pudo extraer contenido del documento');

     // 2. Obtener metadata del documento
     const { data: document } = await supabase
       .from('documents')
       .select('title, org_id')
       .eq('id', documentId)
       .single();

     // 3. Clasificar con IA (usa aiClient con fallback)
     const classification = await classifyDocument(text, document?.title, document?.org_id);

     // 4. Actualizar documento con metadata extraída
     await supabase
       .from('documents')
       .update({
         category: classification.category,
         title: classification.extractedMetadata.title || document?.title,
         metadata: {
           ...classification.extractedMetadata,
           keyTerms: classification.keyTerms,
           suggestedTags: classification.suggestedTags,
           autoClassified: true,
           classificationConfidence: classification.confidence,
           classificationProvider: aiResponse.provider
         },
         auto_classified_at: new Date().toISOString()
       })
       .eq('id', documentId);

     // 5. Crear sugerencia para el usuario
     await supabase.from('suggestions').insert({
       document_id: documentId,
       type: 'auto_classification',
       content: classification,
       is_applied: false,
       created_at: new Date().toISOString()
     });
   }

   async function extractTextFromFile(fileData: Blob): Promise<string> {
     // Implementar extracción según tipo de archivo
     // PDF: pdf-parse
     // DOCX: mammoth
     // XLSX: xlsx
     // Imagen: OCR (Tesseract.js o Google Vision)
     // Por ahora, retornar texto plano si es posible
     return new TextDecoder().decode(await fileData.arrayBuffer()).substring(0, 10000);
   }
   ```

2. **Crear endpoint `app/api/ai/extract-document/route.ts`**
3. **Crear componente `components/documents/AIDocumentUploader.tsx`**
   - Dropzone con react-dropzone
   - Preview de clasificación en tiempo real
   - Edición de metadata sugerida antes de guardar
   - Indicador de confianza y provider usado

**Pruebas requeridas:**
- Test: PDF de contrato → categoría "contrato" (cada provider)
- Test: Factura → categoría "factura"
- Test: Certificación ISO → categoría "iso"
- Test: Metadata extraída (fechas, montos, responsables)
- Test: reducción de etiquetado manual en 90%
- Test: fallback entre providers

**Estimación:** 4-5 días  
**Criterios de aceptación:**
- [ ] Clasificación correcta > 90%
- [ ] Metadata extraída (fechas, montos, responsables)
- [ ] Reducción de etiquetado manual en 90%
- [ ] Tiempo < 5s por página
- [ ] Provider usado visible en UI

---

## 4. 📊 Resumen de Implementación de IA

### 4.1 Matriz de Features IA vs Providers

| Feature | Gemini | DeepSeek | OpenRouter | Claude | Fallback |
|---------|--------|----------|------------|--------|----------|
| Q&A RAG | Primario | Backup | Failover | Adicional | ✅ Auto |
| Validación Facturas | Primario | Backup | Failover | Adicional | ✅ Auto |
| Clasificación Docs | Primario | Backup | Failover | Adicional | ✅ Auto |
| Validación Contratos | Primario | Backup | Failover | Adicional | ✅ Auto |
| Resumen Ejecutivo | Primario | Backup | Failover | Adicional | ✅ Auto |
| Extracción Metadata | Primario | Backup | Failover | Adicional | ✅ Auto |

### 4.2 Dependencias de Paquetes

```bash
# Ya instalados (confirmado en package.json)
npm install openai                    # DeepSeek + OpenRouter (OpenAI-compatible)
npm install @google/genai            # Google Gemini
npm install @anthropic-ai/sdk        # Anthropic Claude

# Nuevos requeridos
npm install zod                      # Validación de respuestas IA
npm install pdf-parse                # Extracción PDF
npm install mammoth                  # Extracción DOCX
npm install xlsx                     # Extracción Excel
npm install tesseract.js             # OCR (opcional)
```

### 4.3 Variables de Entorno Actualizadas

```env
# ============================================
# AI PROVIDERS — SC Platform POL v2.0
# ============================================

# Google Gemini (Primario)
GOOGLE_API_KEY=AIzaSy...
GEMINI_MODEL_PRIMARY=gemini-3-flash
GEMINI_MODEL_ADVANCED=gemini-1.5-pro

# DeepSeek (Backup)
DEEPSEEK_API_KEY=sk-207e809433304fd7aff5914aa313785e
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat

# OpenRouter (Failover Gateway)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL_GPT4=openai/gpt-4-turbo
OPENROUTER_MODEL_SONNET=anthropic/claude-3-sonnet

# Anthropic Claude (Adicional)
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL_SONNET=claude-3-sonnet-20240229
ANTHROPIC_MODEL_OPUS=claude-3-opus-20240229

# Configuración POL
POL_STRATEGY=balanced
POL_HEALTH_CHECK_INTERVAL=30000
POL_CACHE_TTL=3600
POL_MAX_RETRIES=3
POL_CIRCUIT_BREAKER_THRESHOLD=5
```

---

## 5. ✅ Criterios de Aceptación de IA

### 5.1 Funcionales

| Criterio | Métrica | Herramienta |
|----------|---------|-------------|
| Fallback automático | < 2s conmutación | Logs + Tests |
| Health check | Cada 30s | `/api/ai/health` |
| Circuit breaker | 5 fallos → DOWN | `pol-engine.ts` |
| Cache de respuestas | 1h TTL | `ai_call_logs` |
| Logging de provider | 100% de llamadas | `ai_call_logs` |

### 5.2 Rendimiento

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| Latencia Q&A (P95) | < 3s | `qa_logs.response_time_ms` |
| Latencia Validación (P95) | < 10s | `ai_call_logs` |
| Latencia Clasificación (P95) | < 5s | `ai_call_logs` |
| Disponibilidad IA | 99.9% | Health checks |
| Precisión Validación | > 95% | Dataset de prueba |
| Precisión Clasificación | > 90% | Dataset de prueba |

### 5.3 Costos

| Provider | Costo/1M tokens | Uso Esperado |
|----------|-----------------|--------------|
| Gemini Flash | ~$0.35 | 60% |
| DeepSeek | ~$0.14 | 25% |
| OpenRouter | ~$0.50-2.00 | 10% |
| Claude Sonnet | ~$3.00 | 5% |

---

## 6. 🔮 Recomendaciones Específicas de IA

### 6.1 Monitoreo de Costos

```typescript
// Agregar a ai-client.ts
private async trackCost(provider: AIProvider, usage: TokenUsage): Promise<void> {
  const rates = {
    google: { input: 0.35, output: 1.05 },
    deepseek: { input: 0.14, output: 0.28 },
    openrouter: { input: 0.50, output: 1.50 },
    anthropic: { input: 3.00, output: 15.00 }
  };

  const cost = (usage.promptTokens / 1e6 * rates[provider].input) +
               (usage.completionTokens / 1e6 * rates[provider].output);

  // Enviar a métricas (Datadog, etc.)
  console.log(`[Cost] ${provider}: $${cost.toFixed(4)}`);
}
```

### 6.2 Optimización de Prompts

- **Gemini:** Usar `responseMimeType: 'application/json'` para JSON nativo
- **DeepSeek:** Usar `response_format: { type: 'json_object' }`
- **OpenRouter:** Incluir headers `HTTP-Referer` y `X-Title`
- **Claude:** Usar `system` parameter en lugar de mensaje system

### 6.3 Estrategia de Selección por Tarea

| Tarea | Provider Recomendado | Razón |
|-------|---------------------|-------|
| Q&A RAG | Gemini Flash | Ventana de contexto grande (1M tokens) |
| Validación facturas | DeepSeek | Precisión numérica + costo bajo |
| Clasificación | Gemini Flash | Velocidad + costo |
| Análisis legal complejo | Claude Opus | Razonamiento avanzado |
| Fallback general | OpenRouter | Acceso a múltiples modelos |

---

**Fin del Plan Actualizado**

*Documento generado el 3 de mayo de 2026*
*Arquitectura de IA confirmada: Gemini → DeepSeek → OpenRouter → Claude*
