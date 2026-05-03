-- ==============================================================================
-- DATABASE MASTER: Strategic Connex Platform
-- Unificación de Schema, Tablas, Relaciones, Funciones y Seeds
-- Versión: 2.5 (Enterprise Premium)
-- Fecha: 3 de mayo de 2026
-- ==============================================================================

-- 1. SCHEMAS & EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- Soporte para pgvector (IA/RAG)

-- 2. TABLES (Ordered by Dependencies)
-- ==============================================================================

-- Organizations (Tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  is_vendor BOOLEAN DEFAULT false,
  parent_org_id UUID REFERENCES organizations(id),
  contact_email TEXT,
  tax_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (Auth Link + Org Association)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id),
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN', 'MANAGER', 'USER', 'AUDITOR', 'VENDOR')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Types
CREATE TABLE document_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  required_metadata JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents (Core Repository)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  doc_type_id UUID REFERENCES document_types(id),
  title TEXT NOT NULL,
  code TEXT,
  category TEXT,
  description TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'vigente', 'vencido', 'por_vencer', 'borrador', 'revision', 'bloqueado')),
  expiry_date DATE,
  metadata JSONB DEFAULT '{}',
  current_version INT DEFAULT 1,
  vendor_request_id UUID,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Document Versions
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  version_label TEXT,
  file_url TEXT,
  change_description TEXT,
  change_type TEXT CHECK (change_type IN ('major', 'minor', 'patch')),
  content_extracted TEXT, -- RAG Source
  is_current BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Personnel
CREATE TABLE personnel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  cuil TEXT UNIQUE,
  job_title TEXT,
  status TEXT DEFAULT 'aprobado',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personnel Documents (Link)
CREATE TABLE personnel_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  status TEXT,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  license_plate TEXT UNIQUE,
  type TEXT,
  brand TEXT,
  model TEXT,
  year INT,
  status TEXT DEFAULT 'aprobado',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Documents (Link)
CREATE TABLE vehicle_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  status TEXT,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT,
  status TEXT DEFAULT 'borrador',
  total_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget Items
CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  description TEXT,
  quantity DECIMAL(15,2),
  unit_price DECIMAL(15,2),
  total DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Approvals
CREATE TABLE approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version_id UUID REFERENCES document_versions(id) ON DELETE SET NULL,
  approved_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL CHECK (status IN ('aprobado','rechazado','en_revision')),
  comment TEXT,
  approved_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digital Signatures
CREATE TABLE digital_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version_id UUID REFERENCES document_versions(id),
  signer_id UUID NOT NULL REFERENCES profiles(id),
  signer_certificate_hash TEXT NOT NULL,
  signature_hash TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  validation_timestamp TIMESTAMPTZ,
  validation_provider TEXT CHECK (validation_provider IN ('Afip', 'DocuSign', 'Propio', 'StrategicConnex-Internal', 'None')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RAG: Document Chunks for Semantic Search
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES document_versions(id),
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  embedding vector(1536), -- DeepSeek / OpenAI compatible
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Call Logs (POL Telemetry)
CREATE TABLE ai_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  duration_ms INT,
  status TEXT,
  error_message TEXT,
  request_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Keys (Third-party integrations)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hint TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs (Immutability)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contracts
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  vendor_id UUID REFERENCES organizations(id),
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active',
  value_amount DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'INFO' CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ERROR')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QA Logs (Q&A Engine history)
CREATE TABLE qa_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  context_used JSONB,
  feedback_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Risk Score History
CREATE TABLE risk_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AUTOMATION & FUNCTIONS
-- ==============================================================================

-- Restore document to a previous version
CREATE OR REPLACE FUNCTION restore_document_version(
  p_document_id UUID,
  p_target_version INT
)
RETURNS UUID AS $$
DECLARE
  v_source_url TEXT;
  v_new_version INT;
  v_new_id UUID;
  v_created_by UUID;
BEGIN
  SELECT file_url, created_by INTO v_source_url, v_created_by
  FROM document_versions
  WHERE document_id = p_document_id AND version_number = p_target_version;
  
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO v_new_version
  FROM document_versions
  WHERE document_id = p_document_id;
  
  UPDATE document_versions SET is_current = false WHERE document_id = p_document_id;

  INSERT INTO document_versions (
    document_id, created_by, version_number, 
    file_url, change_description, is_current
  )
  VALUES (
    p_document_id, v_created_by, v_new_version,
    v_source_url, format('Rollback a versión %s', p_target_version), true
  )
  RETURNING id INTO v_new_id;
  
  UPDATE documents SET updated_at = NOW(), current_version = v_new_version, file_url = v_source_url WHERE id = p_document_id;
  
  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. SECURITY (RLS)
-- ==============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aislamiento por org_id" ON documents
FOR ALL USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- 5. SEEDS (Sample Data)
-- ==============================================================================

-- Nota: IDs son fijos para coherencia en demos
INSERT INTO organizations (id, name, slug) VALUES 
('00000000-0000-0000-0000-000000000001', 'TechOps Energy', 'techops')
ON CONFLICT DO NOTHING;

INSERT INTO document_types (name, description, org_id) VALUES 
('ISO-9001', 'Procedimientos de Calidad', '00000000-0000-0000-0000-000000000001');

