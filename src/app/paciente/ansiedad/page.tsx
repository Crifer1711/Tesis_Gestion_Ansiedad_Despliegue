'use client';

import { AnxietyContent } from '@/presentation/components/educational/AnxietyContent';
import { PatientRouteGuard } from '@/presentation/components/patient/PatientRouteGuard';

export default function PacienteAnsiedadPage() {
  return (
    <PatientRouteGuard>
      <AnxietyContent padded={false} />
    </PatientRouteGuard>
  );
}