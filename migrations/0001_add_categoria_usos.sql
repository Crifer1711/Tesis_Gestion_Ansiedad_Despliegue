-- Migration: add categoria and usos to actividades table (idempotente)
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS categoria text;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS usos integer DEFAULT 0;
-- Optional: keep finalizacion JSON structure if missing
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS finalizacion jsonb DEFAULT jsonb_build_object();

-- Ensure existing rows have defaults
UPDATE actividades SET categoria = COALESCE(categoria, 'Sin categoría') WHERE categoria IS NULL;
UPDATE actividades SET usos = COALESCE(usos, 0) WHERE usos IS NULL;
