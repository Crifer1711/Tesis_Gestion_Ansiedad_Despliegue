'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { PatientHeader } from '@/presentation/components/patient/PatientHeader';
import { VideosEducativos } from '@/presentation/components/videos';

export default function PacienteVideosPage() {
  const [activeSection, setActiveSection] = useState('recursos');
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === 'loading' || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <PatientHeader
        activeSection={activeSection}
        onNavClick={setActiveSection}
        userName={session?.user?.name || 'Paciente'}
        userRole={session?.user?.role || 'ESTUDIANTE'}
      />
      <div className="pt-24">
        <VideosEducativos onHomeClick={() => {}} />
      </div>
    </div>
  );
}