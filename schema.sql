-- Consolidated schema for MindPeace (README + migrations)
-- Usage:
-- 1) Upload this file to your machine or the Render service.
-- 2) From your terminal run (use the EXTERNAL Database URL provided by Render):
--    psql "postgresql://user:password@host:port/database" -f schema.sql
-- 3) OR paste the SQL into pgAdmin Query Tool (do NOT paste psql "..." there).

-- =====================
-- BEGIN: README SQL
-- =====================

-- ============================================
-- MINDPEACE - SCRIPT COMPLETO BASE DE DATOS
-- Gestión de Ansiedad en Estudiantes Universitarios
-- ============================================

-- 1. TABLA: USUARIOS (Pacientes, Psicólogos, Admin)
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('PACIENTE', 'PSICOLOGO', 'ADMINISTRADOR')),
    contacto VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Activo',
    especialidad VARCHAR(255),
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);


-- 2. TABLA: HISTORIAL MÉDICO (Ficha del paciente)
CREATE TABLE IF NOT EXISTS public.medical_records (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    edad VARCHAR(10),
    fecha_nacimiento DATE,
    escolaridad VARCHAR(100),
    estab_educacional VARCHAR(255),
    con_quien_vive VARCHAR(255),
    domicilio VARCHAR(255),
    quien_consulta VARCHAR(255),
    interconsulta VARCHAR(255),
    derivado_por VARCHAR(255),
    motivo_padres TEXT,
    motivo_nino TEXT,
    motivo_latente TEXT,
    intentos_solucion TEXT,
    sintomatologia_conductual TEXT,
    sintomatologia_emocional TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


-- 3. TABLA: DISPONIBILIDAD PSICÓLOGO (Horarios disponibles)
CREATE TABLE IF NOT EXISTS public.psychologist_availability (
    id SERIAL PRIMARY KEY,
    psychologist_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time VARCHAR(5) NOT NULL,
    end_time VARCHAR(5) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_availability_psychologist ON public.psychologist_availability(psychologist_id);


-- 4. TABLA: CITAS (Appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    psychologist_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(5) NOT NULL,
    modality VARCHAR(50) NOT NULL CHECK (modality IN ('Presencial', 'Virtual')),
    reason TEXT,
    request_link BOOLEAN NOT NULL DEFAULT FALSE,
    meeting_link TEXT,
    cancel_reason TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Aceptada', 'Rechazada', 'Cancelada')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_active_slot
    ON public.appointments(psychologist_id, appointment_date, appointment_time)
    WHERE status NOT IN ('Cancelada', 'Rechazada');

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_psychologist_id ON public.appointments(psychologist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);


-- 5. TABLA: NOTAS DE CITAS (Notas clínicas del psicólogo)
CREATE TABLE IF NOT EXISTS public.appointment_notes (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    psychologist_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    notes TEXT,
    recommendations TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointment_notes_appointment_id ON public.appointment_notes(appointment_id);


-- 6. TABLA: FEEDBACK DE PACIENTE (Calificación de citas)
CREATE TABLE IF NOT EXISTS public.appointment_feedback (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_appointment ON public.appointment_feedback(appointment_id);
CREATE INDEX IF NOT EXISTS idx_feedback_patient ON public.appointment_feedback(patient_id);


-- 7. TABLA: HISTORIAL DE ANSIEDAD (Seguimiento diario/semanal)
CREATE TABLE IF NOT EXISTS public.anxiety_tracking (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    anxiety_level INTEGER NOT NULL CHECK (anxiety_level BETWEEN 1 AND 10),
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_anxiety_patient ON public.anxiety_tracking(patient_id);
CREATE INDEX IF NOT EXISTS idx_anxiety_date ON public.anxiety_tracking(date);


-- 8. TABLA: RESULTADOS TEST GAD-7 (Escala de ansiedad)
CREATE TABLE IF NOT EXISTS public.gad7_responses (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    score INTEGER,
    interpretation VARCHAR(50),
    responses JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);


-- 9. TABLA: RESPUESTAS SUS (System Usability Scale)
CREATE TABLE IF NOT EXISTS public.sus_responses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    q1 INTEGER NOT NULL CHECK (q1 BETWEEN 1 AND 5),
    q2 INTEGER NOT NULL CHECK (q2 BETWEEN 1 AND 5),
    q3 INTEGER NOT NULL CHECK (q3 BETWEEN 1 AND 5),
    q4 INTEGER NOT NULL CHECK (q4 BETWEEN 1 AND 5),
    q5 INTEGER NOT NULL CHECK (q5 BETWEEN 1 AND 5),
    q6 INTEGER NOT NULL CHECK (q6 BETWEEN 1 AND 5),
    q7 INTEGER NOT NULL CHECK (q7 BETWEEN 1 AND 5),
    q8 INTEGER NOT NULL CHECK (q8 BETWEEN 1 AND 5),
    q9 INTEGER NOT NULL CHECK (q9 BETWEEN 1 AND 5),
    q10 INTEGER NOT NULL CHECK (q10 BETWEEN 1 AND 5),
    sus_score DECIMAL(5, 2) NOT NULL,
    interpretation VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sus_responses_user_id ON public.sus_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_sus_responses_score ON public.sus_responses(sus_score);


-- 10. TABLA: ACTIVIDADES (Contenido multimedia / ejercicios de bienestar)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.actividades (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo text NOT NULL DEFAULT 'actividad-bienestar',
    slug text NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    embed_url text NOT NULL,
    indicaciones jsonb NOT NULL DEFAULT '[]'::jsonb,
    finalizacion jsonb NOT NULL DEFAULT '{}'::jsonb,
    eventos jsonb NOT NULL DEFAULT '{}'::jsonb,
    persistencia_recomendada jsonb NOT NULL DEFAULT '{}'::jsonb,
    manifest_original jsonb NOT NULL DEFAULT '{}'::jsonb,
    estado text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobada','rechazada','invalida')),
    source_type text NOT NULL DEFAULT 'zip' CHECK (source_type IN ('zip','url')),
    source_url text,
    source_filename text,
    created_by integer NULL REFERENCES public.users(id) ON DELETE SET NULL,
    categoria text NOT NULL DEFAULT 'Sin categoria',
    usos text NOT NULL DEFAULT 'asignar' CHECK (usos IN ('tecnicas', 'asignar')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (slug, embed_url)
);

CREATE INDEX IF NOT EXISTS idx_actividades_estado ON public.actividades(estado);
CREATE INDEX IF NOT EXISTS idx_actividades_slug ON public.actividades(slug);
CREATE INDEX IF NOT EXISTS idx_actividades_tipo ON public.actividades(tipo);
CREATE INDEX IF NOT EXISTS idx_actividades_categoria ON public.actividades(categoria);


-- 11. TABLA: ASIGNACIONES (bienestar_asignaciones)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'asignacion_estado') THEN
        CREATE TYPE asignacion_estado AS ENUM ('asignada', 'en_progreso', 'completada', 'cancelada');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.bienestar_asignaciones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actividad_id uuid NOT NULL REFERENCES public.actividades(id) ON DELETE CASCADE,
    psicologo_id integer NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    estudiante_id integer NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    estado asignacion_estado NOT NULL DEFAULT 'asignada',
    instrucciones_psicologo text,
    metadata jsonb DEFAULT '{}'::jsonb,
    fecha_asignacion timestamptz NOT NULL DEFAULT now(),
    fecha_limite timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_fecha_limite') THEN
        ALTER TABLE public.bienestar_asignaciones
            ADD CONSTRAINT chk_fecha_limite CHECK (fecha_limite IS NULL OR fecha_limite >= fecha_asignacion);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_bienestar_asignaciones_actividad ON public.bienestar_asignaciones(actividad_id);
CREATE INDEX IF NOT EXISTS idx_bienestar_asignaciones_psicologo ON public.bienestar_asignaciones(psicologo_id);
CREATE INDEX IF NOT EXISTS idx_bienestar_asignaciones_estudiante ON public.bienestar_asignaciones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_bienestar_asignaciones_estado ON public.bienestar_asignaciones(estado);

-- Trigger helper to keep `updated_at` in bienestar_asignaciones
CREATE OR REPLACE FUNCTION fn_update_updated_at_bienestar()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_asignaciones_update ON public.bienestar_asignaciones;
CREATE TRIGGER trg_asignaciones_update
BEFORE UPDATE ON public.bienestar_asignaciones
FOR EACH ROW
EXECUTE FUNCTION fn_update_updated_at_bienestar();


-- 12. TABLA: INTENTOS DE BIENESTAR
CREATE TABLE IF NOT EXISTS public.bienestar_intentos (
    id SERIAL PRIMARY KEY,
    intento_id TEXT NOT NULL,
    actividad_slug TEXT NOT NULL,
    estudiante_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    asignacion_id UUID REFERENCES public.bienestar_asignaciones(id) ON DELETE SET NULL,
    entrada_estudiante TEXT,
    respuesta_ia JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duracion_segundos INTEGER,
    culmino BOOLEAN DEFAULT false,
    resumen JSONB
);

CREATE INDEX IF NOT EXISTS ix_bienestar_intentos_intento_id
ON public.bienestar_intentos(intento_id);

CREATE INDEX IF NOT EXISTS ix_bienestar_intentos_estudiante_id
ON public.bienestar_intentos(estudiante_id);

INSERT INTO users (name, email, password, role, contacto, status, especialidad) 
VALUES (
  'Administrador del Sistema', 
  'admin@espe.edu.ec', 
  '$2b$10$cFMN5PmKdwPP3KE4BDnOf.4/Z6ukopxLKuXba6nzKc/lfOE3orEWO', -- hashed password (12345678)
  'ADMINISTRADOR', 
  '0999999999', 
  'Activo', 
  'Gestión de Plataforma'
);

-- =====================
-- END: README SQL
-- =====================


-- =====================
-- BEGIN: migrations/0001_add_categoria_usos.sql
-- =====================
-- Migration: add categoria and usos to actividades table (idempotente)
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS categoria text;
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS usos integer DEFAULT 0;
-- Optional: keep finalizacion JSON structure if missing
ALTER TABLE actividades ADD COLUMN IF NOT EXISTS finalizacion jsonb DEFAULT jsonb_build_object();

-- Ensure existing rows have defaults
UPDATE actividades SET categoria = COALESCE(categoria, 'Sin categoría') WHERE categoria IS NULL;
UPDATE actividades SET usos = COALESCE(usos, 0) WHERE usos IS NULL;


-- =====================
-- END: migrations/0001_add_categoria_usos.sql
-- =====================


-- =====================
-- BEGIN: src/infrastructure/database/migrations/0001_create_bienestar_intentos.sql
-- =====================
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

-- =====================
-- END: src/infrastructure/database/migrations/0001_create_bienestar_intentos.sql
-- =====================
