import { PatientManagement } from "@/presentation/components/admin/PatientManagement";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PacientesPage() {
  return <PatientManagement />;
}