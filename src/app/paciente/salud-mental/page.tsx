'use client';

import { MentalHealthContent } from '@/presentation/components/educational/MentalHealthContent';
import { PatientRouteGuard } from '@/presentation/components/patient/PatientRouteGuard';

export default function PacienteSaludMentalPage() {
  return (
    <PatientRouteGuard>
      <MentalHealthContent padded={false} />
    </PatientRouteGuard>
  );
}