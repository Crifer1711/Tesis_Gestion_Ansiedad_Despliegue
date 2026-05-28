import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/auth.options';
import pool from '@/infrastructure/database/db';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'PSICOLOGO') return NextResponse.json({ error: 'Solo psicólogos' }, { status: 403 });

    const url = new URL(req.url);
    const estudianteIdStr = url.searchParams.get('estudianteId');
    if (!estudianteIdStr) return NextResponse.json({ error: 'Falta estudianteId' }, { status: 400 });
    const estudianteId = Number(estudianteIdStr);
    if (Number.isNaN(estudianteId)) return NextResponse.json({ error: 'estudianteId inválido' }, { status: 400 });

    const sql = `SELECT * FROM bienestar_intentos WHERE estudiante_id = $1 ORDER BY created_at DESC`;
    const res = await pool.query(sql, [estudianteId]);
    return NextResponse.json({ success: true, data: res.rows });
  } catch (err) {
    console.error('Error fetching intentos for psicologo:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
