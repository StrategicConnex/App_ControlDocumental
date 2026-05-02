```
# Especificación de Requerimientos de Software (SRS)
## SC Platform — Plataforma de Compliance Documental y Operativo para Oil & Gas
**Versión:** 3.5  
**Fecha:** 2 de mayo de 2026  
**Estado:** Producción Avanzada con Ecosistema de Riesgo Proactivo


---

## 1. Introducción

### 1.1 Propósito
Este documento describe los requerimientos funcionales y no funcionales de **SC Platform**, una plataforma de **compliance documental y operativo** orientada al sector **Oil & Gas** y empresas B2B. Cubre control de versiones, vencimientos, aprobaciones, legajos de personal, vehículos, presupuestos y un panel de inteligencia centralizado.

### 1.2 Resumen Ejecutivo

**SC Platform** es una plataforma enterprise de gestión documental estratégica diseñada específicamente para empresas del sector Oil & Gas que necesitan:

- **Compliance estricto** con operadoras (YPF, PAE, Vista, Chevron)
- **Trazabilidad legal** completa de documentos, aprobaciones y accesos
- **Control operativo** de personal, vehículos y legajos
- **Automatización** de vencimientos, alertas y validaciones

**Diferenciadores clave:**
1. **Multi-tenant con ABAC:** no solo roles, sino permisos granulares por atributos (categoría, estado, proyecto, operadora).
2. **Risk Scoring automático:** semáforo verde/amarillo/rojo que mide el riesgo operativo de la organización.
3. **Features avanzados out-of-the-box:** OCR con IA, notificaciones push y WhatsApp, modo offline, firma digital.
4. **Arquitectura enterprise-ready:** disaster recovery con RPO < 1h, observabilidad completa, tests de seguridad, CI/CD.

**Stack tecnológico:**
- Frontend: Next.js 16 + React + Tailwind CSS + Framer Motion
- Backend: Next.js App Router + Supabase (PostgreSQL + Realtime + Storage)
- AI Layer: Provider Orchestration Layer (POL) - Ruteo dinámico entre Gemini, OpenAI y DeepSeek.
- Autenticación: Supabase Auth con MFA
- PDF: @react-pdf/renderer
- OCR: Tesseract.js + AI Vision
- Estado: React Query (TanStack Query)
- Tipado: TypeScript (Strict mode con exactOptionalPropertyTypes habilitado)

**Usuarios objetivo:** empresas de servicios para Oil & Gas, contratistas, proveedores de operadoras, empresas B2B que requieren compliance documental estricto.

**Modelo de negocio:** SaaS multi-tenant con pricing por organización. Módulos core incluidos, módulo de Business Intelligence como add-on opcional.

### 1.3 Alcance
SC Platform cubre los siguientes módulos:
1. Gestión Documental General
2. Ingeniería y Documentación Técnica (ISO)
3. Gestión de Legajos para Operadoras
4. Presupuesto Inteligente
5. Acreditación de Personal y Vehículos
6. Panel de Inteligencia Estratégica (Dashboard)
7. **Firma digital avanzada (nuevo)**
8. **Portal de proveedores (nuevo)**
9. **Workflows visuales (nuevo)**
10. **Reportes automáticos (nuevo)**
11. **Calendario de vencimientos (nuevo)**

### 1.4 Tecnologías Base
| Componente | Tecnología |
|---|---|
| Frontend | Aplicación Web (React / Next.js 16) |
| AI Engine | Provider Orchestration Layer (POL) |
| Base de Datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Almacenamiento | Supabase Storage |
| Notificaciones | Realtime Alertas + WhatsApp + Email |

### 1.5 Usuarios del Sistema
- **Administrador:** Control total del sistema.
- **Gestor Documental:** Carga, aprobación y revisión de documentos.
- **Usuario Operador:** Consulta y descarga de documentos autorizados.
- **Cliente B2B:** Acceso a su panel y documentación propia (vista restringida).
- **Auditor:** Acceso de solo lectura para revisiones y trazabilidad.
- **Proveedor:** Auto-gestión de su propia documentación y legajos (nuevo).

---

## 2. Requerimientos Funcionales

### 2.1 Módulo 1 — Gestión Documental General

#### RF-01: Carga de Documentos
- El sistema permite cargar documentos en formatos: PDF, DOCX, XLSX, imágenes.
- Cada documento debe tener: nombre, categoría, responsable, fecha de emisión y fecha de vencimiento.

#### RF-02: Control de Versiones
- Cada vez que se modifica un documento, se genera automáticamente una nueva versión.
- Se conserva el historial completo de versiones anteriores.
- El usuario puede visualizar y restaurar cualquier versión anterior (rollback).

#### RF-03: Flujo de Aprobación
- Los documentos pasan por estados: `Borrador → En Revisión → Aprobado → Vencido / Rechazado`.
- Cada cambio de estado queda registrado con usuario, fecha y comentario.
- Solo usuarios con rol autorizado pueden aprobar documentos.
- **Nuevo:** Se requiere quórum mínimo de 2 aprobadores (configurable).

#### RF-04: Control de Vencimientos
- El sistema detecta automáticamente documentos próximos a vencer.
- Se generan alertas con anticipación configurable (ej.: 30, 15, 7 días antes).
- Los documentos vencidos quedan marcados y no pueden usarse sin renovación.

#### RF-05: Backup y Repositorio
- Todos los documentos se almacenan en Supabase Storage.
- El sistema permite exportar un backup completo por categoría o proyecto.
- Los archivos eliminados pasan a una papelera con retención configurable.

#### RF-06: Búsqueda y Filtros
- Búsqueda por nombre, etiqueta, categoría, fecha, estado y responsable.
- Filtros combinables (ej.: documentos vencidos + categoría ISO).
- **Optimización:** Búsqueda full-text con índices GIN.

### 2.2 Módulo 2 — Ingeniería y Documentación Técnica

#### RF-07: Tipos de Documentos Técnicos
El sistema soporta y clasifica los siguientes tipos:
- Memorias técnicas
- Especificaciones técnicas
- Normas ISO (ISO 9001, ISO 45001, ISO 14001, entre otras)

#### RF-08: Plantillas Normalizadas
- El sistema provee plantillas predefinidas por tipo de documento técnico.
- Las plantillas incluyen campos obligatorios según normativa internacional.

#### RF-09: Trazabilidad Técnica
- Cada documento técnico lleva un registro de quién lo elaboró, revisó y aprobó.
- Se mantiene la cadena de custodia completa del documento.

### 2.3 Módulo 3 — Gestión de Legajos para Operadoras

#### RF-10: Fichas Estructuradas por Operadora
- Soporte para operadoras: **YPF, PAE, Vista, Chevron**.
- Cada operadora puede tener su propio formato de ficha y campos requeridos.
- Las fichas incluyen: datos del proyecto, empresa, certificaciones, aprobaciones y fechas.

#### RF-11: Trazabilidad de Legajos
- Historial de cambios por legajo: qué cambió, quién lo hizo y cuándo.
- Estado del legajo: `En Proceso / Presentado / Aprobado / Observado / Rechazado`.

#### RF-12: Aprobaciones por Operadora
- Flujo de aprobación específico según la operadora.
- Posibilidad de adjuntar acuses de recibo o comunicaciones de la operadora.

### 2.4 Módulo 4 — Presupuesto Inteligente

#### RF-13: Generación de Propuestas Económicas
- El sistema permite crear presupuestos con diseño corporativo.
- Los ítems de pricing son dinámicos: cantidades, precios unitarios y totales calculados automáticamente.

#### RF-14: Exportación de Presupuestos
- Exportación a **PDF** con diseño visual corporativo.
- Versión editable (DOCX o formulario web) para ajustes posteriores.

#### RF-15: Historial de Presupuestos
- Cada presupuesto tiene versiones guardadas.
- Estado: `Borrador / Enviado / Aceptado / Rechazado / Vencido`.

#### RF-16: Métricas de Cierre B2B
- El sistema registra el resultado de cada propuesta para calcular la tasa de conversión.

### 2.5 Módulo 5 — Acreditación de Personal y Vehículos

#### RF-17: Gestión de Personal
- Alta de personal con datos: nombre, DNI, CUIL, cargo, empresa, certificaciones, vencimientos de documentos personales (ART, seguro, libreta sanitaria, etc.).
- Codificación única por persona.

#### RF-18: Gestión de Vehículos / Flota
- Alta de vehículo con: patente, tipo, empresa, seguro, VTV, habilitación, y fechas de vencimiento.
- Estado de homologación para cada yacimiento.

#### RF-19: Revisiones Históricas
- Historial completo de auditorías y revisiones por persona o vehículo.
- Registro de observaciones y resoluciones.

#### RF-20: Alertas de Vencimiento
- Alertas automáticas cuando un documento de personal o vehículo está próximo a vencer.
- Vista de estado general de la flota y del personal acreditado.

### 2.6 Módulo 6 — Panel de Inteligencia Estratégica (Dashboard)

#### RF-21: Vista General (Dashboard Principal)
El panel muestra en tiempo real:
- Vencimientos próximos (AR, Inducciones, Flota)
- Documentación aprobada vs. pendiente
- Estado de homologación general

#### RF-22: Métricas Clave (KPIs)
- Tráfico orgánico (con variación porcentual)
- Leads generados
- ROI de campañas
- Porcentaje de conversión (objetivo vs. alcanzado)

#### RF-23: Alertas y Notificaciones
- Alertas clasificadas por tipo: ⚠ Advertencia / ✓ Confirmación / ℹ Información
- Ejemplo: "Campaña SEM — Presupuesto al 80% del límite mensual"

#### RF-24: Secciones del Panel
| Ícono | Sección |
|---|---|
| ⬡ | Dashboard General |
| 📈 | Analítica |
| 🎯 | Campañas |
| 📄 | Documentos |
| ⚙️ | Estrategia |
| 🔔 | Alertas |
| 📊 | Reportes |
| ⚙ | Configuración |

#### RF-25: Reportes
- Generación de reportes por período (mensual, trimestral, anual).
- Exportación en PDF o Excel.
### 2.7 Módulo 7 — Capa de Orquestación de IA (POL)
La plataforma utiliza un motor de orquestación inteligente para gestionar múltiples modelos de IA (Gemini, GPT-4, DeepSeek) de manera eficiente.

#### RF-26: Ruteo Dinámico (Smart Routing)
- El sistema evalúa latencia, costo y disponibilidad para elegir el mejor proveedor por cada tarea.
- Fallover automático: si un proveedor falla (ej. OpenAI), el sistema reintenta con un secundario (ej. Gemini).

#### RF-27: Telemetría de IA
- Registro de latencia, consumo de tokens y costos por cada llamada.
- Monitoreo de "Health" de proveedores en tiempo real.

#### RF-28: Scoring de Proveedores
- Algoritmo que puntúa proveedores según rendimiento histórico.
- Priorización ajustable (Costo vs. Velocidad vs. Precisión).

### 2.8 Módulo 8 — Asistente de Inteligencia Documental (RAG)

#### RF-29: Motor de Preguntas y Respuestas (Q&A Engine)
- El sistema permite realizar consultas en lenguaje natural sobre el repositorio documental.
- Implementación de RAG (Retrieval-Augmented Generation) para extraer contextos precisos de documentos PDF/DOCX.
- Búsqueda híbrida: combina búsqueda semántica (vectorial) con búsqueda por palabras clave (keyword search) para máxima precisión.

#### RF-30: Monitoreo de Salud de IA (Diagnostics)
- Dashboard de diagnóstico para proveedores de IA: `/api/ai/health`.
- Reporte detallado de errores: captura mensajes técnicos de proveedores (ej. cuotas agotadas, errores de autenticación).
- Failover dinámico: reintento automático con proveedores alternativos en milisegundos.

#### RF-31: Procesamiento de Documentos
- Vectorización automática de documentos al ser cargados o aprobados.
- Soporte para embeddings multilingües (`text-embedding-3-small`).


---

## 3. Requerimientos No Funcionales

### 3.1 Seguridad
- **RNF-01:** Autenticación mediante Supabase Auth (email/contraseña, posibilidad de MFA).
- **RNF-02:** Control de acceso basado en roles (RBAC): cada usuario solo ve lo que le corresponde.
- **RNF-03:** Todas las comunicaciones deben usar HTTPS.
- **RNF-04:** Los archivos en Supabase Storage deben tener políticas de acceso privadas por defecto.
- **RNF-04-B:** Prohibición estricta de Secretos Hardcoded. Todas las API Keys (IA, Supabase, etc) deben gestionarse vía variables de entorno con validación en runtime (Zod).

### 3.2 Rendimiento
- **RNF-05:** El dashboard debe cargar en menos de 3 segundos.
- **RNF-06:** La búsqueda de documentos debe responder en menos de 2 segundos.
- **RNF-07:** Los reportes programados deben generar archivos en menos de 10 segundos.

### 3.3 Usabilidad
- **RNF-08:** La interfaz debe ser responsive (funciona en desktop y tablet).
- **RNF-09:** El sistema debe ser usable por personas sin conocimientos técnicos avanzados.

### 3.4 Disponibilidad
- **RNF-10:** Disponibilidad mínima del 99% mensual.
- **RNF-11:** Backup automático diario de la base de datos vía Supabase.

### 3.5 Escalabilidad
- **RNF-12:** La arquitectura debe permitir incorporar nuevos módulos sin rediseño.
- **RNF-13:** Soporte multicliente (multi-tenant): cada empresa ve solo sus datos.

### 3.6 Nuevos RNF (Features)
- **RNF-29:** El sistema debe soportar modo offline mediante Service Worker e IndexedDB para operar en zonas sin conectividad (yacimientos remotos).
- **RNF-30:** La firma digital de documentos debe ser legalmente vinculante, utilizando hash SHA-256 y timestamping.
- **RNF-31:** Los reportes programados deben ejecutarse automáticamente según expresión cron y enviarse por email en formato PDF/Excel/CSV.
- **RNF-32:** Los webhooks deben tener reintentos automáticos (hasta 5 veces) y dead letter queue para eventos fallidos.

---

## 4. Modelo de Base de Datos (Supabase) — Entidades Principales

| Tabla | Descripción |
|---|---|
| `users` | Usuarios del sistema (gestionado por Supabase Auth) |
| `organizations` | Empresas / clientes del sistema |
| `documents` | Documentos con metadata (categoría, estado, fechas) |
| `document_versions` | Versiones históricas de cada documento |
| `approvals` | Registro de aprobaciones por documento y versión |
| `legajos` | Legajos por operadora |
| `personnel` | Personal acreditado |
| `vehicles` | Vehículos / flota |
| `budgets` | Presupuestos / propuestas económicas |
| `alerts` | Alertas del sistema |
| `audit_log` | Registro de auditoría de todas las acciones |
| **`digital_signatures`** | Firmas digitales (nueva) |
| **`workflows`** | Workflows configurables (nueva) |
| **`scheduled_reports`** | Reportes automáticos (nueva) |
| **`webhook_queue`** | Cola de webhooks con reintentos (nueva) |
| **`document_templates`** | Plantillas de documentos (nueva) |Analizar todo el codigo
| **`abac_policies`** | Políticas ABAC (nueva) |
| **`risk_score_history`** | Historial de riesgo (nueva) |

---

## 5. Flujos Principales

### 5.1 Flujo de un Documento con Firma Digital
```

