'use client';

import { GAD7Content } from '@/presentation/components/educational/GAD7Content';
import { PatientRouteGuard } from '@/presentation/components/patient/PatientRouteGuard';

export default function PacienteTestPage() {
  return (
    <PatientRouteGuard>
      <GAD7Content padded={false} />
    </PatientRouteGuard>
  );
}