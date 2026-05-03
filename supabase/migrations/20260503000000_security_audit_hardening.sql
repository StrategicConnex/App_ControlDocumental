-- Security Hardening: Hybrid Search Multi-Tenancy Validation
-- Fecha: 3 de mayo de 2026
-- Objetivo: Prevenir fugas de datos entre organizaciones validando auth.uid() en RPCs críticos.

-- 1. Endurecer match_document_chunks_hybrid
DROP FUNCTION IF EXISTS match_document_chunks_hybrid(vector, text, float, int, text);
DROP FUNCTION IF EXISTS match_document_chunks_hybrid(vector, text, double precision, integer, text);

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
SECURITY DEFINER -- Ejecuta con permisos del creador pero valida el usuario actual
AS $$
BEGIN
  -- VALIDACIÓN DE SEGURIDAD ENTERPRISE
  -- Verificamos que el usuario que llama pertenece a la organización solicitada
  -- El service_role (usado por procesos internos) está exento de esta validación
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.org_id::text = p_org_id
  ) AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Acceso denegado: El usuario no pertenece a la organización % o no está autenticado.', p_org_id;
  END IF;

  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id::uuid,
    dc.version_id,
    dc.content,
    dc.metadata,
    (1 - (dc.embedding <=> query_embedding))::FLOAT AS similarity,
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

-- 2. Endurecer match_document_chunks (Búsqueda semántica simple)
DROP FUNCTION IF EXISTS match_document_chunks(vector, float, int, text);
DROP FUNCTION IF EXISTS match_document_chunks(vector, double precision, integer, text);

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
SECURITY DEFINER
AS $$
BEGIN
  -- VALIDACIÓN DE SEGURIDAD ENTERPRISE
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.org_id::text = p_org_id
  ) AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Acceso denegado: El usuario no pertenece a la organización %', p_org_id;
  END IF;

  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id::uuid,
    dc.version_id,
    dc.content,
    dc.metadata,
    (1 - (dc.embedding <=> query_embedding))::FLOAT AS similarity
  FROM document_chunks dc
  WHERE dc.org_id = p_org_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_document_chunks_hybrid IS 'Búsqueda híbrida con validación de aislamiento multi-tenant.';
COMMENT ON FUNCTION match_document_chunks IS 'Búsqueda semántica con validación de aislamiento multi-tenant.';