Carga → Borrador → En Revisión → Aprobado (quórum) → Firmado Digitalmente → Vigente → Vencido

text

```
### 5.2 Flujo de Acreditación de Proveedor
```

Registro proveedor → Pendiente aprobación → Admin aprueba → Sube documentación → Acreditado

text

```
### 5.3 Flujo de Workflow Automático
```

Evento (ej. documento vencido) → Trigger → Ejecución de acciones (email, webhook, tarea)

text

```
---

## 6. Criterios de Aceptación (Estilo BDD)

**CA-01 — Versionado automático**
> **Dado** un documento en estado `aprobado`
> **Cuando** un usuario autorizado lo edita y guarda
> **Entonces** se crea una nueva versión numerada y la versión anterior queda inmutable en el historial

**CA-02 — Control de concurrencia**
> **Dado** que el usuario A está editando un documento
> **Cuando** el usuario B intenta editarlo simultáneamente
> **Entonces** el sistema bloquea el acceso de B y muestra quién tiene el documento en edición

**CA-03 — Alerta de vencimiento**
> **Dado** un documento con fecha de vencimiento a 15 días
> **Cuando** el sistema ejecuta su verificación diaria
> **Entonces** se genera una alerta visible en el dashboard y se envía notificación al responsable

**CA-04 — Validación de legajo**
> **Dado** un legajo con un documento asociado vencido
> **Cuando** el usuario intenta cambiar el estado a `presentado`
> **Entonces** el sistema rechaza la acción y muestra qué documentos impiden la presentación

**CA-05 — Aislamiento multi-tenant**
> **Dado** un usuario autenticado de la organización A
> **Cuando** intenta acceder a documentos de la organización B (modificando la URL o la API)
> **Entonces** el sistema retorna error 403 y registra el intento en el audit log

**CA-06 — Restauración de versión**
> **Dado** un documento con 3 versiones históricas
> **Cuando** el usuario selecciona restaurar la versión 1
> **Entonces** se crea una nueva versión (v4) que referencia el mismo storage_path de v1, sin duplicar el archivo

**CA-07 — Bloqueo de documento vencido**
> **Dado** un documento en estado `vencido`
> **Cuando** un usuario operador intenta utilizarlo en un legajo
> **Entonces** el sistema bloquea la acción e indica que el documento requiere renovación

**CA-08 — Firma digital**
> **Dado** un documento en estado `aprobado`
> **Cuando** un usuario autorizado lo firma digitalmente con su certificado
> **Entonces** se guarda el hash de la firma, la IP, timestamp y queda con validez legal.

**CA-09 — Modo offline**
> **Dado** un usuario sin conexión a internet
> **Cuando** realiza una operación (ej. cargar documento)
> **Entonces** la operación se guarda en IndexedDB y se sincroniza automáticamente al recuperar la conexión.

**CA-10 — Workflow visual**
> **Dado** un administrador configura un workflow con trigger "documento vencido" y acción "enviar email"
> **Cuando** un documento vence
> **Entonces** el sistema ejecuta el workflow y envía el email.

---

## 7. Modelo de Base de Datos Detallado (PostgreSQL)

### 7.1 Tabla: `organizations`
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rut TEXT UNIQUE NOT NULL,
  sector TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.2 Tabla: `users`

sql

```
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','gestor','operador','auditor','cliente','proveedor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.3 Tabla: `documents` (optimizada)

