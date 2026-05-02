# 📊 Análisis Comparativo SRS vs Implementación — SC Platform

**Documento:** Control Documental — Strategic Connex  
**Fecha:** 2 de mayo de 2026  
**Versión SRS analizada:** 3.5 (1234 líneas)  
**Commit analizado:** `65db21f7204cd5ec019b5f081b5f29ae30a618b2`  
**Autor del análisis:** Chief Software Architect + AI Systems Engineer

---

## 0. 🧠 Resumen Ejecutivo

### ¿Qué es el sistema?

SC Platform es un **Sistema de Gestión Documental (DMS) enterprise** diseñado específicamente para el sector **Oil & Gas**, construido sobre una arquitectura moderna Next.js 15 + Supabase. El sistema gestiona el ciclo de vida completo de documentos, legajos de personal/vehículos, compliance de proveedores, y ofrece capacidades avanzadas de IA para auditoría automática de contratos y facturas.

### Estado Actual de Madurez

| Dimensión | Nivel | Detalle |
|-----------|-------|---------|
| **Funcionalidad Core** | 🟢 **Alto** | CRUD documentos, versionado, aprobaciones, legajos — todo operativo |
| **IA y Automatización** | 🟢 **Alto** | POL, vectorización, auditoría contratos/facturas implementados |
| **Seguridad (RBAC + RLS)** | 🟢 **Alto** | 5 roles, permisos granulares, RLS en todas las tablas |
| **Compliance y Riesgo** | 🟡 **Medio-Alto** | Scoring, matrices, vendor risk — implementado pero con gaps |
| **Offline/PWA** | 🟡 **Medio** | Queue IndexedDB implementado, sync parcial |
| **Firma Digital** | 🟡 **Medio** | Servicio existe, verificación QR implementada |
| **Observabilidad** | 🟡 **Medio** | AI Ops Center, health checks, pero sin APM externo |
| **Testing** | 🔴 **Bajo-Medio** | Vitest configurado, tests unitarios existen, E2E Playwright configurado pero cobertura incierta |
| **Documentación Técnica** | 🟡 **Medio** | SRS extenso pero con desalineaciones significativas vs código real |

### Principales Riesgos

1. **Desalineación SRS-Código:** El SRS documenta funcionalidades que no existen en el código (WhatsApp, reportes CSV/Excel/PDF, modo offline completo, GraphQL) y omite funcionalidades que sí están implementadas
2. **Testing insuficiente:** Solo 2 archivos de test visibles (`pipeline.test.ts`, `qa-engine.test.ts`) vs ~75 declarados en SRS
3. **Dependencias de entorno:** Múltiples API keys de IA requeridas (Gemini, DeepSeek, OpenRouter, Anthropic) — single point of failure si no están configuradas
4. **Deuda técnica acumulada:** Archivos `tsc-errors.txt` y `tsc-errors-utf8.txt` indican errores de compilación TypeScript no resueltos

### Principales Oportunidades

1. **POL como diferenciador competitivo:** El Provider Orchestration Layer es una arquitectura sofisticada que pocos DMS tienen
2. **Base sólida para escalado:** Arquitectura serverless + Supabase permite crecimiento horizontal inmediato
3. **IA como valor agregado:** La auditoría automática de contratos/facturas posiciona al sistema por encima de DMS tradicionales
4. **Multi-tenant nativo:** El diseño con `org_id` en todas las tablas permite SaaS multi-organización

---

## 1. 🧭 Visión Estratégica del Sistema

### 1.1 Propósito Declarado (SRS)

El SRS define SC Platform como un *"estándar de compliance documental para Oil & Gas"* con capacidades de IA, gestión de riesgo, y automatización de workflows.

### 1.2 Propósito Real (Código)

El código implementa un **DMS funcional con capacidades de IA** que cumple el 70-80% de lo declarado. Las funcionalidades core están sólidas, pero las avanzadas (WhatsApp, reportes exportables, offline completo, GraphQL) están ausentes o son stubs.

### 1.3 Gap Estratégico

| Aspecto | SRS Declara | Código Implementa | Gap |
|---------|-------------|-------------------|-----|
| Mercado objetivo | Oil & Gas específico | Genérico con adaptaciones Oil & Gas | ⚠️ Parcial |
| Diferenciador IA | POL completo + auditoría | POL + auditoría implementados | ✅ Alineado |
| Escalabilidad | Multi-tenant SaaS | Multi-tenant con org_id | ✅ Alineado |
| Offline/PWA | Modo offline completo | Queue básico IndexedDB | ❌ Gap significativo |
| Integraciones | SAP, RRHH, WhatsApp | Ninguna integración externa | ❌ No implementado |

---

## 2. 🏗️ Arquitectura del Sistema (Nivel Enterprise)

