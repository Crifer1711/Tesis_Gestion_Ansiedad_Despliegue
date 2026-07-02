export type AppointmentStatus = 'Pendiente' | 'Aceptada' | 'Rechazada' | 'Cancelada';

export type AppointmentMode = 'Presencial' | 'Virtual';

export interface Cita {
  id: string;
  fecha: string;
  hora: string;
  psicologo: string;
  modalidad: AppointmentMode;
  motivo: string;
  estado: AppointmentStatus;
  requestLink?: boolean;
  meetingLink?: string | null;
  cancelReason?: string | null;
}

export interface Psicologo {
  id: string;
  name: string;
  email: string;
}

export interface AppointmentFormData {
  psicologo: string;
  fecha: string;
  hora: string;
  modalidad: AppointmentMode;
  motivo: string;
}

export type AppointmentTab = 'proximas' | 'historial';

export type HistoryFilter = 'Todas' | 'Pendiente' | 'Aceptada' | 'Rechazada' | 'Cancelada';

export interface AppointmentApiItem {
  id: string;
  fecha: string;
  hora: string;
  modalidad: AppointmentMode;
  motivo?: string;
  status?: string | null;
  psychologistName?: string;
  requestLink?: boolean;
  meetingLink?: string | null;
  cancelReason?: string | null;
}