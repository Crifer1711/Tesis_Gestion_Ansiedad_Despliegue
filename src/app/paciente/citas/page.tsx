'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PatientHeader } from '@/presentation/components/patient/PatientHeader';
import { CitasComponent } from '@/presentation/components/patient/citas';
import { ArrowLeft } from 'lucide-react';
import { scrollToTop } from '@/presentation/utils/scrollWithOffset';

export default function CitasPage() {
  const [activeSection, setActiveSection] = useState('citas');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (!mounted || status === 'loading' || !session) {
    return null;
  }

  const handleVolver = () => {
    router.push('/dashboard/paciente');
    setTimeout(() => scrollToTop(), 150);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <PatientHeader
        activeSection={activeSection}
        onNavClick={setActiveSection}
        userName={session?.user?.name || 'Paciente'}
        userRole={session?.user?.role || 'ESTUDIANTE'}
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
          <div className="max-w-4xl rounded-xl border border-blue-200 bg-white/70 px-5 py-4 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-[#1E4D8C] mb-2">Agendar una cita</h2>
            <p className="text-slate-700 leading-relaxed">
              En esta sección podrás reservar una cita con tu psicólogo. Elige al profesional que esté disponible, selecciona el día y la hora que mejor se adapten a tu horario y envía tu solicitud para que quede registrada. Si tu psicólogo tiene espacios habilitados, podrás verlos y escoger el que prefieras; si no está disponible, no aparecerán horarios para reservar hasta que vuelva a activar su agenda.
            </p>
          </div>
        </div>
        <CitasComponent />
      </div>
    </div>
  );
}
