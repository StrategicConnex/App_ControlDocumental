# Especificación de Requerimientos de Software (SRS)
## SC Platform — Plataforma de Compliance Documental y Operativo para Oil & Gas
**Versión:** 3.0  
**Fecha:** 24 de abril de 2026  
**Estado:** Borrador  

---

## 1. Introducción

### 1.1 Propósito
Este documento describe los requerimientos funcionales y no funcionales de **SC Platform**, una plataforma de **compliance documental y operativo** orientada al sector **Oil & Gas** y empresas B2B. Cubre control de versiones, vencimientos, aprobaciones, legajos de personal, vehículos, presupuestos y un panel de inteligencia centralizado.

### 1.2 Alcance
SC Platform cubre los siguientes módulos:
1. Gestión Documental General
2. Ingeniería y Documentación Técnica (ISO)
3. Gestión de Legajos para Operadoras
4. Presupuesto Inteligente
5. Acreditación de Personal y Vehículos
6. Panel de Inteligencia Estratégica (Dashboard)

### 1.3 Tecnologías Base
| Componente | Tecnología |
|---|---|
| Frontend | Aplicación Web (React / Next.js recomendado) |
| Base de Datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Almacenamiento de archivos | Supabase Storage |
| Notificaciones | Sistema de alertas en tiempo real |

### 1.4 Usuarios del Sistema
- **Administrador:** Control total del sistema.
- **Gestor Documental:** Carga, aprobación y revisión de documentos.
- **Usuario Operador:** Consulta y descarga de documentos autorizados.
- **Cliente B2B:** Acceso a su panel y documentación propia (vista restringida).
- **Auditor:** Acceso de solo lectura para revisiones y trazabilidad.

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

---

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

---

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

---

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

---

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

---

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
- Filtrado por módulo, cliente o proyecto.

---

## 3. Requerimientos No Funcionales

### 3.1 Seguridad
- **RNF-01:** Autenticación mediante Supabase Auth (email/contraseña, posibilidad de MFA).
- **RNF-02:** Control de acceso basado en roles (RBAC): cada usuario solo ve lo que le corresponde.
- **RNF-03:** Todas las comunicaciones deben usar HTTPS.
- **RNF-04:** Los archivos en Supabase Storage deben tener políticas de acceso privadas por defecto.

### 3.2 Rendimiento
- **RNF-05:** El dashboard debe cargar en menos de 3 segundos.
- **RNF-06:** La búsqueda de documentos debe responder en menos de 2 segundos.

### 3.3 Usabilidad
- **RNF-07:** La interfaz debe ser responsive (funciona en desktop y tablet).
- **RNF-08:** El sistema debe ser usable por personas sin conocimientos técnicos avanzados.

### 3.4 Disponibilidad
- **RNF-09:** Disponibilidad mínima del 99% mensual.
- **RNF-10:** Backup automático diario de la base de datos vía Supabase.

### 3.5 Escalabilidad
- **RNF-11:** La arquitectura debe permitir incorporar nuevos módulos sin rediseño.
- **RNF-12:** Soporte multicliente (multi-tenant): cada empresa ve solo sus datos.

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

---

## 5. Flujos Principales

### 5.1 Flujo de un Documento
```
Carga → Borrador → En Revisión → [Aprobado | Rechazado]
                                        ↓
                              Publicado / Vigente
                                        ↓
                                    Vencido
                                        ↓
                               Renovación / Archivo
```

### 5.2 Flujo de Acreditación de Personal
```
Alta de persona → Carga de documentos → Verificación → Acreditado
                                                ↓
                                    Monitoreo de vencimientos
                                                ↓
                                    Alerta → Renovación
```

---

## 6. Criterios de Aceptación

- [ ] Un usuario puede cargar un documento y que quede en estado "Borrador".
- [ ] Al aprobar un documento, el sistema genera un registro de aprobación con fecha y usuario.
- [ ] Al editar un documento aprobado, se crea automáticamente una nueva versión.
- [ ] El sistema envía una alerta cuando un documento vence en menos de 30 días.
- [ ] El dashboard muestra los KPIs actualizados en tiempo real.
- [ ] El sistema restringe el acceso según el rol del usuario.
- [ ] Se puede restaurar una versión anterior de cualquier documento.

---

## 7. Glosario

| Término | Definición |
|---|---|
| SRS | Software Requirements Specification (Especificación de Requerimientos) |
| Legajo | Conjunto de documentos que identifican y habilitan a una empresa o persona ante una operadora |
| Homologación | Proceso de aprobación formal por parte de una operadora (YPF, PAE, etc.) |
| Rollback | Retorno a una versión anterior de un documento |
| RBAC | Control de acceso basado en roles (Role-Based Access Control) |
| Multi-tenant | Arquitectura donde múltiples clientes comparten la misma plataforma pero con datos aislados |
| Supabase | Plataforma de base de datos y autenticación basada en PostgreSQL |

---

## 8. Modelo de Base de Datos Detallado (Supabase / PostgreSQL)

### 8.1 Tabla: `organizations`
Entidad raíz del sistema. Todos los datos pertenecen a una organización (multi-tenant).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único |
| `name` | string | Nombre de la empresa |
| `rut` | string | CUIT / RUT de la organización |
| `sector` | string | Sector (Oil & Gas, Ingeniería, etc.) |
| `created_at` | timestamp | Fecha de creación |

---

### 8.2 Tabla: `users`
Usuarios del sistema, vinculados a Supabase Auth.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador (igual al de Supabase Auth) |
| `org_id` | uuid FK → organizations | Organización a la que pertenece |
| `email` | string | Correo electrónico |
| `full_name` | string | Nombre completo |
| `role` | string | Rol: `admin`, `gestor`, `operador`, `auditor`, `cliente` |
| `created_at` | timestamp | Fecha de alta |

---

### 8.3 Tabla: `documents`
Documento principal con metadata. No contiene el archivo, solo los datos descriptivos.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único |
| `org_id` | uuid FK → organizations | Organización propietaria |
| `created_by` | uuid FK → users | Usuario que lo creó |
| `title` | string | Nombre del documento |
| `category` | string | Categoría: ISO, Legajo, Ingeniería, Presupuesto, etc. |
| `status` | string | Estado: `borrador`, `en_revision`, `aprobado`, `vencido`, `rechazado` |
| `expiry_date` | date | Fecha de vencimiento |
| `created_at` | timestamp | Fecha de creación |

---

### 8.4 Tabla: `document_versions`
Cada modificación de un documento genera una nueva versión. Aquí se almacena el archivo real.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único |
| `document_id` | uuid FK → documents | Documento al que pertenece |
| `uploaded_by` | uuid FK → users | Usuario que subió esta versión |
| `version_number` | int | Número de versión (1, 2, 3…) |
| `storage_path` | string | Ruta del archivo en Supabase Storage |
| `change_note` | string | Descripción del cambio realizado |
| `created_at` | timestamp | Fecha de subida |

