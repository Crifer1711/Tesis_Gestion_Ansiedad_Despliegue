import pool from "@/infrastructure/database/db";
import { Patient } from "@/domain/dtos/patient.dto";

const toUiStatus = (status: string | null | undefined) => {
  const normalized = (status || '').toString().trim().toLowerCase();
  if (normalized === 'activo' || normalized === 'aprobado') return 'Activo';
  if (normalized === 'inactivo' || normalized === 'desactivado' || normalized === 'rechazado') return 'Inactivo';
  return 'Pendiente';
};

export class PatientRepository {
  async getAll(): Promise<Patient[]> {
    const client = await pool.connect();
    try {
      // Consultamos a los usuarios con rol 'ESTUDIANTE'
      // Usamos COALESCE para evitar errores si las columnas nuevas están vacías
      const res = await client.query(`
        SELECT 
          id, 
          name, 
          email,
          contacto, 
          status,
          -- Formateamos la fecha directamente desde SQL
        TO_CHAR(created_at, 'DD/MM/YY') as fecha_registro        
          FROM users 
        WHERE role = 'PACIENTE'
        ORDER BY created_at DESC
      `);

      return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        contacto: row.contacto || "N/A", // Dato ejemplo hasta que agregues la columna
        fecha_registro: row.fecha_registro,
        // Mapear estado de BD a etiquetas UI
        estado: toUiStatus(row.status)
      }));
    } catch (error: unknown) {
      console.error("Error en PatientRepository.getAll:", error);
      return [];
    } finally {
      client.release();
    }
  }
}