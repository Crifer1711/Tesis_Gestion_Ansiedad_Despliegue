import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/auth.options';
import pool from '@/infrastructure/database/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'PACIENTE') return NextResponse.json({ error: 'Solo pacientes' }, { status: 403 });

    const pacienteId = Number(session.user.id as unknown as string);
    if (Number.isNaN(pacienteId)) return NextResponse.json({ error: 'Id inválido' }, { status: 400 });

    const sql = `
      SELECT ba.id, ba.actividad_id, a.titulo, a.descripcion, a.embed_url, ba.instrucciones_psicologo, ba.estado, ba.fecha_asignacion, ba.fecha_limite, ba.created_at
      FROM bienestar_asignaciones ba
      LEFT JOIN actividades a ON ba.actividad_id = a.id
      WHERE ba.estudiante_id = $1
      ORDER BY ba.created_at DESC
    `;
    const res = await pool.query(sql, [pacienteId]);

    return NextResponse.json({ success: true, data: res.rows });
  } catch (err) {
    console.error('Error fetching asignaciones paciente:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