---

### 8.5 Tabla: `approvals`
Registro de aprobaciones o rechazos por documento y versión.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único |
| `document_id` | uuid FK → documents | Documento evaluado |
| `version_id` | uuid FK → document_versions | Versión evaluada |
| `approved_by` | uuid FK → users | Usuario que tomó la decisión |
| `status` | string | `aprobado` / `rechazado` / `en_revision` |
| `comment` | string | Comentario u observación |
| `approved_at` | timestamp | Fecha de la decisión |

---

### 8.6 Tabla: `legajos`
Legajos agrupados por operadora y proyecto.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único |
| `org_id` | uuid FK → organizations | Organización propietaria |
| `operadora` | string | YPF, PAE, Vista, Chevron |
| `project_name` | string | Nombre del proyecto |
| `status` | string | `en_proceso`, `presentado`, `aprobado`, `observado`, `rechazado` |
| `created_at` | timestamp | Fecha de creación |

---

### 8.7 Tabla: `legajo_documents`
Tabla intermedia que asocia documentos a legajos.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único |
| `legajo_id` | uuid FK → legajos | Legajo al que pertenece |
| `document_id` | uuid FK → documents | Documento asociado |
| `required_format` | string | Formato requerido por la operadora |

---

### 8.8 Tabla: `personnel`
Personal acreditado para yacimientos.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único |
| `org_id` | uuid FK → organizations | Organización |
| `full_name` | string | Nombre completo |
| `dni` | string | Número de DNI |
| `cuil` | string | CUIL |
| `position` | string | Cargo / función |
| `status` | string | `activo`, `suspendido`, `vencido` |
| `created_at` | timestamp | Fecha de alta |

---

### 8.9 Tabla: `personnel_docs`
Documentos individuales de cada persona (ART, seguro, libreta, etc.).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único |
| `person_id` | uuid FK → personnel | Persona a la que pertenece |
| `doc_type` | string | Tipo: ART, seguro, libreta sanitaria, inducción, etc. |
| `storage_path` | string | Ruta en Supabase Storage |
| `expiry_date` | date | Fecha de vencimiento |
| `status` | string | `vigente`, `por_vencer`, `vencido` |

---

### 8.10 Tabla: `vehicles`
Flota de vehículos registrados.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único |
| `org_id` | uuid FK → organizations | Organización |
| `plate` | string | Patente del vehículo |
| `vehicle_type` | string | Tipo: camioneta, camión, grúa, etc. |
| `brand` | string | Marca y modelo |
| `homologation_status` | string | Estado de homologación por yacimiento |
| `created_at` | timestamp | Fecha de registro |

---

### 8.11 Tabla: `vehicle_docs`
Documentos individuales de cada vehículo (seguro, VTV, habilitación, etc.).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único |
| `vehicle_id` | uuid FK → vehicles | Vehículo al que pertenece |
| `doc_type` | string | Tipo: seguro, VTV, habilitación, revisión técnica, etc. |
| `storage_path` | string | Ruta en Supabase Storage |
| `expiry_date` | date | Fecha de vencimiento |
| `status` | string | `vigente`, `por_vencer`, `vencido` |

---

### 8.12 Tabla: `budgets`
Presupuestos y propuestas económicas.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único |
| `org_id` | uuid FK → organizations | Organización |
| `created_by` | uuid FK → users | Usuario que lo elaboró |
| `title` | string | Título de la propuesta |
| `status` | string | `borrador`, `enviado`, `aceptado`, `rechazado`, `vencido` |
| `total_amount` | decimal | Monto total calculado |
| `created_at` | timestamp | Fecha de creación |

---

### 8.13 Tabla: `budget_items`
Ítems de pricing de cada presupuesto.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único |
| `budget_id` | uuid FK → budgets | Presupuesto al que pertenece |
| `description` | string | Descripción del ítem |
| `quantity` | int | Cantidad |
| `unit_price` | decimal | Precio unitario |
| `total` | decimal | Total calculado (quantity × unit_price) |

---

### 8.14 Tabla: `alerts`
Alertas automáticas del sistema (vencimientos, campañas, estados).

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único |
| `org_id` | uuid FK → organizations | Organización destinataria |
| `user_id` | uuid FK → users | Usuario al que se notifica |
| `alert_type` | string | Tipo: `vencimiento`, `aprobacion`, `presupuesto`, `homologacion` |
| `message` | string | Mensaje de la alerta |
| `status` | string | `nueva`, `leida`, `resuelta` |
| `triggered_at` | timestamp | Fecha y hora de disparo |

---

### 8.15 Tabla: `audit_log`
Registro inmutable de todas las acciones realizadas en el sistema.

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Identificador único |
| `org_id` | uuid FK → organizations | Organización |
| `user_id` | uuid FK → users | Usuario que realizó la acción |
| `action` | string | Acción: `crear`, `editar`, `aprobar`, `eliminar`, `restaurar` |
| `table_name` | string | Tabla afectada |
| `record_id` | uuid | ID del registro afectado |
| `changes` | jsonb | Detalle del cambio (valor anterior y nuevo) |
| `created_at` | timestamp | Fecha y hora de la acción |

---

### 8.16 Relaciones principales

| Relación | Tipo | Descripción |
|---|---|---|
| organizations → users | 1 a N | Una organización tiene muchos usuarios |
| organizations → documents | 1 a N | Una organización posee muchos documentos |
| documents → document_versions | 1 a N | Un documento tiene muchas versiones |
| document_versions → approvals | 1 a N | Cada versión puede tener aprobaciones |
| legajos → legajo_documents | 1 a N | Un legajo agrupa varios documentos |
| personnel → personnel_docs | 1 a N | Una persona tiene varios documentos |
| vehicles → vehicle_docs | 1 a N | Un vehículo tiene varios documentos |
| budgets → budget_items | 1 a N | Un presupuesto tiene varios ítems |

---

---

## 9. Arquitectura del Sistema

### 9.1 Modelo Arquitectónico
SC Platform adopta una arquitectura **Modular + API-first + Multi-tenant**, diseñada para escalar como plataforma enterprise.

```
┌─────────────────────────────────────────┐
│              CLIENTE (Browser)          │
│         React / Next.js (SSR)           │
└────────────────┬────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────┐
│            API LAYER (REST)             │
│   Endpoints por módulo + Webhooks       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│          SERVICE LAYER                  │
│  Lógica de negocio / Reglas / Eventos   │
└──────┬─────────────────┬────────────────┘
       │                 │
┌──────▼──────┐   ┌──────▼──────────────┐
│ DATA LAYER  │   │   STORAGE LAYER     │
│  Supabase   │   │  Supabase Storage   │
│ PostgreSQL  │   │  (archivos / PDFs)  │
│  + RLS      │   │  desacoplado        │
└─────────────┘   └─────────────────────┘
       │
┌──────▼────────────────────────────────┐
│         EVENT BUS (Alertas)           │
│  Vencimientos / Aprobaciones / Hooks  │
└───────────────────────────────────────┘
```

