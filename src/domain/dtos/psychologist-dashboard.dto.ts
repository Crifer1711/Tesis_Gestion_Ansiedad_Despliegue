// domain/dtos/psychologist-dashboard.dto.ts
export interface AppointmentDTO {
  hora: string;
  paciente: string;     
  tipo: string;
  estado: string;
}

export interface ActivityDTO {
  estudianteId: string | number;
  paciente: string;      
  asignadas: number;
  realizadas: number;
  pendientes: number;
}

export interface PsychologistDashboardDTO {
  stats: {
    totalPatients: number;
    pendingAppointments: number;
    acceptedAppointments: number;
    todayAppointments: number;
  };
  nextAppointments: AppointmentDTO[];
  recentActivities: ActivityDTO[];
}

export interface IPsychologistRepository {
  getDashboardData(psychologistId: string): Promise<PsychologistDashboardDTO>;
}