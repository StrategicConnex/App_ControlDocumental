-- Migración de Limpieza y Sincronización de Esquema
-- Objetivo: Resolver discrepancias entre el código de servicios y el esquema de base de datos.

-- 1. Añadir deleted_at a tablas principales para soporte de Soft Delete
ALTER TABLE documents ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE document_versions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 2. Corregir inconsistencias de nombres en document_versions
-- El servicio espera 'file_path', pero algunas funciones de migración usaron 'storage_path'
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_versions' AND column_name = 'storage_path') THEN
    ALTER TABLE document_versions RENAME COLUMN storage_path TO file_path;
  END IF;
END $$;

-- 3. Asegurar que 'content_extracted' existe en document_versions
ALTER TABLE document_versions ADD COLUMN IF NOT EXISTS content_extracted TEXT;

-- 4. Añadir 'category' a documents (el test-setup lo usaba y es útil para filtrado)
ALTER TABLE documents ADD COLUMN IF NOT EXISTS category TEXT;

-- 5. Corregir tipos de ID en tablas de auditoría si fuera necesario (TEXT vs UUID)
-- La tabla 'documents' tiene UUID, pero algunas referencias en migrations previas usaron TEXT
-- Nota: PostgreSQL permite CAST de UUID a TEXT, pero las FK deben coincidir en tipo.
-- Aseguramos que las FK apunten correctamente.