### 9.2 Principios Arquitectónicos
- **API-first:** todos los módulos exponen y consumen APIs REST, facilitando integraciones futuras.
- **Multi-tenant:** cada organización tiene sus datos completamente aislados mediante Row Level Security (RLS) en Supabase.
- **Storage desacoplado:** los archivos (PDFs, DOCX) se almacenan separados de la metadata, permitiendo reemplazar el storage sin afectar la lógica.
- **Event-driven para alertas:** los eventos (vencimiento detectado, documento aprobado) disparan acciones de forma asíncrona, sin bloquear el flujo principal.

---

## 10. Reglas de Negocio

### 10.1 Control de Concurrencia en Edición de Documentos

**RN-01:** Cuando un usuario comienza a editar un documento, este queda **bloqueado** para otros usuarios con un indicador visual de "en edición por [nombre]".

**RN-02:** La sesión de edición tiene un **timeout de 15 minutos** de inactividad. Pasado ese tiempo, el bloqueo se libera automáticamente.

**RN-03:** El sistema usa **versionado pesimista**: no se permiten ediciones simultáneas sobre el mismo documento. Un segundo usuario puede solicitar el bloqueo y el sistema notificará al primero.

### 10.2 Ciclo de Vida de Documentos

**RN-04:** Un documento solo puede pasar a estado `aprobado` si tiene al menos una versión cargada y al menos un aprobador autorizado.

**RN-05:** Un documento `aprobado` que se edita genera automáticamente una nueva versión; la versión anterior queda **inmutable** en el historial.

**RN-06:** Los documentos en estado `vencido` se bloquean para uso operativo pero permanecen accesibles en modo lectura para auditoría.

**RN-07:** Solo el rol `admin` o `gestor` puede eliminar documentos. La eliminación es lógica (soft delete), nunca física.

### 10.3 Alertas de Vencimiento

**RN-08:** El sistema genera alertas automáticas a los **30, 15 y 7 días** antes del vencimiento de cualquier documento, persona o vehículo.

**RN-09:** Si un documento vence sin renovación, el sistema notifica al responsable y al administrador de la organización.

### 10.4 Integridad de Legajos

**RN-10:** Un legajo no puede pasar a estado `presentado` si alguno de sus documentos asociados está en estado `vencido` o `rechazado`.

**RN-11:** Cada operadora tiene un conjunto de documentos **obligatorios** configurados en el sistema. El sistema valida que todos estén presentes y vigentes antes de permitir la presentación del legajo.

---

## 11. Seguridad Nivel Enterprise

### 11.1 Row Level Security (RLS)
- Todas las tablas en Supabase tienen políticas RLS activas por defecto.
- Un usuario **nunca puede acceder a datos de otra organización**, aunque manipule la URL o la API directamente.
- Las políticas se aplican a nivel de base de datos, no solo en el frontend.

### 11.2 Control de Acceso (RBAC)
| Acción | Admin | Gestor | Operador | Auditor | Cliente |
|---|:---:|:---:|:---:|:---:|:---:|
| Crear documento | ✓ | ✓ | — | — | — |
| Editar documento | ✓ | ✓ | — | — | — |
| Aprobar documento | ✓ | ✓ | — | — | — |
| Ver documento | ✓ | ✓ | ✓ | ✓ | ✓* |
| Eliminar documento | ✓ | — | — | — | — |
| Restaurar versión | ✓ | ✓ | — | — | — |
| Ver audit log | ✓ | — | — | ✓ | — |
| Configurar sistema | ✓ | — | — | — | — |

*El cliente solo ve documentos de su organización explícitamente habilitados.

### 11.3 Auditoría Legal (Compliance Oil & Gas)
- **RNF-13:** El `audit_log` es **inmutable**: ningún usuario, incluyendo admin, puede modificar o eliminar registros de auditoría.
- **RNF-14:** Se registra no solo quién modificó, sino también **quién visualizó** un documento sensible (audit trail de accesos).
- **RNF-15:** Opción de **WORM Storage** (Write Once Read Many) para documentos con valor legal: una vez aprobados, no pueden ser sobreescritos en storage.
- **RNF-16:** Todos los archivos sensibles se almacenan con **encriptación en reposo** en Supabase Storage.
- **RNF-17:** Los tokens de sesión expiran cada 8 horas. Se soporta autenticación de dos factores (MFA) para roles admin y gestor.

### 11.4 Control de Acceso Avanzado (ABAC)

El RBAC por roles cubre el acceso general, pero en contextos enterprise es necesario un control más granular basado en atributos del documento o del contexto del usuario. SC Platform implementa **ABAC (Attribute-Based Access Control)** como extensión del RBAC.

**Atributos evaluables en cada política:**

| Atributo | Ejemplo de uso |
|---|---|
| `org_id` | El usuario solo accede a documentos de su organización |
| `category` | Un usuario puede ver solo documentos de categoría `iso` |
| `status` | Un auditor solo ve documentos en estado `aprobado` |
| `project_id` | Un cliente solo ve documentos de su proyecto asignado |
| `operadora` | Un gestor solo puede editar legajos de YPF |

**Ejemplos de políticas ABAC reales:**

```sql
-- Usuario que solo ve documentos ISO aprobados
org_id = X AND category = 'iso' AND status = 'aprobado'

-- Cliente que solo ve su proyecto
org_id = X AND project_id = 'PROJ-001'

-- Auditor externo de una operadora
org_id = X AND operadora = 'YPF' AND status IN ('aprobado','vencido')
```

**Implementación en Supabase:** las políticas ABAC se implementan como extensiones de las RLS policies existentes, incorporando una tabla `user_permissions` que almacena los atributos permitidos por usuario, y funciones auxiliares que evalúan los permisos en cada consulta.

**RNF-18:** Las reglas ABAC son configurables por el administrador desde el panel de configuración, sin necesidad de modificar el código.

---

## 12. Integraciones Externas

