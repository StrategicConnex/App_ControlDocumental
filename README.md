# SC Platform — Control Documental Operativo

Plataforma enterprise de gestión documental estratégica diseñada para el sector Oil & Gas.

## 🚀 Estado de Implementación (vs SRS v3.1)

- [x] **Core Documental**: Carga y estados (Borrador/Revisión/Aprobado).
- [x] **Control de Versiones**: Soporte para Major/Minor y Rollback (RF-02).
- [x] **Quórum de Aprobación**: Mínimo 2 aprobadores requeridos para estado final (RF-03).
- [x] **Firma Digital**: Hashing SHA-256 e integridad de firma (RNF-30).
- [x] **Multi-tenancy**: RLS y aislamiento por organización (RNF-13).
- [x] **Legajos Operadoras**: Validación específica para YPF, PAE, Vista, Chevron (RF-10).
- [x] **Dashboard Inteligente**: KPIs consolidados y alertas (RF-21).
- [wip] **Offline Mode**: Base lógica para sincronización (RNF-29).
- [wip] **Reporting**: Esquema de reportes programados (RNF-31).

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estado**: React Query

## 📋 Requerimientos

Para ejecutar el proyecto localmente:

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno en `.env.local`
4. Ejecutar: `npm run dev`

---
*Este proyecto sigue los lineamientos de la Especificación de Requerimientos de Software (SRS) v3.1.*
