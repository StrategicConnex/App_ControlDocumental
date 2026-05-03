# 🗄️ Documentación Maestra de Base de Datos - Strategic Connex

**Versión:** 2.5 (Enterprise Premium)  
**Estado:** Production-Ready  
**Arquitecto:** Principal Systems Architect (AI)

---

## 🧱 1. Resumen Ejecutivo
La base de datos de Strategic Connex está diseñada bajo un paradigma **Multi-tenant** estricto, utilizando PostgreSQL (Supabase) como motor principal. El sistema integra capacidades avanzadas de **Búsqueda Semántica (RAG)** mediante `pgvector`, trazabilidad inmutable de auditoría y una capa de seguridad basada en **Row Level Security (RLS)** que garantiza el aislamiento total de datos entre organizaciones.

## 🏗️ 2. Arquitectura de Datos
*   **Aislamiento:** Filtrado por `org_id` en todas las entidades críticas.
*   **Integridad Documental:** Sistema de versionado con hashes SHA-256 y firmas digitales.
*   **Inteligencia:** Capa RAG con embeddings de 1536 dimensiones para auditoría asistida por IA.
*   **Extensibilidad:** Uso intensivo de `JSONB` para metadata dinámica según el tipo de documento.

## 📊 3. Modelo de Datos (ERD)

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ PROFILES : "contains"
    ORGANIZATIONS ||--o{ DOCUMENTS : "owns"
    ORGANIZATIONS ||--o{ PERSONNEL : "manages"
    ORGANIZATIONS ||--o{ VEHICLES : "manages"
    
    PROFILES ||--o{ DOCUMENTS : "creates"
    PROFILES ||--o{ APPROVALS : "signs"
    
    DOCUMENTS ||--|{ DOCUMENT_VERSIONS : "has"
    DOCUMENT_VERSIONS ||--o{ DOCUMENT_CHUNKS : "vectorized_into"
    
    DOCUMENTS ||--o{ PERSONNEL_DOCS : "linked_to"
    PERSONNEL ||--o{ PERSONNEL_DOCS : "associated_with"
    
    DOCUMENTS ||--o{ VEHICLE_DOCS : "linked_to"
    VEHICLES ||--o{ VEHICLE_DOCS : "associated_with"
```

---

## 📖 4. Diccionario de Datos

### 4.1. Core: Gestión de Identidad y Tenants
| Tabla | Descripción | Campos Clave |
| :--- | :--- | :--- |
| `organizations` | Tenants del sistema (Empresas/Proveedores). | `id`, `slug`, `is_vendor`, `parent_org_id` |
| `profiles` | Usuarios vinculados a Auth y Orgs. | `id` (FK Auth), `role`, `permissions` |

### 4.2. DMS: Gestión Documental
| Tabla | Descripción | Campos Clave |
| :--- | :--- | :--- |
| `documents` | Entidad principal de documentos. | `org_id`, `status`, `expiry_date`, `current_version` |
| `document_versions` | Histórico inmutable de archivos. | `document_id`, `file_url`, `version_number` |
| `document_types` | Configuración de tipos de documentos. | `name`, `required_metadata` |

### 4.3. Operaciones: Activos y Personal
| Tabla | Descripción | Campos Clave |
| :--- | :--- | :--- |
| `personnel` | Registro de empleados/contratistas. | `cuil`, `status`, `org_id` |
| `vehicles` | Flota vehicular vinculada. | `license_plate`, `status` |
| `personnel_docs` | Relación Personal ↔ Documento. | `expiry_date`, `status` |

### 4.4. Inteligencia, Auditoría y Telemetría
| Tabla | Descripción | Campos Clave |
| :--- | :--- | :--- |
| `document_chunks` | Fragmentos para búsqueda vectorial. | `embedding (vector)`, `content` |
| `digital_signatures` | Evidencia legal de aprobaciones. | `signature_hash`, `validation_provider` |
| `audit_logs` | Registro inmutable de eventos. | `action`, `entity_type`, `old_data`, `new_data` |
| `ai_call_logs` | Telemetría de la capa POL. | `provider`, `model`, `tokens`, `duration_ms` |
| `api_keys` | Gestión de llaves externas. | `key_hint`, `encrypted_key`, `expires_at` |
| `contracts` | Seguimiento de contratos comerciales. | `vendor_id`, `start_date`, `value_amount` |
| `notifications` | Sistema de alertas para usuarios. | `type`, `is_read`, `link` |
| `qa_logs` | Historial del motor de Q&A. | `question`, `answer`, `feedback_score` |
| `risk_score_history` | Evolución de riesgo por activo. | `entity_type`, `score`, `reason` |

---

## 🔐 5. Seguridad y Compliance
### 5.1. Row Level Security (RLS)
Todas las tablas críticas implementan políticas de acceso basadas en el contexto del usuario:
```sql
-- Ejemplo de política maestra
CREATE POLICY "Aislamiento por org_id" ON documents
FOR ALL USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));
```

### 5.2. Clasificación de Datos (PII)
*   **Sensible:** `profiles.email`, `personnel.cuil`.
*   **Crítico:** `digital_signatures.signer_certificate_hash`.
*   **Público:** `organizations.slug`, `organizations.name`.

---

## ⚙️ 6. Automatizaciones y Performance
### 6.1. Triggers Críticos
*   **`handle_updated_at`**: Actualización automática de timestamps.
*   **`audit_trigger`**: Captura de cambios de estado en `documents` hacia `audit_logs`.

### 6.2. Funciones de Servidor (RPC)
*   `restore_document_version`: Reversión segura de archivos manteniendo integridad.
*   `match_document_chunks`: Búsqueda de similitud de coseno para RAG.

### 6.3. Índices de Performance
*   `idx_documents_org_status`: B-tree para filtrado rápido en dashboards.
*   `idx_chunks_embedding`: Indexación **IVFFlat** o **HNSW** para búsquedas vectoriales de milisegundos.

---

## 🚀 7. Estrategia de Mantenimiento
*   **Backups:** Snapshots diarios vía Supabase.
*   **Migrations:** Control de versiones estricto en `/supabase/migrations`.
*   **Scaling:** Particionamiento horizontal de `audit_logs` proyectado para >1M registros.
