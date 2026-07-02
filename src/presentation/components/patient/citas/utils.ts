import { Cita, AppointmentStatus } from './types';

export const HORAS = Array.from({ length: 12 }, (_, index) => {
  const hour = 7 + index;
  return `${String(hour).padStart(2, '0')}:00`;
});

export const MAX_MOTIVO_WORDS = 200;

export const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const countWords = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).filter(Boolean).length;
};

export const parseDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const normalizeAppointmentStatus = (status: string | null | undefined): AppointmentStatus => {
  const value = (status || '').trim().toLowerCase();

  if (value === 'aceptada') {
    return 'Aceptada';
  }

  if (value === 'cancelada') {
    return 'Cancelada';
  }

  if (value === 'rechazada') {
    return 'Rechazada';
  }

  return 'Pendiente';
};

export const getAppointmentDateTime = (fecha: string, hora: string) => {
  const [year, month, day] = fecha.split('-').map(Number);
  const [hour, minute] = hora.split(':').map(Number);
  return new Date(year, month - 1, day, hour || 0, minute || 0, 0, 0);
};

export const getEstadoColor = (estado: Cita['estado']) => {
  switch (estado) {
    case 'Aceptada':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'Pendiente':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'Cancelada':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'Rechazada':
      return 'bg-rose-100 text-rose-700 border-rose-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};