-- ==============================================================================
-- DATABASE MASTER: Strategic Connex Platform
-- Unificación de Schema, Tablas, Relaciones, Funciones y Seeds
-- Versión: 3.0 (Enterprise Hardened)
-- Fecha: 3 de mayo de 2026
-- ==============================================================================

-- 1. SCHEMAS & EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector"; -- Soporte para pgvector (IA/RAG)

-- 2. UTILS & HELPERS
-- ==============================================================================

-- Función para manejar el timestamp updated_at automáticamente
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función de alto rendimiento para obtener la org_id del usuario actual
CREATE OR REPLACE FUNCTION get_my_org_id() 
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT org_id::UUID FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION get_my_role() 
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 3. TABLES (Ordered by Dependencies)
-- ==============================================================================

-- Organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
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
CREATE TABLE IF NOT EXISTS profiles (
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
CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  required_metadata JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents (Core Repository)
CREATE TABLE IF NOT EXISTS documents (
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

-- Document Versions (Inmutable History)
CREATE TABLE IF NOT EXISTS document_versions (
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
  deleted_at TIMESTAMPTZ,
  UNIQUE(document_id, version_number) -- [HARDENING] Evita colisiones de versión
);

-- Personnel
CREATE TABLE IF NOT EXISTS personnel (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  cuil TEXT UNIQUE,
  job_title TEXT,
  status TEXT DEFAULT 'aprobado',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Personnel Documents (Link)
CREATE TABLE IF NOT EXISTS personnel_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  personnel_id UUID REFERENCES personnel(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  status TEXT,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  license_plate TEXT UNIQUE,
  type TEXT,
  brand TEXT,
  model TEXT,
  year INT,
  status TEXT DEFAULT 'aprobado',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle Documents (Link)
CREATE TABLE IF NOT EXISTS vehicle_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  status TEXT,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT,
  status TEXT DEFAULT 'borrador',
  total_amount DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Digital Signatures
CREATE TABLE IF NOT EXISTS digital_signatures (
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

-- Audit Logs (Inmutable Source of Truth)
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- RAG: Document Chunks for Semantic Search
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES document_versions(id),
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  embedding vector(1536), -- DeepSeek / OpenAI compatible
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AUTOMATION & TRIGGERS
-- ==============================================================================

-- [HARDENING] Función de Auditoría Automática Inmutable
CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (org_id, user_id, action, entity_type, entity_id, old_data, new_data)
  VALUES (
    COALESCE(NEW.org_id, OLD.org_id, get_my_org_id()),
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar Updated_at y Auditoría a tablas clave
DROP TRIGGER IF EXISTS trg_updated_at_docs ON documents;
CREATE TRIGGER trg_updated_at_docs BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_audit_docs ON documents;
CREATE TRIGGER trg_audit_docs AFTER INSERT OR UPDATE OR DELETE ON documents FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS trg_updated_at_personnel ON personnel;
CREATE TRIGGER trg_updated_at_personnel BEFORE UPDATE ON personnel FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_audit_personnel ON personnel;
CREATE TRIGGER trg_audit_personnel AFTER INSERT OR UPDATE OR DELETE ON personnel FOR EACH ROW EXECUTE FUNCTION process_audit_log();

DROP TRIGGER IF EXISTS trg_updated_at_vehicles ON vehicles;
CREATE TRIGGER trg_updated_at_vehicles BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

DROP TRIGGER IF EXISTS trg_audit_vehicles ON vehicles;
CREATE TRIGGER trg_audit_vehicles AFTER INSERT OR UPDATE OR DELETE ON vehicles FOR EACH ROW EXECUTE FUNCTION process_audit_log();

-- 5. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_documents_org_status ON documents(org_id, status);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks USING hnsw (embedding vector_cosine_ops);

-- 6. SECURITY (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

-- [HARDENING] Normalización de Tipos: Asegurar que org_id sea UUID en todas las tablas
-- Esto corrige errores de "operator does not exist: text = uuid" si las tablas ya existían.
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'org_id' 
      AND table_schema = 'public' 
      AND (data_type = 'text' OR data_type = 'character varying')
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I ALTER COLUMN org_id TYPE UUID USING org_id::UUID;', r.table_name);
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'No se pudo convertir org_id en la tabla %', r.table_name;
    END;
  END LOOP;
END $$;

-- Habilitar RLS en TODAS las tablas de forma dinámica
DO $$ 
DECLARE 
  t text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

-- Política Maestra de Aislamiento por Org para todas las tablas genéricas
DO $$ 
DECLARE 
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'org_id' 
      AND table_schema = 'public'
      AND table_name NOT IN ('documents', 'document_versions') -- Excluidas para política granular
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Org Isolation" ON %I;', t);
    EXECUTE format('CREATE POLICY "Org Isolation" ON %I FOR ALL USING (org_id::uuid = get_my_org_id());', t);
  END LOOP;
END $$;

-- POLÍTICAS GRANULARES PARA DOCUMENTOS
-- ==============================================================================

-- SELECT: Administradores ven todo. Usuarios solo lo propio.
DROP POLICY IF EXISTS "Documents Granular Access" ON documents;
CREATE POLICY "Documents Granular Access" ON documents
FOR SELECT USING (
  org_id::uuid = get_my_org_id() AND (
    get_my_role() IN ('ADMIN', 'MANAGER', 'AUDITOR') OR
    created_by = auth.uid()
  )
);

-- DELETE: Solo Administradores
DROP POLICY IF EXISTS "Documents Admin Only Delete" ON documents;
CREATE POLICY "Documents Admin Only Delete" ON documents
FOR DELETE USING (
  org_id::uuid = get_my_org_id() AND get_my_role() = 'ADMIN'
);

-- POLÍTICAS GRANULARES PARA VERSIONES
-- ==============================================================================
DROP POLICY IF EXISTS "Versions Granular Access" ON document_versions;
CREATE POLICY "Versions Granular Access" ON document_versions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM documents 
    WHERE documents.id = document_versions.document_id
    AND documents.org_id::uuid = get_my_org_id()
  )
);

-- 7. SEEDS (Demo Baseline)
-- ==============================================================================
INSERT INTO organizations (id, name, slug) VALUES 
('00000000-0000-0000-0000-000000000001', 'TechOps Energy', 'techops')
ON CONFLICT DO NOTHING;
