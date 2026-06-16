ALTER TABLE public.appointments
    DROP CONSTRAINT IF EXISTS appointments_psychologist_id_appointment_date_appointment_time_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_active_slot
    ON public.appointments(psychologist_id, appointment_date, appointment_time)
    WHERE status NOT IN ('Cancelada', 'Rechazada');