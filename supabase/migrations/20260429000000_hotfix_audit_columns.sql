-- Hotfix: Agregar columnas faltantes requeridas por la API de Auditoría
-- Fecha: 29 de abril de 2026

-- 1. Actualizar tabla de facturas
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS audit_notes TEXT;

-- 2. Actualizar tabla de contratos
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS audit_notes TEXT;
-- Asegurar que audit_score exista o usar compliance_score (optamos por añadir audit_score para compatibilidad total con la API actual)
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS audit_score INT DEFAULT 0;

-- 3. Índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_invoices_audit_notes ON invoices(audit_notes) WHERE audit_notes IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_audit_score ON contracts(audit_score);
