import { ActivityManagement } from "@/presentation/components/admin/ActivityManagement";
import { ActivityRepository } from "@/infrastructure/repositories/activity.repository";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ActividadesPage() {
  // 1. Instanciamos el repositorio (o puedes usar un UseCase si prefieres)
  const repository = new ActivityRepository();
  
  // 2. Traemos las actividades de la base de datos
  const activities = await repository.getAllActivities();

  // 3. Renderizamos el componente con el diseño del mockup
  return <ActivityManagement initialActivities={activities} />;
}