import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/auth.options';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.user.role !== 'PSICOLOGO') return NextResponse.json({ error: 'Solo psicólogo puede asignar actividades' }, { status: 403 });

    const id = params.id;
    const body = await req.json();
    const patient = body?.patient?.toString?.().trim();
    if (!patient) return NextResponse.json({ error: 'Paciente requerido' }, { status: 400 });

    // Placeholder: implement persistence later. For now return success message.
    // Future: insert into actividades_asignadas table linking actividad id and patient id
    return NextResponse.json({ success: true, message: `Actividad ${id} asignada a ${patient}` });
  } catch (err) {
    console.error('Error asignando actividad:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
