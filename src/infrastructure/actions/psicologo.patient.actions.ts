"use server";
import pool from "../database/db";
import { PatientListItemDTO } from "@/domain/dtos/patient-management.dto";
import { PgPatientRepository } from "../repositories/PgPatientRepository";

export async function getPatientsForPsychologistAction(psychologistId: number): Promise<{ success: boolean; data: PatientListItemDTO[] }> {
  // 1. Agregamos u.last_login a la consulta
  const query = `
    SELECT 
      u.id, 
      u.name as nombre, 
      u.email, 
      u.contacto as telefono,
      u.last_login, -- <--- NUEVO CAMPO
      MAX(a.appointment_date) as ultima_cita
    FROM users u
    INNER JOIN appointments a ON u.id = a.patient_id
    WHERE a.psychologist_id = $1 
    AND u.role = 'PACIENTE'
    GROUP BY u.id, u.name, u.email, u.contacto, u.last_login -- <--- Agregar al GROUP BY
    ORDER BY nombre ASC;
  `;

  try {
    const result = await pool.query(query, [psychologistId]);
    
    const patients: PatientListItemDTO[] = result.rows.map(row => ({
      id: row.id.toString(),
      nombre: row.nombre,
      email: row.email,
      telefono: row.telefono || "Sin número",
      ultimaCita: row.ultima_cita 
        ? new Date(row.ultima_cita).toLocaleDateString('es-EC') 
        : "Sin citas",
      // 2. Mapeamos el nuevo campo para la interfaz
      lastLogin: row.last_login 
        ? new Date(row.last_login).toLocaleString('es-EC', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })
        : "Nunca"
    }));

    return { success: true, data: patients };
  } catch (error) {
    console.error("Error en getPatientsForPsychologistAction:", error);
    return { success: false, data: [] };
  }
}
// Función para obtener las estadísticas del Dashboard
export async function getPsychologistStatsAction(psychologistId: number) {
  try {
    const query = `
      SELECT 
        (SELECT COUNT(DISTINCT patient_id) FROM appointments WHERE psychologist_id = $1) as total_pacientes,
        (SELECT COUNT(*) FROM appointments WHERE psychologist_id = $1 AND status = 'Pendiente') as citas_pendientes,
        (SELECT COUNT(*) FROM appointments WHERE psychologist_id = $1 AND status = 'Aceptada') as citas_aceptadas;
    `;
    const result = await pool.query(query, [psychologistId]);
    return {
      success: true,
      stats: {
        pacientes: result.rows[0].total_pacientes || "0",
        pendientes: result.rows[0].citas_pendientes || "0",
        aceptadas: result.rows[0].citas_aceptadas || "0"
      }
    };
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return { success: false, stats: { pacientes: "0", pendientes: "0", aceptadas: "0" } };
  }
}
// src/infrastructure/actions/psicologo.patient.actions.ts
export async function getDetailedPatientDataAction(patientId: string) {
  try {
    const repository = new PgPatientRepository();
    const data = await repository.getPatientFullDetails(patientId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Error al cargar expediente" };
  }
}