// src/infrastructure/repositories/pg-psychologist.repository.ts
import pool from "../database/db";
import { IPsychologistRepository, PsychologistDashboardDTO } from "../../domain/dtos/psychologist-dashboard.dto";

export class PgPsychologistRepository implements IPsychologistRepository {
  async getDashboardData(psychologistId: string): Promise<PsychologistDashboardDTO> {
    
    // 1. Consulta para las tarjetas de estadísticas
    const statsQuery = `
      SELECT 
        (SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE psychologist_id = $1) as total_patients,
        (SELECT COUNT(*) FROM appointments WHERE psychologist_id = $1 AND status = 'Pendiente') as pending_appointments,
        (SELECT COUNT(*) FROM appointments WHERE psychologist_id = $1 AND status = 'Aceptada') as accepted_appointments,
        (SELECT COUNT(*) FROM appointments WHERE psychologist_id = $1 AND appointment_date = CURRENT_DATE AND status <> 'Cancelada') as today_appointments
    `;
    const statsRes = await pool.query(statsQuery, [psychologistId]);

    // 2. Consulta para "PRÓXIMAS CITAS" con el nombre del paciente
    const appointmentsQuery = `
      SELECT 
        a.appointment_time as hora, 
        u.name as paciente, 
        a.modality as tipo, 
        a.status as estado
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      WHERE a.psychologist_id = $1 AND a.appointment_date >= CURRENT_DATE
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
      LIMIT 5
    `;
    const appointmentsRes = await pool.query(appointmentsQuery, [psychologistId]);

    // 3. Consulta para "ACTIVIDADES" agregadas por paciente
    const activitiesQuery = `
      SELECT 
        u.id as "estudianteId",
        u.name as paciente,
        COUNT(ba.id)::int as asignadas,
        COUNT(CASE WHEN ba.estado = 'completada' THEN 1 END)::int as realizadas,
        COUNT(CASE WHEN ba.estado != 'completada' THEN 1 END)::int as pendientes
      FROM bienestar_asignaciones ba
      JOIN users u ON ba.estudiante_id = u.id
      WHERE ba.psicologo_id = $1
      GROUP BY u.id, u.name
      ORDER BY u.name ASC
    `;
    const activitiesRes = await pool.query(activitiesQuery, [psychologistId]);

    return {
      stats: {
        totalPatients: Number.parseInt(statsRes.rows[0].total_patients || '0', 10),
        pendingAppointments: Number.parseInt(statsRes.rows[0].pending_appointments || '0', 10),
        acceptedAppointments: Number.parseInt(statsRes.rows[0].accepted_appointments || '0', 10),
        todayAppointments: Number.parseInt(statsRes.rows[0].today_appointments || '0', 10),
      },
      nextAppointments: appointmentsRes.rows, // Aquí ya vienen los datos reales de la DB
      recentActivities: activitiesRes.rows
    };
  }
}