import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/auth.options';
import db from '@/infrastructure/database/db';

export async function PATCH(request: Request, { params }: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Debes estar autenticado' }, { status: 401 });
    if (session.user.role !== 'ADMINISTRADOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // In Next.js params may be a promise in some runtimes — ensure we unwrap
    const resolvedParams = typeof params?.then === 'function' ? await params : params;
    const id = resolvedParams?.id;
    const body = await request.json().catch(() => ({}));
    const { estado } = body;
    if (!estado || !['aprobada','rechazada','pendiente'].includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    const res = await db.query('UPDATE actividades SET estado = $1, updated_at = now() WHERE id = $2 RETURNING id, estado', [estado, id]);
    if (res.rowCount === 0) return NextResponse.json({ error: 'Actividad no encontrada' }, { status: 404 });

    return NextResponse.json({ success: true, id: res.rows[0].id, estado: res.rows[0].estado });
  } catch (err) {
    console.error('Error updating actividad status:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
