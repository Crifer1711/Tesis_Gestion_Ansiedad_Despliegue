import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/auth.options';
import pool from '@/infrastructure/database/db';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'PSICOLOGO') return NextResponse.json({ error: 'Solo psicólogo puede asignar actividades' }, { status: 403 });

    const { id: actividadId } = await params; // uuid
    // verify activity exists
    const actCheck = await pool.query('SELECT id FROM actividades WHERE id = $1', [actividadId]);
    if (actCheck.rowCount === 0) return NextResponse.json({ error: 'Actividad no encontrada' }, { status: 404 });
    const body = await req.json();
    const patientInput = body?.patient?.toString?.().trim();
    const instrucciones = body?.instrucciones || null;
    const fecha_limite = body?.fecha_limite || null;

    if (!patientInput) return NextResponse.json({ error: 'Paciente requerido' }, { status: 400 });

    // Resolve student id: try numeric id first, otherwise treat as email
    let estudianteId: number | null = null;
    if (/^\d+$/.test(patientInput)) {
      estudianteId = Number(patientInput);
      // verify exists and role=PACIENTE
      const r = await pool.query('SELECT id FROM users WHERE id = $1 AND role = $2', [estudianteId, 'PACIENTE']);
      if (r.rowCount === 0) return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    } else {
      const r = await pool.query('SELECT id FROM users WHERE email = $1 AND role = $2', [patientInput, 'PACIENTE']);
      if (r.rowCount === 0) return NextResponse.json({ error: 'Paciente no encontrado por email' }, { status: 404 });
      estudianteId = r.rows[0].id;
    }

    const psicologoId = Number(session.user.id as unknown as string);
    if (Number.isNaN(psicologoId)) return NextResponse.json({ error: 'Id de psicólogo inválido en sesión' }, { status: 400 });

    // Insert assignment
    const insertSql = `
      INSERT INTO bienestar_asignaciones (actividad_id, psicologo_id, estudiante_id, estado, instrucciones_psicologo, fecha_limite)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, actividad_id, psicologo_id, estudiante_id, estado, fecha_asignacion, fecha_limite;
    `;
    const vals = [actividadId, psicologoId, estudianteId, 'asignada', instrucciones, fecha_limite];
    const res = await pool.query(insertSql, vals);

    return NextResponse.json({ success: true, data: res.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('Error asignando actividad:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
