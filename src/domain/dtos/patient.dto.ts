// domain/dtos/patient.dto.ts
export interface Patient {
  id: string;
  name: string;
  lastname?: string;
  email: string;
  contacto: string;
  fecha_registro: string;
  estado: 'Activo' | 'Inactivo' | 'Pendiente';
}

export interface CreatePatientData {
  name: string;
  lastname: string;
  email: string;
  contacto: string;
  password: string;
}

export interface UpdatePatientData {
  name: string;
  lastname: string;
  email: string;
  contacto: string;
  estado: 'Activo' | 'Inactivo' | 'Pendiente';
}