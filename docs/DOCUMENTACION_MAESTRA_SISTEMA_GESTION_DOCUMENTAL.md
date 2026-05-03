# DOCUMENTACION_MAESTRA_SISTEMA_GESTION_DOCUMENTAL.md

## SC Platform — Sistema de Gestión Documental (DMS) Enterprise

**Versión:** 5.0 (Unificada y Normalizada)
 **Estado:** Fuente de Verdad Oficial
 **Fecha:** Mayo 2026

------

# 1. 🧠 Resumen Ejecutivo

**SC Platform** es una plataforma SaaS multi-tenant de gestión documental orientada a **Oil & Gas**, diseñada para garantizar **compliance operativo, trazabilidad legal y automatización inteligente** del ciclo de vida documental.

El sistema integra:

- Gestión documental completa con versionado y aprobación
- Control de legajos de personal y vehículos
- Automatización de compliance (vencimientos, alertas)
- Motor de IA con orquestación multi-provider (POL)
- Capacidades de auditoría automatizada (contratos, facturas)

### Estado de Madurez

| Área                   | Estado            |
| ---------------------- | ----------------- |
| Core DMS               | 🟢 Alto            |
| IA / Automatización    | 🟢 Alto            |
| Seguridad (RBAC + RLS) | 🟢 Alto            |
| Compliance             | 🟡 Medio-Alto      |
| Testing                | 🔴 Bajo            |
| Offline                | 🟡 Parcial         |
| Reportes               | 🔴 No implementado |

### Riesgos Críticos

- Desalineación SRS vs implementación real 
- Dependencia de múltiples providers de IA
- Cobertura de testing insuficiente
- Features declaradas no implementadas (reportes, GraphQL)

------

# 2. 🧭 Descripción General del Sistema

SC Platform gestiona el ciclo completo:

```
Carga → Clasificación IA → Versionado → Aprobación → Firma → Vigencia → Vencimiento → Auditoría
```

### Objetivos

- Garantizar compliance documental (ISO + operadoras)
- Reducir carga operativa mediante IA
- Centralizar trazabilidad legal
- Proveer visibilidad estratégica (dashboard + risk scoring)

------

# 3. 🏗️ Arquitectura

## 3.1 Frontend (UI)

- Next.js (App Router)
- React + Tailwind + Radix UI
- Estado: TanStack Query
- Offline parcial: IndexedDB (queue)

## 3.2 Backend / Servicios

- Next.js Server Actions + API Routes
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- Service Layer desacoplado (`lib/services`)

## 3.3 Automatización (Jobs / Eventos)

- `pg_cron` para tareas programadas
- Workflows event-driven
- Webhooks con retry + DLQ

## 3.4 IA (Capa Crítica)

### Provider Orchestration Layer (POL)

- Ruteo dinámico por:
  - costo
  - latencia
  - disponibilidad
- Failover automático entre providers 

### Providers soportados

- OpenRouter (gateway)
- DeepSeek (fallback)
- OpenAI / Anthropic (vía gateway)

------

# 4. 🗄️ Modelo de Datos

## Entidades Core

| Tabla             | Propósito           |
| ----------------- | ------------------- |
| organizations     | multi-tenant        |
| users             | autenticación       |
| documents         | entidad principal   |
| document_versions | versionado          |
| approvals         | flujo de aprobación |
| audit_log         | trazabilidad        |

## IA & Extensiones

| Tabla           | Propósito            |
| --------------- | -------------------- |
| document_chunks | RAG / embeddings     |
| qa_logs         | preguntas/respuestas |
| ai_call_logs    | telemetría IA        |

## Operativo

| Tabla     | Propósito             |
| --------- | --------------------- |
| personnel | personal              |
| vehicles  | flota                 |
| legajos   | agrupación compliance |

## Financiero / Contratos

| Tabla     | Propósito   |
| --------- | ----------- |
| contracts | contratos   |
| invoices  | facturación |

------

# 5. ⚙️ Funcionalidades