sql

```
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  created_by UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  expiry_date DATE,
  required_approvals INT NOT NULL DEFAULT 2,
  approval_quorum_met BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  locked_by UUID REFERENCES users(id),
  locked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_org ON documents(org_id);
CREATE INDEX idx_documents_expiry ON documents(expiry_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_search_gin ON documents USING GIN (to_tsvector('spanish', title || ' ' || COALESCE(description, '')));
```

### 7.4 Vista `documents_with_status` (reemplaza columna status)

sql

```
CREATE VIEW documents_with_status AS
SELECT 
  d.*,
  CASE
    WHEN d.deleted_at IS NOT NULL THEN 'eliminado'
    WHEN NOW() > d.expiry_date AND EXISTS (SELECT 1 FROM approvals a WHERE a.document_id = d.id AND a.status = 'aprobado') THEN 'vencido'
    WHEN NOT EXISTS (SELECT 1 FROM approvals a WHERE a.document_id = d.id AND a.status = 'aprobado') 
         AND EXISTS (SELECT 1 FROM document_versions dv WHERE dv.document_id = d.id) THEN 'en_revision'
    WHEN NOT EXISTS (SELECT 1 FROM document_versions dv WHERE dv.document_id = d.id) THEN 'borrador'
    ELSE 'aprobado'
  END AS calculated_status,
  CASE
    WHEN NOW() > d.expiry_date THEN 'vencido'
    WHEN NOW() + INTERVAL '30 days' > d.expiry_date THEN 'por_vencer'
    ELSE 'vigente'
  END AS expiry_status
FROM documents d;
```

