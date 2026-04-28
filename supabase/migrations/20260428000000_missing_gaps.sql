-- Migración para completar las brechas según el SRS v3.1 (Corrección Final de Tipos Híbridos)
-- Fecha: 28 de abril de 2026

-- 1. Tablas Faltantes
-- Nota: document_versions ya existe con ID UUID, pero approvals y otras son nuevas.

CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_id UUID REFERENCES document_versions(id) ON DELETE SET NULL,
  approved_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('aprobado','rechazado','en_revision')),
  comment TEXT,
  approved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS digital_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_id UUID REFERENCES document_versions(id),
  signer_id UUID NOT NULL REFERENCES profiles(id),
  signer_certificate_hash TEXT NOT NULL,
  signature_hash TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  validation_timestamp TIMESTAMPTZ,
  validation_provider TEXT CHECK (validation_provider IN ('Afip', 'DocuSign', 'Propio', 'None')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  trigger_filters JSONB,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'excel', 'csv')),
  filters JSONB NOT NULL,
  recipients JSONB NOT NULL,
  last_sent_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webhook_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS risk_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
  docs_score INT NOT NULL,
  legajos_score INT NOT NULL,
  personal_score INT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Funciones y Procedimientos (PostgreSQL)

-- Rollback de versiones sin duplicación de almacenamiento
-- p_document_id es TEXT (para coincidir con documents.id)
-- Retorna UUID (para coincidir con document_versions.id)
CREATE OR REPLACE FUNCTION restore_document_version(
  p_document_id TEXT,
  p_target_version INT
)
RETURNS UUID AS $$
DECLARE
  v_source_path TEXT;
  v_source_hash TEXT;
  v_new_version INT;
  v_new_id UUID;
  v_uploaded_by UUID;
BEGIN
  SELECT storage_path, content_hash, uploaded_by INTO v_source_path, v_source_hash, v_uploaded_by
  FROM document_versions
  WHERE document_id = p_document_id AND version_number = p_target_version;
  
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_new_version
  FROM document_versions
  WHERE document_id = p_document_id;
  
  UPDATE document_versions SET is_current = false WHERE document_id = p_document_id;

  INSERT INTO document_versions (
    document_id, uploaded_by, version_number, 
    storage_path, content_hash, change_note, is_current
  )
  VALUES (
    p_document_id, v_uploaded_by, v_new_version,
    v_source_path, v_source_hash, format('Rollback a versión %s', p_target_version), true
  )
  RETURNING id INTO v_new_id;
  
  UPDATE documents SET updated_at = NOW() WHERE id = p_document_id;
  
  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RLS para las nuevas tablas
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_score_history ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento por org_id (donde aplique)
CREATE POLICY "Aislamiento por org_id en risk_score_history" ON risk_score_history
FOR ALL USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));
