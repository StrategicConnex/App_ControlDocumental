-- Roadmap de Liderazgo v4.1 - Soporte para IA Dual (OpenRouter + DeepSeek)
-- Fecha: 28 de abril de 2026

-- 1. Tabla de Logs de Llamadas a IA (Para monitoreo de conmutación)
CREATE TABLE IF NOT EXISTS ai_call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  response_time_ms INT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Actualizar tabla qa_logs para incluir el proveedor
ALTER TABLE qa_logs ADD COLUMN IF NOT EXISTS provider_used TEXT;

-- 3. Políticas RLS
ALTER TABLE ai_call_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aislamiento por org_id en ai_call_logs" ON ai_call_logs
  FOR ALL USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_org ON ai_call_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_call_logs_provider ON ai_call_logs(provider);