### 7.5 Tabla: `document_versions` (con deduplicación)

sql

```
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  version_number INT NOT NULL,
  storage_path TEXT NOT NULL,
  content_hash TEXT,
  change_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_document_versions_content_hash 
ON document_versions (content_hash) 
WHERE content_hash IS NOT NULL;
```

### 7.6 Tabla: `approvals`

sql

```
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  version_id UUID NOT NULL REFERENCES document_versions(id),
  approved_by UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL CHECK (status IN ('aprobado','rechazado','en_revision')),
  comment TEXT,
  approved_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.7 Tabla: `digital_signatures`

sql

```
CREATE TABLE digital_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id),
  version_id UUID NOT NULL REFERENCES document_versions(id),
  signer_id UUID NOT NULL REFERENCES users(id),
  signer_certificate_hash TEXT NOT NULL,
  signature_hash TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET NOT NULL,
  user_agent TEXT,
  validation_timestamp TIMESTAMPTZ,
  validation_provider TEXT CHECK (validation_provider IN ('Afip', 'DocuSign', 'Propio', 'None')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_documents_final_signature 
ON digital_signatures (document_id) 
WHERE validation_timestamp IS NOT NULL;
```

### 7.8 Tabla: `workflows`

sql

```
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  trigger_filters JSONB,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.9 Tabla: `scheduled_reports`

sql

```
CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'excel', 'csv')),
  filters JSONB NOT NULL,
  recipients JSONB NOT NULL,
  last_sent_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.10 Tabla: `webhook_queue`

sql

```
CREATE TABLE webhook_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  target_url TEXT NOT NULL,
  retries INT DEFAULT 0,
  max_retries INT DEFAULT 5,
  last_attempt_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'dead')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_queue_pending ON webhook_queue(status, next_retry_at) WHERE status = 'pending';
