# SC Platform — Control Documental Operativo

Plataforma enterprise de gestión documental estratégica diseñada para el sector Oil & Gas.

## 🚀 Estado de Implementación (v3.5)

- [x] **Core Documental**: Carga y estados (Borrador/Revisión/Aprobado).
- [x] **Control de Versiones**: Soporte para Major/Minor y Rollback.
- [x] **Ecosistema de Riesgo**: Heatmap, Scoring (0-100) y Evolución Histórica.
- [x] **Seguridad Proactiva**: Bloqueo preventivo de accesos para proveedores críticos.
- [x] **Inteligencia IA**: Sugerencias de documentos basadas en contexto industrial.
- [x] **Automatización**: Nudges recurrentes, reportes semanales y alertas de expiración.
- [x] **Firma Digital**: Hashing SHA-256 e integridad de firma.
- [x] **Multi-tenancy**: RLS y aislamiento por organización (ABAC).

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estado**: React Query (TanStack Query)
- **Analytics**: Recharts + jsPDF

## 📋 Despliegue en Vercel

1. **GitHub**: Sube este repositorio a una cuenta de GitHub.
2. **Vercel**: Conecta el repositorio desde el dashboard de Vercel.
3. **Variables de Entorno**: Configura las siguientes variables (puedes tomarlas de `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENROUTER_API_KEY` (opcional para IA)
   - `GEMINI_API_KEY` (opcional para IA)
4. **Build Command**: Asegúrate de que el comando sea `npm run build`.

## 💻 Desarrollo Local

1. Clonar el repositorio.
2. Instalar dependencias: `npm install`
3. Configurar `.env.local`
4. Ejecutar: `npm run dev`

---
*Strategic Connex — Intelligence & Compliance Infrastructure — 2026*
