-- Migration: Implementación de Sistema de Auditoría Centralizado (Audit Trail)
-- Fecha: 02 de mayo de 2026

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'LOGIN', 'DOC_CREATED', 'DOC_SIGNED', 'DOC_APPROVED', 'DOC_REJECTED', 'VERSION_CREATED'
  resource_type TEXT NOT NULL, -- 'DOCUMENT', 'USER', 'ORGANIZATION', 'SIGNATURE'
  resource_id TEXT,
  old_value JSONB,
  new_value JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad: Solo ADMIN y AUDITOR pueden ver logs de su organización
CREATE POLICY "Admins and Auditors can view audit logs"
ON audit_logs FOR SELECT
USING (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()) 
  AND 
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('ADMIN', 'AUDITOR')
);

-- Los usuarios del sistema solo pueden insertar logs (no modificarlos ni ver otros)
CREATE POLICY "Users can insert audit logs"
ON audit_logs FOR INSERT
WITH CHECK (
  org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
);

-- Índices para optimizar búsquedas de auditoría
CREATE INDEX IF NOT EXISTS idx_audit_org_event ON audit_logs(org_id, event_type);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
