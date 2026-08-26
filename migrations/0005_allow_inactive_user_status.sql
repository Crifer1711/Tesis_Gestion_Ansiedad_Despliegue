-- Keep user status values aligned with registration, verification, and admin actions.
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_status_check;

ALTER TABLE public.users
ADD CONSTRAINT users_status_check
CHECK (status IN ('pendiente', 'activo', 'aprobado', 'inactivo'));