### 12.1 API REST Pública
SC Platform expone una API REST documentada (OpenAPI / Swagger) para integraciones B2B:

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/documents` | GET / POST | Listar o crear documentos |
| `/api/documents/{id}/approve` | POST | Aprobar un documento |
| `/api/legajos/{id}/status` | GET | Consultar estado de legajo |
| `/api/personnel/{id}/docs` | GET | Documentos vigentes de persona |
| `/api/vehicles/{id}/status` | GET | Estado de homologación de vehículo |

### 12.2 Webhooks
El sistema emite eventos en tiempo real a sistemas externos:

| Evento | Descripción |
|---|---|
| `document.approved` | Documento aprobado |
| `document.expired` | Documento vencido |
| `legajo.submitted` | Legajo presentado a operadora |
| `personnel.doc_expiring` | Documento de personal próximo a vencer |
| `vehicle.homologation_changed` | Cambio en homologación de vehículo |

### 12.3 Integraciones Planificadas (Fase 3)
- **SAP:** sincronización de legajos y proveedores.
- **Sistemas de RRHH:** importación de personal desde nómina.
- **Portales de operadoras (YPF, PAE):** envío directo de legajos vía API.
- **Sistemas de mantenimiento:** estado de vehículos y vencimientos de flotilla.

---

## 13. Dashboard Operativo vs. Inteligencia de Negocio

El dashboard se divide en dos entornos claramente separados:

### 13.1 Dashboard Operativo (SC Compliance)
Foco: **control documental y acreditación** en tiempo real.

| Métrica | Descripción |
|---|---|
| Documentos por vencer (30/15/7 días) | Alerta temprana |
| Legajos por operadora | Estado por cada operadora |
| Personal acreditado vs. vencido | Estado de la plantilla |
| Flota habilitada vs. observada | Estado de vehículos |
| Documentos pendientes de aprobación | Cola de revisión |

### 13.2 Business Intelligence (SC Intelligence — Módulo opcional)
Foco: **métricas de negocio y campañas** para decisiones estratégicas.

| Métrica | Descripción |
|---|---|
| Tráfico orgánico | Visitas al sitio |
| Leads generados | Prospectos nuevos |
| ROI de campañas | Retorno de inversión |
| Tasa de conversión B2B | Presupuestos aceptados / enviados |
| Rendimiento mensual | Comparativo de objetivos |

> **Nota:** esta separación evita ruido conceptual y hace al producto más claro y creíble ante clientes enterprise.

---

## 14. Inteligencia Artificial (Roadmap)

### RF-IA-01: Clasificación Automática de Documentos
El sistema reconoce el tipo de documento al cargarlo (ISO, legajo, presupuesto) y lo categoriza automáticamente mediante análisis de texto.

### RF-IA-02: Extracción de Datos (OCR)
Lectura automática de PDFs escaneados para extraer datos clave: fechas de vencimiento, número de documento, nombre de persona o vehículo.

### RF-IA-03: Predicción de Vencimientos
El sistema sugiere fechas de renovación basándose en el historial de documentos similares y los tiempos habituales de aprobación de cada operadora.

### RF-IA-04: Detección de Documentos Faltantes
Ante un legajo en construcción, el sistema detecta automáticamente qué documentos faltan según los requisitos de la operadora seleccionada y los sugiere al usuario.

### RF-IA-05: Risk Scoring por Organización

El sistema calcula automáticamente un **puntaje de riesgo operativo** por organización basado en tres factores ponderados:

| Factor | Peso | Descripción |
|---|---|---|
| Documentos vencidos | 40% | Porcentaje de documentos aprobados con vencimiento pasado |
| Legajos incompletos | 35% | Legajos con documentos faltantes o en estado `observado` |
| Personal no acreditado | 25% | Personas con documentos vencidos sobre el total activo |

**Visualización:** el score se muestra como semáforo en el dashboard:

- Verde (0–30): operación sin riesgo significativo
- Amarillo (31–65): riesgo moderado, requiere atención
- Rojo (66–100): riesgo crítico, bloquea operaciones en yacimiento

**RF-IA-05a:** El score se recalcula automáticamente cada 24 horas junto con el proceso diario de vencimientos.

**RF-IA-05b:** Las operadoras (YPF, PAE, etc.) podrán consultar el score de sus proveedores vía API REST en futuras integraciones (Fase 3).

---

## 15. Priorización — Roadmap por Fases

### Fase 1 — MVP (meses 1–3)
| Módulo | Descripción |
|---|---|
| Gestión Documental | Carga, versiones, estados, aprobaciones |
| Control de Vencimientos | Alertas automáticas |
| Legajos básicos | Alta y seguimiento por operadora |
| Autenticación y RBAC | Login, roles, RLS |
| Dashboard Operativo básico | Vista de vencimientos y estados |

### Fase 2 — Consolidación (meses 4–6)
| Módulo | Descripción |
|---|---|
| Presupuesto Inteligente | Generación y exportación PDF |
| Acreditación de Personal y Vehículos | Fichas completas |
| API REST + Webhooks | Integraciones básicas |
| Dashboard avanzado | KPIs operativos completos |
| Business Intelligence | Módulo de métricas de negocio |

### Fase 3 — Plataforma Inteligente (meses 7–12)
| Módulo | Descripción |
|---|---|
| OCR + Clasificación automática | IA documental |
| Predicción de vencimientos | IA preventiva |
| Integración SAP / RRHH | Ecosistema externo |
| WORM Storage legal | Compliance avanzado |
| Portal de operadoras | Envío directo de legajos |

---

## 16. Criterios de Aceptación (Estilo BDD)

Los criterios siguen el formato **Dado / Cuando / Entonces** para facilitar las pruebas de calidad (QA).

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
> **Entonces** se crea una nueva versión (v4) con el contenido de v1, sin eliminar v2 ni v3

**CA-07 — Bloqueo de documento vencido**
> **Dado** un documento en estado `vencido`
> **Cuando** un usuario operador intenta utilizarlo en un legajo
> **Entonces** el sistema bloquea la acción e indica que el documento requiere renovación

---

---

## 17. Wireframes de Pantallas Principales

Los wireframes representan la estructura visual y funcional de cada módulo. El sistema de colores es consistente en toda la plataforma: **verde = vigente / aprobado**, **amarillo = por vencer / en revisión**, **rojo = vencido / bloqueado**, **gris = borrador / neutro**.

---

### 17.1 Dashboard Operativo

**Descripción:** Vista central del sistema. El usuario accede aquí al iniciar sesión y obtiene un resumen completo del estado operativo en tiempo real.

**Componentes principales:**
- Barra de navegación lateral con acceso a todos los módulos.
- 4 tarjetas KPI: documentos vigentes, documentos por vencer, personal acreditado y flota habilitada. Cada KPI muestra variación respecto al mes anterior.
- Tabla de documentos recientes con nombre, categoría y estado (con colores semánticos).
- Panel de alertas activas clasificadas por tipo (advertencia, confirmación, información) con timestamp.
- Barras de progreso de legajos por operadora (YPF, PAE, Vista, Chevron).
- Resumen de acreditación: personal vigente, con documentos vencidos, vehículos habilitados y en observación.

**Flujo de usuario:** el usuario visualiza el estado general → hace clic en una alerta o KPI → navega al módulo correspondiente.

---

### 17.2 Módulo de Legajos

**Descripción:** Gestión completa de legajos por operadora. Permite crear, filtrar, completar y presentar legajos con control de documentos requeridos.

**Componentes principales:**
- Filtros rápidos por operadora (YPF, PAE, Vista, Chevron) y estado (aprobados, en proceso).
- Buscador de proyecto o empresa.
- Tabla de legajos con: nombre del proyecto, operadora (badge con color propio), estado, barra de completitud en porcentaje y fecha de última actualización.
- Botones de acción contextual: "Ver", "Completar", "Historial", "Corregir" según el estado del legajo.
- Panel inferior de checklist: muestra los documentos requeridos por la operadora con su estado individual (vigente, por vencer, faltante). Bloquea la presentación si hay documentos faltantes o vencidos (RN-10, RN-11).

**Flujo de usuario:** selecciona operadora → abre legajo → revisa checklist → completa documentos faltantes → presenta legajo.

---

### 17.3 Gestión Documental

**Descripción:** Repositorio central de todos los documentos del sistema. Permite cargar, versionar, aprobar y restaurar documentos de cualquier categoría.

**Componentes principales:**
- Pestañas de categoría: Todos, ISO/Ingeniería, Legajos, Presupuestos, Personal, Vehículos.
- Tabla principal con: nombre, categoría, número de versión actual, estado (con pill de color), fecha de vencimiento y responsable. La fila seleccionada se resalta con fondo azul claro.
- Panel lateral derecho del documento seleccionado: metadata completa, flujo de aprobación visual (Borrador → Revisión → Aprobado) y historial de versiones numeradas con botón "Restaurar" en versiones anteriores.
- Botones globales: filtros, nuevo documento.

**Flujo de usuario:** busca o filtra documento → selecciona → revisa detalle y versiones → aprueba, edita o restaura versión anterior.

---

### 17.4 Acreditación de Personal y Vehículos

**Descripción:** Módulo de control de habilitación de personas y vehículos para operar en yacimientos. El estado de cada uno depende de la vigencia de sus documentos.

**Componentes principales:**
- 3 KPIs de resumen: personal vigente, con documentos por vencer, con documentos vencidos.
- Panel de personal: lista de personas con avatar de iniciales (color según estado), cargo y operadora asignada, tags de documentos (ART, inducción, seguro) con color según vencimiento, y estado general (vigente / por vencer / bloqueado).
- Panel de vehículos / flota: patente en formato monospace, tipo y marca, tags de documentos (seguro, VTV, habilitación), estado de habilitación.
- Un usuario bloqueado o un vehículo bloqueado no puede ser incluido en un legajo (RN-10).

**Flujo de usuario:** detecta persona/vehículo en estado amarillo o rojo → abre su ficha → renueva el documento vencido → el estado se actualiza automáticamente.

---

### 17.5 Presupuesto Inteligente

**Descripción:** Módulo para crear propuestas económicas con diseño corporativo, cálculo dinámico de totales y exportación a PDF.

**Componentes principales:**
- Formulario de cabecera: título de la propuesta, cliente/operadora, fecha de emisión, validez y descripción del alcance.
- Tabla de ítems de pricing: descripción, unidad, cantidad (editable), precio unitario (editable) y total calculado automáticamente. Permite agregar o eliminar ítems.
- Bloque de totales: subtotal, IVA (21%) y total final calculados en tiempo real.
- Botones de acción: guardar borrador, vista previa PDF, enviar propuesta.
- Panel derecho de vista previa: muestra en tiempo real cómo se verá el PDF con diseño corporativo (header oscuro con logo, ítems, total y pie de página).
- Historial de propuestas recientes con monto y estado (aceptado, en evaluación, vencido).

**Flujo de usuario:** crea propuesta → carga ítems → revisa vista previa PDF → envía al cliente → registra resultado (aceptado / rechazado) para métricas de conversión.

---

---

## 19. Archivos SQL de Base de Datos

### 19.1 `001_init_schema.sql` — Esquema inicial

Crea todas las tablas, índices, funciones y triggers del sistema. Los puntos clave son:

**Tablas:** las 14 entidades definidas en la sección 8, con tipos de datos precisos, claves foráneas y restricciones `CHECK` en todos los campos de estado y categoría para garantizar integridad de datos desde la base.

**Columnas especiales:**
- `documents.locked_by` y `locked_at` → implementan el control de concurrencia (RN-01 y RN-02).
- `documents.deleted_at` → soft delete: los documentos nunca se borran físicamente (RN-07).
- `budget_items.total` → columna calculada automáticamente (`GENERATED ALWAYS AS quantity * unit_price STORED`).
- `audit_log` → los permisos `UPDATE` y `DELETE` están revocados para todos los roles, haciendo el log inmutable (RNF-13).

**Funciones y triggers:**
- `release_expired_locks()` → libera bloqueos de edición después de 15 minutos de inactividad. Se llama desde un cron job.
- `update_budget_totals()` → trigger que recalcula subtotal, IVA y total del presupuesto cada vez que se modifica un ítem.
- `mark_expired_documents()` → función diaria que marca como vencidos los documentos, documentos de personal y documentos de vehículos cuya fecha expiró, y como `por_vencer` los que vencen en los próximos 30 días.

**Índices:** creados sobre los campos más consultados (org_id, status, expiry_date, operadora) para garantizar tiempos de respuesta menores a 2 segundos (RNF-06).

---

### 19.2 `002_rls_policies.sql` — Row Level Security

Implementa el aislamiento completo entre organizaciones. Ningún usuario puede acceder a datos de otra organización, incluso si manipula la URL o la API directamente (CA-05).

**Funciones auxiliares:**
- `auth_org_id()` → retorna el `org_id` del usuario autenticado en cada request.
- `auth_role()` → retorna el rol del usuario (`admin`, `gestor`, `operador`, `auditor`, `cliente`).

**Reglas generales por rol:**

| Acción | Admin | Gestor | Operador | Auditor | Cliente |
|---|:---:|:---:|:---:|:---:|:---:|
| SELECT documentos | ✓ | ✓ | ✓ | ✓ | ✓ |
| INSERT / UPDATE documentos | ✓ | ✓ | — | — | — |
| DELETE (soft) documentos | ✓ | — | — | — | — |
| SELECT audit_log | ✓ | — | — | ✓ | — |
| INSERT directo en audit_log | — | — | — | — | — |
| INSERT directo en alerts | — | — | — | — | — |

**Notas de seguridad:**
- Las versiones de documentos y las aprobaciones no tienen políticas `UPDATE` ni `DELETE` → son inmutables por diseño.
- Las alertas y el audit_log solo pueden ser escritos por funciones con `SECURITY DEFINER`, no por usuarios directamente.
- El aislamiento opera a nivel de base de datos: aunque un usuario modifique el token JWT o la URL, PostgreSQL bloquea el acceso en cada query.

---

## 18. Estructura de Carpetas del Proyecto

El proyecto usa **Next.js 14+ con App Router**, organizado en capas claras: frontend, backend (API routes), servicios de negocio y base de datos.

```
sc-platform/
├── app/                                  ← Frontend + API (Next.js App Router)
│   ├── (auth)/                           ← Rutas públicas (sin sidebar)
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (dashboard)/                      ← Rutas privadas (con sidebar)
│   │   ├── page.tsx                      ← Dashboard operativo
│   │   ├── documents/
│   │   │   ├── page.tsx                  ← Listado de documentos
│   │   │   ├── [id]/page.tsx             ← Detalle + historial de versiones
│   │   │   └── new/page.tsx              ← Cargar nuevo documento
│   │   ├── legajos/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx             ← Checklist por operadora
│   │   ├── personnel/
│   │   │   ├── page.tsx                  ← Listado de personal
│   │   │   └── [id]/page.tsx             ← Ficha de persona
│   │   ├── vehicles/
│   │   │   ├── page.tsx                  ← Listado de flota
│   │   │   └── [id]/page.tsx             ← Ficha de vehículo
│   │   ├── budgets/
│   │   │   ├── page.tsx                  ← Historial de presupuestos
│   │   │   ├── new/page.tsx              ← Crear presupuesto
│   │   │   └── [id]/page.tsx             ← Editar presupuesto
│   │   ├── alerts/page.tsx               ← Centro de alertas
│   │   └── settings/page.tsx             ← Configuración de organización
│   │
│   ├── api/                              ← API REST (backend)
│   │   ├── documents/route.ts            ← GET / POST
│   │   ├── documents/[id]/
│   │   │   ├── route.ts                  ← GET / PATCH / DELETE
│   │   │   ├── approve/route.ts          ← Aprobar documento
│   │   │   └── restore/route.ts          ← Rollback de versión
│   │   ├── legajos/route.ts
│   │   ├── personnel/route.ts
│   │   ├── vehicles/route.ts
│   │   ├── budgets/route.ts
│   │   └── webhooks/route.ts             ← Eventos externos
│   │
│   ├── layout.tsx                        ← Layout raíz con sidebar
│   └── globals.css
│
├── components/                           ← Componentes reutilizables
│   ├── ui/                               ← Componentes base
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── StatusPill.tsx                ← Verde / amarillo / rojo
│   │   └── ProgressBar.tsx
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Topbar.tsx
│   │   └── AlertBanner.tsx
│   ├── documents/
│   │   ├── DocumentTable.tsx
│   │   ├── VersionHistory.tsx
│   │   ├── ApprovalFlow.tsx
│   │   └── DocumentUploader.tsx
│   ├── legajos/
│   │   ├── LegajoTable.tsx
│   │   └── OperadoraChecklist.tsx
│   ├── budgets/
│   │   ├── BudgetForm.tsx
│   │   ├── PricingTable.tsx
│   │   └── PDFPreview.tsx
│   └── dashboard/
│       ├── KPICard.tsx
│       ├── AlertFeed.tsx
│       └── OperadoraBar.tsx
│
├── lib/                                  ← Lógica de negocio y utilidades
│   ├── supabase/
│   │   ├── client.ts                     ← Cliente browser
│   │   ├── server.ts                     ← Cliente server-side
│   │   └── middleware.ts                 ← Auth + RLS
│   ├── services/                         ← Servicios de negocio (reglas)
│   │   ├── documents.ts
│   │   ├── versions.ts                   ← Versionado y rollback
│   │   ├── approvals.ts
│   │   ├── legajos.ts
│   │   ├── alerts.ts                     ← Detección de vencimientos
│   │   ├── budgets.ts
│   │   └── audit.ts                      ← Audit log inmutable
│   └── utils/
│       ├── dates.ts                      ← Cálculo de vencimientos
│       ├── pdf.ts                        ← Generación de PDF
│       └── storage.ts                    ← Supabase Storage
│
├── hooks/                                ← Custom hooks React
│   ├── useDocuments.ts
│   ├── useAlerts.ts
│   ├── useAuth.ts
│   └── useLocking.ts                     ← Control de concurrencia (RN-01)
│
├── types/                                ← Tipos TypeScript compartidos
│   ├── database.ts                       ← Tipos generados por Supabase CLI
│   ├── documents.ts
│   ├── legajos.ts
│   └── roles.ts                          ← admin / gestor / operador / auditor
│
├── supabase/                             ← Base de datos
│   ├── migrations/
│   │   ├── 001_init_schema.sql           ← Creación de tablas
│   │   ├── 002_rls_policies.sql          ← Row Level Security por organización
│   │   ├── 003_functions.sql             ← Triggers: versionado, audit log
│   │   └── 004_seed.sql                  ← Datos de prueba
│   └── config.toml
│
├── middleware.ts                         ← Auth global Next.js
├── .env.local                            ← SUPABASE_URL / SUPABASE_ANON_KEY
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

