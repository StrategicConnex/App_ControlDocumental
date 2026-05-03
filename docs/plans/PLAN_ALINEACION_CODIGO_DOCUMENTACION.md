# 📋 Plan de Alineación Código-Documentación Maestra
## SC Platform — Sistema de Gestión Documental Enterprise

**Versión:** 1.0  
**Fecha:** 3 de mayo de 2026  
**Autor:** Ingeniero de Software Senior  
**Estado:** Borrador para revisión técnica

---

## 1. 🎯 Alcance y Contexto

### 1.1 Objetivo
Alinear el código real del sistema SC Platform con la `DOCUMENTACION_MAESTRA_SISTEMA_GESTION_DOCUMENTAL.md`, identificando brechas, priorizando implementaciones y estableciendo un cronograma ejecutable.

### 1.2 Estado Actual del Proyecto
- **Código:** No disponible en el entorno de análisis (solo documentación)
- **Documentación:** 7 archivos maestros analizados
- **Base de datos:** Schema SQL disponible (`DATABASE_MASTER.sql`)
- **Análisis previo:** `ANALISIS_SRS_VS_IMPLEMENTACION.md` (2 de mayo 2026)

### 1.3 Fuentes de Verdad
| Documento | Propósito |
|-----------|-----------|
| `DOCUMENTACION_MAESTRA_SISTEMA_GESTION_DOCUMENTAL.md` | Especificación funcional y técnica |
| `ANALISIS_SRS_VS_IMPLEMENTACION.md` | Gap analysis SRS vs código real |
| `srs_gestion_documental.md` | SRS original v3.5 |
| `Mejoras.md` / `Mejoras1.md` | Roadmap de features v4.0/v4.1 |
| `DATABASE_MASTER.sql` | Schema de base de datos |
| `DATABASE_MASTER_DOC.md` | Documentación de datos |

---

## 2. 🔍 Análisis de Brechas (Gap Analysis)

### 2.1 Metodología de Análisis
1. **Extracción:** Identificar todos los requisitos funcionales (RF) y no funcionales (RNF) de la documentación maestra
2. **Verificación:** Cruzar contra el análisis SRS vs implementación
3. **Clasificación:** Categorizar por estado (✅ Implementado / ⚠️ Parcial / ❌ Ausente)
4. **Impacto:** Evaluar criticidad para el negocio Oil & Gas

### 2.2 Matriz de Brechas Completa

#### Categoría A: Críticas (Bloqueantes para Producción)

| ID | Brecha | Documentación | Estado Real | Impacto | Riesgo |
|----|--------|---------------|-------------|---------|--------|
| **A-01** | Errores TypeScript sin resolver | SRS §20.2 | `tsc-errors.txt` existente | 🔴 Alto | Build falla en prod |
| **A-02** | Cobertura de tests < 5% | SRS §15 (~75 tests) | ~2 archivos de test | 🔴 Alto | Sin red de seguridad |
| **A-03** | SRS desactualizado vs código | SRS v3.5 | Código v4.0+ | 🔴 Alto | Expectativas incorrectas |
| **A-04** | Sin paginación en queries core | SRS §7.3 | `getDocuments()` sin limit | 🟠 Medio | Degradación con volumen |
| **A-05** | N+1 queries en notificaciones | SRS §5.1 | `notifications.server.ts` | 🟠 Medio | Latencia alta |

#### Categoría B: Funcionalidades Core Ausentes

| ID | Brecha | Documentación | Estado Real | Impacto | Esfuerzo Est. |
|----|--------|---------------|-------------|---------|---------------|
| **B-01** | Reportes exportables (CSV/Excel/PDF) | SRS §13.3, §7.9 | No implementado | 🟠 Medio | 3-4 días |
| **B-02** | Modo offline completo (PWA) | SRS §3.6 (RNF-29) | Queue básico IndexedDB | 🟠 Medio | 5-7 días |
| **B-03** | Firma digital con proveedor externo | SRS §13.1, §7.7 | Hash SHA-256 propio | 🟠 Medio | 3-4 días |
| **B-04** | Webhook retry con DLQ | SRS §7.10, §8.3 | No implementado | 🟡 Bajo | 2-3 días |
| **B-05** | Calendario de vencimientos | SRS §12.3 | No verificado | 🟡 Bajo | 2-3 días |
| **B-06** | Workflows visuales (ReactFlow) | SRS §12.2, §7.8 | Editor documentado | 🟡 Bajo | 4-5 días |

#### Categoría C: Features Avanzadas (Roadmap)

| ID | Brecha | Documentación | Estado Real | Impacto | Esfuerzo Est. |
|----|--------|---------------|-------------|---------|---------------|
| **C-01** | Motor Q&A con RAG | `Mejoras.md` §7.1 | No implementado | 🟡 Bajo | 5-7 días |
| **C-02** | Validación automática de facturas | `Mejoras.md` §7.2 | No implementado | 🟡 Bajo | 4-5 días |
| **C-03** | Clasificación automática de documentos | `Mejoras.md` §7.3 | No implementado | 🟡 Bajo | 4-5 días |
| **C-04** | API externa con rate limiting | `Mejoras.md` §7.3.4 | No implementado | 🟡 Bajo | 3-4 días |
| **C-05** | Cliente IA dual (OpenRouter + DeepSeek) | `Mejoras1.md` §7 | No implementado | 🟡 Bajo | 3-4 días |
| **C-06** | Integración Digital Twins | `Mejoras1.md` §8.4 | No implementado | 🟢 Mínimo | 2-3 días |
| **C-07** | GraphQL API | SRS §10 | No implementado | 🟢 Mínimo | 5-7 días |
| **C-08** | Integraciones SAP/RRHH | SRS §14 (Fase 4) | No implementado | 🟢 Mínimo | 7-10 días |

#### Categoría D: Deuda Técnica y Hardening

| ID | Brecha | Documentación | Estado Real | Impacto | Esfuerzo Est. |
|----|--------|---------------|-------------|---------|---------------|
| **D-01** | Sin rate limiting en API | Análisis §8.2 | No implementado | 🟠 Medio | 1-2 días |
| **D-02** | Sin structured logging | Análisis §10.2 | `console.log` básico | 🟡 Bajo | 2-3 días |
| **D-03** | Sin APM (Sentry/Datadog) | Análisis §10.2 | No implementado | 🟡 Bajo | 1-2 días |
| **D-04** | Metadata JSONB sin schema Zod | Análisis §11 (P2-11) | No validado | 🟡 Bajo | 2-3 días |
| **D-05** | Duplicación de tipos Workflow | Análisis §11 (P2-8) | `workflows.ts` vs `workflows.server.ts` | 🟡 Bajo | 1 día |
| **D-06** | Cola offline sin límites | Análisis §11 (P2-10) | IndexedDB sin maxSize | 🟡 Bajo | 1-2 días |
| **D-07** | `navigator.userAgent` en server | SRS §13.1 | Código incorrecto | 🟠 Medio | 0.5 días |

