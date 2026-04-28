-- Roadmap de Liderazgo v4.3 - Sincronización de Esquema de Auditoría
-- Fecha: 28 de abril de 2026

-- 1. Actualizar tabla de contratos
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS compliance_score INT DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Actualizar tabla de facturas
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'pending';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discrepancies JSONB DEFAULT '[]';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 3. Índices adicionales para auditoría
CREATE INDEX IF NOT EXISTS idx_contracts_score ON contracts(compliance_score);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(validation_status);