### 18.1 Convenciones del proyecto

| Convención | Descripción |
|---|---|
| Componentes | PascalCase: `DocumentTable.tsx` |
| Hooks | camelCase con prefijo use: `useDocuments.ts` |
| Servicios | camelCase: `documents.ts`, `alerts.ts` |
| Rutas API | Siempre en `app/api/[recurso]/route.ts` |
| Tipos | Generados con `supabase gen types typescript` y extendidos en `types/` |
| Variables de entorno | Siempre en `.env.local`, nunca hardcodeadas |
| Migraciones | Numeradas y secuenciales: `001_`, `002_`… |

### 18.2 Dependencias principales

| Paquete | Uso |
|---|---|
| `next` | Framework principal (App Router) |
| `@supabase/supabase-js` | Cliente de base de datos y auth |
| `@supabase/ssr` | Manejo de sesión server-side |
| `tailwindcss` | Estilos utilitarios |
| `react-hook-form` | Formularios (presupuestos, documentos) |
| `zod` | Validación de esquemas |
| `date-fns` | Cálculo de vencimientos |
| `@react-pdf/renderer` | Generación de PDF para presupuestos |
| `react-query` | Cache y estado del servidor |

---

---

## 20. Archivo `003_functions.sql` — Audit Log y Funciones Avanzadas

