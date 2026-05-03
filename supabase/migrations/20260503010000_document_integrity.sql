-- Document Integrity & Audit System
-- Fecha: 3 de mayo de 2026
-- Objetivo: Garantizar la inmutabilidad de versiones firmadas y trazabilidad total de acceso.

-- 1. Mejorar document_versions con Checksums e Inmutabilidad
ALTER TABLE document_versions ADD COLUMN IF NOT EXISTS checksum_sha256 TEXT;
ALTER TABLE document_versions ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
ALTER TABLE document_versions ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Tabla de Logs de Acceso (Trazabilidad Enterprise)
CREATE TABLE IF NOT EXISTS document_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version_id UUID REFERENCES document_versions(id),
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL DEFAULT 'VIEW', -- VIEW, DOWNLOAD, PREVIEW
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS en Access Logs
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org Isolation Access Logs" ON document_access_logs 
FOR ALL USING (org_id::uuid = get_my_org_id());

-- 3. Trigger para Inmutabilidad: Prevenir cambios en versiones bloqueadas
CREATE OR REPLACE FUNCTION protect_locked_versions()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_locked = true THEN
    RAISE EXCEPTION 'Operación denegada: La versión documental % está bloqueada (inmutable).', OLD.version_number;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_locked_versions ON document_versions;
CREATE TRIGGER trg_protect_locked_versions
BEFORE UPDATE OR DELETE ON document_versions
FOR EACH ROW EXECUTE FUNCTION protect_locked_versions();

-- 4. Comentarios de Auditoría
COMMENT ON COLUMN document_versions.checksum_sha256 IS 'Hash SHA-256 del archivo original para verificar integridad post-upload.';
COMMENT ON COLUMN document_versions.is_locked IS 'Si es true, la versión no puede ser editada ni eliminada (Snapshot Inmutable).';
COMMENT ON TABLE document_access_logs IS 'Registro histórico de acceso a documentos para auditorías forenses.';
