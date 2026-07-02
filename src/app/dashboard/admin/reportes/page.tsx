import { ReportManagement, UserData } from "@/presentation/components/admin/ReportManagement";
import { getAllUsersUseCase } from "@/application/use-cases/get-all-users.use-case";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ReportesPage() {
  // Tipado explícito para corregir el error visual
  let users: UserData[] = [];

  try {
    // Obtenemos la lista completa de la base de datos
    users = await getAllUsersUseCase();
  } catch (error) {
    console.error("Error al cargar los usuarios:", error);
  }

  return <ReportManagement allUsers={users} />;
}