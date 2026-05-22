// src/app/dashboard/psicologo/actividades/page.tsx
'use server'
import { ActivityRepository } from '@/infrastructure/repositories/activity.repository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/infrastructure/auth/auth.options';
import { getPatientsForPsychologistAction } from '@/infrastructure/actions/psicologo.patient.actions';
import PsychologistActivitiesClient from '@/presentation/components/psychologist/PsychologistActivitiesClient';
import { PatientListItemDTO } from '@/domain/dtos/patient-management.dto';

export default async function PsychologistActividadesPage() {
  const session = await getServerSession(authOptions);
  const repo = new ActivityRepository();
  const activities = await repo.getAllActivities();
  const approved = activities.filter(a => a.estado === 'Aprobada');
  let patients: PatientListItemDTO[] = [];
  try {
    if (session?.user?.id) {
      const pid = Number(session.user.id as unknown as string);
      if (!Number.isNaN(pid)) {
        const res = await getPatientsForPsychologistAction(pid);
        if (res.success) patients = res.data;
      }
    }
  } catch (err) {
    console.error('Error loading patients for psychologist page:', err);
    patients = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[#1E4D8C]">Actividades</h1>
        <p className="text-slate-600 mt-1">Gestiona actividades para tus pacientes</p>
      </div>

      {approved.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center border border-blue-100">
          <div className="mb-4">
            <div className="text-6xl">🚀</div>
          </div>
          <p className="text-slate-600 text-lg">No hay actividades aprobadas aún</p>
          <p className="text-slate-500 text-sm mt-2">Las actividades aprobadas por el administrador aparecerán aquí.</p>
        </div>
      ) : (
        <PsychologistActivitiesClient activities={approved} patients={patients} />
      )}
    </div>
  );
}
