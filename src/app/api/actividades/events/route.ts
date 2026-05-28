import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/auth.options';
import { insertInteraction, markAttemptCompleted } from '@/infrastructure/repositories/attempt.repository';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'PACIENTE') return NextResponse.json({ error: 'Solo pacientes pueden reportar interacciones' }, { status: 403 });

    const body = await req.json();
    const type = body?.type;
    const estudianteId = Number(session.user.id as unknown as string);
    if (Number.isNaN(estudianteId)) return NextResponse.json({ error: 'Id inválido' }, { status: 400 });

    if (type === 'BIENESTAR_ACTIVIDAD_INTERACCION') {
      const { intento_id, actividad_slug, entrada_estudiante, respuesta_ia, asignacion_id } = body;
      if (!intento_id || !actividad_slug) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });

      const saved = await insertInteraction({
        intento_id: String(intento_id),
        actividad_slug: String(actividad_slug),
        estudiante_id: estudianteId,
        // `asignacion_id` is UUID in DB; accept string UUID or null
        asignacion_id: asignacion_id ?? undefined,
        entrada_estudiante: entrada_estudiante ?? null,
        respuesta_ia: respuesta_ia ?? null,
      });

      return NextResponse.json({ success: true, data: saved });
    }

    if (type === 'BIENESTAR_ACTIVIDAD_COMPLETADA') {
      const { intento_id, duracion_segundos, resumen, completed_at, actividad_slug, asignacion_id, entrada_estudiante, respuesta_ia } = body;
      if (!intento_id) return NextResponse.json({ error: 'Falta intento_id' }, { status: 400 });

      const completedAt = completed_at ? new Date(completed_at) : new Date();
      const updated = await markAttemptCompleted(
        String(intento_id),
        estudianteId,
        completedAt.toISOString(),
        duracion_segundos ?? null,
        resumen ?? null,
        entrada_estudiante ?? null,
        respuesta_ia ?? null
      );

      if (!updated) {
        // Si no existe el intento, intentamos crear uno mínimo (si se proporcionó actividad_slug)
        if (actividad_slug) {
          await insertInteraction({
            intento_id: String(intento_id),
            actividad_slug: String(actividad_slug),
            estudiante_id: estudianteId,
            asignacion_id: asignacion_id ?? undefined,
            entrada_estudiante: entrada_estudiante ?? null,
            respuesta_ia: respuesta_ia ?? null,
          });
          const updated2 = await markAttemptCompleted(
            String(intento_id),
            estudianteId,
            completedAt.toISOString(),
            duracion_segundos ?? null,
            resumen ?? null,
            entrada_estudiante ?? null,
            respuesta_ia ?? null
          );
          if (updated2) return NextResponse.json({ success: true, data: updated2 });
        }
        return NextResponse.json({ error: 'Intento no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ error: 'Tipo no soportado' }, { status: 400 });
  } catch (err) {
    console.error('Error processing actividad event:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
