import { PsychologistDashboard } from "@/presentation/components/psychologist/PsychologistDashboard";
import { getDashboardAction } from "@/infrastructure/actions/psychologist.actions";
import { getServerSession } from "next-auth"; // Importamos para leer la sesión
import { authOptions } from "@/infrastructure/auth/auth.options";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PsychologistPage() {
  // 1. Obtenemos la sesión del servidor
  const session = await getServerSession(authOptions);

  // 2. Verificamos que el usuario esté logueado y sea psicólogo
  if (!session || session.user.role !== "PSICOLOGO") {
    redirect("/login");
  }

  // 3. Usamos el ID real de la base de datos (UUID completo)
  const psychologistId = session.user.id; 
  
  // 4. Llamamos a la acción con el UUID real
  const dashboardData = await getDashboardAction(psychologistId);

  return (
    <>
      {/* 5. El componente ahora recibe datos reales vinculados al usuario logueado */}
      <PsychologistDashboard initialData={dashboardData} />
    </>
  );
}