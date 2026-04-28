-- 1. Tabla de Logs de Auditoría
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- e.g. 'documents', 'personnel'
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,      -- e.g. 'CREATED', 'UPDATED'
  actor_id UUID NOT NULL,           -- Who did it
  changes JSONB,                    -- Diff or relevant data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying history of a specific entity
CREATE INDEX idx_audit_entity ON audit_log (entity_type, entity_id);

-- 2. Tabla de Versiones de Documentos
CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  version_major INT NOT NULL DEFAULT 1,
  version_minor INT NOT NULL DEFAULT 0,
  file_url TEXT NOT NULL,
  changes_summary TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for finding versions of a document
CREATE INDEX idx_doc_versions ON document_versions (document_id);

-- 3. Tabla de Aprobaciones de Documentos
CREATE TABLE document_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,      -- 'approve', 'reject', 'request_changes'
  notes TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for approvals
CREATE INDEX idx_doc_approvals ON document_approvals (document_id);

-- Add Storage Bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;

-- Storage policies for the 'documents' bucket
CREATE POLICY "Authenticated users can upload documents" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Authenticated users can read documents" 
  ON storage.objects FOR SELECT 
  TO authenticated 
  USING (bucket_id = 'documents');
