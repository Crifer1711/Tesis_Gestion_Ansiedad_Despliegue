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

// --- AGREGA ESTO AQUÍ ---
export interface IPsychologistRepository {
  /**
   * Define el contrato para obtener los datos del panel del psicólogo
   * basándose en el diseño del mockup
   */
  getDashboardData(psychologistId: string): Promise<PsychologistDashboardDTO>;
}