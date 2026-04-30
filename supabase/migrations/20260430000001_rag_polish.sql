-- Migración Final de Monitoreo y Ajuste
-- Fecha: 30 de abril de 2026

-- 1. Añadir latency_ms a qa_logs
ALTER TABLE qa_logs ADD COLUMN IF NOT EXISTS latency_ms INT;

-- 2. Asegurar que los índices para búsqueda híbrida estén óptimos
CREATE INDEX IF NOT EXISTS idx_document_chunks_metadata_gin ON document_chunks USING GIN (metadata);