---

## 3. 📊 Priorización

### 3.1 Criterios de Priorización

| Criterio | Peso | Descripción |
|----------|------|-------------|
| **Criticidad de Negocio** | 40% | Impacto en operación Oil & Gas (compliance, seguridad) |
| **Dependencias Técnicas** | 25% | Bloqueo de otras tareas |
| **Esfuerzo de Implementación** | 20% | Tiempo estimado en días |
| **Riesgo Técnico** | 15% | Probabilidad de introducir bugs |

### 3.2 Matriz de Priorización

| Fase | Tareas | Prioridad | Esfuerzo Total | Dependencias |
|------|--------|-----------|----------------|--------------|
| **Fase 1: Estabilización** | A-01, A-02, A-03, D-07 | 🔴 P0 | 8-10 días | Ninguna |
| **Fase 2: Core DMS** | A-04, A-05, B-01, B-03, D-01 | 🟠 P1 | 10-12 días | Fase 1 |
| **Fase 3: Automatización** | B-02, B-04, B-05, B-06, D-02, D-03 | 🟡 P2 | 12-15 días | Fase 2 |
| **Fase 4: IA Avanzada** | C-01, C-02, C-03, C-05 | 🟢 P3 | 16-21 días | Fase 2 |
| **Fase 5: Integraciones** | C-04, C-06, C-07, C-08 | 🔵 P4 | 17-24 días | Fase 3-4 |

### 3.3 Orden de Implementación Sugerido

```
Semana 1-2:  Fase 1 (Estabilización)
Semana 3-4:  Fase 2 (Core DMS)
Semana 5-6:  Fase 3 (Automatización)
Semana 7-9:  Fase 4 (IA Avanzada)
Semana 10-12: Fase 5 (Integraciones)
```

---

## 4. 🛠️ Plan Detallado por Tarea

### FASE 1: ESTABILIZACIÓN (Semanas 1-2)

---

#### **A-01: Resolver Errores TypeScript**

**Estado actual:** Archivo `tsc-errors.txt` indica errores de compilación  
**Documentación:** SRS §20.2 (Estabilidad de UI y Build)

**Acciones de codificación:**
1. Ejecutar `tsc --noEmit` y capturar todos los errores
2. Clasificar errores por tipo:
   - Errores de tipos (interfaces faltantes)
   - Errores de importación (módulos no resueltos)
   - Errores de React (props incorrectas)
   - Errores de Supabase (tipos de tablas)
3. Corregir en orden de dependencia (utils → services → components → pages)
4. Agregar `strict: true` en `tsconfig.json` si no está activo

**Pruebas requeridas:**
- `npm run type-check` debe pasar sin errores
- `npm run build` debe completarse exitosamente
- Smoke test de rutas críticas

**Actualización de documentación:**
- Actualizar `ANALISIS_SRS_VS_IMPLEMENTACION.md` §11 (eliminar hallazgo P0-1)
- Actualizar SRS v4.0 si aplica

**Estimación:** 3-4 días  
**Criterios de aceptación:**
- [ ] `tsc --noEmit` retorna 0 errores
- [ ] Build de producción exitoso en Vercel
- [ ] No hay regresiones en funcionalidad existente

---

#### **A-02: Alcanzar Cobertura de Tests Mínima (60%)**

**Estado actual:** ~2 archivos de test (`pipeline.test.ts`, `qa-engine.test.ts`)  
**Documentación:** SRS §15 (~75 tests declarados)

**Acciones de codificación:**
1. **Auditar tests existentes:** Verificar que los 2 tests actuales pasan
2. **Priorizar servicios core** (orden de criticidad):
   - `documents.ts` (CRUD, versionado, rollback)
   - `approvals.ts` (quorum, transiciones de estado)
   - `legajos.ts` (validación por operadora)
   - `vendors.ts` (risk scoring, compliance matrix)
   - `rbac-shared.ts` (permisos, roles)
3. **Implementar tests unitarios** con Vitest:
   ```typescript
   // Ejemplo para documents.ts
   describe('DocumentService', () => {
     it('should create document with initial version', async () => {
       // Mock Supabase client
       // Assert: document created + version v1.0
     });

     it('should rollback to previous version', async () => {
       // Setup: document with 3 versions
       // Action: rollback to v1
       // Assert: new version v4 with same storage_path as v1
     });
   });
   ```
4. **Implementar tests de integración** para Server Actions
5. **Configurar cobertura** en `vitest.config.ts`:
   ```typescript
   coverage: {
     provider: 'v8',
     thresholds: {
       lines: 60,
       functions: 60,
       branches: 50
     }
   }
   ```

**Pruebas requeridas:**
- Tests unitarios para 5 servicios core
- Tests de integración para 3 flujos críticos
- Tests E2E con Playwright para flujo de aprobación

**Actualización de documentación:**
- Actualizar SRS §15 (inventario de tests)
- Documentar estrategia de testing en `TESTING.md`

**Estimación:** 4-5 días  
**Criterios de aceptación:**
- [ ] Cobertura de líneas ≥ 60%
- [ ] Todos los tests pasan en CI
- [ ] Flujo crítico (carga → aprobación) tiene E2E

---

#### **A-03: Alinear SRS con Implementación Real**

**Estado actual:** SRS v3.5 documenta funcionalidades inexistentes  
**Documentación:** `ANALISIS_SRS_VS_IMPLEMENTACION.md` §15

**Acciones de codificación:**
- *No requiere código*, solo documentación

**Acciones de documentación:**
1. Crear SRS v4.0 basado en el análisis ya realizado
2. Marcar claramente:
   - ✅ Funcionalidades implementadas (con referencia a archivos)
   - ⚠️ Funcionalidades parciales (con gaps documentados)
   - ❌ Funcionalidades no implementadas (mover a roadmap)
   - ⏳ Funcionalidades en roadmap (Fase 3-4)
3. Actualizar stack tecnológico (Next.js 15.3.3, no 16)
4. Actualizar inventario del sistema (tablas, componentes, servicios)
5. Eliminar referencias a tecnologías no usadas (moment.js, ExcelJS si no están)

**Pruebas requeridas:**
- Revisión por pares (peer review) del nuevo SRS
- Validación con stakeholders

**Estimación:** 2-3 días  
**Criterios de aceptación:**
- [ ] SRS v4.0 publicado y aprobado
- [ ] 0 funcionalidades "fantasma" (documentadas pero no implementadas)
- [ ] Roadmap claramente separado de especificación actual

---

#### **D-07: Corregir `navigator.userAgent` en Server-Side**

**Estado actual:** Código en `digitalSignature.ts` usa `navigator.userAgent`  
**Documentación:** SRS §13.1

