import pool from "@/infrastructure/database/db";
import { Psychologist } from "@/domain/dtos/psychologist.dto";

const toUiStatus = (status: string | null | undefined) => {
  const normalized = (status || '').toString().trim().toLowerCase();
  if (normalized === 'activo' || normalized === 'aprobado') return 'Activo';
  if (normalized === 'inactivo' || normalized === 'desactivado' || normalized === 'rechazado') return 'Inactivo';
  return 'Pendiente';
};

export class PsychologistRepository {
  async getAll(): Promise<Psychologist[]> {
    const client = await pool.connect();
    try {
      // Consultamos solo a los que tienen rol PSICOLOGO
      // Si aún no tienes las columnas contacto/especialidad, las simulamos con strings
      const res = await client.query(`
        SELECT 
          id, 
          name, 
          email,
          contacto, 
          status        
          FROM users 
        WHERE role = 'PSICOLOGO'
        ORDER BY created_at DESC
      `);

      return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        contacto: row.contacto || "N/A", // Dato ejemplo hasta que agregues la columna
        especialidad: "N/A", // Dato ejemplo hasta que agregues la columna
        pacientes: 0,
        // Mapear valores de BD a etiquetas UI
        estado: toUiStatus(row.status)
      }));
    } finally {
      client.release();
    }
  }
}