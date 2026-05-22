import pool from "@/infrastructure/database/db";
import { Activity } from "@/domain/dtos/activity.dto";

export class ActivityRepository {
  async getAllActivities(): Promise<Activity[]> {
    const client = await pool.connect();
    try {
      const res = await client.query(`
        SELECT
          id,
          titulo as nombre,
          categoria as categoria_raw,
          tipo as tipo_raw,
          embed_url,
          COALESCE((finalizacion->>'duracion_minima_segundos'), '') as duracion,
          0 as usos,
          estado
        FROM actividades
        ORDER BY titulo ASC
      `);
      // Map DB rows into the expected DTO shape
      return res.rows.map((r: any) => ({
        id: r.id,
        nombre: r.nombre || '',
        categoria: (() => {
          const cat = (r.categoria_raw || '').toString().trim();
          if (cat && cat.toLowerCase() !== 'sin categoría' && cat.toLowerCase() !== 'sin categoria') return cat;
          const t = (r.tipo_raw || '').toString().toLowerCase();
          if (t.includes('respir')) return 'Respiración';
          if (t.includes('visual')) return 'Visualizacion';
          if (t.includes('sonid')) return 'Sonidos';
          if (t.includes('interaccion') || t.includes('interacción')) return 'Interaccion';
          // fallback to a friendly label
          return 'Otros';
        })(),
        duracion: String(r.duracion || ''),
        usos: r.usos || 0,
        // Map DB estado to UI-friendly labels
        estado: (r.estado === 'aprobada') ? 'Aprobada' : (r.estado === 'rechazada') ? 'Rechazada' : 'Pendiente',
        embed_url: r.embed_url || null
      }));
    } catch (error) {
      console.error("Error en ActivityRepository:", error);
      return [];
    } finally {
      client.release();
    }
  }
}