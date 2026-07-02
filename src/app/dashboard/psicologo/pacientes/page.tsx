// src/app/dashboard/psicologo/pacientes/page.tsx
import { PatientManager } from "@/presentation/components/psychologist/patients/PatientManager";
import { getPatientsForPsychologistAction } from "@/infrastructure/actions/psicologo.patient.actions";
import { getServerSession } from "next-auth"; // [CAMBIO] Importar sesión
import { authOptions } from "@/infrastructure/auth/auth.options"; // [CAMBIO] Opciones de auth
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PacientesPsicologoPage() {
  // 1. Obtener la sesión del servidor para identificar al psicólogo
  const session = await getServerSession(authOptions);

  // 2. Seguridad: Redirigir si no hay sesión o no es psicólogo
  if (!session || session.user.role !== "PSICOLOGO") {
    redirect("/login");
  }

  // 3. [CAMBIO] Usar el ID dinámico de la sesión en lugar del "2" manual
  const psychologistId = session.user.id; 
  
  // 4. Llamar a la acción con el ID real (asegúrate de convertir a Number si tu DB usa enteros)
  const response = await getPatientsForPsychologistAction(Number(psychologistId));
  const patients = response.success ? response.data : [];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
          Mis Pacientes
        </h1>
        <p className="text-gray-500 text-xs italic uppercase">
          Listado oficial de estudiantes bajo tu seguimiento clínico.
        </p>
      </div>
      
      {patients.length > 0 ? (
        <PatientManager patients={patients} />
      ) : (
        <div className="bg-white p-16 rounded-3xl border-2 border-dotted border-gray-100 text-center">
          {/* Este mensaje es el que ves en la image_4b7720.png cuando el ID no coincide */}
          <p className="text-gray-400 font-medium">No se encontraron registros de pacientes.</p>
        </div>
      )}
    </div>
  );
}