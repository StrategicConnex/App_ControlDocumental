# SC Platform — Documentación Maestra del Sistema de Gestión Documental (DMS)
## Plataforma de Compliance Documental y Operativo para el Sector Oil & Gas

**Versión:** 4.2 (Maestra)  
**Fecha:** 3 de mayo de 2026  
**Estado:** Producción — Fuente de Verdad Unificada

---

## 1. Resumen Ejecutivo

**SC Platform** es una solución enterprise de gestión documental estratégica diseñada específicamente para empresas del sector **Oil & Gas** y entornos B2B de alta complejidad. La plataforma centraliza la trazabilidad legal, el cumplimiento de normativas ISO y el control operativo de recursos (personal y flota), integrando una capa avanzada de Inteligencia Artificial para la toma de decisiones proactiva.

**Diferenciadores Clave:**
- **Provider Orchestration Layer (POL):** Ruteo dinámico entre múltiples proveedores de IA (Gemini, OpenAI, DeepSeek) con failover automático.
- **Compliance ISO & Operadoras:** Estructuras adaptadas a YPF, PAE, Vista y Chevron.
- **Trazabilidad Inmutable:** Audit logs completos y versionado estricto con quórum de aprobación.
- **Risk Scoring:** Evaluación en tiempo real del riesgo operativo basado en el estado de la documentación.

---

## 2. Descripción General del Sistema

El sistema opera como un SaaS multi-tenant donde cada organización mantiene un aislamiento estricto de sus datos. Permite la gestión integral del ciclo de vida documental, desde la carga y clasificación automática hasta la firma digital y el control de vencimientos.

### Objetivos Principales:
- Garantizar el **100% de cumplimiento** en auditorías externas e internas.
- Reducir el tiempo de gestión documental mediante **automatización con IA**.
- Proporcionar **visibilidad estratégica** sobre el estado de acreditación de recursos.

---

## 3. Arquitectura

El sistema sigue una arquitectura moderna, desacoplada y orientada a la resiliencia.

### 3.1 Frontend (UI)
- **Framework:** Next.js 16 (App Router).
- **Styling:** Tailwind CSS + Framer Motion para micro-animaciones premium.
- **Estado:** TanStack Query para sincronización eficiente con el servidor.
- **Características:** Diseño responsive, modo oscuro/claro, y soporte offline mediante Service Workers e IndexedDB.

### 3.2 Backend / Servicios
- **Infraestructura:** Supabase (BaaS) sobre AWS.
- **Lógica de Servidor:** API Routes en Next.js con validación estricta vía Zod.
- **IA Engine:** `AIClient` unificado que gestiona OpenRouter y DeepSeek directos.
- **Storage:** Supabase Storage con políticas RLS para aislamiento de archivos.

### 3.3 Automatización (Jobs, Eventos, Workflows)
- **Cron Jobs:** `pg_cron` en la base de datos para alertas diarias y reportes programados.
- **Webhooks:** Sistema de cola con reintentos automáticos y Dead Letter Queue.
- **Eventos Realtime:** Notificaciones push instantáneas para cambios de estado críticos.

---

## 4. Modelo de Datos (Esquema Supabase)

El esquema de base de datos está optimizado para trazabilidad y búsqueda vectorial.

| Entidad | Propósito |
| :--- | :--- |
| `organizations` | Definición de tenants y configuración global de empresa. |
| `users` | Perfiles de usuario vinculados a Supabase Auth (RBAC). |
| `documents` | Entidad core con metadatos, categorías y estado calculado. |
| `document_versions` | Almacenamiento inmutable de cada revisión de archivo. |
| `document_chunks` | Fragmentos de texto vectorizados para búsqueda semántica (pgvector). |
| `approvals` | Registro de quórum y firmas para aprobación documental. |
| `legajos` | Agrupadores de documentos por operadora/proyecto. |
| `personnel` / `vehicles` | Gestión de recursos operativos y sus vencimientos. |
| `risk_score_history` | Historial de métricas de riesgo para análisis de tendencia. |
| `audit_log` | Registro inalterable de cada acción en el sistema. |

---

## 5. Módulos Funcionales

### 5.1 Gestión Documental Core
Control total del ciclo de vida: `Carga → Clasificación IA → Revisión → Aprobación → Firma → Vigencia → Vencimiento`. Soporta versionado automático y rollback sin duplicidad de almacenamiento.

### 5.2 IA & RAG (Asistente Inteligente)
Asistente integrado que permite realizar consultas en lenguaje natural sobre el repositorio. Utiliza RAG (Retrieval-Augmented Generation) para extraer respuestas precisas citando fuentes específicas.

### 5.3 Legajos & Compliance (Operadoras)
Módulo especializado para la exportación de legajos según los estándares de **YPF, PAE, Vista y Chevron**. Valida automáticamente que todos los documentos requeridos estén presentes y vigentes.

