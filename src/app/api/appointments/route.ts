// src/app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/auth.options';
import db from '@/infrastructure/database/db';

const MAX_MOTIVO_WORDS = 200;

const countWords = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).filter(Boolean).length;
};

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isPastAppointment = (fecha: string, hora: string) => {
  const [year, month, day] = fecha.split('-').map(Number);
  const [hour] = hora.split(':').map(Number);
  const slot = new Date(year, month - 1, day, hour, 0, 0, 0);
  return slot < new Date();
};

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
    hasCancelReason: columns.has('cancel_reason'),
  };
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Debes estar autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const psychologistId = searchParams.get('psychologistId');
    const patientId = searchParams.get('patientId');
    const fecha = searchParams.get('fecha');
    const { hasRequestLink, hasMeetingLink, hasCancelReason } = await getAppointmentColumnFlags();

    const requestLinkSelect = hasRequestLink
      ? 'a.request_link as "requestLink"'
      : 'NULL::boolean as "requestLink"';
    const meetingLinkSelect = hasMeetingLink
      ? 'a.meeting_link as "meetingLink"'
      : 'NULL::text as "meetingLink"';
    const cancelReasonSelect = hasCancelReason
      ? 'a.cancel_reason as "cancelReason"'
      : 'NULL::text as "cancelReason"';

    // Si se pasa psychologistId, obtener citas del psicólogo
    if (psychologistId) {
      const id = psychologistId || session.user.id;
      
      let query = `SELECT 
          a.id, 
          a.patient_id,
          a.psychologist_id,
          a.appointment_date,
          a.appointment_time,
          a.modality,
          a.reason as motivo,
          ${requestLinkSelect},
          ${meetingLinkSelect},
          ${cancelReasonSelect},
          a.status,
          u.name as "patientName",
          u.email as "patientEmail"
         FROM appointments a
         JOIN users u ON a.patient_id = u.id
         WHERE a.psychologist_id = $1`;
      
      const params: any[] = [id];
      
      // Agregar filtro de fecha si se proporciona
      if (fecha) {
        query += ` AND a.appointment_date = $2`;
        params.push(fecha);
      }
      
      query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
      
      const appointments = await db.query(query, params);

      return NextResponse.json(
        appointments.rows.map(apt => {
          // Convertir fecha a formato YYYY-MM-DD
          const fecha = typeof apt.appointment_date === 'string' 
            ? apt.appointment_date.split('T')[0]
            : new Date(apt.appointment_date).toISOString().split('T')[0];
          
          return {
            id: apt.id,
            patientId: apt.patient_id,
            psychologistId: apt.psychologist_id,
            fecha: fecha,
            hora: apt.appointment_time,
            modalidad: apt.modality,
            motivo: apt.motivo,
            requestLink: apt.requestLink,
            meetingLink: apt.meetingLink,
            cancelReason: apt.cancelReason,
            status: apt.status,
            patientName: apt.patientName,
            patientEmail: apt.patientEmail
          };
        })
      );
    }

    // Si es paciente, obtener sus citas
    if (session.user.role === 'PACIENTE' || patientId) {
      const id = patientId || session.user.id;
        let query = `SELECT 
          a.id, 
          a.patient_id,
          a.psychologist_id,
          a.appointment_date,
          a.appointment_time,
          a.modality,
          a.reason as motivo,
          ${requestLinkSelect},
          ${meetingLinkSelect},
          ${cancelReasonSelect},
          a.status,
          p.name as "psychologistName",
          p.email as "psychologistEmail"
         FROM appointments a
         JOIN users p ON a.psychologist_id = p.id
         WHERE a.patient_id = $1`;
      
      const params: any[] = [id];
      
      // Agregar filtro de fecha si se proporciona
      if (fecha) {
        query += ` AND a.appointment_date = $2`;
        params.push(fecha);
      }
      
      query += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;
      
      const appointments = await db.query(query, params);

      return NextResponse.json(
        appointments.rows.map(apt => {
          // Convertir fecha a formato YYYY-MM-DD
          const fecha = typeof apt.appointment_date === 'string' 
            ? apt.appointment_date.split('T')[0]
            : new Date(apt.appointment_date).toISOString().split('T')[0];
          
          return {
            id: apt.id,
            patientId: apt.patient_id,
            psychologistId: apt.psychologist_id,
            fecha: fecha,
            hora: apt.appointment_time,
            modalidad: apt.modality,
            motivo: apt.motivo,
            requestLink: apt.requestLink,
            meetingLink: apt.meetingLink,
            cancelReason: apt.cancelReason,
            status: apt.status,
            psychologistName: apt.psychologistName,
            psychologistEmail: apt.psychologistEmail
          };
        })
      );
    }

    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Error al obtener citas' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Debes estar autenticado para agendar citas' },
        { status: 401 }
      );
    }
    
    if (session.user.role !== 'PACIENTE') {
      return NextResponse.json(
        { error: 'Solo los pacientes pueden agendar citas' },
        { status: 403 }
      );
    }

    const { psychologistId, fecha, hora, modalidad, motivo, requestLink } = await request.json();
    const motivoNormalizado = typeof motivo === 'string' ? motivo.trim() : '';
    const motivoWords = countWords(motivoNormalizado);
    const hoy = getLocalDateString(new Date());
    const { hasRequestLink } = await getAppointmentColumnFlags();

    if (!psychologistId || !fecha || !hora || !modalidad) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: psicólogo, fecha, hora, modalidad' },
        { status: 400 }
      );
    }

    if (fecha < hoy || isPastAppointment(fecha, hora)) {
      return NextResponse.json(
        { error: 'No puedes agendar una cita en una fecha u hora que ya pasó' },
        { status: 400 }
      );
    }

    if (motivoWords > MAX_MOTIVO_WORDS) {
      return NextResponse.json(
        { error: `El motivo no puede superar las ${MAX_MOTIVO_WORDS} palabras` },
        { status: 400 }
      );
    }

    const existingSlot = await db.query(
      `SELECT id, status
       FROM appointments
       WHERE psychologist_id = $1
         AND appointment_date = $2
         AND appointment_time = $3
       ORDER BY updated_at DESC
       LIMIT 1`,
      [psychologistId, fecha, hora]
    );

    const existingAppointment = existingSlot.rows[0];

    if (existingAppointment && !['Cancelada', 'Rechazada'].includes(existingAppointment.status)) {
      return NextResponse.json(
        { error: 'Ese horario ya está reservado' },
        { status: 409 }
      );
    }

    if (existingAppointment && ['Cancelada', 'Rechazada'].includes(existingAppointment.status)) {
      const updateColumns = [
        'patient_id = $1',
        'psychologist_id = $2',
        'appointment_date = $3',
        'appointment_time = $4',
        'modality = $5',
        'reason = $6',
        'status = $7',
        'cancel_reason = NULL',
        'updated_at = NOW()'
      ];
      const updateValues = [session.user.id, psychologistId, fecha, hora, modalidad, motivoNormalizado || 'Sin especificar', 'Pendiente', existingAppointment.id];

      if (hasRequestLink) {
        updateColumns.splice(6, 0, 'request_link = $7');
        updateColumns[7] = 'status = $8';
        updateValues.splice(6, 0, Boolean(requestLink));
        updateValues[7] = 'Pendiente';
      }

      const rebookQuery = `UPDATE appointments
        SET ${updateColumns.join(', ')}
        WHERE id = $${updateValues.length}
        RETURNING id, patient_id, psychologist_id, appointment_date, appointment_time, modality, reason${hasRequestLink ? ', request_link' : ''}, status`;

      const rebookResult = await db.query(rebookQuery, updateValues);
      const rebooked = rebookResult.rows[0];

      return NextResponse.json(
        {
          id: rebooked.id,
          patientId: rebooked.patient_id,
          psychologistId: rebooked.psychologist_id,
          fecha: rebooked.appointment_date,
          hora: rebooked.appointment_time,
          modalidad: rebooked.modality,
          motivo: rebooked.reason,
          requestLink: hasRequestLink ? rebooked.request_link : Boolean(requestLink),
          meetingLink: null,
          status: rebooked.status,
          rebooked: true,
        },
        { status: 200 }
      );
    }

    const insertColumns = ['patient_id', 'psychologist_id', 'appointment_date', 'appointment_time', 'modality', 'reason'];
    const insertValues = [session.user.id, psychologistId, fecha, hora, modalidad, motivoNormalizado || 'Sin especificar'];

    if (hasRequestLink) {
      insertColumns.push('request_link');
      insertValues.push(Boolean(requestLink));
    }

    insertColumns.push('status');
    insertValues.push('Pendiente');

    const query = `INSERT INTO appointments (${insertColumns.join(', ')})
       VALUES (${insertValues.map((_, index) => `$${index + 1}`).join(', ')})
       RETURNING id, patient_id, psychologist_id, appointment_date, appointment_time, modality, reason${hasRequestLink ? ', request_link' : ''}, status`;

    const result = await db.query(query, insertValues);

    const appointment = result.rows[0];
    return NextResponse.json(
      {
        id: appointment.id,
        patientId: appointment.patient_id,
        psychologistId: appointment.psychologist_id,
        fecha: appointment.appointment_date,
        hora: appointment.appointment_time,
        modalidad: appointment.modality,
        motivo: appointment.reason,
        requestLink: hasRequestLink ? appointment.request_link : Boolean(requestLink),
        meetingLink: null,
        status: appointment.status
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating appointment:', error);
    if (error instanceof Error && (error as any).code === '23505') {
      return NextResponse.json(
        { error: 'Ese horario ya estaba ocupado por una cita anterior. Intenta refrescar la página y volver a seleccionarlo.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Error al crear cita' },
      { status: 500 }
    );
  }
}
