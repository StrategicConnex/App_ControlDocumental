-- Roadmap de Liderazgo v4.2 - Búsqueda Semántica con pgvector
-- Fecha: 28 de abril de 2026

-- 1. Función para búsqueda de similitud de cosenos en fragmentos de documentos
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_org_id text
)
RETURNS TABLE (
  id uuid,
  version_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.version_id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE dc.org_id = p_org_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 2. Índice para acelerar la búsqueda vectorial (HNSW o IVFFlat)
-- HNSW es más rápido pero consume más recursos
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
ON document_chunks USING hnsw (embedding vector_cosine_ops);