### 5.4 Acreditación de Personal y Vehículos
Seguimiento de ART, seguros, licencias y habilitaciones técnicas. Incluye un sistema de alertas proactivas que notifica a los responsables antes de que ocurra un incumplimiento.

### 5.5 Presupuestos y Propuestas
Generación de propuestas comerciales en PDF con diseño corporativo, integrando trazabilidad de versiones y estados de aceptación.

### 5.6 Panel de Control (Dashboard)
Visualización ejecutiva de KPIs: Documentos por vencer, estado de flota, cobertura de legajos y scoring de riesgo organizacional.

---

## 6. IA & Automatización (POL, RAG, Clasificación)

La capa de IA es el cerebro operativo del sistema.

- **POL (Provider Orchestration Layer):** Implementado en `lib/ai/ai-client.ts`. Gestiona el ruteo entre OpenRouter y DeepSeek, asegurando que el sistema siempre responda incluso ante caídas de proveedores.
- **Clasificación Automática:** Al subir un archivo, la IA extrae el título, categoría, fecha de vencimiento y metadatos relevantes, reduciendo la carga manual en un 90%.
- **Validación de Facturas:** Compara facturas contra órdenes de compra y contratos, detectando discrepancias mediante análisis semántico.

---

## 7. Seguridad & Trazabilidad

Cumplimiento de estándares enterprise de seguridad.

- **Autenticación:** Supabase Auth con soporte para Multi-Factor Authentication (MFA).
- **Autorización (ABAC/RBAC):** Control de acceso granular basado en atributos y roles.
- **RLS (Row Level Security):** Todas las tablas tienen políticas de aislamiento por `org_id` a nivel de base de datos.
- **Inmutabilidad:** Las versiones de documentos aprobadas no pueden ser modificadas ni eliminadas sin dejar rastro en el log de auditoría.

---

## 8. Flujos de Trabajo (Workflows)

El sistema permite configurar acciones automáticas basadas en eventos:
1. **Trigger:** Documento próximo a vencer (15 días).
2. **Acción:** Notificación Push al gestor + Email al responsable del recurso.
3. **Acción:** Marcado automático en el Legajo como "Pendiente de Actualización".

---

## 9. Requerimientos No Funcionales

- **Rendimiento:** Carga de Dashboard < 2s; Búsqueda semántica < 1s.
- **Disponibilidad:** 99.9% (Arquitectura Cloud-Native).
- **Escalabilidad:** Soporte para miles de documentos y usuarios concurrentes mediante índices GIN y particionamiento.
- **Compliance Legal:** Firmas digitales con Hash SHA-256 y Timestamping.

---

## 10. Roadmap de Evolución

- **Corto Plazo:** Finalización de la integración con SAP para importación de POs.
- **Mediano Plazo:** Aplicación móvil nativa para inspecciones en yacimiento con modo offline total.
- **Largo Plazo:** Análisis predictivo de riesgo basado en tendencias históricas de cumplimiento.

---

## 11. Guía de Instalación y Configuración

### Variables de Envío Clave
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# IA (POL Engine)
OPENROUTER_API_KEY=...
DEEPSEEK_API_KEY=...
AI_MODEL_PREFERRED=deepseek/deepseek-chat

# App
NEXT_PUBLIC_APP_URL=...
```

---

## 12. Criterios de Aceptación (BDD)

- **CA-01:** Cada documento subido debe generar un chunk vectorial y ser consultable por el Asistente IA en < 5s.
- **CA-02:** Un intento de acceso a un documento de otra organización debe resultar en un error 403 y ser registrado en `audit_log`.
- **CA-03:** El quórum de aprobación (mínimo 2 firmas) debe ser validado por el backend antes de marcar un documento como `Aprobado`.

---

## 13. Glosario Técnico

- **POL:** Provider Orchestration Layer.
- **RAG:** Retrieval-Augmented Generation.
- **TENANT:** Instancia aislada de una organización en el sistema.
- **RLS:** Row Level Security.
- **ABAC:** Attribute-Based Access Control.

---

## 14. Anexo: Análisis de Cumplimiento (SRS vs Real)

| Requerimiento Original | Estado Real | Observación |
| :--- | :--- | :--- |
| Notificaciones WhatsApp | **ELIMINADO** | Sustituido por Push + Email por razones de seguridad y costos. |
| Modo Offline | **IMPLEMENTADO** | Vía Service Workers y sincronización diferida. |
| Firma Digital | **IMPLEMENTADO** | Hash SHA-256 con almacenamiento inmutable. |
| IA Multi-proveedor | **IMPLEMENTADO** | Sistema POL funcional con failover. |

---

## 15. Control de Versiones del Documento

| Versión | Fecha | Autor | Cambios |
| :--- | :--- | :--- | :--- |
| 1.0 | 2026-04-15 | Architect | SRS Inicial. |
| 4.0 | 2026-04-28 | Architect | Inclusión de Roadmap IA. |
| 4.2 | 2026-05-03 | Architect | Unificación Maestra. Eliminación de WhatsApp. |