## Core

- CRUD documental
- Versionado automático
- Workflow de aprobación (quórum)
- Control de vencimientos
- Búsqueda avanzada

## IA

- Clasificación automática (90% reducción manual) 
- Q&A sobre documentos (RAG)
- Validación de facturas
- Auditoría de contratos

## Compliance

- Legajos por operadora (YPF, PAE, etc.)
- Risk scoring automático
- Alertas proactivas

## Operativo

- Gestión de personal y vehículos
- Dashboard estratégico

------

# 6. 🔄 Flujos del Sistema

## Flujo Documental

1. Carga documento
2. Clasificación IA
3. Generación de versión
4. Flujo de aprobación
5. Firma digital
6. Activación
7. Monitoreo de vencimiento

## Flujo IA (Q&A)

1. Consulta usuario
2. Búsqueda en `document_chunks`
3. Construcción de contexto
4. Llamada a AIClient
5. Respuesta con fuentes 

------

# 7. 🤖 Automatizaciones

## Expiraciones

- Detección automática
- Alertas configurables (30/15/7 días)

## Compliance

- Validación de legajos
- Estado automático por documento

## Alertas

- Push + Email
- Clasificación por prioridad

------

# 8. 📊 Estado de Implementación

| Área                     | Estado            |
| ------------------------ | ----------------- |
| Gestión documental       | ✅ Completo        |
| Versionado               | ✅ Completo        |
| IA (RAG + clasificación) | ✅ Completo        |
| Validación facturas      | 🟡 Parcial         |
| Offline                  | 🟡 Parcial         |
| Reportes exportables     | ❌ Pendiente       |
| Integraciones externas   | ❌ Pendiente       |
| GraphQL                  | ❌ No implementado |

------

# 9. ⚠️ Brechas (Gap Analysis)

## SRS vs Implementación

| Feature            | SRS  | Real    | Estado |
| ------------------ | ---- | ------- | ------ |
| Reportes PDF/Excel | Sí   | No      | ❌      |
| Offline completo   | Sí   | Parcial | ⚠️      |
| GraphQL            | Sí   | No      | ❌      |
| Integraciones SAP  | Sí   | No      | ❌      |

## Técnicas

- Tests insuficientes 
- Errores TypeScript pendientes
- Dependencia de API Keys externas

------

# 10. 🚀 Mejoras Integradas

## IA

- Cliente unificado con fallback automático 
- Logging de llamadas IA
- Health checks `/api/ai/health`

## Base de Datos

- Soporte vectorial (pgvector)
- Nuevas tablas:
  - document_chunks
  - invoices
  - contracts
  - api_keys

## Seguridad

- RLS en todas las tablas
- Gestión de API Keys
- Eliminación de secretos hardcoded (pendiente en algunos casos)

------

# 11. 🛣️ Roadmap Técnico

## Corto Plazo

- Reportes (PDF/Excel/CSV)
- Cobertura de tests
- Corrección errores TypeScript

## Mediano Plazo

- Offline completo (PWA real)
- Integraciones externas (SAP, RRHH)
- Observabilidad (APM)

## Largo Plazo

- IA predictiva (risk forecasting)
- Mobile app nativa
- BI avanzado

------

# 12. ⚠️ Riesgos y Consideraciones

## Técnicos

- Alta complejidad en capa IA
- Dependencia de terceros (OpenRouter, DeepSeek)
- Falta de testing robusto

## Arquitectura

- Necesidad de separar:
  - UI
  - Servicios
  - Automatización

## Compliance

- Manejo de datos sensibles (PII)
- Regulaciones específicas Oil & Gas

| Versión | Fecha | Autor | Cambios |
| :--- | :--- | :--- | :--- |
| 1.0 | 2026-04-15 | Architect | SRS Inicial. |
| 4.0 | 2026-04-28 | Architect | Inclusión de Roadmap IA. |
| 4.2 | 2026-05-03 | Architect | Unificación Maestra. Eliminación de WhatsApp. |