**Acciones de codificación:**
1. Identificar el archivo exacto (probablemente en `lib/services/digitalSignature.ts`)
2. Extraer `userAgent` solo en cliente:
   ```typescript
   // Antes (incorrecto):
   user_agent: navigator.userAgent,

   // Después (correcto):
   user_agent: typeof window !== 'undefined' ? navigator.userAgent : 'server-side',
   // O mejor: pasar como parámetro desde el componente cliente
   ```
3. Alternativa: Mover la lógica de userAgent al componente React que llama al Server Action

**Pruebas requeridas:**
- Test de firma digital en SSR (Server Component)
- Test de firma digital en CSR (Client Component)

**Estimación:** 0.5 días  
**Criterios de aceptación:**
- [ ] Firma digital funciona en Server Components
- [ ] No hay errores de `navigator is not defined` en logs

---

### FASE 2: CORE DMS (Semanas 3-4)

---

#### **A-04: Implementar Paginación en Queries Principales**

**Estado actual:** `getDocuments()` retorna todos los documentos sin limit  
**Documentación:** SRS §7.3 (índices optimizados)

**Acciones de codificación:**
1. **Modificar `documents.ts`:**
   ```typescript
   interface GetDocumentsOptions {
     orgId: string;
     cursor?: string; // UUID del último documento
     limit?: number;  // default: 50
     status?: string;
     category?: string;
     search?: string;
   }

   export async function getDocuments(options: GetDocumentsOptions) {
     const { orgId, cursor, limit = 50, status, category, search } = options;

     let query = supabase
       .from('documents')
       .select('*')
       .eq('org_id', orgId)
       .order('created_at', { ascending: false })
       .limit(limit + 1); // +1 para detectar si hay más

     if (cursor) {
       query = query.lt('created_at', cursor); // o lt('id', cursor)
     }
     if (status) query = query.eq('status', status);
     if (category) query = query.eq('category', category);
     if (search) {
       query = query.textSearch('title', search, { type: 'websearch' });
     }

     const { data, error } = await query;
     // ... manejar paginación
   }
   ```
2. **Actualizar componentes UI:**
   - `DocumentTable.tsx`: Agregar infinite scroll o paginación numérica
   - Implementar `useInfiniteQuery` de TanStack Query
3. **Agregar índices en BD:**
   ```sql
   CREATE INDEX idx_documents_created_at ON documents(org_id, created_at DESC);
   ```

**Pruebas requeridas:**
- Test de paginación con 1000+ documentos mock
- Test de filtros combinados
- Test de rendimiento (query < 200ms)

**Actualización de documentación:**
- Actualizar API docs de `documents.ts`
- Documentar parámetros de paginación

**Estimación:** 2-3 días  
**Criterios de aceptación:**
- [ ] `getDocuments()` soporta cursor-based pagination
- [ ] UI no carga todos los documentos al inicio
- [ ] Tiempo de carga < 500ms para 50 registros

---

#### **A-05: Resolver N+1 Queries en Notificaciones**

**Estado actual:** `notifications.server.ts` hace queries individuales por documento  
**Documentación:** SRS §5.1 (procesamiento de vencimientos)

**Acciones de codificación:**
1. **Identificar el patrón N+1:**
   ```typescript
   // Antes (N+1):
   for (const doc of documents) {
     const { data } = await supabase.from('personnel_docs').select('*').eq('document_id', doc.id);
     // ... procesar
   }
   ```
2. **Refactorizar a batch queries:**
   ```typescript
   // Después (batch):
   const documentIds = documents.map(d => d.id);
   const { data: allPersonnelDocs } = await supabase
     .from('personnel_docs')
     .select('*')
     .in('document_id', documentIds);

   // Mapear en memoria
   const docsByDocumentId = groupBy(allPersonnelDocs, 'document_id');
   ```
3. **O usar JOINs cuando sea posible:**
   ```typescript
   const { data } = await supabase
     .from('documents')
     .select(`
       *,
       personnel_docs(*),
       vehicle_docs(*)
     `)
     .eq('org_id', orgId)
     .lte('expiry_date', thirtyDaysFromNow);
   ```

**Pruebas requeridas:**
- Test con 500 documentos: medir número de queries
- Benchmark: antes vs después (debe reducirse de N+1 a 2-3 queries)

**Estimación:** 1-2 días  
**Criterios de aceptación:**
- [ ] Procesamiento de 500 vencimientos en < 3 segundos
- [ ] Máximo 3 queries por batch de procesamiento

---

#### **B-01: Implementar Reportes Exportables (CSV/Excel/PDF)**

**Estado actual:** No hay dependencias ni código de reportes  
**Documentación:** SRS §13.3, §7.9 (`scheduled_reports`)

**Acciones de codificación:**
1. **Instalar dependencias:**
   ```bash
   npm install @json2csv/plainjs exceljs @react-pdf/renderer
   ```
2. **Crear servicio `lib/services/reports.ts`:**
   ```typescript
   import { Parser } from '@json2csv/plainjs';
   import ExcelJS from 'exceljs';
   import { generatePDFReport } from './pdfReport';

   export type ReportFormat = 'csv' | 'excel' | 'pdf';

   export async function generateReport(
     orgId: string,
     filters: ReportFilters,
     format: ReportFormat
   ): Promise<Buffer | string> {
     const data = await fetchReportData(orgId, filters);

     switch (format) {
       case 'csv':
         const parser = new Parser({ fields: reportFields });
         return parser.parse(data);
       case 'excel':
         const workbook = new ExcelJS.Workbook();
         const sheet = workbook.addWorksheet('Reporte');
         sheet.columns = reportFields.map(f => ({ header: f.label, key: f.key }));
         sheet.addRows(data);
         return await workbook.xlsx.writeBuffer();
       case 'pdf':
         return await generatePDFReport(data, filters);
     }
   }
   ```
3. **Crear API Route `app/api/reports/generate/route.ts`:**
   ```typescript
   export async function POST(req: NextRequest) {
     const { orgId, filters, format } = await req.json();
     const report = await generateReport(orgId, filters, format);

     return new NextResponse(report, {
       headers: {
         'Content-Type': getContentType(format),
         'Content-Disposition': `attachment; filename="report.${format}"`
       }
     });
   }
   ```
4. **Crear componente UI `components/reports/ReportGenerator.tsx`:**
   - Formulario de filtros (fecha, categoría, estado)
   - Selector de formato
   - Botón de descarga

**Pruebas requeridas:**
- Test unitario: generación de cada formato con datos mock
- Test de integración: endpoint completo
- Test de rendimiento: reporte con 10,000 registros

**Actualización de documentación:**
- Actualizar SRS §13.3 con implementación real
- Documentar API de reportes

**Estimación:** 3-4 días  
**Criterios de aceptación:**
- [ ] CSV generado correctamente con UTF-8
- [ ] Excel con formato corporativo (colores, headers)
- [ ] PDF con diseño visual (logo, tablas)
- [ ] Filtros funcionan en los 3 formatos

---

#### **B-03: Completar Firma Digital con Proveedor Externo**