### 20.1 Función genérica de audit log (`fn_audit_log`)
Un único trigger reutilizable que se aplica a todas las tablas críticas. Detecta automáticamente el tipo de operación (`INSERT`, `UPDATE`, `DELETE`) y registra en `audit_log` solo los campos que cambiaron (diff), junto con su valor anterior y nuevo en formato JSONB. Para documentos, distingue acciones especiales como `bloquear`, `desbloquear` y `eliminar` según qué columnas cambiaron.

**Triggers activos:** `documents`, `document_versions`, `approvals`, `legajos`, `personnel`, `personnel_docs`, `vehicles`, `vehicle_docs`, `budgets`.

### 20.2 Función `log_document_view`
Se llama manualmente desde la API cada vez que un usuario abre un documento. Registra la acción `ver` en el audit log, cumpliendo el RNF-14 (audit trail de accesos, no solo cambios).

### 20.3 Función `restore_document_version`
Implementa el rollback de versiones (CA-06). Crea una nueva versión numerada copiando el `storage_path` de la versión elegida, sin eliminar las versiones intermedias. Vuelve el documento a estado `borrador` para que pase por el flujo de aprobación nuevamente.

### 20.4 Función `generate_expiry_alerts`
Genera alertas automáticas para documentos, personal y vehículos que vencen en exactamente 30, 15 o 7 días (RN-08). Incluye protección contra duplicados: no crea dos alertas del mismo tipo para el mismo registro en el mismo día.

