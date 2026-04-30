-- Phase 2: Metadata Enrichment & Hybrid Search
-- Fecha: 30 de abril de 2026

-- 1. Enriquecer la tabla document_chunks
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS org_id TEXT REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Backfill de org_id desde la tabla documents
UPDATE document_chunks dc
SET org_id = d.org_id::text
FROM documents d
WHERE dc.document_id = d.id::text
AND dc.org_id IS NULL;

-- 3. Crear índice GIN para búsqueda de texto completo (FTS)
-- Usamos 'spanish' por ser el idioma principal del proyecto
CREATE INDEX IF NOT EXISTS idx_document_chunks_content_fts 
ON document_chunks USING GIN (to_tsvector('spanish', content));

-- 4. Nueva función de búsqueda Híbrida (Vectores + Palabras Clave)
DROP FUNCTION IF EXISTS match_document_chunks_hybrid(vector, text, float, int, text);
DROP FUNCTION IF EXISTS match_document_chunks_hybrid(vector, text, float, int, uuid);
CREATE OR REPLACE FUNCTION match_document_chunks_hybrid (
  query_embedding vector(1536),
  query_text text,
  match_threshold float,
  match_count int,
  p_org_id text
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  version_id uuid,
  content text,
  metadata jsonb,
  similarity float,
  text_rank float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id::uuid,
    dc.version_id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    ts_rank_cd(to_tsvector('spanish', dc.content), plainto_tsquery('spanish', query_text)) AS text_rank
  FROM document_chunks dc
  WHERE dc.org_id = p_org_id
    AND (
      1 - (dc.embedding <=> query_embedding) > match_threshold
      OR to_tsvector('spanish', dc.content) @@ plainto_tsquery('spanish', query_text)
    )
  ORDER BY 
    (1 - (dc.embedding <=> query_embedding)) DESC, 
    ts_rank_cd(to_tsvector('spanish', dc.content), plainto_tsquery('spanish', query_text)) DESC
  LIMIT match_count;
END;
$$;

-- 5. Actualizar la función anterior para que sea compatible con los nuevos campos
DROP FUNCTION IF EXISTS match_document_chunks(vector, float, int, text);
DROP FUNCTION IF EXISTS match_document_chunks(vector, float, int, uuid);
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_org_id text
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
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
    dc.document_id::uuid,
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
