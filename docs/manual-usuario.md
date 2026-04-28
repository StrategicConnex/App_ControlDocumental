# Manual de Usuario — Strategic Connex Platform

**Versión:** 3.0 MVP  
**Última actualización:** Abril 2026  
**Plataforma:** Web (Next.js 16 + Supabase)

---

## Tabla de Contenidos

1. [Acceso al Sistema](#1-acceso-al-sistema)
2. [Dashboard Principal](#2-dashboard-principal)
3. [Gestión Documental](#3-gestión-documental)
4. [Legajos](#4-legajos)
5. [Acreditación de Personal](#5-acreditación-de-personal)
6. [Acreditación de Flota](#6-acreditación-de-flota)
7. [Presupuestos Inteligentes](#7-presupuestos-inteligentes)
8. [Centro de Alertas](#8-centro-de-alertas)
9. [Configuración](#9-configuración)
10. [Glosario de Estados](#10-glosario-de-estados)

---

## 1. Acceso al Sistema

### Iniciar Sesión
1. Navegar a la URL de la plataforma.
2. Ingresar **email institucional** y **contraseña**.
3. Hacer clic en **Iniciar Sesión**.

> Si es el primer ingreso o se olvidó la contraseña, contactar al administrador IT.

### Registro de Usuario Nuevo
1. Hacer clic en **Crear Cuenta** desde la pantalla de login.
2. Completar email, contraseña (mínimo 8 caracteres) y confirmación.
3. Revisar el **email de confirmación** enviado por Supabase.
4. Una vez confirmado, iniciar sesión normalmente.

### Cerrar Sesión
- Hacer clic en **Cerrar Sesión** en la parte inferior del menú lateral.

---

## 2. Dashboard Principal

El Dashboard es la pantalla de inicio que muestra una **vista consolidada** del estado operativo de la organización.

### Métricas Principales
| Métrica | Descripción |
|---|---|
| **Documentos Activos** | Documentos con estado `aprobado` o `vigente` |
| **Personal y Flota Acreditada** | Cantidad habilitada vs total |
| **Facturación Confirmada** | Suma de presupuestos `aceptados` y tasa de conversión |

### Alertas Operativas
- Muestra las **5 alertas más críticas** del sistema.
- Los ítems en **rojo** están vencidos o bloqueados.
- Los ítems en **amarillo** están próximos a vencer (30 días).
- Hacer clic en cualquier alerta navega al detalle del recurso.

---

## 3. Gestión Documental

### Listado de Documentos
- Ruta: `/documents`
- Muestra todos los documentos del repositorio con filtrado por categoría.
- Cada fila muestra: Título, Código, Categoría, Estado, Versión, Vencimiento.

### Detalle de Documento
- Ruta: `/documents/[id]`
- Muestra información completa del documento, flujo de aprobación e historial de versiones.
- **Descargar Actual**: disponible si el documento tiene archivo adjunto.
- **Subir Nueva Versión**: inicia el proceso de versionado.

### Estados de Documentos
| Estado | Significado |
|---|---|
| `borrador` | En edición, no publicado |
| `revision` | Bajo revisión técnica |
| `aprobado` | Aprobado, listo para uso |
| `vigente` | Vigente y en uso activo |
| `por_vencer` | Vence en los próximos 30 días |
| `vencido` | Expirado, requiere renovación |

---

## 4. Legajos

### Listado de Legajos
- Ruta: `/legajos`
- Repositorio de expedientes y legajos de la organización.
- Permite buscar por nombre y filtrar por estado.

### Crear Legajo
- Hacer clic en **Nuevo Legajo** (esquina superior derecha).
- Completar título y descripción.

---

## 5. Acreditación de Personal

### Listado de Personal
- Ruta: `/personnel`
- Muestra todos los empleados con su estado de acreditación.
- KPIs rápidos: Personal Vigente / Por Vencer / Bloqueados.

### Ficha Individual
- Ruta: `/personnel/[id]`
- Muestra datos del empleado, CUIL, cargo y **toda la documentación requerida** con su estado.
- Cada documento puede verse directamente desde la ficha.

### Lógica de Estado de Personal
El estado de un empleado se calcula en base al **peor estado** de sus documentos asociados:
- Si algún doc está `vencido` → empleado `bloqueado`
- Si algún doc está `por_vencer` → empleado `por_vencer`
- Todos los docs `aprobados` → empleado `vigente`

---

## 6. Acreditación de Flota

### Listado de Vehículos
- Ruta: `/vehicles`
- Muestra toda la flota con patente, tipo, marca/modelo y estado.

### Ficha Individual
- Ruta: `/vehicles/[id]`
- Detalle del vehículo con documentación asociada (VTV, seguro, habilitación operativa, etc.).

---

## 7. Presupuestos Inteligentes

### Historial de Presupuestos
- Ruta: `/budgets`
- KPIs: Facturación aceptada, Tasa de conversión, Pendientes.
- Tabla con todos los presupuestos, fecha, estado y monto.

### Crear Nuevo Presupuesto
- Ruta: `/budgets/new`
- Formulario dinámico para agregar ítems con descripción, cantidad y precio unitario.
- El total se calcula automáticamente.
- **Guardar Borrador**: guarda sin emitir.
- **Emitir Propuesta**: envía el presupuesto al cliente.

### Estados de Presupuesto
| Estado | Significado |
|---|---|
| `borrador` | No enviado al cliente |
| `enviado` | Enviado, esperando respuesta |
| `aceptado` | Aceptado por el cliente |
| `rechazado` | Rechazado por el cliente |
| `vencido` | Sin respuesta en el tiempo acordado |

---

## 8. Centro de Alertas

- Ruta: `/alerts`
- Vista unificada de **todas las alertas activas** del sistema.
- Segmentada por tipo: Documentos / Personal / Flota.
- Las alertas críticas (vencidas/bloqueadas) aparecen primero.

### Prioridades
| Color | Significado |
|---|---|
| 🔴 Rojo | Crítico: vencido o bloqueado |
| 🟡 Amarillo | Advertencia: próximo a vencer |

---

## 9. Configuración

- Ruta: `/settings`
- **Perfil**: visualización de email, ID y fechas de cuenta.
- **Organización**: configuración del nombre y CUIT de la empresa.
- **Notificaciones**: toggle para activar/desactivar alertas por email.
- **Seguridad**: cambio de contraseña.

---

## 10. Glosario de Estados

| Estado | Módulos | Descripción |
|---|---|---|
| `vigente` / `aprobado` | Docs, Personal, Flota | Habilitado, sin observaciones |
| `por_vencer` | Docs, Personal, Flota | Vence en los próximos 30 días |
| `vencido` | Docs, Personal, Flota | Expirado, acción requerida |
| `bloqueado` | Personal, Flota | Inhabilitado activamente |
| `borrador` | Docs, Presupuestos | En edición, no publicado |
| `revision` | Docs | Bajo auditoría técnica |
| `enviado` | Presupuestos | Emitido al cliente |
| `aceptado` | Presupuestos | Confirmado por el cliente |
| `rechazado` | Presupuestos | Declinado por el cliente |

---

## Soporte Técnico

Para reportar problemas o solicitar acceso, contactar al equipo IT:
- **Email:** it@strategicconnex.com
- **Plataforma:** Strategic Connex SC Platform v3.0