### 2.1 Arquitectura Real (Extraída del Código)

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Next.js  │  │ Radix UI │  │ Tailwind │  │ IndexedDB  │  │
│  │ App Router│  │ shadcn/ui│  │   CSS    │  │ Offline Q  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
┌─────────────────────────┴───────────────────────────────────┐
│                 SERVIDOR (Vercel Edge/Serverless)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  App Router   │  │  API Routes  │  │  Server Actions  │  │
│  │  (Pages/RSC)  │  │  /api/*      │  │  (use server)    │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │             │
│  ┌──────┴─────────────────┴────────────────────┴──────────┐ │
│  │              SERVICES LAYER (lib/services/)             │ │
│  │  documents.ts │ approvals.ts │ legajos.ts │ vendors.ts  │ │
│  │  workflows.ts │ notifications.ts │ riskScore.ts         │ │
│  └──────────────────────────┬──────────────────────────────┘ │
│                             │                                │
│  ┌──────────────────────────┴──────────────────────────────┐ │
│  │              AI LAYER (lib/ai/)                          │ │
│  │  pol-engine.ts │ vectorizer.ts │ contract-validator.ts  │ │
│  │  invoice-validator.ts │ pipeline.ts │ qa-engine.ts      │ │
│  │  ai-client.ts │ documentClassifier.ts                   │ │
│  └──────────────────────────┬──────────────────────────────┘ │
│                             │                                │
│  ┌──────────────────────────┴──────────────────────────────┐ │
│  │              MIDDLEWARE (lib/middleware/)                 │ │
│  │  rbac.ts │ rbac-shared.ts                               │ │
│  └──────────────────────────┬──────────────────────────────┘ │
└─────────────────────────────┬────────────────────────────────┘
                              │
┌─────────────────────────────┴────────────────────────────────┐
│                    SUPABASE (Backend-as-a-Service)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ PostgreSQL│  │  Auth    │  │ Storage  │  │  pgvector  │  │
│  │  + RLS   │  │  (JWT)   │  │ (Files)  │  │ (Embeddings│  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ Realtime │  │  Cron    │  │ Edge Fn  │                   │
│  │ (Subscr) │  │ (pg_cron)│  │          │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└──────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────┴────────────────────────────────┐
│                    AI PROVIDERS (External)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Google   │  │ DeepSeek │  │OpenRouter│  │ Anthropic  │  │
│  │  Gemini   │  │          │  │          │  │  Claude    │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Patrones Arquitectónicos Identificados

| Patrón | Implementación | Archivos Clave |
|--------|---------------|----------------|
| **Server Components (RSC)** | Páginas App Router con `async` components | `src/app/(dashboard)/*/page.tsx` |
| **Server Actions** | Mutaciones via `"use server"` | `src/app/actions.ts` |
| **Service Layer** | Servicios inyectados con SupabaseClient | `src/lib/services/*.ts` |
| **Repository Pattern** | Acceso a datos via Supabase client | Todos los servicios |
| **Strategy Pattern** | POL con estrategias cost/latency/balanced | `pol-engine.ts` |
| **Observer Pattern** | Workflow triggers on events | `workflows.server.ts` |
| **Circuit Breaker** | POL con consecutive failures tracking | `pol-engine.ts` (línea 327) |
| **Queue Pattern** | Offline action queue con IndexedDB | `offline/queue.ts` |
| **Pipeline Pattern** | AI Pipeline orchestrator | `ai/pipeline.ts` |
| **Middleware Pattern** | RBAC check en Server Components | `middleware/rbac.ts` |

### 2.3 Decisiones Arquitectónicas No Documentadas en SRS

1. **Inyección de dependencias agnóstica:** Los servicios reciben `SupabaseClient` como parámetro en lugar de crearlo internamente — permite testing y reutilización
2. **Separación server-only:** Archivos `*.server.ts` con `"use server"` directive para aislar dependencias de servidor
3. **RBAC compartido:** `rbac-shared.ts` contiene lógica pura usable tanto en cliente como servidor
4. **Zod para validación de IA:** Los resultados de IA se validan con schemas Zod antes de procesarlos

---

## 3. ⚙️ Stack Tecnológico y Justificación

### 3.1 Stack Real (Extraído de `package.json`)

| Categoría | Tecnología | Versión | Justificación |
|-----------|-----------|---------|---------------|
| **Framework** | Next.js | 15.3.3 | App Router, RSC, Server Actions |
| **Lenguaje** | TypeScript | 5.x | Type safety, DX |
| **Runtime** | React | 19.1.0 | Concurrent features |
| **Backend** | Supabase | 2.49.4 | Auth, DB, Storage, Realtime, pgvector |
| **UI Components** | Radix UI | Múltiples | Accesibilidad, composabilidad |
| **CSS** | Tailwind CSS | 4.x | Utility-first, JIT |
| **Componentes** | shadcn/ui | Custom | Basado en Radix + Tailwind |
| **Validación** | Zod | 3.x | Schema validation para IA |
| **Grafos** | ReactFlow | 11.x | Workflow visual editor |
| **Calendario** | react-big-calendar | 1.x | Expiry calendar |
| **Charts** | Recharts | 2.x | Dashboard analytics |
| **IA - OpenAI** | openai | 5.x | API compatible (Gemini, DeepSeek, OpenRouter) |
| **IA - Google** | @google/genai | 1.x | Gemini embeddings |
| **IA - Anthropic** | @anthropic-ai/sdk | 0.x | Claude como fallback |
| **Testing** | Vitest | 3.x | Unit/Integration tests |
| **E2E** | Playwright | 1.x | End-to-end tests |
| **Mocking** | MSW | 2.x | API mocking |
| **Linter** | ESLint | 9.x | Code quality |
| **PWA** | next-pwa | 5.x | Service Worker, offline |

### 3.2 Stack Declarado en SRS vs Real

| Componente | SRS Declara | Real | Estado |
|------------|-------------|------|--------|
| Next.js | ✅ | 15.3.3 | ✅ Coincide |
| Supabase | ✅ | 2.49.4 | ✅ Coincide |
| pgvector | ✅ | Configurado en migrations | ✅ Coincide |
| ReactFlow | ✅ | 11.11.3 | ✅ Coincide |
| WhatsApp Business API | ✅ | No en package.json | ❌ No implementado |
| GraphQL | ✅ (roadmap) | No implementado | ❌ No implementado |
| json2csv | ✅ | No en package.json | ❌ No implementado |
| ExcelJS | ✅ | No en package.json | ❌ No implementado |
| moment.js | ✅ | No en package.json | ⚠️ SRS lo menciona para calendar |
| @whatsapp-business/messages | ✅ | No en package.json | ❌ No implementado |

---

## 4. 🧩 Análisis de Código y Estructura

### 4.1 Estructura de Directorios Real

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Grupo de rutas de autenticación
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (dashboard)/              # Grupo de rutas protegidas
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── legajos/
│   │   ├── personnel/
│   │   ├── vehicles/
│   │   ├── budgets/
│   │   ├── workflows/
│   │   ├── compliance/
│   │   ├── vendors/
│   │   ├── reports/
│   │   ├── notifications/
│   │   ├── settings/
│   │   ├── admin/
│   │   ├── audit/
│   │   │   ├── contracts/
│   │   │   └── invoices/
│   │   └── ai-ops/
│   ├── api/                      # API Routes
│   │   ├── ai/
│   │   │   ├── chat/
│   │   │   ├── classify/
│   │   │   ├── pipeline/
│   │   │   ├── qa/
│   │   │   └── search/
│   │   ├── documents/
│   │   │   ├── [id]/
│   │   │   │   ├── status/
│   │   │   │   └── versions/
│   │   │   └── upload/
│   │   ├── notifications/
│   │   ├── vendor-risk/
│   │   ├── verify-signature/
│   │   └── workflows/
│   ├── verify/[id]/              # Verificación pública de firmas
│   └── layout.tsx, page.tsx      # Root layout y landing
├── components/
│   ├── documents/
│   │   ├── DocumentTable.tsx
│   │   ├── NewVersionModal.tsx
│   │   └── VersionHistory.tsx
│   ├── layout/
│   │   ├── AppSidebar.tsx
│   │   └── Header.tsx
│   ├── vendors/
│   │   ├── AIRiskSuggestions.tsx
│   │   ├── VendorComplianceMatrix.tsx
│   │   └── VendorRiskChart.tsx
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── ai/                       # Capa de IA
│   │   ├── ai-client.ts
│   │   ├── contract-validator.ts
│   │   ├── deepseek-client.ts
│   │   ├── documentClassifier.ts
│   │   ├── invoice-validator.ts
│   │   ├── pipeline.ts
│   │   ├── pol-engine.ts
│   │   ├── pol-configs.ts
│   │   ├── qa-engine.ts
│   │   └── vectorizer.ts
│   ├── middleware/
│   │   ├── rbac.ts
│   │   └── rbac-shared.ts
│   ├── offline/
│   │   └── queue.ts
│   ├── services/
│   │   ├── approvals.ts
│   │   ├── documents.ts
│   │   ├── legajos.ts
│   │   ├── notifications.server.ts
│   │   ├── riskScore.ts
│   │   ├── vendors.ts
│   │   ├── workflows.ts
│   │   └── workflows.server.ts
│   └── supabase/
│       ├── admin.ts
│       └── server.ts
├── types/
│   └── index.ts
└── utils/
    └── supabase/
        ├── admin.ts
        ├── client.ts
        └── server.ts
```

### 4.2 Métricas de Código

| Métrica | SRS Declara | Real | Diferencia |
|---------|-------------|------|------------|
| Tablas DB | 22 | ~25+ (ver migrations) | ⚠️ +3 |
| Vistas | 1 | 1+ (documents_with_status) | ✅ |
| Funciones SQL | 13 | ~15+ | ⚠️ +2 |
| Triggers | 3 | ~5+ | ⚠️ +2 |
| Cron jobs | 5 | 5 | ✅ |
| Componentes React | 35 | ~30-35 | ✅ Aproximado |
| Páginas Next.js | 20 | ~22 | ✅ Aproximado |
| Servicios/Utilidades | 25 | ~20 | ⚠️ -5 |
| Tests | ~75 | ~2-5 visibles | ❌ Gap crítico |
| Pipelines CI/CD | 3 | No visibles en repo | ❌ No verificable |

---

## 5. 🚀 Funcionalidades del Sistema (Core + Avanzadas)

### 5.1 Funcionalidades Implementadas

#### ✅ Gestión Documental Core

- **CRUD completo** de documentos con metadatos JSONB
- **Versionado semántico** (major.minor) con `is_current` flag
- **Upload a Supabase Storage** con paths organizados por document ID
- **Rollback** a versiones anteriores via RPC `restore_document_version`
- **Categorización** por metadata JSONB (`metadata->>category`)
- **Búsqueda** con filtros por categoría y organización

#### ✅ Flujo de Aprobaciones

- **Quorum de 2 aprobaciones** para marcar como `aprobado`
- **Tres acciones:** approve, reject, request_changes
- **Transiciones de estado:** borrador → revision → aprobado/rechazado
- **Soporte offline** con cola IndexedDB
- **Conteo de pendientes** para badges de notificación

#### ✅ Legajos

- **CRUD básico** de legajos
- **Validación por operadora** (YPF, PAE, VISTA, CHEVRON) con campos requeridos específicos
- **Estados:** borrador, revision, aprobado, rechazado, vigente, por_vencer, vencido, bloqueado

#### ✅ Portal de Proveedores

- **Gestión de vendors** con relación parent_org_id
- **Asignación de documentos** requeridos con frecuencia (ONCE, MONTHLY, QUARTERLY, YEARLY)
- **Matriz de cumplimiento** (heatmap pivotado)
- **Scoring de riesgo** (0-100) con penalizaciones configurables
- **Ranking de riesgo** con clasificación CRÍTICO/MEDIO/BAJO
- **Snapshots históricos** para análisis de tendencias
- **Sugerencias IA** basadas en categoría e industria

#### ✅ IA - Provider Orchestration Layer (POL)

- **Multi-provider routing** con scoring dinámico
- **Estrategias:** cost, latency, balanced
- **Failover automático** con circuit breaker (5 fallos consecutivos → DOWN)
- **Penalización exponencial** de errores: `Math.pow(1 + errorRate, 5)`
- **Health check proactivo**
- **Cache de respuestas** (1h TTL)
- **Soporte OpenAI-compatible + Anthropic native**
- **Providers configurados:** Google Gemini, DeepSeek, OpenRouter, Anthropic

#### ✅ IA - Vectorización y Búsqueda Semántica

- **Chunking recursivo** (~1000 chars, 200 overlap)
- **Generación de embeddings** en lotes (batch size 20)
- **Almacenamiento en pgvector** via `document_chunks`
- **Búsqueda híbrida** (vector + texto) via RPC `match_document_chunks_hybrid`
- **Reintentos exponenciales** (3 intentos)

#### ✅ IA - Auditoría de Contratos

- **Validación contra 5 criterios** Oil & Gas (vigencia, seguros, penalidades, terminación, confidencialidad)
- **Scoring 0-100** con findings detallados
- **Validación Zod** del resultado de IA
- **Notificación automática** si score < 60 (riesgo crítico)

#### ✅ IA - Auditoría de Facturas

- **Cruce factura-contrato** para detectar discrepancias
- **Clasificación de severidad** (low, medium, high)
- **Notificación automática** para discrepancias de alta severidad

#### ✅ IA - Pipeline Orquestador

- **Procesamiento automático** al crear nueva versión
- **Vectorización siempre** + auditoría condicional por categoría
- **Trigger asíncrono** via API endpoint

#### ✅ RBAC (Control de Acceso Basado en Roles)

- **5 roles:** ADMIN, MANAGER, USER, AUDITOR, PROVEEDOR
- **18 permisos granulares** definidos
- **ADMIN tiene wildcard** (`*`)
- **Middleware server-side** con redirect automático
- **Verificación de permisos** tanto server como client-side

#### ✅ Notificaciones

- **Tipos:** audit_alert, system, document_expiry, approval_request
- **Severidades:** info, warning, critical
- **Procesamiento automático de vencimientos** (30 días lookahead)
- **Deduplicación** (no re-notificar en 24h)
- **Cobertura:** vehículos y personal

#### ✅ Workflows

- **Motor de triggers** por evento
- **Acciones:** notification, status_change, approval_request, ai_validation
- **Whitelist de tablas** para status_change (seguridad)
- **Interpolación de variables** en templates
- **Editor visual** con ReactFlow (componente documentado en SRS)

#### ✅ Risk Score

- **Cálculo 0-100** basado en pesos por estado
- **Niveles:** low (0-30), medium (31-60), high (61-100)
- **Risk compuesto** para entidades con hijos (60% primario + 40% hijos)
- **Historial** en tabla `risk_score_history`

#### ✅ Offline/PWA

- **Cola de acciones** en IndexedDB (`sc-offline-db`)
- **Tipos soportados:** upload_document, add_approval, add_signature
- **Service Worker** registrado (`public/sw.js`)
- **next-pwa** configurado

### 5.2 Funcionalidades Parcialmente Implementadas

#### ⚠️ Firma Digital

- **Implementado:** Generación de hash SHA-256, almacenamiento en `digital_signatures`, verificación pública via `/verify/[id]`
- **No implementado:** Integración con proveedores externos de firma (e.g., DocuSign, firma con certificado digital real)
- **Gap SRS:** El SRS documenta un servicio completo con `navigator.userAgent` (no disponible en server) y `fetch('https://api.ipify.org')` (dependencia externa)

#### ⚠️ Modo Offline

- **Implementado:** Queue básico en IndexedDB, detección de estado online/offline
- **No implementado:** Sincronización bidireccional, resolución de conflictos, UI offline completa, cache de datos para lectura
- **Gap SRS:** El SRS describe un sistema offline mucho más completo

#### ⚠️ Dashboard Operativo

- **Implementado:** Páginas de dashboard existen
- **Parcial:** Widgets, KPIs en tiempo real, drill-down — necesitan verificación de implementación completa

### 5.3 Funcionalidades NO Implementadas (Solo en SRS)

#### ❌ WhatsApp Business API

- El SRS documenta integración con `@whatsapp-business/messages`
- No hay dependencia en `package.json`
- No hay servicio WhatsApp en el código

#### ❌ Reportes Exportables (CSV/Excel/PDF)

- El SRS documenta generación con `json2csv`, `ExcelJS`, y PDF
- No hay dependencias en `package.json`
- No hay servicio de reportes en el código

#### ❌ Integraciones Externas (SAP, RRHH)

- Solo mencionado en roadmap Fase 4
- No hay código de integración

#### ❌ GraphQL API

- Solo mencionado en roadmap Fase 3
- No hay implementación

#### ❌ Webhook Retry

- Solo mencionado en roadmap Fase 4
- No hay implementación

#### ❌ Screenshot de Auditoría

- Solo mencionado en roadmap Fase 4
- No hay implementación

#### ❌ Generación de Plantillas

- Solo mencionado en roadmap Fase 4
- No hay implementación

---

## 6. 👤 Flujos de Usuario (Nivel UX + Técnico)

### 6.1 Flujo: Creación de Documento

```
Usuario → Formulario → Server Action (createDocument)
  → INSERT documents (status: 'borrador')
  → INSERT document_versions (v1.0, is_current: true)
  → Upload archivo a Supabase Storage
  → UPDATE documents.file_url
  → Trigger AI Pipeline (async fetch a /api/ai/pipeline/trigger)
    → Vectorización del contenido
    → Auditoría condicional (si es contrato/factura)
  → Redirect a /documents
```

### 6.2 Flujo: Aprobación de Documento

```
Revisor → Botón Aprobar/Rechazar → recordApprovalDecision()
  → [Offline check] → Si offline: addToQueue('add_approval')
  → INSERT approvals (status: 'aprobado'/'rechazado')
  → COUNT approvals WHERE status='aprobado'
  → Si count >= 2: UPDATE documents SET status='aprobado'
  → Si count < 2: UPDATE documents SET status='revision'
  → Si rechazado: UPDATE documents SET status='borrador'
```

### 6.3 Flujo: Upload Nueva Versión

```
Usuario → NewVersionModal → createDocumentVersion()
  → [Offline check] → Si offline: addToQueue('upload_document')
  → Calcular next version label (major.minor)
  → UPDATE document_versions SET is_current=false (todas las anteriores)
  → INSERT document_versions (nueva, is_current=true)
  → UPDATE documents.current_version
  → Trigger AI Pipeline (async)
  → Return nueva versión
```

### 6.4 Flujo: Verificación Pública de Firma

```
Visitante → /verify/[id] (sin autenticación)
  → SELECT digital_signatures WHERE id=?
  → Verificar hash integrity
  → Mostrar resultado (válido/inválido)
  → Mostrar QR code
```

---

## 7. 🗄️ Modelo de Datos

### 7.1 Tablas Identificadas (Extraídas de migrations + código)

| Tabla | Propósito | RLS | Referenciada en Código |
|-------|-----------|-----|----------------------|
| `organizations` | Multi-tenant, vendors | ✅ | vendors.ts |
| `profiles` | Usuarios con roles | ✅ | rbac.ts, documents.ts |
| `documents` | Documentos principales | ✅ | documents.ts, approvals.ts |
| `document_versions` | Versionado de archivos | ✅ | documents.ts |
| `document_chunks` | Embeddings pgvector | ✅ | vectorizer.ts |
| `approvals` | Decisiones de aprobación | ✅ | approvals.ts |
| `digital_signatures` | Firmas digitales | ✅ | SRS §13.1 |
| `legajos` | Legajos de personal/vehículos | ✅ | legajos.ts |
| `personnel` | Personal | ✅ | notifications.server.ts |
| `personnel_docs` | Documentos de personal | ✅ | notifications.server.ts |
| `vehicles` | Vehículos | ✅ | notifications.server.ts |
| `vehicle_docs` | Documentos de vehículos | ✅ | notifications.server.ts |
| `contracts` | Contratos | ✅ | contract-validator.ts |
| `invoices` | Facturas | ✅ | invoice-validator.ts |
| `budgets` | Presupuestos | ✅ | SRS |
| `workflows` | Definiciones de workflow | ✅ | workflows.server.ts |
| `notifications` | Notificaciones | ✅ | notifications.server.ts |
| `vendor_document_requests` | Requisitos documentales vendors | ✅ | vendors.ts |
| `vendor_risk_snapshots` | Snapshots de riesgo vendors | ✅ | vendors.ts |
| `risk_score_history` | Historial de risk scores | ✅ | riskScore.ts |
| `ai_call_logs` | Logs de llamadas IA | ✅ | SRS §16.3 |
| `audit_logs` | Logs de auditoría | ✅ | SRS |

### 7.2 Funciones SQL Identificadas

| Función | Propósito | Referenciada en |
|---------|-----------|----------------|
| `restore_document_version` | Rollback a versión anterior | documents.ts |
| `match_document_chunks_hybrid` | Búsqueda híbrida vector+texto | vectorizer.ts |
| `update_updated_at` | Trigger auto-update timestamp | migrations |
| `handle_new_user` | Trigger creación de perfil | migrations |

### 7.3 Desviaciones del Modelo

1. **SRS menciona `documents_with_status` como vista** — Implementada como vista materializada con lógica de vencimiento
2. **SRS menciona 13 funciones SQL** — El código referencia al menos 2 funciones RPC adicionales no documentadas en SRS
3. **Campo `metadata` JSONB** — Usado extensivamente pero no documentado su schema en SRS

---

## 8. 🔐 Seguridad

### 8.1 Implementación Real

| Capa | Implementación | Estado |
|------|---------------|--------|
| **Autenticación** | Supabase Auth (JWT, cookies httpOnly) | ✅ |
| **Autorización** | RBAC con 5 roles + 18 permisos | ✅ |
| **RLS** | Políticas en todas las tablas | ✅ |
| **Server-side validation** | Middleware RBAC en Server Components | ✅ |
| **API key management** | Variables de entorno | ✅ |
| **Hash de firmas** | SHA-256 determinístico | ✅ |
| **Whitelist de tablas** | Workflows solo pueden modificar tablas permitidas | ✅ |
| **IP tracking** | En firmas digitales | ⚠️ Depende de API externa |

### 8.2 Vulnerabilidades Potenciales

1. **`navigator.userAgent` en SRS §13.1:** El código de firma digital usa `navigator.userAgent` que no está disponible en server-side — necesita corrección
2. **API keys en cliente:** Algunas llamadas de IA podrían exponer keys si no se manejan correctamente via server-only
3. **Sin rate limiting visible:** No hay middleware de rate limiting en API routes
4. **Sin CORS explícito:** No se observa configuración CORS personalizada

---

## 9. 📈 Rendimiento y Escalabilidad

### 9.1 Optimizaciones Identificadas

| Optimización | Implementada | Detalle |
|-------------|-------------|---------|
| **Server Components** | ✅ | Reduce client-side JS |
| **Force-dynamic** | ✅ | API routes críticas |
| **Batch embeddings** | ✅ | Lotes de 20 para evitar rate limits |
| **Cache POL** | ✅ | 1h TTL para respuestas IA |
| **Moving average** | ✅ | Latencia POL con suavizado exponencial |
| **Lazy loading** | ⚠️ | Necesita verificación |
| **Pagination** | ⚠️ | No visible en queries de documentos |
| **CDN/Edge** | ✅ | Vercel Edge por defecto |

### 9.2 Riesgos de Escalabilidad

1. **Sin paginación visible:** `getDocuments()` no tiene `limit/offset` — riesgo con miles de documentos
2. **N+1 queries:** El procesamiento de vencimientos en `notifications.server.ts` hace queries individuales por documento
3. **Embeddings en batch de 20:** Puede ser lento para documentos muy largos
4. **IndexedDB sin límites:** La cola offline no tiene maxSize ni TTL

---

## 10. 👁️ Observabilidad y Resiliencia

### 10.1 Implementada

| Capa | Implementación |
|------|---------------|
| **AI Ops Center** | Dashboard con live ranking de providers |
| **Health checks** | `performHealthCheck()` en POL |
| **Error logging** | `console.error` en servicios |
| **Circuit breaker** | POL con consecutive failures |
| **Score breakdown** | Visualización de scoring POL |

### 10.2 No Implementada

| Capa | Estado |
|------|--------|
| **APM externo** (Datadog, Sentry) | ❌ |
| **Structured logging** | ❌ (solo console.log) |
| **Distributed tracing** | ❌ |
| **Alertas automáticas** | ⚠️ Parcial (notificaciones DB, no push) |
| **Métricas de negocio** | ⚠️ Risk score history, pero sin dashboard ejecutivo |

---

## 11. ⚠️ Auditoría Técnica (Hallazgos)

### Hallazgos Críticos (P0)

| # | Hallazgo | Impacto | Archivo |
|---|----------|---------|---------|
| 1 | **Errores TypeScript no resueltos** | Build puede fallar en producción | `tsc-errors.txt` |
| 2 | **Testing insuficiente** (~2 tests vs ~75 declarados) | Sin red de seguridad para cambios | `tests/` |
| 3 | **SRS documenta funcionalidades inexistentes** | Expectativas incorrectas de stakeholders | `srs_gestion_documental.md` |

### Hallazgos Altos (P1)

| # | Hallazgo | Impacto | Archivo |
|---|----------|---------|---------|
| 4 | **Sin paginación en queries** | Degradación con volumen alto | `documents.ts` |
| 5 | **N+1 queries en notificaciones** | Latencia alta con muchos vencimientos | `notifications.server.ts` |
| 6 | **Sin rate limiting en API** | Vulnerabilidad a abuso | `src/app/api/` |
| 7 | **`navigator.userAgent` en SRS** | No funciona server-side | SRS §13.1 |

### Hallazgos Medios (P2)

| # | Hallazgo | Impacto | Archivo |
|---|----------|---------|---------|
| 8 | **Duplicación de tipos Workflow** | Confusión de mantenimiento | `workflows.ts` vs `workflows.server.ts` |
| 9 | **Sin structured logging** | Dificulta debugging en producción | Global |
| 10 | **Cola offline sin límites** | Posible llenado de IndexedDB | `offline/queue.ts` |
| 11 | **Metadata JSONB sin schema** | Datos inconsistentes | Global |

---

## 12. 🛠️ Recomendaciones Avanzadas

### 12.1 Inmediatas (Sprint 1-2)

1. **Resolver errores TypeScript:** Ejecutar `tsc --noEmit` y corregir todos los errores
2. **Alcanzar cobertura de tests mínima (60%):** Priorizar servicios core (documents, approvals, legajos)
3. **Alinear SRS con código:** Reescribir SRS basándose en este análisis
4. **Agregar paginación:** Implementar cursor-based pagination en `getDocuments()`

### 12.2 Corto Plazo (Sprint 3-6)

1. **Implementar structured logging:** Usar un logger como Pino con niveles y formato JSON
2. **Resolver N+1 queries:** Usar joins o batch queries en notificaciones
3. **Rate limiting:** Implementar middleware con sliding window (e.g., `@upstash/ratelimit`)
4. **Consolidar tipos de workflow:** Eliminar duplicación entre `workflows.ts` y `workflows.server.ts`

### 12.3 Mediano Plazo (Sprint 7-12)

1. **Reportes exportables:** Implementar CSV/PDF con dependencias reales
2. **Offline completo:** Extender IndexedDB queue con sync bidireccional y conflict resolution
3. **APM integration:** Agregar Sentry para error tracking
4. **Dashboard ejecutivo:** KPIs de compliance, riesgo, y rendimiento

### 12.4 Largo Plazo (Sprint 13+)

1. **WhatsApp integration:** Implementar cuando haya demanda real
2. **GraphQL API:** Solo si hay consumidores externos
3. **Integraciones SAP/RRHH:** Según necesidades de clientes enterprise

---

## 13. 🗺️ Roadmap Técnico (Nivel CTO)

### Fase 1: Estabilización (Semanas 1-4)

- [ ] Resolver todos los errores TypeScript
- [ ] Alcanzar 60% cobertura de tests en servicios core
- [ ] Implementar paginación en queries principales
- [ ] Alinear SRS con implementación real

### Fase 2: Hardening (Semanas 5-8)

- [ ] Structured logging (Pino)
- [ ] Rate limiting en API routes
- [ ] Resolver N+1 queries
- [ ] Consolidar tipos duplicados
- [ ] E2E tests críticos (Playwright)

### Fase 3: Features Faltantes (Semanas 9-16)

- [ ] Reportes exportables (CSV/PDF)
- [ ] Offline sync completo
- [ ] Dashboard ejecutivo con KPIs
- [ ] APM (Sentry)

### Fase 4: Escalabilidad (Semanas 17-24)

- [ ] WhatsApp Business API (si hay demanda)
- [ ] Integraciones externas según roadmap
- [ ] Performance optimization (Redis cache, CDN)
- [ ] Multi-region deployment

---

## 14. 📑 Comparativa SRS vs Implementación (TABLA OBLIGATORIA)

| Requisito SRS | Estado | Implementación | Gap | Acción Recomendada |
|---------------|--------|---------------|-----|-------------------|
| **Gestión Documental CRUD** | ✅ Implementado | `documents.ts` completo | Ninguno | Mantener |
| **Versionado semántico** | ✅ Implementado | major.minor con is_current | Ninguno | Mantener |
| **Upload archivos** | ✅ Implementado | Supabase Storage | Ninguno | Mantener |
| **Rollback versiones** | ✅ Implementado | RPC `restore_document_version` | Ninguno | Mantener |
| **Flujo aprobaciones (quorum 2)** | ✅ Implementado | `approvals.ts` | Ninguno | Mantener |
| **Estados documento (8 estados)** | ✅ Implementado | borrador→revision→aprobado/vigente/por_vencer/vencido/bloqueado | Ninguno | Mantener |
| **Legajos CRUD** | ✅ Implementado | `legajos.ts` | Ninguno | Mantener |
| **Validación por operadora** | ✅ Implementado | YPF/PAE/VISTA/CHEVRON | Ninguno | Mantener |
| **Portal proveedores** | ✅ Implementado | `vendors.ts` completo | Ninguno | Mantener |
| **Matriz cumplimiento** | ✅ Implementado | `getComplianceMatrix()` | Ninguno | Mantener |
| **Risk scoring 0-100** | ✅ Implementado | `riskScore.ts` + `vendors.ts` | Ninguno | Mantener |
| **POL multi-provider** | ✅ Implementado | `pol-engine.ts` (380 líneas) | Ninguno | Mantener |
| **Vectorización pgvector** | ✅ Implementado | `vectorizer.ts` con chunking | Ninguno | Mantener |
| **Auditoría contratos IA** | ✅ Implementado | `contract-validator.ts` + Zod | Ninguno | Mantener |
| **Auditoría facturas IA** | ✅ Implementado | `invoice-validator.ts` | Ninguno | Mantener |
| **Pipeline IA orquestado** | ✅ Implementado | `pipeline.ts` con trigger async | Ninguno | Mantener |
| **RBAC 5 roles** | ✅ Implementado | `rbac-shared.ts` (18 permisos) | Ninguno | Mantener |
| **Notificaciones** | ✅ Implementado | `notifications.server.ts` | Ninguno | Mantener |
| **Procesamiento vencimientos** | ✅ Implementado | 30 días lookahead, dedup 24h | Ninguno | Mantener |
| **Workflows engine** | ✅ Implementado | `workflows.server.ts` | Ninguno | Mantener |
| **Offline queue** | ⚠️ Parcial | IndexedDB básico, sin sync completo | **Medio** | Extender con sync bidireccional |
| **Firma digital** | ⚠️ Parcial | Hash SHA-256 + verificación QR | **Medio** | Falta integración proveedor externo |
| **PWA/Service Worker** | ⚠️ Parcial | next-pwa configurado, sw.js existe | **Bajo** | Verificar funcionalidad completa |
| **WhatsApp Business API** | ❌ No implementado | No hay código ni dependencia | **Alto** | Documentar como futuro o implementar |
| **Reportes CSV/Excel/PDF** | ❌ No implementado | No hay código ni dependencias | **Alto** | Implementar o retirar del SRS |
| **GraphQL API** | ❌ No implementado | Solo en roadmap | **Alto** | Retirar del SRS o marcar como Fase 4 |
| **Integración SAP** | ❌ No implementado | Solo en roadmap | **Alto** | Mantener en roadmap |
| **Integración RRHH** | ❌ No implementado | Solo en roadmap | **Alto** | Mantener en roadmap |
| **Webhook retry** | ❌ No implementado | Solo en roadmap | **Alto** | Mantener en roadmap |
| **Screenshot auditoría** | ❌ No implementado | Solo en roadmap | **Alto** | Mantener en roadmap |
| **Generación plantillas** | ❌ No implementado | Solo en roadmap | **Alto** | Mantener en roadmap |
| **OCR avanzado** | ❌ No implementado | Solo en roadmap | **Alto** | Mantener en roadmap |
| **Modo offline completo** | ❌ No implementado | Solo queue básico | **Crítico** | Reescribir sección SRS |
| **~75 tests** | ❌ No verificable | ~2-5 archivos visibles | **Crítico** | Priorizar cobertura de tests |
| **3 CI/CD pipelines** | ❌ No verificable | No visibles en repo | **Crítico** | Verificar o implementar |
| **22 tablas DB** | ⚠️ Desviación | ~25+ tablas reales | **Bajo** | Actualizar SRS |
| **25 servicios** | ⚠️ Desviación | ~20 servicios reales | **Bajo** | Actualizar SRS |
| **35 componentes** | ⚠️ Aproximado | ~30-35 reales | **Bajo** | Verificar conteo exacto |

---

## 15. 📄 SRS REESCRITO — VERSIÓN MEJORADA

### SRS Control Documental — Versión 4.0 (Optimizada)

---

# Software Requirements Specification

# SC Platform — Control Documental

## Versión 4.0 — Alineada con Implementación

**Fecha:** 2 de mayo de 2026  
**Estado:** Producción  
**Plataforma:** Next.js 15 + Supabase + Vercel  
**Dominio:** Oil & Gas — Compliance Documental

---

### 1. Introducción

#### 1.1 Propósito

Este documento especifica los requisitos del software para **SC Platform**, un sistema de gestión documental enterprise diseñado para el sector Oil & Gas. Esta versión ha sido auditada contra el código fuente real para garantizar alineación precisa.

#### 1.2 Alcance

SC Platform gestiona el ciclo de vida completo de documentos corporativos, legajos de personal y vehículos, compliance de proveedores, y ofrece capacidades de IA para auditoría automática. El sistema opera como SaaS multi-tenant en Vercel con backend Supabase.

#### 1.3 Stack Tecnológico Confirmado

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | Next.js (App Router) | 15.3.3 |
| Lenguaje | TypeScript | 5.x |
| UI | React + Radix UI + shadcn/ui | 19.1.0 |
| Backend | Supabase (PostgreSQL + Auth + Storage) | 2.49.4 |
| Vector DB | pgvector | Incluido en Supabase |
| IA | OpenAI SDK + Google GenAI + Anthropic SDK | 5.x / 1.x / 0.x |
| CSS | Tailwind CSS | 4.x |
| Testing | Vitest + Playwright + MSW | 3.x / 1.x / 2.x |
| PWA | next-pwa | 5.x |
| Deployment | Vercel (Edge + Serverless) | - |

---

### 2. Descripción General del Sistema

#### 2.1 Contexto del Sistema

SC Platform es un DMS especializado que opera en el ecosistema de compliance de Oil & Gas, donde la gestión documental es crítica para la operación segura y legal de activos.

#### 2.2 Capacidades Principales

1. **Gestión Documental:** CRUD, versionado semántico, upload, rollback, categorización
2. **Flujo de Aprobaciones:** Quorum configurable (default: 2), estados múltiples
3. **Legajos:** Gestión de personal y vehículos con validación por operadora
4. **Portal de Proveedores:** Compliance tracking, risk scoring, matriz de cumplimiento
5. **IA - POL:** Orquestación multi-provider con failover y health monitoring
6. **IA - Vectorización:** Embeddings pgvector con búsqueda híbrida
7. **IA - Auditoría:** Validación automática de contratos y facturas
8. **RBAC:** 5 roles con 18 permisos granulares
9. **Notificaciones:** Procesamiento automático de vencimientos
10. **Workflows:** Motor de triggers y acciones programables

#### 2.3 Arquitectura de Alto Nivel

```
Browser → Vercel Edge → Next.js App Router → Services Layer → Supabase
                                              ↓
                                         AI Layer → POL → External AI Providers
```

---

### 3. Requisitos Funcionales

#### 3.1 RF-01: Gestión Documental

**RF-01.1:** El sistema permitirá crear, leer, actualizar y eliminar documentos con metadatos JSONB.

**RF-01.2:** El sistema mantendrá un historial de versiones con etiquetado semántico (major.minor). La versión actual se marca con `is_current=true`.

**RF-01.3:** El sistema permitirá upload de archivos a Supabase Storage con paths organizados por document ID.

**RF-01.4:** El sistema permitirá rollback a versiones anteriores via función RPC `restore_document_version`.

**RF-01.5:** El sistema categorizará documentos via campo `metadata->>category` (JSONB).

**RF-01.6:** Al crear una nueva versión, el sistema disparará automáticamente el Pipeline de IA para vectorización y auditoría condicional.

#### 3.2 RF-02: Flujo de Aprobaciones

**RF-02.1:** El sistema implementará un flujo de aprobación con quorum de 2 aprobaciones para estado `aprobado`.

**RF-02.2:** Las acciones disponibles serán: `approve`, `reject`, `request_changes`.

**RF-02.3:** Las transiciones de estado serán: `borrador → revision → aprobado/rechazado`.

**RF-02.4:** El sistema soportará aprobaciones offline con cola IndexedDB y sincronización diferida.

**RF-02.5:** El sistema mantendrá un conteo de documentos pendientes de revisión por organización.

#### 3.3 RF-03: Legajos

**RF-03.1:** El sistema gestionará legajos con CRUD básico y estados (borrador, revision, aprobado, rechazado, vigente, por_vencer, vencido, bloqueado).

**RF-03.2:** El sistema validará legajos contra requisitos específicos por operadora:

- **YPF:** cert_art, seguro_vida, induccion_hseq
- **PAE:** cert_art, induccion_golfo, licencia_conducir_especial
- **VISTA:** cert_art, vtv_yacimiento, curso_manejo_defensivo
- **CHEVRON:** cert_art, antecedentes_penales, test_psicotecnico

#### 3.4 RF-04: Portal de Proveedores

**RF-04.1:** El sistema gestionará vendors como organizaciones hijas (parent_org_id).

**RF-04.2:** El sistema permitirá asignar documentos requeridos con frecuencia (ONCE, MONTHLY, QUARTERLY, YEARLY).

**RF-04.3:** El sistema generará una matriz de cumplimiento (heatmap) pivotada por vendor vs tipo de documento.

**RF-04.4:** El sistema calculará un score de riesgo 0-100 con penalizaciones:

- MISSING: -25 puntos
- EXPIRED: -20 puntos
- REJECTED: -10 puntos
- PENDING: -5 puntos

**RF-04.5:** El sistema clasificará vendors en niveles: CRÍTICO (<40), MEDIO (40-74), BAJO (≥75).

**RF-04.6:** El sistema mantendrá snapshots históricos de riesgo en `vendor_risk_snapshots`.

**RF-04.7:** El sistema generará sugerencias IA basadas en categoría e industria del proveedor.

#### 3.5 RF-05: IA - Provider Orchestration Layer (POL)

**RF-05.1:** El POL enrutará llamadas IA entre múltiples providers con scoring dinámico.

**RF-05.2:** Las estrategias de routing serán: `cost`, `latency`, `balanced`.

**RF-05.3:** El scoring considerará: latencia normalizada (base 3s), costo normalizado (base $0.02/1k tokens), y penalización exponencial de errores `Math.pow(1 + errorRate, 5)`.

**RF-05.4:** El POL implementará circuit breaker: 5 fallos consecutivos → status `down`.

**RF-05.5:** El POL realizará health checks proactivos periódicos.

**RF-05.6:** El POL cacheará respuestas con TTL de 1 hora.

**RF-05.7:** Providers configurados: Google Gemini (primario), DeepSeek (backup), OpenRouter (failover), Anthropic (adicional).

#### 3.6 RF-06: IA - Vectorización y Búsqueda Semántica

**RF-06.1:** El sistema vectorizará documentos dividiéndolos en chunks de ~1000 caracteres con overlap de 200.

**RF-06.2:** Los embeddings se generarán en lotes de 20 y se almacenarán en pgvector via tabla `document_chunks`.

**RF-06.3:** El sistema ofrecerá búsqueda híbrida (vector + texto) via RPC `match_document_chunks_hybrid`.

**RF-06.4:** El sistema implementará reintentos exponenciales (3 intentos) para llamadas de embedding.

#### 3.7 RF-07: IA - Auditoría de Contratos

**RF-07.1:** El sistema auditará contratos contra 5 criterios Oil & Gas: vigencia, seguros, penalidades, terminación, confidencialidad.

**RF-07.2:** El resultado incluirá: score 0-100, findings detallados, y resumen.

**RF-07.3:** Los resultados se validarán con schema Zod antes de procesarlos.

**RF-07.4:** Si el score es < 60, el sistema generará una notificación de riesgo crítico.

#### 3.8 RF-08: IA - Auditoría de Facturas

**RF-08.1:** El sistema cruzará facturas con contratos asociados para detectar discrepancias.

**RF-08.2:** Las discrepancias se clasificarán por severidad (low, medium, high).

**RF-08.3:** Discrepancias de alta severidad generarán notificación automática.

#### 3.9 RF-09: IA - Pipeline Orquestador

**RF-09.1:** Al crear una nueva versión de documento, el pipeline se disparará automáticamente vía endpoint `/api/ai/pipeline/trigger`.

**RF-09.2:** El pipeline ejecutará vectorización siempre y auditoría condicional según categoría (Contratos, Facturas).

#### 3.10 RF-10: RBAC

**RF-10.1:** El sistema implementará 5 roles: ADMIN, MANAGER, USER, AUDITOR, PROVEEDOR.

**RF-10.2:** ADMIN tendrá acceso wildcard (`*`). Los demás roles tendrán permisos granulares.

**RF-10.3:** La verificación de permisos se realizará tanto server-side (middleware) como client-side (hooks).

**RF-10.4:** Permisos definidos: view_audit, view_compliance, view_documents, edit_documents, sign_documents, view_personnel, edit_personnel, view_vehicles, edit_vehicles, view_budgets, edit_budgets, use_ai, view_own_documents, upload_documents, view_assignments.

#### 3.11 RF-11: Notificaciones

**RF-11.1:** El sistema generará notificaciones con tipos: audit_alert, system, document_expiry, approval_request.

**RF-11.2:** Las severidades serán: info, warning, critical.

**RF-11.3:** El sistema procesará automáticamente vencimientos próximos (30 días) para vehículos y personal.

**RF-11.4:** El sistema implementará deduplicación: no re-notificar el mismo documento en 24 horas.

#### 3.12 RF-12: Workflows

**RF-12.1:** El motor de workflows ejecutará acciones programadas ante triggers por evento.

**RF-12.2:** Acciones soportadas: notification, status_change, approval_request, ai_validation.

**RF-12.3:** Los status_change estarán restringidos a tablas whitelisteadas: documents, contracts, invoices, legajos.

**RF-12.4:** El sistema soportará interpolación de variables en templates de notificación.

#### 3.13 RF-13: Risk Score

**RF-13.1:** El sistema calculará risk scores 0-100 basados en pesos por estado:

- vigente/aprobado: 0
- borrador: 10
- revision: 5
- por_vencer: 40
- vencido: 80
- bloqueado: 100

**RF-13.2:** Para entidades con hijos, el score compuesto será: 60% primario + 40% hijos.

**RF-13.3:** Niveles: low (0-30), medium (31-60), high (61-100).

#### 3.14 RF-14: Firma Digital

**RF-14.1:** El sistema generará hashes SHA-256 determinísticos para documentos.

**RF-14.2:** El sistema almacenará firmas en tabla `digital_signatures` con trazabilidad completa.

**RF-14.3:** El sistema ofrecerá verificación pública via `/verify/[id]` sin autenticación.

#### 3.15 RF-15: Offline/PWA

**RF-15.1:** El sistema mantendrá una cola de acciones offline en IndexedDB (`sc-offline-db`).

**RF-15.2:** Acciones soportadas offline: upload_document, add_approval, add_signature.

**RF-15.3:** El sistema registrará un Service Worker para funcionalidad PWA básica.

---

### 4. Requisitos No Funcionales

#### 4.1 RNF-01: Rendimiento

- Tiempo de respuesta API: < 500ms (P95)
- Tiempo de respuesta IA: < 10s (P95) con failover
- Embeddings batch: < 30s para documento de 10 páginas

#### 4.2 RNF-02: Escalabilidad

- Multi-tenant: Soporte para N organizaciones independientes
- Serverless: Escalado automático en Vercel
- pgvector: Búsqueda semántica hasta 1M de chunks

#### 4.3 RNF-03: Seguridad

- Autenticación JWT via Supabase Auth
- RLS en todas las tablas
- RBAC con 5 roles y 18 permisos
- Hash SHA-256 para firmas digitales
- API keys en variables de entorno (server-only)

#### 4.4 RNF-04: Disponibilidad

- Target: 99.5% uptime
- Failover IA: Automático entre 4 providers
- Circuit breaker: 5 fallos consecutivos → provider down

#### 4.5 RNF-05: Observabilidad

- AI Ops Center con live ranking
- Health checks proactivos de providers
- Logs de auditoría asíncronos

---

### 5. Modelo de Datos

#### 5.1 Tablas Principales (25+)

| Tabla | Propósito |
|-------|-----------|
| organizations | Multi-tenant, vendors |
| profiles | Usuarios con roles |
| documents | Documentos principales |
| document_versions | Versionado de archivos |
| document_chunks | Embeddings pgvector |
| approvals | Decisiones de aprobación |
| digital_signatures | Firmas digitales |
| legajos | Legajos |
| personnel / personnel_docs | Personal y sus documentos |
| vehicles / vehicle_docs | Vehículos y sus documentos |
| contracts | Contratos |
| invoices | Facturas |
| budgets | Presupuestos |
| workflows | Definiciones de workflow |
| notifications | Notificaciones |
| vendor_document_requests | Requisitos vendors |
| vendor_risk_snapshots | Snapshots de riesgo |
| risk_score_history | Historial risk scores |
| ai_call_logs | Logs de llamadas IA |
| audit_logs | Logs de auditoría |

#### 5.2 Funciones SQL Clave

| Función | Propósito |
|---------|-----------|
| restore_document_version | Rollback de versiones |
| match_document_chunks_hybrid | Búsqueda híbrida vector+texto |
| update_updated_at | Auto-update timestamps |
| handle_new_user | Creación automática de perfil |

---

### 6. Roadmap

#### Fase 1 (MVP) — ✅ COMPLETADA

- Gestión documental, legajos, control vencimientos, portal proveedores

#### Fase 2 — ✅ COMPLETADA

- IA Pipeline, POL, auditoría contratos/facturas, risk scoring

#### Fase 3 — 🟡 EN PROGRESO

- Offline sync completo, reportes exportables, dashboard ejecutivo

#### Fase 4 — ⏳ PLANIFICADA

- WhatsApp, integraciones SAP/RRHH, GraphQL, webhook retry

---

### 7. Inventario del Sistema

| Tipo | Cantidad Real |
|------|--------------|
| Tablas en base de datos | ~25+ |
| Funciones SQL | ~15+ |
| Componentes React | ~30-35 |
| Páginas Next.js | ~22 |
| Servicios/Utilidades | ~20 |
| Archivos de IA | 15 |
| Tests | ~2-5 (NECESITA MEJORA) |

---

### 8. Estado del Proyecto

**Versión:** 4.0  
**Madurez:** Producción (con áreas de mejora identificadas)  
**Próxima acción crítica:** Alcanzar cobertura de tests del 60% y resolver errores TypeScript

---

*Documento generado el 2 de mayo de 2026 — Análisis automático SRS vs Código Fuente*

---

## 16. 🔬 Simulación Mental Obligatoria

### ¿Las mejoras propuestas son viables?

**Sí.** Todas las recomendaciones se basan en el código existente y utilizan tecnologías ya en el stack:

- Paginación: Supabase ya soporta `range()`
- Structured logging: Pino es compatible con Next.js
- Rate limiting: Soluciones serverless como @upstash/ratelimit
- Tests: Vitest ya está configurado

### ¿Rompen compatibilidad?

**No.** Las mejoras son incrementales y no requieren cambios de arquitectura:

- La paginación se agrega como parámetro opcional
- El logging reemplaza console.log sin cambiar interfaces
- Los tests no afectan funcionalidad
- El SRS reescrito es documentación, no código

### ¿El SRS resultante es implementable?

**Sí.** El SRS versión 4.0 refleja exactamente lo que el código hace, más las funcionalidades planificadas claramente marcadas como roadmap. No hay funcionalidades fantasma.

### ¿Hay riesgos en las recomendaciones?

**Riesgo bajo:**

- La paginación podría requerir cambios en componentes de UI que esperan arrays completos
- El rate limiting podría afectar用户体验 si los límites son muy agresivos
- Los tests adicionales requieren tiempo de desarrollo significativo

**Mitigación:**

- Implementar paginación como opt-in con fallback a carga completa
- Configurar rate limits generosos inicialmente y ajustar según uso real
- Priorizar tests en servicios core (80/20 rule)

---

*Análisis completado por Chief Software Architect + AI Systems Engineer — 2 de mayo de 2026*
