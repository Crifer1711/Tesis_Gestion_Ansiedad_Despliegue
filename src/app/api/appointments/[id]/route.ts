// src/app/api/appointments/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/auth.options';
import db from '@/infrastructure/database/db';

const getAppointmentColumnFlags = async () => {
  const result = await db.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'appointments'`
  );

  const columns = new Set(result.rows.map((row: any) => row.column_name));
  return {
    hasRequestLink: columns.has('request_link'),
    hasMeetingLink: columns.has('meeting_link'),
  };
};

const ensureMeetingLinkColumn = async () => {
  await db.query('ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_link TEXT');
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status, meetingLink } = await request.json();
    let { hasMeetingLink } = await getAppointmentColumnFlags();

    if (typeof meetingLink !== 'undefined' && !hasMeetingLink) {
      await ensureMeetingLinkColumn();
      ({ hasMeetingLink } = await getAppointmentColumnFlags());
    }

    // Verificar que el psicólogo es el dueño de la cita
    const appointment = await db.query(
      'SELECT psychologist_id, patient_id, status FROM appointments WHERE id = $1',
      [id]
    );

    if (appointment.rows.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const appointmentPsychologistId = Number(appointment.rows[0].psychologist_id);
    const appointmentPatientId = Number(appointment.rows[0].patient_id);
    const sessionUserId = Number(session.user.id);
    const currentStatus = appointment.rows[0].status as string;
    
    console.log(`Checking permission: apt_psych_id=${appointmentPsychologistId} (type: ${typeof appointmentPsychologistId}), session_user_id=${sessionUserId} (type: ${typeof sessionUserId}), role=${session.user.role}`);
    
    const isOwnerPsychologist = appointmentPsychologistId === sessionUserId;
    const isOwnerPatient = appointmentPatientId === sessionUserId;
    const isAdmin = session.user.role === 'ADMINISTRADOR';

    if (status === 'Cancelada') {
      if (!isOwnerPatient && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const result = await db.query(
        'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, id]
      );

      const updated = result.rows[0];
      return NextResponse.json({
        id: updated.id,
        status: updated.status,
        meetingLink: updated.meeting_link,
        message: 'Cita actualizada'
      });
    }

    const hasStatusUpdate = typeof status === 'string' && ['Pendiente', 'Aceptada', 'Rechazada'].includes(status);
    const hasMeetingLinkUpdate = typeof meetingLink !== 'undefined';

    if (!hasStatusUpdate && !hasMeetingLinkUpdate) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (!isOwnerPsychologist && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateStatus = hasStatusUpdate ? status : currentStatus;
    const meetingLinkValue = typeof meetingLink === 'string' ? meetingLink.trim() || null : null;

    const setClauses: string[] = [];
    const updateValues: any[] = [];

    if (hasStatusUpdate) {
      updateValues.push(updateStatus);
      setClauses.push(`status = $${updateValues.length}`);
    }

    if (hasMeetingLinkUpdate && hasMeetingLink) {
      updateValues.push(meetingLinkValue);
      setClauses.push(`meeting_link = $${updateValues.length}`);
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    updateValues.push(id);

    const result = await db.query(
      `UPDATE appointments
       SET ${setClauses.join(', ')}, updated_at = NOW()
       WHERE id = $${updateValues.length}
       RETURNING *`,
      updateValues
    );

    const updated = result.rows[0];
    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      meetingLink: hasMeetingLink ? updated.meeting_link : null,
      message: 'Cita actualizada'
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Error al actualizar cita' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { hasRequestLink, hasMeetingLink } = await getAppointmentColumnFlags();

    const requestLinkSelect = hasRequestLink
      ? 'request_link'
      : 'NULL::boolean as request_link';
    const meetingLinkSelect = hasMeetingLink
      ? 'meeting_link'
      : 'NULL::text as meeting_link';
    const result = await db.query(
      `SELECT 
        id, 
        patient_id, 
        psychologist_id, 
        appointment_date, 
        appointment_time, 
        modality, 
        reason, 
        ${requestLinkSelect},
        ${meetingLinkSelect},
        status
       FROM appointments 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const apt = result.rows[0];
    return NextResponse.json({
      id: apt.id,
      patientId: apt.patient_id,
      psychologistId: apt.psychologist_id,
      fecha: apt.appointment_date,
      hora: apt.appointment_time,
      modalidad: apt.modality,
      motivo: apt.reason,
      requestLink: apt.request_link,
      meetingLink: apt.meeting_link,
      status: apt.status
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Error al obtener cita' },
      { status: 500 }
    );
  }
}
