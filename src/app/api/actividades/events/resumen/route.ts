import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/auth.options';
import pool from '@/infrastructure/database/db';

/**
 * PATCH /api/actividades/events/resumen
 * Actualiza el campo `resumen` de un intento con la emoción seleccionada por el paciente.
 * Body: { intento_id: string, emocion: string, categoria: string }
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'PACIENTE') {
      return NextResponse.json({ error: 'Solo pacientes pueden actualizar el resumen' }, { status: 403 });
    }

    const body = await req.json();
    const { intento_id, emocion, categoria } = body;

    if (!intento_id || !emocion) {
      return NextResponse.json({ error: 'Faltan campos requeridos: intento_id y emocion' }, { status: 400 });
    }

    const estudianteId = Number(session.user.id as unknown as string);
    if (Number.isNaN(estudianteId)) {
      return NextResponse.json({ error: 'Id de estudiante inválido' }, { status: 400 });
    }

    const resumenData = {
      satisfaccion_paciente: {
        emocion: String(emocion),
        categoria: String(categoria || ''),
        registrado_en: new Date().toISOString(),
      },
    };

    const sql = `
      UPDATE bienestar_intentos
      SET resumen = CASE
        WHEN resumen IS NULL THEN $1::jsonb
        ELSE resumen || $1::jsonb
      END
      WHERE intento_id = $2 AND estudiante_id = $3
      RETURNING *
    `;

    const result = await pool.query(sql, [
      JSON.stringify(resumenData),
      String(intento_id),
      estudianteId,
    ]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Intento no encontrado o no pertenece al paciente' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error actualizando resumen de intento:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
