'use client';

import { Biblioteca } from '@/presentation/components/biblioteca/Biblioteca';
import { PatientRouteGuard } from '@/presentation/components/patient/PatientRouteGuard';

export default function PacienteBibliotecaPage() {
  return (
    <PatientRouteGuard>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-6">
            <Biblioteca onHomeClick={() => {}} />
          </div>
        </div>
      </div>
    </PatientRouteGuard>
  );
}