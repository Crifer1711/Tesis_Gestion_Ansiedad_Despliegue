import { ActivityRepository } from '@/infrastructure/repositories/activity.repository';
import { TechnicasRapidasGallery } from '@/presentation/components/activities/TechnicasRapidasGallery';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TecnicasRapidasPage() {
  const repository = new ActivityRepository();
  const activities = await repository.getAllActivities();
  const approved = activities.filter((activity) => activity.estado === 'Aprobada');

  return <TechnicasRapidasGallery activities={approved} />;
}