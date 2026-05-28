-- Migration: create table bienestar_intentos
-- Run this on your Postgres DB (psql or migration tool)

CREATE TABLE IF NOT EXISTS bienestar_intentos (
  id SERIAL PRIMARY KEY,
  intento_id TEXT NOT NULL,
  actividad_slug TEXT NOT NULL,
  estudiante_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  asignacion_id UUID REFERENCES bienestar_asignaciones(id) ON DELETE SET NULL,
  entrada_estudiante TEXT,
  respuesta_ia JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duracion_segundos INTEGER,
  culmino BOOLEAN DEFAULT false,
  resumen JSONB
);

CREATE INDEX IF NOT EXISTS ix_bienestar_intentos_intento_id ON bienestar_intentos(intento_id);
CREATE INDEX IF NOT EXISTS ix_bienestar_intentos_estudiante_id ON bienestar_intentos(estudiante_id);
