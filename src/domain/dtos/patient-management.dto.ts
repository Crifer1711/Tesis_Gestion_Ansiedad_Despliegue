// src/domain/dtos/patient-management.dto.ts

export interface PatientListItemDTO {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  ultimaCita: string;
  lastLogin?: string;
}

export interface PatientDetailDTO extends PatientListItemDTO {
  stats: {
    citas: number;
    fichasMedicas: number;
    actividades: number;
    test: number;
  };
}