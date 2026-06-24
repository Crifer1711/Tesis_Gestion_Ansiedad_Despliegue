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
  const approved = activities.filter(a => a.estado === 'Aprobada' && a.usos === 'asignar');
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
    <div className="space-y-6 rounded-[28px] border border-blue-100 bg-gradient-to-b from-[#f5f9ff] to-[#e7f1ff] p-4 md:p-6 shadow-sm">
      <div className="rounded-[24px] border border-blue-100 bg-white/80 p-5 md:p-6 shadow-[0_10px_30px_rgba(30,77,140,0.08)] backdrop-blur">
        <h1 className="text-3xl md:text-4xl font-black text-[#1E4D8C]">Actividades</h1>
        <p className="text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Gestiona actividades para tus pacientes desde un panel visual más limpio y cómodo.
        </p>
      </div>

      {approved.length === 0 ? (
        <div className="bg-white rounded-[24px] shadow-md p-12 text-center border border-blue-100">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-4xl">🚀</div>
          <p className="text-slate-700 text-lg font-semibold">No hay actividades aprobadas aún</p>
          <p className="text-slate-500 text-sm mt-2 max-w-xl mx-auto">Las actividades aprobadas aparecerán aquí para que puedas asignarlas a tus pacientes.</p>
        </div>
      ) : (
        <PsychologistActivitiesClient activities={approved} patients={patients} />
      )}
    </div>
  );
}