```

### 7.11 Tabla: `risk_score_history`

sql

```
CREATE TABLE risk_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  docs_score INT NOT NULL CHECK (docs_score BETWEEN 0 AND 40),
  legajos_score INT NOT NULL CHECK (legajos_score BETWEEN 0 AND 35),
  personal_score INT NOT NULL CHECK (personal_score BETWEEN 0 AND 25),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_history_org_date ON risk_score_history(org_id, recorded_at DESC);
```

*(El resto de tablas: personnel, vehicles, budgets, alerts, audit_log, abac_policies, document_templates se mantienen según el diseño original con las optimizaciones de índices y soft delete)*

------

## 8. Funciones y Triggers Clave

### 8.1 Función de rollback sin duplicación

sql

```
CREATE OR REPLACE FUNCTION restore_document_version(
  p_document_id UUID,
  p_target_version INT
)
RETURNS UUID AS $$
DECLARE
  v_source_path TEXT;
  v_source_hash TEXT;
  v_new_version INT;
  v_new_id UUID;
BEGIN
  SELECT storage_path, content_hash INTO v_source_path, v_source_hash
  FROM document_versions
  WHERE document_id = p_document_id AND version_number = p_target_version;
  
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_new_version
  FROM document_versions
  WHERE document_id = p_document_id;
  
  INSERT INTO document_versions (
    id, document_id, uploaded_by, version_number, 
    storage_path, content_hash, change_note, created_at
  )
  SELECT 
    gen_random_uuid(), p_document_id, uploaded_by, v_new_version,
    v_source_path, v_source_hash, 
    format('Rollback a versión %s', p_target_version),
    NOW()
  FROM document_versions
  WHERE document_id = p_document_id AND version_number = p_target_version
  RETURNING id INTO v_new_id;
  
  UPDATE documents 
  SET updated_at = NOW()
  WHERE id = p_document_id;
  
  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 8.2 Función de alertas optimizada (solo notificaciones)

sql

```
CREATE OR REPLACE FUNCTION generate_expiry_alerts_optimized()
RETURNS void AS $$
BEGIN
  INSERT INTO alerts (id, org_id, user_id, alert_type, message, status, triggered_at)
  SELECT 
    gen_random_uuid(),
    d.org_id,
    d.created_by,
    'vencimiento',
    format('Documento %s vence en %s días', d.title, EXTRACT(DAY FROM (d.expiry_date - NOW()))),
    'nueva',
    NOW()
  FROM documents d
  WHERE d.expiry_date IS NOT NULL
    AND d.deleted_at IS NULL
    AND EXTRACT(DAY FROM (d.expiry_date - NOW())) IN (30, 15, 7)
    AND NOT EXISTS (
      SELECT 1 FROM alerts a 
      WHERE a.record_id = d.id::text 
        AND a.alert_type = 'vencimiento'
        AND a.triggered_at > NOW() - INTERVAL '1 day'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 8.3 Función de webhook queue processor

sql

```
CREATE OR REPLACE FUNCTION process_webhook_queue()
RETURNS void AS $$
DECLARE
  webhook RECORD;
BEGIN
  FOR webhook IN SELECT * FROM webhook_queue WHERE status = 'pending' AND (next_retry_at IS NULL OR next_retry_at <= NOW()) LIMIT 100 LOOP
    BEGIN
      PERFORM http_post(webhook.target_url, webhook.payload);
      UPDATE webhook_queue SET status = 'success', last_attempt_at = NOW() WHERE id = webhook.id;
    EXCEPTION WHEN OTHERS THEN
      UPDATE webhook_queue SET 
        retries = retries + 1,
        last_attempt_at = NOW(),
        next_retry_at = NOW() + ((2 ^ retries) || ' minutes')::INTERVAL,
        error_message = SQLERRM,
        status = CASE WHEN retries + 1 >= max_retries THEN 'dead' ELSE 'pending' END
      WHERE id = webhook.id;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 8.4 Función de risk score diario

sql

