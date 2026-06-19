import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/auth.options';
import pool from '@/infrastructure/database/db';

type NotificationItem = {
  id: string;
  type: 'task' | 'appointment';
  title: string;
  message: string;
  created_at: string;
};

const getAppointmentColumnFlags = async () => {
  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'appointments'`
  );

  const columns = new Set(result.rows.map((row: any) => row.column_name));
  return {
    hasUpdatedByRole: columns.has('status_updated_by_role'),
  };
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const role = session.user.role;
    const userId = String(session.user.id || '');
    const items: NotificationItem[] = [];
    const { hasUpdatedByRole } = await getAppointmentColumnFlags();

    if (role === 'PACIENTE') {
      const statusUpdatedByRoleSelect = hasUpdatedByRole
        ? 'ap.status_updated_by_role'
        : 'NULL::text';
      const cancelMessagePrefix = hasUpdatedByRole
        ? "COALESCE(ap.status_updated_by_role, '')"
        : "''";

      const tasksRes = await pool.query(
        `SELECT ba.id::text AS id, a.titulo AS title, ba.created_at,
                'Te asignaron una nueva tarea: ' || COALESCE(a.titulo, 'Actividad') AS message
         FROM bienestar_asignaciones ba
         LEFT JOIN actividades a ON a.id = ba.actividad_id
         WHERE ba.estudiante_id = $1 AND ba.estado = 'asignada'
         ORDER BY ba.created_at DESC
         LIMIT 5`,
        [userId]
      );

      const appointmentsRes = await pool.query(
        `SELECT ap.id::text AS id, ap.status,
          COALESCE(p.name, 'Psicólogo') AS title,
                ap.updated_at AS created_at,
                ${statusUpdatedByRoleSelect} AS status_updated_by_role,
                ap.cancel_reason,
                ap.meeting_link,
                CASE
                  WHEN ap.status = 'Cancelada' AND ${cancelMessagePrefix} = 'PSICOLOGO' THEN
                    'La psicóloga canceló tu cita del ' || TO_CHAR(ap.appointment_date, 'DD/MM/YYYY') || ' a las ' || ap.appointment_time || '. Motivo: ' || COALESCE(ap.cancel_reason, 'Sin motivo especificado')
                  WHEN ap.status = 'Cancelada' AND ${cancelMessagePrefix} = 'ADMINISTRADOR' THEN
                    'La administración canceló tu cita del ' || TO_CHAR(ap.appointment_date, 'DD/MM/YYYY') || ' a las ' || ap.appointment_time || '. Motivo: ' || COALESCE(ap.cancel_reason, 'Sin motivo especificado')
                  WHEN ap.status = 'Aceptada' AND ap.meeting_link IS NOT NULL THEN 'Tu cita con ' || COALESCE(p.name, 'tu psicólogo') || ' fue aceptada para ' || TO_CHAR(ap.appointment_date, 'DD/MM/YYYY') || ' a las ' || ap.appointment_time || ' y ya tienes disponible el enlace de la sesión'
                  WHEN ap.status = 'Aceptada' THEN 'Tu cita con ' || COALESCE(p.name, 'tu psicólogo') || ' fue aceptada para ' || TO_CHAR(ap.appointment_date, 'DD/MM/YYYY') || ' a las ' || ap.appointment_time
                  WHEN ap.status = 'Rechazada' THEN 'La psicóloga rechazó tu cita del ' || TO_CHAR(ap.appointment_date, 'DD/MM/YYYY') || ' a las ' || ap.appointment_time
                  ELSE 'Actualización en tu cita con ' || COALESCE(p.name, 'tu psicólogo')
                END AS message
         FROM appointments ap
         LEFT JOIN users p ON p.id = ap.psychologist_id
         WHERE ap.patient_id = $1
           AND (
             ap.status IN ('Aceptada', 'Rechazada')
             ${hasUpdatedByRole ? "OR (ap.status = 'Cancelada' AND COALESCE(ap.status_updated_by_role, '') IN ('PSICOLOGO', 'ADMINISTRADOR'))" : ''}
           )
         ORDER BY ap.updated_at DESC
         LIMIT 5`,
        [userId]
      );

      items.push(
        ...tasksRes.rows.map((row) => ({
          id: `task-${row.id}`,
          type: 'task' as const,
          title: row.title || 'Tarea asignada',
          message: row.message,
          created_at: row.created_at,
        })),
        ...appointmentsRes.rows.map((row) => ({
          id: `apt-${row.id}-${row.status}-${new Date(String(row.created_at)).getTime()}`,
          type: 'appointment' as const,
          title: row.title || 'Cita actualizada',
          message: row.message,
          created_at: row.created_at,
        }))
      );
    } else if (role === 'ADMINISTRADOR') {
      const tasksRes = await pool.query(
        `SELECT ba.id::text AS id, a.titulo AS title, ba.created_at,
                'Nueva asignación: ' || COALESCE(a.titulo, 'Actividad') || ' para ' || COALESCE(u.name, 'paciente') AS message
         FROM bienestar_asignaciones ba
         LEFT JOIN actividades a ON a.id = ba.actividad_id
         LEFT JOIN users u ON u.id = ba.estudiante_id
         WHERE ba.estado = 'asignada'
         ORDER BY ba.created_at DESC
         LIMIT 5`
      );

      const appointmentsRes = await pool.query(
        `SELECT ap.id::text AS id, COALESCE(p.name, 'Psicólogo') AS title,
                ap.updated_at AS created_at,
                'Cita aceptada de ' || COALESCE(u.name, 'paciente') || ' con ' || COALESCE(p.name, 'psicólogo') AS message
         FROM appointments ap
         LEFT JOIN users p ON p.id = ap.psychologist_id
         LEFT JOIN users u ON u.id = ap.patient_id
         WHERE ap.status = 'Aceptada'
         ORDER BY ap.updated_at DESC
         LIMIT 5`
      );

      items.push(
        ...tasksRes.rows.map((row) => ({
          id: `task-${row.id}`,
          type: 'task' as const,
          title: row.title || 'Asignación nueva',
          message: row.message,
          created_at: row.created_at,
        })),
        ...appointmentsRes.rows.map((row) => ({
          id: `apt-${row.id}`,
          type: 'appointment' as const,
          title: row.title || 'Cita aceptada',
          message: row.message,
          created_at: row.created_at,
        }))
      );
    }

    const ordered = items
      .sort((a, b) => new Date(String(b.created_at)).getTime() - new Date(String(a.created_at)).getTime())
      .slice(0, 8)
      .map((item) => ({
        ...item,
        created_at: new Date(String(item.created_at)).toISOString(),
      }));

    return NextResponse.json({ success: true, data: ordered });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}