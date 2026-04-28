-- Roadmap de Liderazgo v4.0 - Nuevas Tablas y Funciones de IA
-- Fecha: 28 de abril de 2026

-- Habilitar extensión para búsqueda semántica (vectores)
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Tablas para IA y Análisis

-- Tabla de chunks de documentos para búsqueda semántica
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES document_versions(id),
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  embedding vector(1536), -- Para pgvector (DeepSeek o OpenAI compatible)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de contratos extendida (vinculada a documentos)
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  document_id TEXT NOT NULL REFERENCES documents(id),
  contract_number TEXT NOT NULL,
  counterparty TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  contract_value DECIMAL(15,2),
  renewal_notice_days INT DEFAULT 60,
  auto_renewal BOOLEAN DEFAULT FALSE,
  last_alert_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id),
  invoice_number TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  po_number TEXT,
  validation_result JSONB,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobada', 'observada', 'rechazada')),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de API Keys para acceso externo
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT UNIQUE NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  rate_limit INT DEFAULT 1000,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de logs de Q&A de IA
CREATE TABLE IF NOT EXISTS qa_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  tokens_used INT,
  documents_used TEXT[], -- IDs de documentos citados
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Políticas RLS (Seguridad)

ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_logs ENABLE ROW LEVEL SECURITY;

-- Política de aislamiento por org_id (usando la función auxiliar si existe o subquery)
CREATE POLICY "Aislamiento por org_id en document_chunks" ON document_chunks
  FOR ALL USING (EXISTS (SELECT 1 FROM documents d WHERE d.id = document_chunks.document_id AND d.org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())));

CREATE POLICY "Aislamiento por org_id en contracts" ON contracts
  FOR ALL USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Aislamiento por org_id en invoices" ON invoices
  FOR ALL USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Aislamiento por org_id en api_keys" ON api_keys
  FOR ALL USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Aislamiento por org_id en qa_logs" ON qa_logs
  FOR ALL USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- 3. Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_document_chunks_doc ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_invoices_contract ON invoices(contract_id);
CREATE INDEX IF NOT EXISTS idx_contracts_org ON contracts(org_id);