```
CREATE OR REPLACE FUNCTION record_daily_risk_scores()
RETURNS void AS $$
BEGIN
  INSERT INTO risk_score_history (org_id, score, docs_score, legajos_score, personal_score)
  SELECT 
    o.id,
    ROUND(
      COALESCE(docs.porc_vencidos, 0) * 0.4 +
      COALESCE(leg.porc_incompletos, 0) * 0.35 +
      COALESCE(per.porc_no_acreditado, 0) * 0.25
    )::INTEGER,
    ROUND(COALESCE(docs.porc_vencidos, 0) * 0.4)::INTEGER,
    ROUND(COALESCE(leg.porc_incompletos, 0) * 0.35)::INTEGER,
    ROUND(COALESCE(per.porc_no_acreditado, 0) * 0.25)::INTEGER
  FROM organizations o
  LEFT JOIN LATERAL (
    SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE COUNT(CASE WHEN dv.calculated_status = 'vencido' THEN 1 END)::NUMERIC / COUNT(*) * 100
      END AS porc_vencidos
    FROM documents_with_status dv
    WHERE dv.org_id = o.id AND dv.deleted_at IS NULL
  ) docs ON true
  LEFT JOIN LATERAL (
    SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE COUNT(CASE WHEN l.status IN ('en_proceso', 'observado') THEN 1 END)::NUMERIC / COUNT(*) * 100
      END AS porc_incompletos
    FROM legajos l
    WHERE l.org_id = o.id
  ) leg ON true
  LEFT JOIN LATERAL (
    SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE COUNT(CASE WHEN p.status != 'activo' THEN 1 END)::NUMERIC / COUNT(*) * 100
      END AS porc_no_acreditado
    FROM personnel p
    WHERE p.org_id = o.id AND p.deleted_at IS NULL
  ) per ON true;
END;
$$ LANGUAGE plpgsql;
```

### 8.5 Programación de cron jobs

sql

```
SELECT cron.schedule('generate-expiry-alerts', '0 7 * * *', 'SELECT generate_expiry_alerts_optimized()');
SELECT cron.schedule('process-webhook-queue', '*/1 * * * *', 'SELECT process_webhook_queue()');
SELECT cron.schedule('record-daily-risk-scores', '0 8 * * *', 'SELECT record_daily_risk_scores()');
```

------

## 9. Seguridad y Políticas RLS

### 9.1 Función auxiliar

sql

```
CREATE OR REPLACE FUNCTION auth_org_id() RETURNS UUID AS $$
  SELECT org_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION auth_role() RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql STABLE;
```

### 9.2 Políticas base

sql

```
-- Política genérica para SELECT en todas las tablas
CREATE POLICY "Users can view own org data" ON documents
  FOR SELECT USING (org_id = auth_org_id());

-- Política para INSERT/UPDATE según rol
CREATE POLICY "Admins and gestores can modify documents" ON documents
  FOR INSERT WITH CHECK (auth_role() IN ('admin', 'gestor'));

-- Política específica para proveedores
CREATE POLICY "Proveedores ven sus legajos" ON legajos
  FOR SELECT USING (auth_role() = 'proveedor' AND created_by = auth.uid());

-- Política para audit_log (inmutable)
CREATE POLICY "Only auditors and admins view audit_log" ON audit_log
  FOR SELECT USING (auth_role() IN ('admin', 'auditor'));
-- No se permiten UPDATE ni DELETE en audit_log
```

------

## 10. Arquitectura del Sistema (Actualizada)

text

```
┌─────────────────────────────────────────┐
│              CLIENTE (Browser)          │
│         React / Next.js (SSR)           │
│    + Service Worker (modo offline)      │
└────────────────┬────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────┐
│            API LAYER (REST + GraphQL)   │
│   Endpoints REST + /api/graphql         │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│          SERVICE LAYER                  │
│  Lógica de negocio / Workflows / Sign   │
└──────┬─────────────────┬────────────────┘
       │                 │
┌──────▼──────┐   ┌──────▼──────────────┐
│ DATA LAYER  │   │   STORAGE LAYER     │
│  Supabase   │   │  Supabase Storage   │
│  PostgreSQL │   │  + CDN + Screenshots│
└──────┬──────┘   └─────────────────────┘
       │
┌──────▼────────────────────────────────┐
│         EVENT BUS + QUEUE             │
│  Vencimientos / Webhook Queue / Alerts│
└───────────────────────────────────────┘
```

------

## 11. Estructura de Carpetas del Proyecto (Next.js 14)

text

```
sc-platform/
├── app/
│   ├── (auth)/login, register, register-proveedor
│   ├── (dashboard)/
│   │   ├── page.tsx (dashboard)
│   │   ├── documents/
│   │   ├── legajos/
│   │   ├── personnel/
│   │   ├── vehicles/
│   │   ├── budgets/
│   │   ├── alerts/
│   │   ├── calendar/            (nuevo)
│   │   ├── proveedor/           (nuevo)
│   │   ├── risk/                (nuevo)
│   │   ├── settings/reports     (nuevo)
│   │   └── templates/           (nuevo)
│   ├── api/
│   │   ├── documents/
│   │   ├── graphql/route.ts     (nuevo)
│   │   ├── ai/process-document  (nuevo)
│   │   └── webhooks/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── documents/
│   │   ├── DocumentTable.tsx
│   │   ├── SignatureModal.tsx   (nuevo)
│   │   └── AdvancedOCRUploader.tsx (nuevo)
│   ├── workflows/
│   │   └── WorkflowEditor.tsx   (nuevo)
│   ├── calendar/
│   │   └── ExpiryCalendar.tsx   (nuevo)
│   ├── dashboard/
│   │   └── RiskScoreDashboard.tsx (nuevo)
│   └── layout/
├── lib/
│   ├── supabase/
│   ├── services/
│   │   ├── documents.ts
│   │   ├── digitalSignature.ts  (nuevo)
│   │   ├── workflowExecutor.ts  (nuevo)
│   │   └── ...
│   ├── sync/
│   │   └── offline-sync.ts      (nuevo)
│   ├── reports/
│   │   └── reportGenerator.ts   (nuevo)
│   ├── notifications/
│   │   └── whatsapp.ts          (nuevo)
│   ├── templates/
│   │   └── document-generator.ts (nuevo)
│   ├── ai/
│   │   ├── pol-engine.ts        (nuevo - motor de orquestación)
│   │   ├── pol-configs.ts       (nuevo - configuración de proveedores)
│   │   └── ...
│   ├── utils/
├── hooks/
│   ├── useOfflineSync.ts        (nuevo)
│   └── ...
├── public/
│   ├── sw.js                    (nuevo)
│   └── offline.html
├── supabase/
│   ├── migrations/
│   │   ├── 001_init_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_functions.sql
│   │   ├── 004_seed.sql
│   │   └── 005_risk_score_history.sql (nuevo)
│   └── config.toml
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

------

## 12. Componentes React Principales para Nuevas Features

### 12.1 SignatureModal

tsx

```
'use client';
import { useState } from 'react';
import { Modal, Button, Alert } from '@/components/ui';
import { signDocument } from '@/lib/services/digitalSignature';

