-- Fix for type mismatch in vector search functions
-- Date: April 30, 2026

-- 1. Fix match_document_chunks_hybrid
DROP FUNCTION IF EXISTS match_document_chunks_hybrid(vector, text, float, int, text);
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
    (1 - (dc.embedding <=> query_embedding))::float AS similarity,
    ts_rank_cd(to_tsvector('spanish', dc.content), plainto_tsquery('spanish', query_text))::float AS text_rank
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

-- 2. Fix match_document_chunks
DROP FUNCTION IF EXISTS match_document_chunks(vector, float, int, text);
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
    (1 - (dc.embedding <=> query_embedding))::float AS similarity
  FROM document_chunks dc
  WHERE dc.org_id = p_org_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
