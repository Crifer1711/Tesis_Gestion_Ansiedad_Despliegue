-- Migration: change usos from integer to text (tecnicas/asignar)
ALTER TABLE actividades ALTER COLUMN usos TYPE text
  USING CASE WHEN usos = 0 THEN 'asignar' ELSE 'tecnicas' END;
ALTER TABLE actividades ALTER COLUMN usos SET DEFAULT 'asignar';
ALTER TABLE actividades ADD CONSTRAINT actividades_usos_check CHECK (usos IN ('tecnicas', 'asignar'));