export function SignatureModal({ documentId, versionId, onSigned, onClose }) {
  const [certificate, setCertificate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSign = async () => {
    setLoading(true);
    try {
      await signDocument(documentId, versionId, certificate);
      onSigned();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Firma Digital" onClose={onClose}>
      <textarea className="w-full border p-2" rows={4} value={certificate} onChange={e => setCertificate(e.target.value)} placeholder="Certificado PEM..." />
      {error && <Alert type="danger">{error}</Alert>}
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleSign} disabled={loading || !certificate}>Firmar</Button>
      </div>
    </Modal>
  );
}
```

### 12.2 WorkflowEditor (React Flow)

tsx

```
'use client';
import ReactFlow, { addEdge, Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui';

export function WorkflowEditor({ workflow, onSave }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

  const handleSave = () => {
    const actions = nodes.filter(n => n.type === 'action').map(n => n.data);
    onSave({ trigger_event: workflow.trigger, actions });
  };

  return (
    <div style={{ height: '70vh' }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}>
        <Background />
        <Controls />
      </ReactFlow>
      <Button onClick={handleSave}>Guardar Workflow</Button>
    </div>
  );
}
```

### 12.3 ExpiryCalendar

tsx

```
'use client';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export function ExpiryCalendar({ events }) {
  const calendarEvents = events.map(ev => ({
    title: `${ev.title} (${ev.type})`,
    start: new Date(ev.expiry_date),
    end: new Date(ev.expiry_date),
    allDay: true,
    color: ev.days_left <= 7 ? 'red' : ev.days_left <= 30 ? 'orange' : 'green'
  }));
  return <Calendar localizer={localizer} events={calendarEvents} startAccessor="start" endAccessor="end" style={{ height: 600 }} />;
}
```

### 12.4 Offline Sync Hook

ts

```
import { useEffect } from 'react';
import { syncPendingOperations } from '@/lib/sync/offline-sync';

export function useOfflineSync() {
  useEffect(() => {
    window.addEventListener('online', syncPendingOperations);
    if (navigator.onLine) syncPendingOperations();
    return () => window.removeEventListener('online', syncPendingOperations);
  }, []);
}
```

------

## 13. Servicios y Utilidades (Nuevos)

### 13.1 Digital Signature Service

ts

```
import { createHash } from 'crypto';
import { supabaseServer } from '@/lib/supabase/server';

export async function signDocument(documentId: string, versionId: string, certificate: string) {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  const ip = await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip);
  
  const { data: version } = await supabase.from('document_versions').select('storage_path').eq('id', versionId).single();
  const { data: fileData } = await supabase.storage.from('documents').download(version.storage_path);
  const buffer = await fileData.arrayBuffer();
  const fileHash = createHash('sha256').update(Buffer.from(buffer)).digest('hex');
  const signatureHash = createHash('sha256').update(fileHash + certificate).digest('hex');
  
  const { data, error } = await supabase.from('digital_signatures').insert({
    document_id: documentId, version_id: versionId, signer_id: user!.id,
    signer_certificate_hash: createHash('sha256').update(certificate).digest('hex'),
    signature_hash: signatureHash, ip_address: ip, user_agent: navigator.userAgent,
    validation_provider: 'Propio', validation_timestamp: new Date().toISOString()
  }).select().single();
  if (error) throw new Error(error.message);
  return data;
}
```

### 13.2 WhatsApp Service

ts

```
import { Messages } from '@whatsapp-business/messages';

const whatsapp = new Messages(process.env.WHATSAPP_TOKEN, process.env.WHATSAPP_PHONE_ID);

export async function sendWhatsAppMessage(to: string, template: string, variables: Record<string, string>) {
  await whatsapp.sendTemplate({
    to, template,
    components: [{ type: 'body', parameters: Object.entries(variables).map(([k, v]) => ({ type: 'text', text: v })) }]
  });
}
```

### 13.3 Report Generator (CSV/Excel/PDF)

ts

```
import { Parser } from '@json2csv/plainjs';
import ExcelJS from 'exceljs';
import { generatePDFReport } from './pdfReport';

export async function generateReport(orgId: string, filters: any, format: 'pdf' | 'excel' | 'csv') {
  const supabase = await supabaseServer();
  let query = supabase.from('documents').select('*').eq('org_id', orgId);
  if (filters.status) query = query.eq('status', filters.status);
  const { data } = await query;
  
  if (format === 'csv') {
    const parser = new Parser({ fields: ['id', 'title', 'status', 'expiry_date'] });
    return parser.parse(data);
  } else if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reporte');
    sheet.addRows(data);
    return await workbook.xlsx.writeBuffer();
  } else {
    return await generatePDFReport(data);
  }
}
```

------

## 14. Roadmap de Implementación de Features

| Fase         | Meses | Features                                                     |
| :----------- | :---- | :----------------------------------------------------------- |
| Fase 1 (MVP) | 1-3   | Gestión documental, legajos básicos, control vencimientos, portal proveedores |
| Fase 2       | 4-6   | Firma digital, reportes automáticos, acreditación personal/vehículos, presupuestos |
| Fase 3       | 7-9   | Workflow visual, OCR avanzado, WhatsApp, GraphQL, modo offline |
| Fase 4       | 10-12 | Integraciones SAP/RRHH, webhook retry, screenshot auditoría, generación plantillas |

------

## 15. Estado Final del Proyecto — Inventario Completo

| Tipo                                   | Cantidad                    |
| :------------------------------------- | :-------------------------- |
| Tablas en base de datos                | 22                          |
| Vistas                                 | 1 (`documents_with_status`) |
| Funciones SQL                          | 13                          |
| Triggers                               | 3                           |
| Cron jobs                              | 5                           |
| Componentes React                      | 35                          |
| Páginas Next.js                        | 20                          |
| Servicios/Utilidades                   | 25                          |
| Motores de Orquestación (POL)         | 1                           |
| Tests (unit + integration + RLS + E2E) | ~75                         |
| Pipelines CI/CD                        | 3 workflows                 |

------

## 16. Inteligencia de Orquestación de IA (POL)

### 16.1 Arquitectura del Engine
El sistema utiliza un **Provider Orchestration Layer (POL)** diseñado para garantizar la máxima resiliencia y eficiencia de costos en el procesamiento de documentos mediante IA.

- **Algoritmo de Scoring Dinámico:** Evalúa proveedores en tiempo real basándose en:
    - **Latencia (30%):** Tiempo de respuesta normalizado.
    - **Costo (70%):** Eficiencia por token (priorizando modelos como Google Gemini).
- **Penalización Exponencial de Errores:** Se aplica un factor de castigo `Math.pow(1 + errorRate, 5)` ante fallos técnicos o rate limits, desplazando automáticamente al proveedor inestable al final de la cola de failover.

### 16.2 Estrategia de Ruteo
| Proveedor | Modelo | Rol | Razón de Selección |
|---|---|---|---|
| **Google Gemini** | `gemini-3-flash` | Primario | Líder de Costos y Ventana de Contexto |
| **DeepSeek** | `deepseek-chat` | Backup | Equilibrio Performance/Costo |
| **OpenRouter** | Multi-model | Failover Final | Acceso a modelos GPT-4/Claude como última instancia |

### 16.3 Observabilidad y Control (AI Ops Center)
El dashboard integra un panel de **Live Ranking** que expone:
- **Routing Reason:** Justificación lógica de por qué un proveedor está en su posición actual.
- **Score Breakdown:** Desglose visual del puntaje (Salud, Latencia, Economía).
- **Telemetría en Vivo:** Integración con `ai_call_logs` para monitoreo de errores en tiempo real.

------

## 18. Ecosistema de Compliance y Gestión de Riesgo (V3)

### 18.1 Centro de Inteligencia de Riesgo
Se ha implementado un motor analítico que transforma los datos estáticos en indicadores de riesgo operativo.
- **Matriz de Cumplimiento (Heatmap):** Visualización pivotada de proveedores vs requerimientos con estados de color dinámicos.
- **Scoring Algorítmico:** Evaluación de 0 a 100 puntos basada en penalizaciones por documentos faltantes (-25), vencidos (-20), rechazados (-10) o pendientes (-5).
- **Categorización de Riesgo:** Clasificación automática en niveles Crítico, Medio y Bajo para priorización administrativa.

### 18.2 Analítica de Evolución e IA
- **Snapshots Históricos:** Captura diaria de métricas de salud en la tabla `vendor_risk_snapshots` para análisis de tendencias.
- **Evolución Temporal:** Gráficas de área con gradientes de riesgo para monitorear la mejora o degradación del cumplimiento de la flota.
- **Recomendaciones IA (Context-Aware):** Motor de reglas que analiza categoría e industria del proveedor para sugerir requisitos documentales preventivos (ej: Seguros de Carga, Planes de Higiene).

### 18.3 Automatización de Seguridad (Gatekeeper)
- **Bloqueo Preventivo:** Sincronización en tiempo real entre el estado de cumplimiento y el acceso físico/operativo. Los proveedores en "Riesgo Crítico" son bloqueados automáticamente en el sistema de accesos.
- **Notificaciones "Nudge":** Sistema de recordatorios recurrentes cada 48 horas para proveedores con deudas documentales activas.
- **Reportes Ejecutivos:** Generación automática de resúmenes semanales para gerencia con KPIs de salud general y alerta de proveedores críticos.

---

## 19. Conclusión

El presente SRS incorpora todas las correcciones de optimización y el nuevo Ecosistema de Riesgo V3, posicionando a SC Platform como el estándar de compliance documental para Oil & Gas.

---

*Documento actualizado para SC Platform — Versión 3.5 — 2 de mayo de 2026*
