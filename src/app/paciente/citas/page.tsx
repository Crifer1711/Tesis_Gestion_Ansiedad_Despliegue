'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PatientHeader } from '@/presentation/components/patient/PatientHeader';
import { PatientRouteGuard } from '@/presentation/components/patient/PatientRouteGuard';
import { CitasComponent } from '@/presentation/components/patient/citas';
import { ArrowLeft } from 'lucide-react';
import { scrollToTop } from '@/presentation/utils/scrollWithOffset';

export default function CitasPage() {
  const [activeSection, setActiveSection] = useState('citas');
  const { data: session } = useSession();
  const router = useRouter();

  const handleVolver = () => {
    router.push('/dashboard/paciente');
    setTimeout(() => scrollToTop(), 150);
  };

  return (
    <PatientRouteGuard>
      <div className="citas-route-shell min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
        <PatientHeader
          activeSection={activeSection}
          onNavClick={setActiveSection}
        />
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-6 pt-6">
            <div className="mb-6">
              <button
                onClick={handleVolver}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#1E4D8C] font-semibold rounded-lg shadow-sm border border-[#71A5D9] hover:bg-[#71A5D9] hover:text-white transition"
              >
                <ArrowLeft size={18} /> Volver a Inicio
              </button>
            </div>
          </div>
          <CitasComponent />
        </div>
      </div>
    </PatientRouteGuard>
  );
}