**Estado actual:** Hash SHA-256 propio, sin integración externa  
**Documentación:** SRS §13.1, §7.7 (`digital_signatures`)

**Acciones de codificación:**
1. **Crear interfaz de proveedores:**
   ```typescript
   interface SignatureProvider {
     name: 'Afip' | 'DocuSign' | 'Propio';
     sign(documentHash: string, certificate: string): Promise<SignatureResult>;
     verify(signatureHash: string): Promise<boolean>;
   }
   ```
2. **Implementar proveedor "Propio" (actual):**
   - Mantener hash SHA-256 como fallback
   - Agregar timestamp de validación
3. **Implementar proveedor "DocuSign" (opcional):**
   - Integrar con DocuSign eSignature API
   - OAuth 2.0 para autenticación
4. **Implementar proveedor "AFIP" (Argentina):**
   - WSAA (Web Service de Autenticación y Autorización)
   - Certificado X.509
5. **Actualizar tabla `digital_signatures`:**
   - Campo `validation_provider` ya existe
   - Agregar `external_signature_id` para referencia externa

**Pruebas requeridas:**
- Test de firma con cada proveedor (mock)
- Test de verificación de integridad
- Test de fallback (si DocuSign falla, usar Propio)

**Estimación:** 3-4 días (solo Propio + DocuSign mock)  
**Criterios de aceptación:**
- [ ] Firma genera hash válido y verificable
- [ ] Verificación pública `/verify/[id]` funciona
- [ ] QR code muestra información correcta

---

#### **D-01: Implementar Rate Limiting en API**

**Estado actual:** Sin rate limiting  
**Documentación:** `Mejoras1.md` §8.3.4 (rate limiting simple)

