ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS cancel_reason TEXT;