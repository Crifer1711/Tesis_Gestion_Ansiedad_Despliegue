import pool from '@/infrastructure/database/db';

export interface InteractionPayload {
  intento_id: string;
  actividad_slug: string;
  estudiante_id: number;
  // `bienestar_asignaciones.id` is UUID in the DB, accept string UUID here
  asignacion_id?: string | null;
  entrada_estudiante?: string | null;
  respuesta_ia?: any;
}

export async function insertInteraction(payload: InteractionPayload) {
  const sql = `
    INSERT INTO bienestar_intentos (intento_id, actividad_slug, estudiante_id, asignacion_id, entrada_estudiante, respuesta_ia, created_at)
    VALUES ($1,$2,$3,$4,$5,$6, now())
    RETURNING *
  `;
  const values = [
    payload.intento_id,
    payload.actividad_slug,
    payload.estudiante_id,
    payload.asignacion_id || null,
    payload.entrada_estudiante || null,
    payload.respuesta_ia ? JSON.stringify(payload.respuesta_ia) : null,
  ];

  const res = await pool.query(sql, values);
  return res.rows[0];
}

export async function markAttemptCompleted(
  intento_id: string,
  estudiante_id: number,
  completedAt: string | Date,
  duracion_segundos?: number | null,
  resumen?: any,
  entrada_estudiante?: string | null,
  respuesta_ia?: any
) {
  const sql = `
    UPDATE bienestar_intentos
    SET completed_at = $3,
        duracion_segundos = $4,
        culmino = true,
        resumen = $5,
        entrada_estudiante = COALESCE($6, entrada_estudiante),
        respuesta_ia = COALESCE($7, respuesta_ia)
    WHERE intento_id = $1 AND estudiante_id = $2
    RETURNING *
  `;
  const values = [
    intento_id,
    estudiante_id,
    completedAt,
    duracion_segundos || null,
    resumen ? JSON.stringify(resumen) : null,
    entrada_estudiante || null,
    respuesta_ia ? JSON.stringify(respuesta_ia) : null
  ];
  const res = await pool.query(sql, values);
  const updatedAttempt = res.rows[0];

  if (updatedAttempt && updatedAttempt.asignacion_id) {
    const updateAsignacionSql = `
      UPDATE bienestar_asignaciones
      SET estado = 'completada'
      WHERE id = $1 AND estudiante_id = $2
    `;
    await pool.query(updateAsignacionSql, [updatedAttempt.asignacion_id, estudiante_id]);
  }

  return updatedAttempt;
}

export async function findAttemptById(intento_id: string, estudiante_id?: number) {
  const values: any[] = [intento_id];
  let sql = `SELECT * FROM bienestar_intentos WHERE intento_id = $1`;
  if (typeof estudiante_id === 'number') {
    sql += ` AND estudiante_id = $2`;
    values.push(estudiante_id);
  }
  const res = await pool.query(sql, values);
  return res.rows[0];
}