**Acciones de codificación:**
1. **Instalar dependencia:**
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```
2. **Crear middleware `lib/middleware/rateLimit.ts`:**
   ```typescript
   import { Ratelimit } from '@upstash/ratelimit';
   import { Redis } from '@upstash/redis';

   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests/min
     analytics: true
   });

   export async function rateLimit(request: NextRequest) {
     const ip = request.ip ?? '127.0.0.1';
     const { success, limit, remaining } = await ratelimit.limit(ip);

     if (!success) {
       return NextResponse.json(
         { error: 'Rate limit exceeded' },
         { status: 429, headers: { 'X-RateLimit-Limit': limit.toString() } }
       );
     }
     return null; // Continue
   }
   ```
3. **Aplicar a API routes críticas:**
   - `/api/ai/*`
   - `/api/documents/*`
   - `/api/external/*`

**Pruebas requeridas:**
- Test de carga: 150 requests/min, esperar 429 en exceso
- Test de headers correctos

**Estimación:** 1-2 días  
**Criterios de aceptación:**
- [ ] 429 retornado después de límite
- [ ] Headers `X-RateLimit-*` presentes
- [ ] No afecta rutas no protegidas

---

### FASE 3: AUTOMATIZACIÓN (Semanas 5-6)

---

#### **B-02: Completar Modo Offline (PWA Real)**

**Estado actual:** Queue básico en IndexedDB, sync parcial  
**Documentación:** SRS §3.6 (RNF-29), `lib/sync/offline-sync.ts`

**Acciones de codificación:**
1. **Extender `lib/offline/queue.ts`:**
   ```typescript
   interface OfflineQueue {
     maxSize: number; // 100 acciones
     ttl: number;     // 7 días
     items: QueueItem[];
   }

   interface QueueItem {
     id: string;
     type: 'upload_document' | 'add_approval' | 'add_signature';
     payload: any;
     retries: number;
     createdAt: number;
     status: 'pending' | 'syncing' | 'failed';
   }
   ```
2. **Implementar sync bidireccional:**
   - Al reconectar: subir acciones pendientes
   - Descargar cambios del servidor (documentos nuevos, estados)
   - Resolver conflictos (último escritor gana + notificación)
3. **Mejorar Service Worker (`public/sw.js`):**
   - Cache de rutas críticas (dashboard, documentos)
   - Cache de assets estáticos
   - Estrategia "Network first, cache fallback" para API
4. **Crear UI offline:**
   - Indicador de estado (online/offline)
   - Badge de acciones pendientes
   - Botón "Sincronizar ahora"

**Pruebas requeridas:**
- Test: desconectar, crear documento, reconectar, verificar sync
- Test de conflictos: editar mismo documento offline en 2 dispositivos
- Test de límites: 100+ acciones en cola

**Estimación:** 5-7 días  
**Criterios de aceptación:**
- [ ] Documento creado offline aparece online
- [ ] Acciones pendientes < 100
- [ ] UI muestra estado de conectividad
- [ ] Sin pérdida de datos en reconexión

---

#### **B-04: Implementar Webhook Retry con DLQ**

**Estado actual:** Tabla `webhook_queue` existe pero sin procesador  
**Documentación:** SRS §7.10, §8.3

**Acciones de codificación:**
1. **Completar función `process_webhook_queue()`:**
   ```sql
   -- Ya existe en schema, verificar funcionamiento
   ```
2. **Crear servicio `lib/services/webhooks.ts`:**
   ```typescript
   export async function enqueueWebhook(
     orgId: string,
     eventType: string,
     payload: any,
     targetUrl: string
   ) {
     return supabase.from('webhook_queue').insert({
       org_id: orgId,
       event_type: eventType,
       payload,
       target_url: targetUrl,
       status: 'pending',
       retries: 0,
       max_retries: 5
     });
   }

   export async function processWebhooks() {
     const { data: pending } = await supabase
       .from('webhook_queue')
       .select('*')
       .eq('status', 'pending')
       .lte('next_retry_at', new Date().toISOString())
       .limit(100);

     for (const webhook of pending || []) {
       try {
         const response = await fetch(webhook.target_url, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(webhook.payload)
         });

         if (response.ok) {
           await supabase.from('webhook_queue')
             .update({ status: 'success', last_attempt_at: new Date() })
             .eq('id', webhook.id);
         } else {
           throw new Error(`HTTP ${response.status}`);
         }
       } catch (error) {
         const newRetries = webhook.retries + 1;
         await supabase.from('webhook_queue')
           .update({
             retries: newRetries,
             last_attempt_at: new Date(),
             next_retry_at: new Date(Date.now() + Math.pow(2, newRetries) * 60000),
             status: newRetries >= webhook.max_retries ? 'dead' : 'pending',
             error_message: error.message
           })
           .eq('id', webhook.id);
       }
     }
   }
   ```
3. **Configurar cron job:**
   ```sql
   SELECT cron.schedule('process-webhooks', '*/1 * * * *', 'SELECT process_webhook_queue()');
   ```

**Pruebas requeridas:**
- Test: webhook exitoso (status: success)
- Test: webhook fallido (retry exponencial)
- Test: webhook muerto después de 5 retries
- Test: DLQ consultable

**Estimación:** 2-3 días  
**Criterios de aceptación:**
- [ ] Webhooks se encolan correctamente
- [ ] Retry exponencial funciona (1min, 2min, 4min, 8min, 16min)
- [ ] DLQ accesible para auditoría

---

#### **B-05: Implementar Calendario de Vencimientos**

**Estado actual:** No verificado  
**Documentación:** SRS §12.3 (`ExpiryCalendar.tsx`)

**Acciones de codificación:**
1. **Instalar dependencia:**
   ```bash
   npm install react-big-calendar moment
   ```
2. **Crear componente `components/calendar/ExpiryCalendar.tsx`:**
   ```typescript
   'use client';
   import { Calendar, momentLocalizer } from 'react-big-calendar';
   import moment from 'moment';
   import 'react-big-calendar/lib/css/react-big-calendar.css';

   const localizer = momentLocalizer(moment);

   export function ExpiryCalendar({ events }: { events: CalendarEvent[] }) {
     const calendarEvents = events.map(ev => ({
       title: `${ev.title} (${ev.type})`,
       start: new Date(ev.expiry_date),
       end: new Date(ev.expiry_date),
       allDay: true,
       resource: ev
     }));

     return (
       <Calendar
         localizer={localizer}
         events={calendarEvents}
         startAccessor="start"
         endAccessor="end"
         style={{ height: 600 }}
         eventPropGetter={(event) => ({
           style: {
             backgroundColor: getEventColor(event.resource.days_left)
           }
         })}
       />
     );
   }
   ```
3. **Crear página `app/(dashboard)/calendar/page.tsx`:**
   - Server Component que carga vencimientos
   - Filtros por tipo (documentos, personal, vehículos)

**Pruebas requeridas:**
- Test visual: colores correctos por urgencia
- Test funcional: click en evento abre detalle
- Test de rendimiento: 500+ eventos

**Estimación:** 2-3 días  
**Criterios de aceptación:**
- [ ] Calendario muestra todos los vencimientos
- [ ] Colores: rojo (<7 días), naranja (<30), verde (>30)
- [ ] Filtros por categoría funcionan

---

#### **B-06: Completar Workflows Visuales (ReactFlow)**

**Estado actual:** Editor documentado pero no verificado  
**Documentación:** SRS §12.2, §7.8

**Acciones de codificación:**
1. **Verificar instalación:**
   ```bash
   npm install reactflow
   ```
2. **Completar `components/workflows/WorkflowEditor.tsx`:**
   - Integrar con API de workflows existente
   - Guardar/ cargar definiciones de workflow
   - Validar conexiones entre nodos
3. **Crear nodos personalizados:**
   - TriggerNode (evento inicial)
   - ActionNode (email, webhook, cambio estado)
   - ConditionNode (if/else)
4. **Integrar con motor de ejecución:**
   - `lib/services/workflows.server.ts`
   - Ejecutar workflow al disparar evento

**Pruebas requeridas:**
- Test: crear workflow visualmente
- Test: ejecutar workflow con trigger simulado
- Test: validación de conexiones inválidas

**Estimación:** 4-5 días  
**Criterios de aceptación:**
- [ ] Workflow se guarda correctamente
- [ ] Ejecución automática al disparar evento
- [ ] UI intuitiva (drag & drop)

---

#### **D-02: Implementar Structured Logging**

**Estado actual:** `console.log` básico  
**Documentación:** Análisis §12.2

**Acciones de codificación:**
1. **Instalar Pino:**
   ```bash
   npm install pino pino-pretty
   ```
2. **Crear `lib/utils/logger.ts`:**
   ```typescript
   import pino from 'pino';

   export const logger = pino({
     level: process.env.LOG_LEVEL || 'info',
     transport: process.env.NODE_ENV === 'development' 
       ? { target: 'pino-pretty', options: { colorize: true } }
       : undefined,
     base: {
       service: 'sc-platform',
       version: process.env.APP_VERSION
     }
   });

   // Uso:
   // logger.info({ orgId, userId }, 'Document created');
   // logger.error({ err }, 'Failed to process invoice');
   ```
3. **Reemplazar todos los `console.log/error`:**
   - Buscar y reemplazar en `lib/services/*.ts`
   - Buscar y reemplazar en `lib/ai/*.ts`
   - Agregar contexto (orgId, userId, entityId)

**Pruebas requeridas:**
- Test: formato JSON en producción
- Test: niveles de log respetados
- Test: contexto incluido

**Estimación:** 2-3 días  
**Criterios de aceptación:**
- [ ] 0 `console.log` en código de producción
- [ ] Logs en formato JSON estructurado
- [ ] Niveles: debug, info, warn, error

---

#### **D-03: Integrar APM (Sentry)**

**Estado actual:** Sin APM  
**Documentación:** Análisis §10.2

**Acciones de codificación:**
1. **Instalar Sentry:**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```
2. **Configurar `sentry.client.config.ts`:**
   ```typescript
   import * as Sentry from '@sentry/nextjs';

   Sentry.init({
     dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
     tracesSampleRate: 0.1,
     replaysSessionSampleRate: 0.1,
     replaysOnErrorSampleRate: 1.0
   });
   ```
3. **Configurar `sentry.server.config.ts` y `sentry.edge.config.ts`**
4. **Agregar captura de errores en servicios críticos:**
   ```typescript
   try {
     // operación crítica
   } catch (error) {
     Sentry.captureException(error, {
       tags: { service: 'documents', operation: 'create' },
       extra: { orgId, documentId }
     });
     throw error;
   }
   ```

**Pruebas requeridas:**
- Test: error simulado aparece en Sentry dashboard
- Test: performance tracing funciona
- Test: source maps cargan correctamente

**Estimación:** 1-2 días  
**Criterios de aceptación:**
- [ ] Errores reportados en Sentry
- [ ] Performance monitoring activo
- [ ] Source maps funcionan

---

### FASE 4: IA AVANZADA (Semanas 7-9)

---

#### **C-01: Implementar Motor Q&A con RAG**

**Estado actual:** No implementado  
**Documentación:** `Mejoras.md` §7.1, `Mejoras1.md` §8.1

**Acciones de codificación:**
1. **Verificar tabla `document_chunks`:**
   - Ya existe en schema (`DATABASE_MASTER.sql`)
   - Verificar índice HNSW: `idx_chunks_embedding`
2. **Crear `lib/ai/qa-engine.ts`:**
   ```typescript
   export async function askQuestion(request: QARequest): Promise<QAResponse> {
     // 1. Buscar chunks relevantes (vector search)
     const { data: chunks } = await supabase.rpc('match_document_chunks_hybrid', {
       query_embedding: await generateEmbedding(request.question),
       match_threshold: 0.7,
       match_count: 10,
       org_id: request.orgId
     });

     // 2. Construir contexto
     const context = chunks.map(c => `[${c.document_title}]\n${c.content}`).join('\n\n---\n\n');

     // 3. Llamar a IA
     const response = await aiClient.chat([
       { role: 'system', content: 'Responde basándote EXCLUSIVAMENTE en los documentos.' },
       { role: 'user', content: `Contexto:\n${context}\n\nPregunta: ${request.question}` }
     ]);

     // 4. Registrar en qa_logs
     await supabase.from('qa_logs').insert({ ... });

     return { answer: response.content, sources: chunks.slice(0, 3) };
   }
   ```
3. **Crear endpoint `app/api/ai/ask/route.ts`:**
4. **Crear componente `components/ai/AIAssistant.tsx`:**
   - Chat flotante (ya documentado en `Mejoras1.md`)
   - Mostrar fuentes de información

**Pruebas requeridas:**
- Test: pregunta con respuesta en documentos
- Test: pregunta sin respuesta ("No encontré información")
- Test: citas de fuentes correctas
- Test: tiempo de respuesta < 3 segundos

**Estimación:** 5-7 días  
**Criterios de aceptación:**
- [ ] Respuesta basada solo en documentos de la org
- [ ] Fuentes citadas correctamente
- [ ] Tiempo < 3s
- [ ] Fallback si no hay documentos relevantes

---

#### **C-02: Implementar Validación Automática de Facturas**

**Estado actual:** No implementado  
**Documentación:** `Mejoras.md` §7.2, `Mejoras1.md` §8.2

**Acciones de codificación:**
1. **Verificar tabla `invoices`:**
   - Ya existe en schema
   - Verificar relación con `contracts` y `purchase_orders`
2. **Crear `lib/services/invoiceValidationService.ts`:**
   ```typescript
   export async function validateInvoice(invoiceId: string): Promise<ValidationResult> {
     // 1. Obtener factura + items
     // 2. Obtener PO asociada
     // 3. Obtener contrato asociado
     // 4. Construir prompt para IA
     // 5. Llamar a aiClient con response_format: 'json_object'
     // 6. Guardar resultado en invoice.validation_result
     // 7. Generar notificación si hay discrepancias high
   }
   ```
3. **Crear endpoint `app/api/invoices/validate/route.ts`**
4. **Crear componente `components/invoices/InvoiceValidator.tsx`**

**Pruebas requeridas:**
- Test: factura válida (sin discrepancias)
- Test: factura con discrepancias de precio
- Test: factura sin PO asociada
- Test: precisión > 95% con dataset de prueba

**Estimación:** 4-5 días  
**Criterios de aceptación:**
- [ ] Detecta discrepancias de precio/cantidad
- [ ] Precisión > 95%
- [ ] Notificación automática para severidad alta
- [ ] Tiempo < 10s

---

#### **C-03: Implementar Clasificación Automática de Documentos**

**Estado actual:** No implementado  
**Documentación:** `Mejoras.md` §7.3, `Mejoras1.md` §8.3

**Acciones de codificación:**
1. **Crear `lib/ai/documentClassifier.ts`:**
   ```typescript
   export async function classifyDocument(content: string, fileName?: string): Promise<DocumentClassification> {
     const response = await aiClient.chat([
       { role: 'system', content: 'Clasifica el documento y extrae metadatos. Responde en JSON.' },
       { role: 'user', content: `Archivo: ${fileName}\n\nContenido:\n${content.substring(0, 8000)}` }
     ], { response_format: 'json_object', temperature: 0.2 });

     return JSON.parse(response.content);
   }
   ```
2. **Crear endpoint `app/api/ai/extract-document/route.ts`:**
   - Recibe archivo (multipart/form-data)
   - Extrae texto (pdf-parse, mammoth)
   - Llama a clasificador
   - Retorna metadata sugerida
3. **Crear componente `components/documents/AIDocumentUploader.tsx`:**
   - Dropzone para archivos
   - Preview de metadata extraída
   - Edición antes de guardar

**Pruebas requeridas:**
- Test: PDF de contrato → categoría "contrato"
- Test: Factura → categoría "factura"
- Test: Metadata extraída (fechas, montos, responsables)
- Test: reducción de etiquetado manual

**Estimación:** 4-5 días  
**Criterios de aceptación:**
- [ ] Clasificación correcta > 90%
- [ ] Metadata extraída (fechas, montos)
- [ ] Reducción de etiquetado manual en 90%
- [ ] Tiempo < 5s por página

---

#### **C-05: Implementar Cliente IA Dual (OpenRouter + DeepSeek)**

**Estado actual:** No implementado  
**Documentación:** `Mejoras1.md` §7

**Acciones de codificación:**
1. **Crear `lib/ai/ai-client.ts`:**
   ```typescript
   export class AIClient {
     async chat(messages, options): Promise<AIResponse> {
       // 1. Intentar OpenRouter
       try {
         return await this.callOpenRouter(messages, options);
       } catch (error) {
         // 2. Fallback a DeepSeek directo
         return await this.callDeepSeekDirect(messages, options);
       }
     }

     async checkHealth(): Promise<{ openrouter: boolean; deepseek: boolean }> {
       // Ping a ambos providers
     }
   }
   ```
2. **Configurar variables de entorno:**
   ```env
   OPENROUTER_API_KEY=sk-or-v1-...
   DEEPSEEK_API_KEY=sk-...
   ```
3. **Crear endpoint `app/api/ai/health/route.ts`**
4. **Integrar en todos los servicios IA existentes:**
   - Reemplazar `deepseekClient` directo por `aiClient`
   - Agregar logging de provider usado

**Pruebas requeridas:**
- Test: OpenRouter responde correctamente
- Test: Fallback a DeepSeek cuando OpenRouter falla
- Test: Health check retorna estado correcto
- Test: Logging de provider en `ai_call_logs`

**Estimación:** 3-4 días  
**Criterios de aceptación:**
- [ ] OpenRouter como gateway principal
- [ ] DeepSeek como fallback automático
- [ ] Health check funcional
- [ ] Logs de provider en cada llamada

---

### FASE 5: INTEGRACIONES (Semanas 10-12)

---

#### **C-04: Implementar API Externa con Rate Limiting**

**Estado actual:** No implementado  
**Documentación:** `Mejoras.md` §7.3.4, `Mejoras1.md` §8.3.4

**Acciones de codificación:**
1. **Verificar tabla `api_keys`:**
   - Ya existe en schema
   - Campos: `key`, `permissions`, `rate_limit`, `is_active`
2. **Crear `app/api/external/document-status/route.ts`:**
   ```typescript
   export async function GET(req: NextRequest) {
     const apiKey = req.headers.get('x-api-key');
     // 1. Validar API Key
     // 2. Verificar rate limit (Redis/Upstash)
     // 3. Buscar documento/personal
     // 4. Registrar en api_access_logs
     // 5. Retornar resultado
   }
   ```
3. **Implementar rate limiting por API Key:**
   - Usar `@upstash/ratelimit` con Redis
   - Límite configurable por key (default: 1000/hora)
4. **Crear UI de gestión de API Keys:**
   - Generar nueva key
   - Configurar permisos
   - Ver uso histórico

**Pruebas requeridas:**
- Test: API Key válida → 200
- Test: API Key inválida → 401
- Test: Rate limit excedido → 429
- Test: Consulta de documento existente → 200 con datos
- Test: Consulta de documento ajeno → 403

**Estimación:** 3-4 días  
**Criterios de aceptación:**
- [ ] Autenticación por API Key funcional
- [ ] Rate limiting efectivo
- [ ] Logs de acceso completos
- [ ] Disponibilidad 99.9%

---

#### **C-06: Implementar Certificación Digital Twins**

**Estado actual:** No implementado  
**Documentación:** `Mejoras1.md` §8.4

**Acciones de codificación:**
1. **Crear `lib/integrations/digitaltwin/client.ts`:**
   ```typescript
   export class DigitalTwinClient {
     async syncPersonnel(orgId: string, personId: string): Promise<boolean> {
       // 1. Obtener config de integración
       // 2. Obtener datos de personnel
       // 3. Enviar a API de Digital Twin (AVEVA, Bentley)
     }

     async certify(orgId: string): Promise<CertificationResult> {
       // Verificar requisitos y generar certificado
     }
   }
   ```
2. **Crear endpoint `app/api/digitaltwin/certify/route.ts`**
3. **Agregar campos a `organizations`:**
   - `digital_twin_certified`
   - `certified_at`
   - `digital_twin_certificate`

**Pruebas requeridas:**
- Test: sincronización de personnel exitosa
- Test: certificación con requisitos cumplidos
- Test: certificación con requisitos faltantes

**Estimación:** 2-3 días  
**Criterios de aceptación:**
- [ ] Sync de personnel funciona
- [ ] Certificación verifica requisitos
- [ ] Certificado generado con IA

---

#### **C-07: Implementar GraphQL API**

**Estado actual:** No implementado  
**Documentación:** SRS §10

**Acciones de codificación:**
1. **Instalar dependencias:**
   ```bash
   npm install @apollo/server @as-integrations/next graphql
   ```
2. **Crear schema GraphQL:**
   ```typescript
   const typeDefs = gql`
     type Document {
       id: ID!
       title: String!
       status: String!
       versions: [DocumentVersion!]!
     }

     type Query {
       documents(orgId: ID!, limit: Int, offset: Int): [Document!]!
       document(id: ID!): Document
     }
   `;
   ```
3. **Crear resolvers con RLS:**
   - Reutilizar lógica de `lib/services`
   - Verificar `org_id` en cada query
4. **Crear endpoint `app/api/graphql/route.ts`**

**Pruebas requeridas:**
- Test: query de documentos
- Test: query con filtro
- Test: mutación de aprobación
- Test: aislamiento multi-tenant

**Estimación:** 5-7 días  
**Criterios de aceptación:**
- [ ] Schema GraphQL funcional
- [ ] Queries documentales operativas
- [ ] Mutaciones con validación
- [ ] RLS aplicado

---

#### **C-08: Implementar Integraciones SAP/RRHH**

**Estado actual:** No implementado  
**Documentación:** SRS §14 (Fase 4), `Mejoras.md` §7.2.2

**Acciones de codificación:**
1. **Crear `lib/integrations/sap/client.ts`:**
   ```typescript
   export class SAPClient {
     async importPurchaseOrders(orgId: string): Promise<number> {
       // 1. Obtener config de integración
       // 2. Conectar a SAP (OData/BAPI)
       // 3. Importar POs
       // 4. Guardar en tabla purchase_orders
     }
   }
   ```
2. **Crear tabla `purchase_orders`:**
   ```sql
   CREATE TABLE purchase_orders (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     org_id UUID REFERENCES organizations(id),
     po_number TEXT NOT NULL,
     supplier_name TEXT,
     total_amount DECIMAL(15,2),
     items JSONB,
     source_system TEXT DEFAULT 'sap',
     imported_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```
3. **Crear UI de configuración de integraciones:**
   - Formulario de credenciales SAP
   - Botón "Sincronizar ahora"
   - Logs de sincronización

**Pruebas requeridas:**
- Test: conexión mock a SAP
- Test: importación de POs
- Test: deduplicación (no importar duplicados)
- Test: manejo de errores de conexión

**Estimación:** 7-10 días  
**Criterios de aceptación:**
- [ ] Conexión a SAP funcional
- [ ] POs importados correctamente
- [ ] Deduplicación activa
- [ ] Logs de sincronización

---

## 5. 📅 Cronograma Detallado

### Resumen por Fase

| Fase | Semanas | Tareas | Esfuerzo Total | Hitos |
|------|---------|--------|----------------|-------|
| **1. Estabilización** | 1-2 | A-01, A-02, A-03, D-07 | 10-14 días | ✅ Build limpio, ✅ Tests 60%, ✅ SRS v4.0 |
| **2. Core DMS** | 3-4 | A-04, A-05, B-01, B-03, D-01 | 10-14 días | ✅ Paginación, ✅ Reportes, ✅ Firma digital |
| **3. Automatización** | 5-6 | B-02, B-04, B-05, B-06, D-02, D-03 | 16-23 días | ✅ PWA real, ✅ Webhooks, ✅ Calendar, ✅ Workflows |
| **4. IA Avanzada** | 7-9 | C-01, C-02, C-03, C-05 | 16-21 días | ✅ Q&A RAG, ✅ Validación facturas, ✅ Clasificación IA |
| **5. Integraciones** | 10-12 | C-04, C-06, C-07, C-08 | 17-24 días | ✅ API externa, ✅ Digital Twins, ✅ GraphQL, ✅ SAP |

### Cronograma Semanal Detallado

```
SEMANA 1: Estabilización I
├── Día 1-2: A-01 Resolver errores TypeScript
├── Día 3-4: A-03 Alinear SRS v4.0
└── Día 5: D-07 Corregir navigator.userAgent

SEMANA 2: Estabilización II
├── Día 1-3: A-02 Tests core (documents, approvals)
├── Día 4-5: Tests E2E + CI/CD
└── Hito: Build limpio + 60% cobertura

SEMANA 3: Core DMS I
├── Día 1-2: A-04 Paginación
├── Día 3-4: A-05 Resolver N+1 queries
└── Día 5: D-01 Rate limiting

SEMANA 4: Core DMS II
├── Día 1-2: B-01 Reportes CSV/Excel
├── Día 3-4: B-01 Reportes PDF
└── Día 5: B-03 Firma digital completa

SEMANA 5: Automatización I
├── Día 1-2: B-02 Offline sync bidireccional
├── Día 3-4: B-02 Service Worker + UI
└── Día 5: B-04 Webhook retry

SEMANA 6: Automatización II
├── Día 1-2: B-05 Calendario de vencimientos
├── Día 3-4: B-06 Workflows visuales
└── Día 5: D-02 Structured logging + D-03 Sentry

SEMANA 7: IA Avanzada I
├── Día 1-2: C-05 Cliente IA dual (OpenRouter + DeepSeek)
├── Día 3-4: C-01 Motor Q&A con RAG
└── Día 5: Integración Q&A en UI

SEMANA 8: IA Avanzada II
├── Día 1-2: C-02 Validación de facturas (backend)
├── Día 3-4: C-02 Validación de facturas (UI)
└── Día 5: C-03 Clasificación automática (backend)

SEMANA 9: IA Avanzada III
├── Día 1-2: C-03 Clasificación automática (UI)
├── Día 3-4: Tests IA + ajustes
└── Día 5: Hito: Demo de IA

SEMANA 10: Integraciones I
├── Día 1-2: C-04 API externa con rate limiting
├── Día 3-4: C-06 Digital Twins (sync + certificación)
└── Día 5: C-07 GraphQL schema

SEMANA 11: Integraciones II
├── Día 1-3: C-07 GraphQL resolvers + tests
├── Día 4-5: C-08 SAP client (conexión + import)

SEMANA 12: Integraciones III
├── Día 1-3: C-08 SAP UI + testing
├── Día 4-5: Testing end-to-end + documentación
└── Hito: Release v5.0
```

---

## 6. ✅ Criterios de Aceptación Globales

### Por Fase

| Fase | Criterios de Aceptación |
|------|------------------------|
| **1. Estabilización** | • `tsc --noEmit` = 0 errores<br>• Cobertura de tests ≥ 60%<br>• SRS v4.0 aprobado por stakeholders<br>• Build de producción exitoso |
| **2. Core DMS** | • Paginación funcional en todos los listados<br>• Reportes generados en 3 formatos<br>• Firma digital verificable públicamente<br>• Rate limiting activo en API routes |
| **3. Automatización** | • Modo offline sincroniza sin pérdida de datos<br>• Webhooks con retry exponencial y DLQ<br>• Calendario muestra vencimientos con colores<br>• Workflows ejecutan automáticamente |
| **4. IA Avanzada** | • Q&A responde en < 3s con fuentes<br>• Validación de facturas > 95% precisión<br>• Clasificación automática > 90% precisión<br>• Fallback IA funciona (OpenRouter → DeepSeek) |
| **5. Integraciones** | • API externa con 99.9% disponibilidad<br>• GraphQL schema completo y documentado<br>• SAP importa POs sin duplicados<br>• Digital Twins certifica correctamente |

### Métricas de Éxito

| KPI | Objetivo | Medición |
|-----|----------|----------|
| Build time | < 2 min | `npm run build` |
| Test coverage | ≥ 60% | `vitest --coverage` |
| API response time (P95) | < 500ms | APM / Logs |
| IA response time (P95) | < 10s | `ai_call_logs` |
| Uptime | 99.5% | Vercel / Sentry |
| Documentación alineada | 100% | Revisión manual |

---

## 7. 🔮 Recomendaciones Futuras

### 7.1 Mantener Sincronización Documentación-Código

**Estrategia "Docs as Code":**
1. **Versionar documentación en Git:**
   - Mover `DOCUMENTACION_MAESTRA_SISTEMA_GESTION_DOCUMENTAL.md` a `/docs`
   - Usar PRs para actualizaciones
   - Requerir aprobación de tech lead

2. **Automatizar validación:**
   ```yaml
   # .github/workflows/docs-check.yml
   - name: Verify docs alignment
     run: |
       npm run docs:extract-features
       npm run docs:compare-with-code
   ```

3. **Regla de oro:** "Si no está en el código, no está en la doc. Si no está en la doc, no se implementa."

### 7.2 Proceso de Gestión de Cambios

```
Nueva Feature → RFC en /docs/rfc → Aprobación → Implementación → Actualizar docs → Merge
```

### 7.3 Herramientas Recomendadas

| Propósito | Herramienta |
|-----------|-------------|
| Documentación técnica | Docusaurus / MkDocs |
| API docs | Swagger / OpenAPI |
| Diagramas | Mermaid (ya en uso) |
| Decisiones arquitectónicas | ADR (Architecture Decision Records) |
| Changelog | Changesets |

### 7.4 Revisiones Periódicas

- **Semanal:** Revisar PRs con checklist de documentación
- **Mensual:** Auditar cobertura de tests y docs
- **Trimestral:** Revisión completa SRS vs código (como este análisis)

### 7.5 Métricas de Salud del Proyecto

| Métrica | Frecuencia | Umbral de Alerta |
|---------|------------|------------------|
| Docs drift (features doc vs implementadas) | Mensual | > 10% |
| Test coverage | Semanal | < 60% |
| Errores TypeScript | Cada PR | > 0 |
| Deuda técnica (SonarQube) | Mensual | > 20h |

---

## 8. 📎 Anexos

### Anexo A: Checklist de Implementación por Tarea

```markdown
## [ID-Tarea]: [Nombre]

### Pre-implementación
- [ ] Revisar documentación actual
- [ ] Identificar dependencias
- [ ] Diseñar interfaz/API
- [ ] Escribir tests (TDD)

### Implementación
- [ ] Código funcional
- [ ] Manejo de errores
- [ ] Logging estructurado
- [ ] Validación de inputs (Zod)

### Post-implementación
- [ ] Tests pasan
- [ ] Documentación actualizada
- [ ] Revisión de código (PR)
- [ ] Merge a main
```

### Anexo B: Estructura de Carpetas Sugerida

```
docs/
├── README.md                 # Índice de documentación
├── ARCHITECTURE.md           # Decisiones arquitectónicas
├── SRS.md                    # Especificación de requisitos
├── API.md                    # Documentación de API
├── TESTING.md                # Estrategia de testing
├── DEPLOYMENT.md             # Guía de despliegue
├── rfcs/                     # Requests for Comments
│   ├── 001-pagination.md
│   ├── 002-offline-sync.md
│   └── 003-ai-dual-client.md
└── decisions/                # Architecture Decision Records
    ├── adr-001-use-supabase.md
    └── adr-002-pgvector-rag.md
```

### Anexo C: Dependencias por Fase

| Fase | Dependencias NPM | Servicios Externos |
|------|------------------|-------------------|
| 1 | `vitest`, `@vitest/coverage-v8` | - |
| 2 | `@json2csv/plainjs`, `exceljs`, `@react-pdf/renderer` | - |
| 3 | `react-big-calendar`, `moment` | - |
| 4 | `openai`, `@google/genai`, `@anthropic-ai/sdk` | OpenRouter, DeepSeek |
| 5 | `@apollo/server`, `graphql` | SAP (opcional) |

---

**Fin del Plan de Alineación**

*Documento generado el 3 de mayo de 2026*
*Próxima revisión: 3 de agosto de 2026 (trimestral)*