### 20.5 Cron job diario (pg_cron)
Un único job programado a las 07:00 hora Argentina ejecuta en secuencia: `mark_expired_documents()` → `generate_expiry_alerts()` → `release_expired_locks()`. No requiere infraestructura externa, corre dentro de la misma base de datos Supabase.

---

## 21. Estructura Base Next.js

### 21.1 Archivos de configuración
- `package.json` — dependencias principales: Next.js 14, `@supabase/ssr`, `react-hook-form`, `zod`, `date-fns`, `@react-pdf/renderer`, `@tanstack/react-query`.
- `.env.local` — tres variables de entorno: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (públicas, usadas en el browser) y `SUPABASE_SERVICE_ROLE_KEY` (privada, solo en el servidor).

### 21.2 Middleware global (`middleware.ts`)
Intercepta todas las peticiones antes de que lleguen a las páginas. Si el usuario no tiene sesión activa y accede a una ruta del dashboard, lo redirige a `/login`. Si tiene sesión y accede a `/login`, lo redirige al dashboard. Usa `@supabase/ssr` para leer la cookie de sesión sin exponer el token al navegador.

### 21.3 Clientes Supabase
Dos clientes separados según el contexto de ejecución: `lib/supabase/client.ts` para componentes del browser (Client Components) y `lib/supabase/server.ts` para Server Components, API Routes y Server Actions. Ambos tipados con los tipos generados por `supabase gen types typescript`.

### 21.4 Tipos compartidos (`types/roles.ts`)
Define los tipos TypeScript de roles (`UserRole`), estados de documentos (`DocumentStatus`), categorías, operadoras y alertas. Incluye la tabla de permisos `ROLE_PERMISSIONS` y la función `hasPermission(role, permission)` para validar acceso en el frontend sin repetir lógica.

### 21.5 Servicio de documentos (`lib/services/documents.ts`)
Centraliza toda la lógica de acceso a datos de documentos: listar con filtros, obtener detalle con versiones, bloquear/desbloquear para edición, soft delete y llamada a `restore_document_version`. Al centralizar aquí, las páginas y componentes no hacen queries directas a Supabase.

### 21.6 Utilidades de fechas (`lib/utils/dates.ts`)
Funciones puras para calcular el estado de vencimiento (`getExpiryStatus`), los días restantes (`daysUntilExpiry`), el texto humanizado para mostrar en la UI (`expiryLabel`) y el color semántico (`expiryColor`). Usadas en todos los módulos que muestran fechas.

### 21.7 Hooks React
- `useDocuments` / `useDocument` — consultan y cachean documentos con React Query. La invalidación de caché es automática al aprobar o modificar un documento.
- `useApproveDocument` — mutation que inserta la aprobación y actualiza el estado del documento en una sola operación.
- `useDocumentLock` — implementa el control de concurrencia (RN-01, RN-02): adquiere el bloqueo al montar el componente, lo refresca cada 4 minutos para evitar expiración prematura, y lo libera automáticamente al desmontar o cerrar la pestaña.

### 21.8 Layouts y página principal
- `app/layout.tsx` — layout raíz con el provider de React Query.
- `app/(dashboard)/layout.tsx` — layout del dashboard: verifica sesión en el servidor, carga el perfil del usuario con su rol, y renderiza sidebar + topbar.
- `app/(dashboard)/page.tsx` — dashboard operativo: carga los 4 KPIs en paralelo con `Promise.all` para máxima performance, y renderiza alertas activas + estado de legajos por operadora.

---

---

## 22. Gestión de Archivos Pesados

En el sector Oil & Gas es habitual trabajar con archivos de gran tamaño: planos técnicos (50–200 MB), PDFs de memorias técnicas, imágenes de inspección y videos de procedimientos.

### 22.1 Límites y configuración

| Tipo de archivo | Tamaño máximo |
|---|---|
| PDF / DOCX estándar | 50 MB |
| Planos técnicos (DWG, PDF) | 200 MB |
| Imágenes de inspección | 100 MB |
| Videos de procedimiento | 500 MB |

Los límites son configurables por organización desde el panel de administración.

### 22.2 Carga reanudable (chunked upload)

**RNF-19:** Para archivos mayores a 10 MB el sistema usa **upload por partes (chunked)** a través de la API de Supabase Storage con soporte TUS (protocolo de carga reanudable). Si la conexión se interrumpe, la carga continúa desde el último chunk completado sin reiniciar desde cero.

### 22.3 Descarga eficiente

**RNF-20:** Los archivos se sirven directamente desde Supabase Storage con URLs firmadas de corta duración (15 minutos) para garantizar seguridad. Los archivos más consultados se distribuyen a través del CDN integrado de Supabase para reducir latencia.

### 22.4 Versionado inteligente

**RNF-21:** Antes de guardar una nueva versión, el sistema calcula el hash SHA-256 del archivo. Si el hash coincide con una versión anterior, se crea el registro de versión pero se reutiliza el mismo archivo en Storage, evitando duplicación de almacenamiento.

### 22.5 Streaming de archivos

**RNF-22:** Los archivos pesados se sirven en modo streaming para evitar cargar el archivo completo en memoria del servidor. El usuario puede comenzar a visualizar PDFs mientras se descarga el resto.

---

## 23. Continuidad del Negocio (Disaster Recovery)

Esta sección define los objetivos y procedimientos para garantizar la disponibilidad del sistema ante fallos. Es un requisito crítico para la venta a empresas enterprise en el sector energético.

### 23.1 Objetivos de recuperación

| Métrica | Objetivo | Descripción |
|---|---|---|
| **RPO** (Recovery Point Objective) | < 1 hora | Máxima pérdida de datos aceptable |
| **RTO** (Recovery Time Objective) | < 4 horas | Tiempo máximo para restaurar el servicio |
| Disponibilidad mensual | 99.5% | Equivale a menos de 3.6 horas de inactividad/mes |

### 23.2 Estrategia de backups

**RNF-23:** Supabase realiza backups automáticos diarios con retención de 30 días (plan Pro). Para el tier enterprise se configura:
- Backup continuo (Point-in-Time Recovery) con granularidad de 1 minuto.
- Backup georeplicado en una segunda región (ej: São Paulo → us-east-1).
- Backup semanal exportado a almacenamiento externo (S3 o similar).

### 23.3 Procedimiento de restauración

1. Identificar el punto de restauración (timestamp).
2. Restaurar la base de datos desde el backup más cercano.
3. Aplicar los WAL logs hasta el punto objetivo.
4. Verificar integridad de datos con queries de validación.
5. Reactivar el servicio y notificar a usuarios.

