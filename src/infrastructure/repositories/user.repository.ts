import pool from "@/infrastructure/database/db";
import { UserData } from "@/presentation/components/admin/ReportManagement";

export class UserRepository {
  async getAllForReports(): Promise<UserData[]> {
    const client = await pool.connect();
    try {
      // Consultamos la tabla users sin filtros para tener la data de todos los roles
      const res = await client.query(`
        SELECT 
          id, 
          name, 
          email,
          contacto, 
          status,
          role,
          -- Usamos tu formato de fecha estándar
          TO_CHAR(created_at, 'DD/MM/YY') as fecha_registro         
        FROM users 
        ORDER BY created_at DESC
      `);

      return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        contacto: row.contacto || "N/A", 
        // Map DB status values to UI-friendly labels
        status: (row.status === 'aprobado') ? 'Activo' : (row.status === 'pendiente' ? 'Pendiente' : row.status || 'Pendiente'),
        role: row.role,
        fecha_registro: row.fecha_registro
      }));
    } catch (error: unknown) {
      console.error("Error en UserRepository.getAllForReports:", error);
      return [];
    } finally {
      client.release();
    }
  }
}