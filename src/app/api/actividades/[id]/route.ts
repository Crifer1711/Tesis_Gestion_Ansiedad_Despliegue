import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/auth.options';
import db from '@/infrastructure/database/db';

export async function DELETE(request: Request, { params }: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Debes estar autenticado' }, { status: 401 });
    if (session.user.role !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const resolvedParams = typeof params?.then === 'function' ? await params : params;
    const id = resolvedParams?.id;
    if (!id) return NextResponse.json({ error: 'Id requerido' }, { status: 400 });

    const res = await db.query('DELETE FROM actividades WHERE id = $1', [id]);
    if (res.rowCount === 0) return NextResponse.json({ error: 'Actividad no encontrada' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting actividad:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Debes estar autenticado' }, { status: 401 });
    if (session.user.role !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const resolvedParams = typeof params?.then === 'function' ? await params : params;
    const id = resolvedParams?.id;
    if (!id) return NextResponse.json({ error: 'Id requerido' }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const { titulo, descripcion, indicaciones, embed_url, tipo, categoria, duracion, usos, estado } = body;

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (titulo !== undefined) { updates.push(`titulo = $${idx++}`); values.push(titulo); }
    if (descripcion !== undefined) { updates.push(`descripcion = $${idx++}`); values.push(descripcion); }
    if (indicaciones !== undefined) { updates.push(`indicaciones = $${idx++}`); values.push(JSON.stringify(indicaciones)); }
    if (embed_url !== undefined) { updates.push(`embed_url = $${idx++}`); values.push(embed_url); }
    if (tipo !== undefined) { updates.push(`tipo = $${idx++}`); values.push(tipo); }
    if (categoria !== undefined) { updates.push(`categoria = $${idx++}`); values.push(categoria); }
    if (estado !== undefined) { updates.push(`estado = $${idx++}`); values.push(estado.toLowerCase()); }
    // duracion stored inside finalizacion JSON; we will set finalizacion to a minimal object containing duracion_minima_segundos
    if (duracion !== undefined) { updates.push(`finalizacion = $${idx++}`); values.push(JSON.stringify({ duracion_minima_segundos: String(duracion) })); }
    if (usos !== undefined) { updates.push(`usos = $${idx++}`); values.push(usos); }

    if (updates.length === 0) return NextResponse.json({ error: 'Nada para actualizar' }, { status: 400 });

    const sql = `UPDATE actividades SET ${updates.join(',')}, updated_at = now() WHERE id = $${idx} RETURNING id`;
    values.push(id);

    const res = await db.query(sql, values);
    if (res.rowCount === 0) return NextResponse.json({ error: 'Actividad no encontrada' }, { status: 404 });
    return NextResponse.json({ success: true, id: res.rows[0].id });
  } catch (err) {
    console.error('Error patch actividad:', err);
    // Detect missing column error and return helpful message
    // Postgres error code 42703 = undefined_column
    if ((err as any)?.code === '42703') {
      return NextResponse.json({ error: 'Error de BD: columna no encontrada. Ejecuta la migración `migrations/0001_add_categoria_usos.sql` para agregar las columnas necesarias.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