**RNF-24:** El procedimiento completo debe poder ejecutarse en menos de 4 horas por un administrador técnico siguiendo la documentación de recuperación.

### 23.4 Tests de recuperación

**RNF-25:** Se realizan simulacros de disaster recovery cada 3 meses en un entorno de staging, con registro del tiempo real de recuperación y comparación contra el RTO objetivo.

---

## 24. Observabilidad

La observabilidad permite detectar y resolver problemas antes de que afecten a los usuarios, y es requisito para operar el sistema en producción a escala.

### 24.1 Logs centralizados

**RNF-26:** Todos los eventos del sistema se centralizan en una plataforma de logging (ej: Axiom, Datadog, o Logtail integrado con Supabase). Se registran tres categorías:

- **Errores:** excepciones de API, fallos de base de datos, errores de storage.
- **Accesos:** autenticaciones, intentos fallidos, accesos a documentos sensibles.
- **Eventos de negocio:** aprobaciones, vencimientos detectados, alertas generadas.

### 24.2 Métricas de sistema

| Métrica | Descripción |
|---|---|
| Tiempo de respuesta de API | Percentiles p50, p95, p99 por endpoint |
| Uso de storage por organización | MB usados vs límite contratado |
| Documentos procesados por día | Cargas, aprobaciones, vencimientos |
| Tasa de errores | Porcentaje de requests con status 5xx |
| Usuarios activos | DAU / MAU por organización |

### 24.3 Alertas técnicas automáticas

**RNF-27:** El sistema genera alertas al equipo técnico (no al usuario final) ante:
- Tiempo de respuesta de API > 3 segundos durante más de 2 minutos.
- Tasa de errores 5xx > 1% en una ventana de 5 minutos.
- Fallo en el cron job diario de vencimientos.
- Storage de una organización > 90% de su límite.

### 24.4 Distributed Tracing

**RNF-28:** Cada request lleva un `trace_id` único que permite seguir el flujo completo: cliente → API Next.js → Supabase → Storage. Facilita diagnosticar cuellos de botella y errores intermitentes.

---

## 25. Estrategia de Testing

### 25.1 Unit tests
Cubren la lógica de negocio pura, sin dependencias externas:
- Funciones de cálculo de vencimientos (`dates.ts`).
- Validación de permisos RBAC y ABAC (`roles.ts`, `hasPermission`).
- Cálculo de totales de presupuesto (`budgets.ts`).
- Risk scoring (`riskScore.ts`).

**Herramienta:** Vitest. **Cobertura mínima:** 80% en `lib/services/` y `lib/utils/`.

### 25.2 Integration tests
Verifican que la API y la base de datos funcionan correctamente juntas:
- CRUD de documentos con versiones.
- Flujo completo de aprobación.
- Generación y cálculo de presupuestos.
- Inserción correcta en audit_log.

**Herramienta:** Vitest + cliente Supabase apuntando a base de datos de test local.

### 25.3 Tests de seguridad (RLS)
Los más críticos del sistema. Verifican que el aislamiento multi-tenant es real:

```typescript
// Ejemplo: usuario de org A no puede ver docs de org B
test('RLS bloquea acceso cross-tenant', async () => {
  const clientOrgA = createClientForUser(userOrgA);
  const { data } = await clientOrgA.from('documents')
    .select('*').eq('org_id', ORG_B_ID);
  expect(data).toHaveLength(0); // RLS debe retornar vacío
});
```

**Herramienta:** Vitest + Supabase local. Debe ejecutarse en cada PR antes del merge.

### 25.4 Tests E2E (flujos críticos)
Simulan un usuario real usando el navegador:
- Login → cargar documento → aprobar documento.
- Detectar vencimiento → generar alerta → renovar documento.
- Crear legajo → agregar documentos → presentar a operadora.
- Crear presupuesto → agregar ítems → exportar PDF.

**Herramienta:** Playwright. **Entorno:** staging con datos de prueba.

### 25.5 Pipeline de CI/CD

```
Push a rama → Unit tests → Integration tests → RLS tests
     → Build Next.js → Deploy staging → E2E tests
     → Aprobación manual → Deploy producción
```

---

## 26. Estados UX Críticos

Los wireframes muestran el flujo feliz, pero un producto enterprise necesita manejar correctamente todos los estados de error y casos borde.

### 26.1 Empty states
Cuando una lista no tiene datos (primera vez que se usa el sistema, filtros sin resultados), se muestra un estado vacío con mensaje claro y acción sugerida. Ejemplo: "Todavía no hay documentos. Cargá el primero →".

### 26.2 Loading states (skeletons)
Mientras se cargan datos del servidor se muestran **skeleton screens** (placeholders grises animados) en lugar de spinners. Esto reduce la percepción de lentitud y evita el "salto" de contenido al cargar.

### 26.3 Error states con retry
Si una carga falla (error de red, timeout), se muestra el error con un botón "Reintentar" que repite la consulta sin necesidad de recargar la página. Los errores se loguean automáticamente en el sistema de observabilidad.

### 26.4 Retry automático en uploads
Si la carga de un archivo falla a mitad del proceso (corte de conexión), el sistema intenta reanudar la carga automáticamente hasta 3 veces antes de mostrar un error al usuario, aprovechando el protocolo TUS de uploads reanudables.

### 26.5 Conflictos de edición
Si el usuario A intenta editar un documento que está bloqueado por el usuario B, se muestra un aviso claro: "Este documento está siendo editado por [Nombre] desde hace [X] minutos. Podés solicitar acceso o volver más tarde." El usuario puede enviar una notificación al editor actual desde la misma pantalla.

### 26.6 Confirmaciones destructivas
Acciones irreversibles (eliminar documento, rechazar legajo) requieren confirmación explícita con un modal que describe exactamente qué va a ocurrir. No se usa el `confirm()` nativo del navegador.

---

## 27. SC Intelligence — Módulo Opcional

SC Intelligence es un **módulo desacoplado** del core operativo. Puede activarse o desactivarse por cliente sin afectar el funcionamiento de SC Compliance.

**Activación:** desde el panel de administración de la organización con un toggle. Una vez activado, aparece en la barra lateral como módulo separado.

**Contenido del módulo:**

| Sección | Descripción |
|---|---|
| Tráfico orgánico | Visitas al sitio web corporativo |
| Leads generados | Prospectos nuevos por período |
| ROI de campañas | Retorno de inversión por canal |
| Tasa de conversión B2B | Presupuestos aceptados / enviados |
| Rendimiento mensual | Comparativo de objetivos comerciales |

**Integración:** los datos de SC Intelligence se cargan desde fuentes externas (Google Analytics, CRM, hojas de cálculo) mediante conectores configurables. No comparte base de datos con el módulo operativo.

**Nota comercial:** SC Intelligence puede ofrecerse como add-on de precio separado, incrementando el ticket promedio por cliente sin agregar complejidad al producto core.

---

*Documento generado para SC Platform — Versión 3.0 — Abril 2026*
